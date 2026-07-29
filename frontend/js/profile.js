/* Inforia — マイページ */

requireAuth();

(function () {
  renderBottomNav("profile");

  const state = loadState();
  const email = currentUserEmail();
  const { level } = xpProgressInLevel(state.xp);

  document.getElementById("avatarLevel").innerHTML = avatarHTML(level);
  document.getElementById("userEmail").textContent = email || "";
  document.getElementById("infoLevel").textContent = `レベル ${level}`;
  document.getElementById("infoXp").textContent = `${state.xp} XP`;
  document.getElementById("infoStreak").textContent = `${state.streak}日`;
  document.getElementById("infoBadges").textContent = `${state.badges.length} / ${BADGES.length}`;

  const users = loadUsers();
  const me = users.find((u) => u.email === email);
  document.getElementById("infoRegistered").textContent = me?.registeredAt || "-";

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

  document.getElementById("passwordForm").addEventListener("submit", (e) => {
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

    const result = changePassword(email, current, next);
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
