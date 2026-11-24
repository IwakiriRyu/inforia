/* Inforia — 成績タブ(統計・ジャンルごとの得意苦手分析・バッジコレクション) */

requireAuth();

const MIN_ANSWERS_FOR_TAG = 5;

(function () {
  const state = loadState();
  renderBottomNav("records");

  const { level } = xpProgressInLevel(state.xp);
  document.getElementById("statLevel").innerHTML = `${level}`;
  document.getElementById("statXp").innerHTML = `${state.xp}<span class="unit">XP</span>`;
  document.getElementById("statStreak").innerHTML = `${state.streak}<span class="unit">日</span>`;
  document.getElementById("statAccuracy").innerHTML = `${accuracyPercent(state)}<span class="unit">%</span>`;
  document.getElementById("statAnswered").innerHTML = `${state.totalAnswered}<span class="unit">問</span>`;
  document.getElementById("statCorrect").innerHTML = `${state.totalCorrect}<span class="unit">問</span>`;

  renderAnalysisSummary();
  renderGenreAnalysis();
  renderBadges();

  function accuracyClass(pct) {
    if (pct >= 70) return "good";
    if (pct >= 40) return "mid";
    return "low";
  }

  function renderAnalysisSummary() {
    const card = document.getElementById("analysisSummaryCard");
    const answeredGenres = GENRES.filter((g) => (state.genreStats[g.id]?.answered || 0) > 0);

    if (answeredGenres.length === 0) {
      card.innerHTML = `<div class="analysis-empty">クイズに挑戦すると、ここにジャンルごとの得意・苦手分析が表示されます。</div>`;
      return;
    }

    const withAccuracy = answeredGenres
      .map((g) => ({ genre: g, pct: genreAccuracyPercent(state, g.id) }))
      .sort((a, b) => b.pct - a.pct);

    if (withAccuracy.length >= 2) {
      const best = withAccuracy[0];
      const worst = withAccuracy[withAccuracy.length - 1];
      card.innerHTML = `
        <div class="analysis-summary">
          得意分野は <span class="strong-genre">${best.genre.title}</span>(正答率${best.pct}%)、
          苦手分野は <span class="weak-genre">${worst.genre.title}</span>(正答率${worst.pct}%)です。
          苦手分野を中心に復習すると効果的です。
        </div>
      `;
    } else {
      const only = withAccuracy[0];
      card.innerHTML = `
        <div class="analysis-summary">
          現在は <span class="strong-genre">${only.genre.title}</span> のみ挑戦済みです(正答率${only.pct}%)。
          他のジャンルにも挑戦すると、得意・苦手が見えてきます。
        </div>
      `;
    }
  }

  function renderGenreAnalysis() {
    const list = document.getElementById("genreAnalysisList");
    GENRES.forEach((genre) => {
      const pct = genreAccuracyPercent(state, genre.id);
      const hasData = pct !== null;
      const cls = hasData ? accuracyClass(pct) : "none";

      let tag = "";
      // 回答が少ないうちは判定しない(偶然に左右されるため)
      const enough = (state.genreStats[genre.id]?.answered || 0) >= MIN_ANSWERS_FOR_TAG;
      if (hasData && !enough) tag = `<span class="genre-tag">判定には${MIN_ANSWERS_FOR_TAG}問以上</span>`;
      else if (enough && pct >= 70) tag = `<span class="genre-tag strong">得意</span>`;
      else if (enough && pct < 40) tag = `<span class="genre-tag weak">苦手</span>`;

      const total = genreQuestionTotal(genre.id);
      const done = masteredCount(state, genre.id);
      const masteryPercent = unitProgressPercent(state, genre.id);

      const el = document.createElement("div");
      el.className = "card genre-analysis-card";
      el.innerHTML = `
        <div class="genre-analysis-head">
          <span class="genre-analysis-title">${genre.title}</span>
          ${tag}
        </div>
        <div class="accuracy-row">
          <div class="accuracy-row-head">
            <span>正答率</span>
            <span class="accuracy-value">${hasData ? pct + "%" : "未挑戦"}</span>
          </div>
          <div class="accuracy-bar-track">
            <div class="accuracy-bar-fill ${cls}" style="width:${hasData ? pct : 0}%;"></div>
          </div>
        </div>
        <div class="accuracy-row">
          <div class="accuracy-row-head">
            <span>習得率</span>
            <span class="accuracy-value">${done}/${total}(${masteryPercent}%)</span>
          </div>
          <div class="accuracy-bar-track">
            <div class="accuracy-bar-fill mastery" style="width:${masteryPercent}%;"></div>
          </div>
        </div>
      `;
      list.appendChild(el);
    });
  }

  function renderBadges() {
    const badgesGrid = document.getElementById("badgesGrid");
    BADGES.forEach((badge) => {
      const unlocked = state.badges.includes(badge.id);
      const el = document.createElement("div");
      el.className = `badge-tile ${unlocked ? "" : "locked"}`;
      el.innerHTML = `
        <div class="badge-chip ${unlocked ? badge.tier : "locked"}">
          <span class="icon">${unlocked ? ICONS[badge.icon] : ICONS.lock}</span>
        </div>
        <div class="badge-name">${badge.name}</div>
        ${unlocked ? "" : `<div class="badge-condition">${badge.condition}</div>`}
      `;
      badgesGrid.appendChild(el);
    });
  }
})();
