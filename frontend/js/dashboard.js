/* Inforia — ダッシュボード画面ロジック */

requireAuth();

(function () {
  const state = loadState();

  renderBottomNav("home");
  document.getElementById("flameIcon").innerHTML = ICONS.flame;

  // レベル・XP表示
  const { level, current, needed, percent } = xpProgressInLevel(state.xp);
  document.getElementById("avatarLevel").innerHTML = avatarHTML(level);
  document.getElementById("levelLabel").textContent = `レベル ${level}`;
  document.getElementById("xpBarFill").style.width = `${Math.min(percent, 100)}%`;
  document.getElementById("xpLabel").textContent = `${current} / ${needed} XP`;

  // ストリーク表示
  document.getElementById("streakLabel").textContent = `${state.streak}日連続学習中`;

  // ジャンル一覧
  const unitList = document.getElementById("unitList");
  GENRES.forEach((genre) => {
    const total = GLOSSARY[genre.id]?.length || 0;
    const done = state.unitProgress[genre.id]?.correctIds.length || 0;
    const percent = unitProgressPercent(state, genre.id);

    const el = document.createElement("div");
    el.className = "card unit-card";
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", `${genre.title}を学習する`);
    el.innerHTML = `
      <div class="unit-info">
        <div class="title">${genre.title}</div>
        <div class="unit-progress-track">
          <div class="unit-progress-fill" style="width:${percent}%;"></div>
        </div>
        <div class="meta">習得率 ${done}/${total}(${percent}%)</div>
      </div>
      <div class="unit-arrow icon">${ICONS.arrowRight}</div>
    `;
    const goToQuiz = () => {
      window.location.href = `quiz.html?genre=${genre.id}`;
    };
    el.addEventListener("click", goToQuiz);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goToQuiz();
      }
    });
    unitList.appendChild(el);
  });
})();
