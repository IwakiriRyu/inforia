/* Inforia — クイズ・結果画面ロジック
 * 単語帳(GLOSSARY)の基本問題 + コーディング/応用問題(question-bank.js)を
 * 混ぜた10問を1セッションとして出題する。
 * 1つのHTML内で「クイズ画面」⇄「結果・解説画面」を切り替える構成。
 */

requireAuth();

(function () {
  const params = new URLSearchParams(window.location.search);
  const genreId = params.get("genre") || GENRES[0].id;
  const genre = GENRES.find((g) => g.id === genreId) || GENRES[0];
  const questions = getSessionQuestions(genreId, QUESTIONS_PER_SESSION);

  let state = loadState();
  let index = 0;
  let selectedChoice = null;
  let sessionXp = 0;
  let sessionCorrect = 0;

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
    explanationBox: document.getElementById("explanationBox"),
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
    window.location.href = "index.html";
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

    el.unitTitle.textContent = genre.title;

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
    const xpAward = XP_BY_TYPE[q.type] ?? XP_BY_TYPE.basic;

    [...el.choiceList.children].forEach((item, i) => {
      if (i === q.answer) item.classList.add("correct");
      else if (i === selectedChoice) item.classList.add("incorrect");
    });

    if (isCorrect) {
      sessionXp += xpAward;
      sessionCorrect += 1;
    }
    const newlyUnlocked = recordAnswer(state, genre.id, q.id, isCorrect, q.type);

    el.resultIcon.className = `result-icon ${isCorrect ? "correct" : "incorrect"}`;
    el.resultIcon.innerHTML = `<span class="icon">${isCorrect ? ICONS.check : ICONS.cross}</span>`;
    el.resultTitle.className = `result-title ${isCorrect ? "correct" : "incorrect"}`;
    el.resultTitle.textContent = isCorrect ? "正解!" : "不正解...";
    el.resultXp.textContent = isCorrect ? `+${xpAward} XP獲得!` : "もう一度挑戦してみよう";

    renderExplanationImage(q);
    el.explanationBox.textContent = q.explanation;

    el.nextBtn.textContent = index + 1 >= questions.length ? "結果を見る" : "次の問題へ";

    el.sessionXpLabel.textContent = sessionXp;
    el.quizView.style.display = "none";
    el.resultView.style.display = "block";
    el.progressFill.style.width = `${((index + 1) / questions.length) * 100}%`;

    if (newlyUnlocked.length > 0) {
      showBadgeToast(newlyUnlocked[0]);
    }
  }

  function renderExplanationImage(q) {
    if (q.image) {
      el.aiImagePlaceholder.classList.add("ai-image-real");
      el.aiImagePlaceholder.innerHTML = q.image.svg;
      el.aiImagePlaceholder.appendChild(captionEl(q.image.caption));
      el.aiImageLabelText.textContent = "解説イメージ(サンプル図解)";
      el.aiImageNote.textContent =
        "※ 本実装ではLLM APIが問題ごとにこのような解説画像を自動生成する予定です(このサンプルは手作成の図解です)";
    } else {
      el.aiImagePlaceholder.classList.remove("ai-image-real");
      el.aiImagePlaceholder.innerHTML = `
        <div class="icon" style="font-size:34px; color:#94a3b8;">${ICONS.image}</div>
        <div>生成予定: 「${q.explanation.split("。")[0]}」のイメージ図</div>
      `;
      el.aiImageLabelText.textContent = "解説イメージ";
      el.aiImageNote.textContent = "※ バックエンド接続後、LLM APIが問題ごとに解説画像を自動生成します";
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
    const newlyUnlocked = recordSessionComplete(state, sessionCorrect, questions.length);
    const badgeNote =
      newlyUnlocked.length > 0
        ? `\n新しいバッジ: ${newlyUnlocked
            .map((id) => BADGES.find((b) => b.id === id)?.name)
            .join("、")}`
        : "";
    alert(
      `セッション終了!\n正解数: ${sessionCorrect}/${questions.length}\n獲得XP: ${sessionXp}${badgeNote}`
    );
    window.location.href = "index.html";
  }
})();
