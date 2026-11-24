create extension if not exists citext;

-- ユーザー(ユーザー名とメールアドレスは別々。どちらも重複不可・大文字小文字を区別しない)
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  username      citext not null unique check (char_length(username) between 2 and 20),
  email         citext not null unique,
  password_hash text   not null,                 -- 平文は保存しない(ハッシュ化)
  created_at    timestamptz not null default now(),
  last_login_at timestamptz
);

-- 進捗の集計値(回答のたびに更新。answer_logs から再計算もできる)
create table if not exists user_progress (
  user_id            uuid primary key references users(id) on delete cascade,
  xp                 integer not null default 0,
  streak             integer not null default 0,
  last_active_date   date,
  total_answered     integer not null default 0,
  total_correct      integer not null default 0,
  sessions_completed integer not null default 0
);

-- 獲得したバッジ(バッジの定義はコード側)
create table if not exists user_badges (
  user_id   uuid references users(id) on delete cascade,
  badge_id  text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- 問題ごとの復習の状態(今の state.review にあたる)
create table if not exists review_state (
  user_id          uuid references users(id) on delete cascade,
  question_id      text not null,
  genre_id         text not null,
  stage            text not null check (stage in ('learning','mastered','confirmed')),
  due_date         date,                          -- 次に出す日(習得済みなら null)
  consecutive      integer not null default 0,    -- 異なる日の連続正解数
  last_answer_date date,
  primary key (user_id, question_id)
);
create index if not exists review_due_idx on review_state (user_id, due_date) where due_date is not null;

-- セッション(10問のまとまり、または復習)
create table if not exists sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  mode          text not null check (mode in ('genre','review')),
  genre_id      text,                             -- review のときは null
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  correct_count integer,
  total_count   integer
);

-- 回答の記録(1回答=1行。消さずに残す)
create table if not exists answer_logs (
  id              bigserial primary key,
  user_id         uuid not null references users(id) on delete cascade,
  session_id      uuid references sessions(id) on delete set null,
  question_id     text not null,
  genre_id        text not null,
  question_type   text not null check (question_type in ('basic','coding','applied')),
  selected_choice smallint not null,
  is_correct      boolean not null,
  xp_awarded      smallint not null default 0,
  answer_date     date not null,                  -- 学習日(日本時間)
  answered_at     timestamptz not null default now()
);
create index if not exists answer_logs_user_idx on answer_logs (user_id, answered_at desc);
create index if not exists answer_logs_question_idx on answer_logs (question_id);

-- ユーザーごとの設定(今は通知・効果音のスイッチのみ。どちらもモック)
create table if not exists user_settings (
  user_id       uuid primary key references users(id) on delete cascade,
  notifications boolean not null default true,
  sound         boolean not null default true
);

-- 調整できる数値(復習の間隔・XP・1日の復習の上限など)。初期値は今のコードと同じ
create table if not exists app_config (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
-- 例: review_after_wrong=1, review_after_correct=3, review_final_check=7,
--     review_daily_limit=10, xp_by_type={"basic":10,"coding":15,"applied":25}

-- 初期値(今の state.js と同じ)
insert into app_config (key, value) values
  ('review_after_wrong',   '1'),
  ('review_after_correct', '3'),
  ('review_final_check',   '7'),
  ('review_daily_limit',   '10'),
  ('xp_by_type',           '{"basic":10,"coding":15,"applied":25}')
on conflict (key) do nothing;

