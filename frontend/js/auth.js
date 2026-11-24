/* Inforia — 仮認証(フロントエンド単体モック)
 * 本番ではFlaskバックエンド+Neonでのユーザー認証に置き換える想定。
 * ここではlocalStorageにユーザー一覧とセッションを保存するだけの簡易実装。
 */

const USERS_KEY = "inforia_users_v1";
const SESSION_KEY = "inforia_session_v1";

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function currentUserEmail() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    return session?.email || null;
  } catch (e) {
    return null;
  }
}

function setSession(email) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "login.html";
}

/** ログイン・新規登録が必要なページの先頭で呼ぶガード */
function requireAuth() {
  if (!currentUserEmail()) {
    window.location.href = "login.html";
  }
}

function authTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** 表示用ユーザー名。ユーザー名未設定の旧アカウントはメールアドレスの@前を使う */
function displayNameOf(user) {
  if (!user) return "";
  return user.username || (user.email ? user.email.split("@")[0] : "");
}

function currentUser() {
  const email = currentUserEmail();
  return loadUsers().find((u) => u.email === email) || null;
}

function currentUserName() {
  return displayNameOf(currentUser());
}

function validateUsername(username) {
  if (username.length < 2 || username.length > 20) {
    return "ユーザー名は2〜20文字で入力してください。";
  }
  return null;
}

function registerUser(username, email, password) {
  const users = loadUsers();
  const nameError = validateUsername(username);
  if (nameError) {
    return { ok: false, message: nameError };
  }
  if (users.some((u) => displayNameOf(u).toLowerCase() === username.toLowerCase())) {
    return { ok: false, message: "このユーザー名はすでに使われています。" };
  }
  if (users.some((u) => u.email === email)) {
    return { ok: false, message: "このメールアドレスはすでに登録されています。" };
  }
  users.push({ username, email, password, registeredAt: authTodayStr() });
  saveUsers(users);
  setSession(email);
  return { ok: true };
}

function loginUser(email, password) {
  const users = loadUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return { ok: false, message: "メールアドレスまたはパスワードが正しくありません。" };
  }
  setSession(email);
  return { ok: true };
}

function changePassword(email, currentPassword, newPassword) {
  const users = loadUsers();
  const user = users.find((u) => u.email === email);
  if (!user || user.password !== currentPassword) {
    return { ok: false, message: "現在のパスワードが正しくありません。" };
  }
  user.password = newPassword;
  saveUsers(users);
  return { ok: true };
}
