"""Inforia バックエンド(Flask / Vercel Functions)

認証まわりのAPI。データは Neon(PostgreSQL)に保存する。
- 接続情報は環境変数 DATABASE_URL(Vercel と Neon の連携で自動設定される)。コードには書かない。
- ログイン状態は、署名つきのCookie(HttpOnly / SameSite=Lax)。サーバーに状態を持たない。
"""
import hashlib
import os
import re
from datetime import timedelta
from pathlib import Path

import psycopg
from flask import Flask, jsonify, request, session
from psycopg import errors as pg_errors
from psycopg.rows import dict_row
from werkzeug.security import check_password_hash, generate_password_hash

DATABASE_URL = os.environ.get("DATABASE_URL", "")

app = Flask(__name__)
# 秘密鍵: SECRET_KEY があればそれを使う。なければ DATABASE_URL から作る(DBの接続情報は秘密なので、代わりになる)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY") or hashlib.sha256(
    ("inforia-session|" + DATABASE_URL).encode()
).hexdigest()
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=bool(os.environ.get("VERCEL")),
    PERMANENT_SESSION_LIFETIME=timedelta(days=90),  # 同じ端末では、しばらくログインしたままにする
)

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
MIGRATION = Path(__file__).resolve().parent.parent / "backend" / "migrations" / "001_init.sql"
_schema_ready = False


def connect():
    # Neon の接続プール(pgbouncer)を通るため、prepared statement は使わない
    return psycopg.connect(DATABASE_URL, row_factory=dict_row, prepare_threshold=None)


def ensure_schema(conn):
    """テーブルがなければ作る(初回だけ。何度流れても安全な SQL)"""
    global _schema_ready
    if _schema_ready:
        return
    row = conn.execute("select to_regclass('public.users') as t").fetchone()
    if row["t"] is None:
        conn.execute(MIGRATION.read_text(encoding="utf-8"))
        conn.commit()
    _schema_ready = True


def fail(message, status=400):
    return jsonify({"ok": False, "message": message}), status


def user_json(row):
    return {
        "username": row["username"],
        "email": row["email"],
        "createdAt": row["created_at"].date().isoformat(),
    }


def current_user_row(conn):
    uid = session.get("uid")
    if not uid:
        return None
    return conn.execute(
        "select id, username, email, password_hash, created_at from users where id = %s", (uid,)
    ).fetchone()


def validate_username(name):
    if len(name) < 2 or len(name) > 20:
        return "ユーザー名は2〜20文字で入力してください。"
    return None


def json_body():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


@app.errorhandler(Exception)
def on_error(e):
    # 内部の詳細(接続情報など)は返さない
    app.logger.exception("unhandled error")
    return fail("サーバーでエラーが起きました。しばらくしてからもう一度お試しください。", 500)


@app.get("/api/health")
def health():
    with connect() as conn:
        ensure_schema(conn)
        conn.execute("select 1")
    return jsonify({"ok": True})


@app.post("/api/register")
def register():
    body = json_body()
    username = str(body.get("username", "")).strip()
    email = str(body.get("email", "")).strip()
    password = str(body.get("password", ""))

    err = validate_username(username)
    if err:
        return fail(err)
    if not EMAIL_RE.match(email):
        return fail("メールアドレスの形式が正しくありません。")
    if len(password) < 8:
        return fail("パスワードは8文字以上で入力してください。")

    with connect() as conn:
        ensure_schema(conn)
        if conn.execute("select 1 from users where username = %s", (username,)).fetchone():
            return fail("このユーザー名はすでに使われています。", 409)
        if conn.execute("select 1 from users where email = %s", (email,)).fetchone():
            return fail("このメールアドレスはすでに登録されています。", 409)
        try:
            row = conn.execute(
                "insert into users (username, email, password_hash) values (%s, %s, %s) "
                "returning id, username, email, created_at",
                (username, email, generate_password_hash(password)),
            ).fetchone()
        except pg_errors.UniqueViolation:
            return fail("このユーザー名またはメールアドレスはすでに使われています。", 409)
        conn.execute("insert into user_progress (user_id) values (%s)", (row["id"],))
        conn.execute("insert into user_settings (user_id) values (%s)", (row["id"],))
        conn.commit()

    session.permanent = True
    session["uid"] = str(row["id"])
    return jsonify({"ok": True, "user": user_json(row)})


@app.post("/api/login")
def login():
    body = json_body()
    email = str(body.get("email", "")).strip()
    password = str(body.get("password", ""))
    with connect() as conn:
        ensure_schema(conn)
        row = conn.execute(
            "select id, username, email, password_hash, created_at from users where email = %s", (email,)
        ).fetchone()
        if not row or not check_password_hash(row["password_hash"], password):
            return fail("メールアドレスまたはパスワードが正しくありません。", 401)
        conn.execute("update users set last_login_at = now() where id = %s", (row["id"],))
        conn.commit()
    session.permanent = True
    session["uid"] = str(row["id"])
    return jsonify({"ok": True, "user": user_json(row)})


@app.post("/api/logout")
def logout():
    session.clear()
    return jsonify({"ok": True})


@app.get("/api/me")
def me():
    with connect() as conn:
        ensure_schema(conn)
        row = current_user_row(conn)
    if not row:
        return fail("ログインしていません。", 401)
    return jsonify({"ok": True, "user": user_json(row)})


@app.patch("/api/me")
def update_me():
    """ユーザー名・メールアドレスの変更(現在のパスワードが必要)"""
    body = json_body()
    username = str(body.get("username", "")).strip()
    email = str(body.get("email", "")).strip()
    password = str(body.get("password", ""))
    with connect() as conn:
        ensure_schema(conn)
        row = current_user_row(conn)
        if not row:
            return fail("ログインしていません。", 401)
        if not check_password_hash(row["password_hash"], password):
            return fail("現在のパスワードが正しくありません。", 403)
        err = validate_username(username)
        if err:
            return fail(err)
        if not EMAIL_RE.match(email):
            return fail("メールアドレスの形式が正しくありません。")
        if conn.execute(
            "select 1 from users where username = %s and id <> %s", (username, row["id"])
        ).fetchone():
            return fail("このユーザー名はすでに使われています。", 409)
        if conn.execute(
            "select 1 from users where email = %s and id <> %s", (email, row["id"])
        ).fetchone():
            return fail("このメールアドレスはすでに登録されています。", 409)
        row = conn.execute(
            "update users set username = %s, email = %s where id = %s "
            "returning id, username, email, created_at",
            (username, email, row["id"]),
        ).fetchone()
        conn.commit()
    return jsonify({"ok": True, "user": user_json(row)})


@app.post("/api/me/password")
def change_password():
    body = json_body()
    current = str(body.get("currentPassword", ""))
    new = str(body.get("newPassword", ""))
    with connect() as conn:
        ensure_schema(conn)
        row = current_user_row(conn)
        if not row:
            return fail("ログインしていません。", 401)
        if not check_password_hash(row["password_hash"], current):
            return fail("現在のパスワードが正しくありません。", 403)
        if len(new) < 8:
            return fail("新しいパスワードは8文字以上で入力してください。")
        conn.execute(
            "update users set password_hash = %s where id = %s",
            (generate_password_hash(new), row["id"]),
        )
        conn.commit()
    return jsonify({"ok": True})
