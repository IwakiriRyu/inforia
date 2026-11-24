/* Inforia — マイページ */

requireAuth();

(function () {
  renderBottomNav("profile");

  const state = loadState();
  const email = currentUserEmail();
  const { level } = xpProgressInLevel(state.xp);

  document.getElementById("avatarLevel").innerHTML = avatarHTML(level);
  document.getElementById("userName").textContent = currentUserName();
  document.getElementById("userEmail").textContent = email || "";
  document.getElementById("infoLevel").textContent = `レベル ${level}`;
  document.getElementById("infoXp").textContent = `${state.xp} XP`;
  document.getElementById("infoStreak").textContent = `${state.streak}日`;
  document.getElementById("infoBadges").textContent = `${state.badges.length} / ${BADGES.length}`;

  document.getElementById("infoRegistered").textContent = currentUserCreatedAt() || "-";

  // 設定トグル
  const settings = loadSettings();
  const notifToggle = document.getElementById("notifToggle");
  const soundToggle = document.getElementById("soundToggle");
  notifToggle.checked = settings.notifications;
  soundToggle.checked = settings.sound;

  notifToggle.addEventListener("change", () => {
    settings.notifications = notifToggle.checked;
    saveSettings(settings);
  });
  soundToggle.addEventListener("change", () => {
    settings.sound = soundToggle.checked;
    saveSettings(settings);
  });

  // デモ用の操作
  const demoDate = document.getElementById("demoDate");
  const renderDemoDate = () => {
    const off = devOffsetDays();
    demoDate.textContent = `${todayStr()}${off ? `(今日から+${off}日)` : "(今日)"}`;
  };
  renderDemoDate();
  document.getElementById("demoSeedBtn").addEventListener("click", () => {
    if (!confirm("現在の学習記録を、デモ用の例に置き換えます。よろしいですか?")) return;
    saveState(seedDemoState());
    location.reload();
  });
  document.getElementById("demoNextDayBtn").addEventListener("click", () => {
    setDevOffsetDays(devOffsetDays() + 1);
    location.reload();
  });
  document.getElementById("demoResetDayBtn").addEventListener("click", () => {
    setDevOffsetDays(0);
    location.reload();
  });
  document.getElementById("demoClearBtn").addEventListener("click", () => {
    if (!confirm("学習記録(XP・復習・バッジなど)をすべて消します。よろしいですか?")) return;
    saveState(defaultState());
    location.reload();
  });

  // アカウント情報(ユーザー名・メールアドレス)変更フォーム
  const accountCard = document.getElementById("accountCard");
  const accountFormToggle = document.getElementById("accountFormToggle");
  document.getElementById("userIconAcc").innerHTML = ICONS.user;
  document.getElementById("mailIconAcc").innerHTML = ICONS.mail;
  document.getElementById("keyIconAcc").innerHTML = ICONS.key;
  document.getElementById("accountUsername").value = currentUserName();
  document.getElementById("accountEmail").value = email || "";

  accountFormToggle.addEventListener("click", () => {
    const isHidden = accountCard.style.display === "none";
    accountCard.style.display = isHidden ? "block" : "none";
    accountFormToggle.textContent = isHidden ? "閉じる" : "変更する";
  });

  document.getElementById("accountForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("accountUsername").value.trim();
    const newEmail = document.getElementById("accountEmail").value.trim();
    const password = document.getElementById("accountPassword").value;
    const errorEl = document.getElementById("accountFormError");
    errorEl.classList.remove("show");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      errorEl.textContent = "メールアドレスの形式が正しくありません。";
      errorEl.classList.add("show");
      return;
    }

    const result = await updateAccount(username, newEmail, password);
    if (result.ok) {
      alert("アカウント情報を変更しました。");
      location.reload();
    } else {
      errorEl.textContent = result.message;
      errorEl.classList.add("show");
    }
  });

  // パスワード変更フォームの開閉
  const passwordCard = document.getElementById("passwordCard");
  const passwordFormToggle = document.getElementById("passwordFormToggle");
  passwordFormToggle.addEventListener("click", () => {
    const isHidden = passwordCard.style.display === "none";
    passwordCard.style.display = isHidden ? "block" : "none";
    passwordFormToggle.textContent = isHidden ? "閉じる" : "変更する";
  });

  document.getElementById("keyIcon1").innerHTML = ICONS.key;
  document.getElementById("keyIcon2").innerHTML = ICONS.key;
  document.getElementById("keyIcon3").innerHTML = ICONS.key;

  document.getElementById("passwordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const current = document.getElementById("currentPassword").value;
    const next = document.getElementById("newPassword").value;
    const confirm = document.getElementById("newPasswordConfirm").value;
    const errorEl = document.getElementById("passwordFormError");
    errorEl.classList.remove("show");

    if (next.length < 8) {
      errorEl.textContent = "新しいパスワードは8文字以上で入力してください。";
      errorEl.classList.add("show");
      return;
    }
    if (next !== confirm) {
      errorEl.textContent = "新しいパスワードが一致しません。";
      errorEl.classList.add("show");
      return;
    }

    const result = await changePassword(current, next);
    if (result.ok) {
      alert("パスワードを変更しました。");
      document.getElementById("passwordForm").reset();
      passwordCard.style.display = "none";
      passwordFormToggle.textContent = "変更する";
    } else {
      errorEl.textContent = result.message;
      errorEl.classList.add("show");
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    if (confirm("ログアウトしますか?")) {
      logout();
    }
  });
})();
