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

  // 今日の復習
  const dueCount = Math.min(getDueReviewIds(state).length, REVIEW_DAILY_LIMIT);
  const reviewCard = document.getElementById("reviewCard");
  if (dueCount > 0) {
    reviewCard.className = "card review-card due";
    reviewCard.innerHTML = `
      <div class="review-info">
        <div class="review-title">今日の復習 ${dueCount}問</div>
        <div class="review-sub">間違えた問題や、日をあけた確認が戻ってきています(2〜3分)</div>
      </div>
      <button class="btn btn-primary review-btn" id="reviewStartBtn">復習する</button>
    `;
    document.getElementById("reviewStartBtn").addEventListener("click", () => {
      window.location.href = "quiz.html?mode=review";
    });
  } else {
    const next = nextReviewDate(state);
    reviewCard.className = "card review-card";
    reviewCard.innerHTML = `
      <div class="review-info">
        <div class="review-title">今日の復習はありません</div>
        <div class="review-sub">${next ? `次の復習は ${shortDate(next)} です` : "問題に答えると、復習の予定がここに表示されます"}</div>
      </div>
    `;
  }

  // ジャンル一覧
  const unitList = document.getElementById("unitList");
  GENRES.forEach((genre) => {
    const total = genreQuestionTotal(genre.id);
    const done = masteredCount(state, genre.id);
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
