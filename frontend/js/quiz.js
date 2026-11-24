/* Inforia — クイズ・結果画面ロジック
 * 単語帳(GLOSSARY)の基本問題 + コーディング/応用問題(question-bank.js)を
 * 混ぜた10問を1セッションとして出題する。
 * 1つのHTML内で「クイズ画面」⇄「結果・解説画面」を切り替える構成。
 */

requireAuth();

(function () {
  const params = new URLSearchParams(window.location.search);
  let state = loadState();
  const isReview = params.get("mode") === "review";
  // ?figure=off で説明図を出さない(図あり/図なしの比較条件を試すためのスイッチ)
  const showFigure = params.get("figure") !== "off";
  const genreId = params.get("genre") || GENRES[0].id;
  let genre = GENRES.find((g) => g.id === genreId) || GENRES[0];
  const questions = isReview ? getReviewQuestions(state) : getSessionQuestions(genreId, QUESTIONS_PER_SESSION);
  if (questions.length === 0) {
    window.location.href = "home.html";
    return;
  }
  let index = 0;
  let selectedChoice = null;
  let sessionXp = 0;
  let sessionCorrect = 0;
  const sessionResults = [];
  const sessionLog = [];
  const levelBefore = xpProgressInLevel(state.xp).level;

  const HINTS_BY_GENRE = {
    society: "法律や権利は「誰を・何から守るためのものか」を考えてみよう。",
    design: "身の回りの標識やアプリの画面を思い浮かべてみよう。",
    programming: "コードは1行ずつ順番に実行される、という基本を思い出そう。",
    network: "身近な仕組み(郵便や住所、アンケートなど)に例えて考えてみよう。",
  };

  const TYPE_LABELS = {
    coding: "コーディング問題",
    applied: "応用問題",
  };

  const el = {
    unitTitle: document.getElementById("unitTitle"),
    typeBadge: document.getElementById("questionTypeBadge"),
    progressFill: document.getElementById("quizProgressFill"),
    progressText: document.getElementById("quizProgressText"),
    sessionXpLabel: document.getElementById("sessionXpLabel"),
    questionText: document.getElementById("questionText"),
    codeBlock: document.getElementById("codeBlock"),
    choiceList: document.getElementById("choiceList"),
    hintBox: document.getElementById("hintBox"),
    hintBtn: document.getElementById("hintBtn"),
    submitBtn: document.getElementById("submitBtn"),
    quizView: document.getElementById("quizView"),
    resultView: document.getElementById("resultView"),
    resultIcon: document.getElementById("resultIcon"),
    resultTitle: document.getElementById("resultTitle"),
    resultXp: document.getElementById("resultXp"),
    aiImagePlaceholder: document.getElementById("aiImagePlaceholder"),
    aiImageLabelText: document.getElementById("aiImageLabelText"),
    aiImageNote: document.getElementById("aiImageNote"),
    explainList: document.getElementById("explainList"),
    reviewNote: document.getElementById("reviewNote"),
    nextBtn: document.getElementById("nextBtn"),
    closeBtn: document.getElementById("closeBtn"),
    badgeToast: document.getElementById("badgeToast"),
    badgeToastIcon: document.getElementById("badgeToastIcon"),
    badgeToastName: document.getElementById("badgeToastName"),
  };

  el.closeBtn.innerHTML = ICONS.close;
  document.getElementById("xpPillIcon").innerHTML = ICONS.star;
  document.getElementById("sparkleIcon").innerHTML = ICONS.sparkle;

  renderQuestion();

  el.closeBtn.addEventListener("click", () => {
    window.location.href = "home.html";
  });

  el.hintBtn.addEventListener("click", () => {
    el.hintBox.innerHTML = `<span class="icon" style="margin-right:4px;">${ICONS.bulb}</span>${
      HINTS_BY_GENRE[genre.id] || "落ち着いてもう一度問題文を読んでみよう。"
    }`;
    el.hintBox.classList.add("show");
  });

  el.submitBtn.addEventListener("click", () => {
    if (selectedChoice === null) return;
    showResult();
  });

  el.nextBtn.addEventListener("click", () => {
    index += 1;
    if (index >= questions.length) {
      finishSession();
      return;
    }
    el.resultView.style.display = "none";
    el.quizView.style.display = "block";
    renderQuestion();
  });

  function renderQuestion() {
    const q = questions[index];
    selectedChoice = null;

    genre = GENRES.find((g) => g.id === q.genreId) || genre;
    el.unitTitle.textContent = isReview ? `今日の復習 / ${genre.title}` : genre.title;

    if (TYPE_LABELS[q.type]) {
      el.typeBadge.textContent = TYPE_LABELS[q.type];
      el.typeBadge.className = `question-type-badge ${q.type}`;
      el.typeBadge.style.display = "inline-flex";
    } else {
      el.typeBadge.style.display = "none";
    }

    const percent = (index / questions.length) * 100;
    el.progressFill.style.width = `${percent}%`;
    el.progressText.textContent = `問題 ${index + 1}/${questions.length}`;
    el.sessionXpLabel.textContent = sessionXp;

    el.questionText.textContent = q.question;

    if (q.code) {
      el.codeBlock.style.display = "block";
      el.codeBlock.textContent = q.code;
    } else {
      el.codeBlock.style.display = "none";
    }

    el.hintBox.classList.remove("show");
    el.hintBox.textContent = "";

    el.choiceList.innerHTML = "";
    q.choices.forEach((choice, i) => {
      const item = document.createElement("div");
      item.className = "choice-item";
      item.setAttribute("role", "radio");
      item.setAttribute("aria-checked", "false");
      item.setAttribute("tabindex", "0");
      item.innerHTML = `<span class="choice-marker"></span><span>${choice}</span>`;
      const select = () => {
        selectedChoice = i;
        [...el.choiceList.children].forEach((c) => {
          c.classList.remove("selected");
          c.setAttribute("aria-checked", "false");
        });
        item.classList.add("selected");
        item.setAttribute("aria-checked", "true");
        el.submitBtn.disabled = false;
      };
      item.addEventListener("click", select);
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          select();
        }
      });
      el.choiceList.appendChild(item);
    });

    el.submitBtn.disabled = true;
  }

  function showResult() {
    const q = questions[index];
    const isCorrect = selectedChoice === q.answer;

    [...el.choiceList.children].forEach((item, i) => {
      if (i === q.answer) item.classList.add("correct");
      else if (i === selectedChoice) item.classList.add("incorrect");
    });

    const rec = recordAnswer(state, q.genreId || genre.id, q.id, isCorrect, q.type);
    const newlyUnlocked = rec.newlyUnlocked;
    sessionResults.push(isCorrect);
    sessionLog.push({ q, selected: selectedChoice, isCorrect });
    if (isCorrect) {
      sessionXp += rec.xpAward;
      sessionCorrect += 1;
    }

    el.resultIcon.className = `result-icon ${isCorrect ? "correct" : "incorrect"}`;
    el.resultIcon.innerHTML = `<span class="icon">${isCorrect ? ICONS.check : ICONS.cross}</span>`;
    el.resultTitle.className = `result-title ${isCorrect ? "correct" : "incorrect"}`;
    el.resultTitle.textContent = isCorrect ? "正解!" : "不正解...";
    el.resultXp.textContent = isCorrect
      ? `+${rec.xpAward} XP獲得!${rec.xpAward < (XP_BY_TYPE[q.type] ?? 10) ? "(習得済みの問題は半分)" : ""}`
      : "もう一度挑戦してみよう";

    if (isCorrect) {
      requestAnimationFrame(() => Fx.confetti(el.resultIcon, 24));
    }

    renderFigure(q);
    renderExplanation(q, isCorrect);
    el.reviewNote.innerHTML = `<span class="review-note-label">復習</span>${rec.review.text}`;

    el.nextBtn.textContent = index + 1 >= questions.length ? "結果を見る" : "次の問題へ";

    el.sessionXpLabel.textContent = sessionXp;
    el.quizView.style.display = "none";
    el.resultView.style.display = "block";
    window.scrollTo(0, 0);
    el.progressFill.style.width = `${((index + 1) / questions.length) * 100}%`;

    if (newlyUnlocked.length > 0) {
      showBadgeToast(newlyUnlocked[0]);
    }
  }

  /** 3点の解説: 正解の理由 / よくある間違い / 次の一歩 */
  function explanationItems(q, isCorrect, selected) {
    let reason;
    let mistake;
    let next;

    if (q.type === "basic") {
      reason = q.explanation;
      if (!isCorrect && q.choiceNotes) {
        mistake = `選んだ答えについて: ${q.choiceNotes[selected]}`;
      } else {
        const wrongIdx = q.choices.findIndex((_, i) => i !== q.answer);
        mistake = `取り違えやすい例: ${q.choiceNotes ? q.choiceNotes[wrongIdx] : "似た用語との混同に注意。"}`;
      }
      next = `「${q.term}」と「${q.distractorTerm}」の違いを、自分の言葉で言ってみよう。`;
    } else {
      reason = q.explanation;
      mistake = q.pitfall || "選択肢を1つずつ確かめて、なぜ違うのかを考えよう。";
      next =
        q.type === "coding"
          ? "変数の値を1行ずつ紙に書き出して、答えを確かめてみよう。"
          : "ほかの選択肢が、なぜ適切でないのかを説明してみよう。";
    }

    return [
      ["正解の理由", reason, "accent"],
      ["よくある間違い", mistake, "warn"],
      ["次の一歩", next, "accent"],
    ];
  }

  function explanationHTML(items) {
    return items
      .map(
        (it, i) => `
        <div class="explain-item ${it[2]}">
          <div class="explain-num">${i + 1}</div>
          <div>
            <div class="explain-head">${it[0]}</div>
            <div class="explain-body">${escapeHtml(it[1])}</div>
          </div>
        </div>`
      )
      .join("");
  }

  function renderExplanation(q, isCorrect) {
    el.explainList.innerHTML = explanationHTML(explanationItems(q, isCorrect, selectedChoice));
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /** 説明図: 構造・手順・関係を示せる問題だけに表示する(飾りの絵は出さない) */
  function renderFigure(q) {
    const box = document.getElementById("figureBox");
    if (!showFigure) {
      box.style.display = "none";
      el.aiImageNote.textContent = "説明図は表示しない設定です(?figure=off)。";
      return;
    }
    if (q.image) {
      box.style.display = "block";
      el.aiImagePlaceholder.classList.add("ai-image-real");
      el.aiImagePlaceholder.innerHTML = q.image.svg;
      el.aiImagePlaceholder.appendChild(captionEl(q.image.caption));
      el.aiImageLabelText.textContent = "説明図";
      el.aiImageNote.textContent =
        "※ 試作では、手で作った図の仕様をテンプレートで描画しています。本実装では、AIが図の仕様を出し、人が確認してから描画します";
    } else {
      box.style.display = "none";
      el.aiImageNote.textContent = "この問題には説明図がありません(構造・手順・関係を示せる問題にだけ付けます)";
    }
  }

  function captionEl(text) {
    const div = document.createElement("div");
    div.style.cssText = "font-size:11px; color:#94a3b8; text-align:center; margin-top:8px;";
    div.textContent = text;
    return div;
  }

  function showBadgeToast(badgeId) {
    const badge = BADGES.find((b) => b.id === badgeId);
    if (!badge) return;
    el.badgeToastIcon.innerHTML = ICONS[badge.icon] || ICONS.medal;
    el.badgeToastName.textContent = badge.name;
    el.badgeToast.classList.add("show");
    setTimeout(() => el.badgeToast.classList.remove("show"), 2600);
  }

  function finishSession() {
    const total = questions.length;
    const newlyUnlocked = recordSessionComplete(state, sessionCorrect, total);
    const nextDate = nextReviewDate(state);
    const rate = total ? Math.round((sessionCorrect / total) * 100) : 0;

    // 円グラフ(正解数 / 問題数)
    const r = 54;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - (total ? sessionCorrect / total : 0));
    document.getElementById("summaryKind").textContent = `${isReview ? "復習" : "セッション"}終了!`;
    document.getElementById("summaryRing").innerHTML = `
      <svg viewBox="0 0 140 140" aria-hidden="true">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#60a5fa" />
            <stop offset="100%" stop-color="#2dd4bf" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r="${r}" class="ring-track" />
        <circle cx="70" cy="70" r="${r}" class="ring-fill" id="ringFill"
          stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}" />
      </svg>
      <div class="summary-ring-text">
        <span class="summary-ring-num">${sessionCorrect}</span><span class="summary-ring-total">/${total}</span>
      </div>`;
    Fx.countUp(document.getElementById("summaryRate"), rate, {
      dur: 1000,
      delay: 300,
      fmt: (v) => `正解率 ${v}%`,
    });
    Fx.countUp(document.querySelector(".summary-ring-num"), sessionCorrect, { dur: 1000, delay: 300 });

    // 問題ごとの正解・不正解
    document.getElementById("summaryDots").innerHTML = sessionResults
      .map(
        (ok, i) =>
          `<span class="summary-dot ${ok ? "ok" : "ng"}" style="--i:${i}" title="問題 ${i + 1}">${
            ok ? ICONS.check : ICONS.cross
          }</span>`
      )
      .join("");

    Fx.countUp(document.getElementById("summaryCorrect"), sessionCorrect, {
      dur: 900,
      delay: 600,
      fmt: (v) => `${v}/${total}`,
    });
    document.getElementById("summaryXpIcon").innerHTML = ICONS.star;
    Fx.countUp(document.getElementById("summaryXp"), sessionXp, { dur: 1100, delay: 700 });

    // レベルアップ
    const levelAfter = xpProgressInLevel(state.xp).level;
    const levelUpEl = document.getElementById("summaryLevelUp");
    if (levelAfter > levelBefore) {
      levelUpEl.innerHTML = `<div class="summary-levelup-label">レベルアップ!</div><div class="summary-levelup-num">レベル ${levelBefore} → ${levelAfter}</div>`;
      levelUpEl.style.display = "block";
    }

    const badgesEl = document.getElementById("summaryBadges");
    if (newlyUnlocked.length > 0) {
      badgesEl.innerHTML =
        `<div class="summary-card-label">新しいバッジ</div>` +
        newlyUnlocked
          .map((id) => {
            const b = BADGES.find((x) => x.id === id);
            return b
              ? `<div class="summary-badge"><span class="icon">${ICONS[b.icon] || ICONS.medal}</span>${b.name}</div>`
              : "";
          })
          .join("");
      badgesEl.style.display = "block";
    }

    const reviewEl = document.getElementById("summaryReview");
    if (nextDate) {
      reviewEl.innerHTML = `<div class="summary-card-label">次の復習</div><div class="summary-review-date">${shortDate(
        nextDate
      )}</div>`;
      reviewEl.style.display = "block";
    }

    document.getElementById("summaryReviewList").innerHTML = sessionLog
      .map(({ q, selected, isCorrect }, i) => {
        const choices = q.choices
          .map((c, ci) => {
            const cls = ci === q.answer ? "correct" : ci === selected ? "incorrect" : "";
            const tag = ci === q.answer ? "正解" : ci === selected ? "あなたの答え" : "";
            return `<div class="rv-choice ${cls}"><span>${c}</span>${tag ? `<em>${tag}</em>` : ""}</div>`;
          })
          .join("");
        const fig = q.image ? `<div class="rv-figure">${q.image.svg}</div>` : "";
        return `
          <details class="rv-item ${isCorrect ? "ok" : "ng"}">
            <summary>
              <span class="rv-mark">${isCorrect ? ICONS.check : ICONS.cross}</span>
              <span class="rv-q"><b>問${i + 1}</b> ${escapeHtml(q.question)}</span>
            </summary>
            <div class="rv-body">
              ${q.code ? `<pre class="code-block">${escapeHtml(q.code)}</pre>` : ""}
              <div class="rv-choices">${choices}</div>
              ${fig}
              <div class="explain-list">${explanationHTML(explanationItems(q, isCorrect, selected))}</div>
            </div>
          </details>`;
      })
      .join("");

    el.resultView.style.display = "none";
    el.quizView.style.display = "none";
    document.getElementById("summaryView").style.display = "block";
    el.progressFill.style.width = "100%";
    window.scrollTo(0, 0);

    // 紙吹雪(7割以上の正解、またはレベルアップのとき)
    if (rate >= 70 || levelAfter > levelBefore) {
      setTimeout(() => Fx.confetti(document.getElementById("summaryRing"), 40), 900);
    }

    // 円グラフを動かす
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        document.getElementById("ringFill").style.strokeDashoffset = offset;
      })
    );

    document.getElementById("summaryHomeBtn").addEventListener("click", () => {
      window.location.href = "home.html";
    });
  }
})();
