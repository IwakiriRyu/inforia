/* Inforia — 認証(サーバー連携)
 * ユーザー情報とパスワードは、バックエンド(Flask + Neon)に保存する。
 * ログイン状態はサーバーが発行するCookieで保つ(同じ端末では、しばらく自動でログインしたままになる)。
 * 画面の表示を速くするため、ログイン中のユーザー名などは localStorage に控えを置く。
 * 控えは表示用で、本当にログインしているかは /api/me で確かめる。
 */

const SESSION_KEY = "inforia_session_v1";

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch (e) {
    return null;
  }
}

function writeCache(user) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ email: user.email, username: user.username, createdAt: user.createdAt })
  );
}

function clearCache() {
  localStorage.removeItem(SESSION_KEY);
}

function currentUserEmail() {
  return readCache()?.email || null;
}

function currentUserName() {
  const c = readCache();
  if (!c) return "";
  return c.username || (c.email ? c.email.split("@")[0] : "");
}

/** 登録日(マイページ用) */
function currentUserCreatedAt() {
  return readCache()?.createdAt || null;
}

function validateUsername(username) {
  if (username.length < 2 || username.length > 20) {
    return "ユーザー名は2〜20文字で入力してください。";
  }
  return null;
}

/** APIを呼ぶ。通信できないときも、{ ok:false, message } の形で返す */
async function api(method, path, body) {
  try {
    const res = await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
    });
    const data = await res.json().catch(() => null);
    if (!data) return { ok: false, status: res.status, message: "サーバーに接続できませんでした。" };
    return { status: res.status, ...data };
  } catch (e) {
    return { ok: false, status: 0, message: "サーバーに接続できませんでした。通信状況を確認してください。" };
  }
}

async function registerUser(username, email, password) {
  const r = await api("POST", "/api/register", { username, email, password });
  if (r.ok) writeCache(r.user);
  return r;
}

async function loginUser(email, password) {
  const r = await api("POST", "/api/login", { email, password });
  if (r.ok) writeCache(r.user);
  return r;
}

async function logout() {
  await api("POST", "/api/logout");
  clearCache();
  window.location.href = "login.html";
}

async function changePassword(currentPassword, newPassword) {
  return api("POST", "/api/me/password", { currentPassword, newPassword });
}

/** ユーザー名・メールアドレスの変更(本人確認のため現在のパスワードが必要) */
async function updateAccount(username, email, password) {
  const r = await api("PATCH", "/api/me", { username, email, password });
  if (r.ok) writeCache(r.user);
  return r;
}

/** ログインが必要なページの先頭で呼ぶ。控えがなければログイン画面へ。控えがあっても、サーバーで確かめる */
function requireAuth() {
  if (!currentUserEmail()) {
    window.location.href = "login.html";
    return;
  }
  api("GET", "/api/me").then((r) => {
    if (r.status === 401) {
      // サーバー側でログインが切れている(別の端末でログアウトした、など)
      clearCache();
      window.location.href = "login.html";
    } else if (r.ok) {
      writeCache(r.user); // 他の端末での変更を反映
    }
  });
}
