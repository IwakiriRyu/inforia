/* Inforia — 学習状態の管理(localStorage)
 * 本番ではNeon(PostgreSQL)にユーザーの学習記録として保存する想定。
 * 今はフロントエンド単体で動作確認するため localStorage に保持する。
 */

const STORAGE_KEY = "inforia_state_v1";

/* ── XP・レベルの定義 ──
 * 出題タイプごとに正解時のXPを変える(応用問題ほど高得点)。
 * レベルNからN+1に必要なXPは「100 + (N-1)×20」で、レベルが上がるほど
 * 必要量が増えていく(RPGでよくあるカーブ)。
 *   Lv.1→2: 100XP / Lv.2→3: 120XP / Lv.3→4: 140XP …
 */
const XP_BY_TYPE = {
  basic: 10, // 用語の一問一答
  coding: 15, // コーディング(コード選択式)問題
  applied: 25, // 共通テスト対策の応用問題
};

function xpRequiredForLevel(level) {
  return 100 + (level - 1) * 20;
}

function levelFromXp(xp) {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpRequiredForLevel(level)) {
    remaining -= xpRequiredForLevel(level);
    level += 1;
  }
  return level;
}

function xpProgressInLevel(xp) {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpRequiredForLevel(level)) {
    remaining -= xpRequiredForLevel(level);
    level += 1;
  }
  const needed = xpRequiredForLevel(level);
  return { level, current: remaining, needed, percent: (remaining / needed) * 100 };
}

function defaultState() {
  return {
    xp: 0,
    streak: 0,
    lastActiveDate: null, // "YYYY-MM-DD"
    unitProgress: {
      // genreId: { correctIds: [termId, ...] }
    },
    genreStats: {
      // genreId: { answered: n, correct: n }
    },
    badges: [], // 獲得済みバッジID
    totalAnswered: 0,
    totalCorrect: 0,
    sessionsCompleted: 0,
    review: {
      // questionId: { genreId, stage: "learning"|"mastered"|"confirmed", due: "YYYY-MM-DD"|null,
      //               consecutive: n, lastAnswerDate: "YYYY-MM-DD" }
    },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch (e) {
    return defaultState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* デモ・動作確認用: 日付を進めて「次の日」の復習を確かめられるようにする(マイページから操作) */
const DEV_OFFSET_KEY = "inforia_dev_offset_days";

function devOffsetDays() {
  try {
    return Number(localStorage.getItem(DEV_OFFSET_KEY)) || 0;
  } catch (e) {
    return 0;
  }
}

function setDevOffsetDays(n) {
  localStorage.setItem(DEV_OFFSET_KEY, String(Math.max(0, n)));
}

function dateToStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayStr() {
  const d = new Date();
  d.setDate(d.getDate() + devOffsetDays());
  return dateToStr(d);
}

function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return dateToStr(new Date(y, m - 1, d + n));
}

function shortDate(dateStr) {
  const [, m, d] = dateStr.split("-").map(Number);
  return `${m}/${d}`;
}

function daysBetween(a, b) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const parse = (x) => {
    const [y, m, d] = x.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  return Math.round((parse(b) - parse(a)) / msPerDay);
}

/** 学習した日をストリークに反映する(1日1回のみカウント) */
function touchStreak(state) {
  const today = todayStr();
  if (state.lastActiveDate === today) {
    return state; // 今日はすでにカウント済み
  }
  if (state.lastActiveDate) {
    const diff = daysBetween(state.lastActiveDate, today);
    state.streak = diff === 1 ? state.streak + 1 : 1;
  } else {
    state.streak = 1;
  }
  state.lastActiveDate = today;
  return state;
}

function unlockBadge(state, id, newlyUnlocked) {
  if (!state.badges.includes(id)) {
    state.badges.push(id);
    newlyUnlocked.push(id);
  }
}

/* ── 復習のルール(数値はすべて仮の初期値) ──
 * 誤答 → 翌日 / 正解 → 3日後 / 異なる日に2回連続で正解 → 習得 / 習得の7日後に最終確認 /
 * 最終確認で誤答 → 習得を解除して翌日。同じ日の2回目以降の回答は復習日の判定に使わない。
 * 「習得」は問題単位の目安で、概念の理解そのものではない。
 */
const REVIEW_AFTER_WRONG = 1;
const REVIEW_AFTER_CORRECT = 3;
const REVIEW_FINAL_CHECK = 7;
const REVIEW_DAILY_LIMIT = 10;

function isMastered(state, qid) {
  const r = state.review[qid];
  return !!r && (r.stage === "mastered" || r.stage === "confirmed");
}

function masteredCount(state, genreId) {
  return Object.values(state.review).filter(
    (r) => r.genreId === genreId && (r.stage === "mastered" || r.stage === "confirmed")
  ).length;
}

/** 期限が来た(今日以前の)復習。期限の古い順 */
function getDueReviewIds(state) {
  const today = todayStr();
  return Object.entries(state.review)
    .filter(([, r]) => r.due && r.due <= today)
    .sort((a, b) => (a[1].due < b[1].due ? -1 : a[1].due > b[1].due ? 1 : 0))
    .map(([id]) => id);
}

function nextReviewDate(state) {
  const dues = Object.values(state.review)
    .map((r) => r.due)
    .filter(Boolean)
    .sort();
  return dues[0] || null;
}

/** 1回の回答を復習の状態に反映する。結果の説明文を返す */
function updateReview(state, genreId, qid, isCorrect) {
  const today = todayStr();
  let r = state.review[qid];
  if (r && r.lastAnswerDate === today) {
    return { counted: false, text: "今日は回答済みの問題なので、復習日は変わりません。" };
  }
  if (!r) r = state.review[qid] = { genreId, stage: "learning", due: null, consecutive: 0, lastAnswerDate: null };
  r.lastAnswerDate = today;

  if (!isCorrect) {
    const wasFinal = r.stage === "mastered";
    r.stage = "learning";
    r.consecutive = 0;
    r.due = addDays(today, REVIEW_AFTER_WRONG);
    return {
      counted: true,
      text: `${wasFinal ? "最終確認で間違えたので、習得を解除しました。" : ""}明日(${shortDate(r.due)})、もう一度出ます。`,
    };
  }
  if (r.stage === "mastered") {
    r.stage = "confirmed";
    r.due = null;
    return { counted: true, text: "最終確認をクリアしました。この問題は習得済みです。" };
  }
  r.consecutive += 1;
  if (r.consecutive >= 2) {
    r.stage = "mastered";
    r.due = addDays(today, REVIEW_FINAL_CHECK);
    return { counted: true, text: `習得しました。${REVIEW_FINAL_CHECK}日後(${shortDate(r.due)})に最終確認が出ます。` };
  }
  r.due = addDays(today, REVIEW_AFTER_CORRECT);
  return { counted: true, text: `${REVIEW_AFTER_CORRECT}日後(${shortDate(r.due)})に、復習として出ます。` };
}

/** 1問の解答を記録する(正解時はXP・進捗・バッジも更新)。{ newlyUnlocked, xpAward, review } を返す */
function recordAnswer(state, genreId, qid, isCorrect, questionType) {
  const beforeLevel = levelFromXp(state.xp);
  const newlyUnlocked = [];

  state.totalAnswered += 1;
  touchStreak(state);

  if (!state.genreStats[genreId]) {
    state.genreStats[genreId] = { answered: 0, correct: 0 };
  }
  state.genreStats[genreId].answered += 1;

  // 習得済みの問題は、同じ問題を繰り返してXPを稼ぐことを防ぐため、XPを半分にする
  const baseXp = XP_BY_TYPE[questionType] ?? XP_BY_TYPE.basic;
  const xpAward = isMastered(state, qid) ? Math.floor(baseXp / 2) : baseXp;
  let awarded = 0;

  if (isCorrect) {
    state.totalCorrect += 1;
    state.genreStats[genreId].correct += 1;
    state.xp += xpAward;
    awarded = xpAward;

    if (state.totalCorrect === 1) unlockBadge(state, "first-quiz", newlyUnlocked);

    const afterLevel = levelFromXp(state.xp);
    if (afterLevel > beforeLevel && afterLevel >= 5) {
      unlockBadge(state, "level-5", newlyUnlocked);
    }
  }

  const review = updateReview(state, genreId, qid, isCorrect);

  if (state.streak >= 3) unlockBadge(state, "streak-3", newlyUnlocked);
  if (state.streak >= 7) unlockBadge(state, "streak-7", newlyUnlocked);

  saveState(state);
  return { newlyUnlocked, xpAward: awarded, review };
}

/** セッション(10問)完了時に呼ぶ。獲得バッジ一覧を返す */
function recordSessionComplete(state, correctCount, totalCount) {
  const newlyUnlocked = [];
  state.sessionsCompleted += 1;
  unlockBadge(state, "session-clear", newlyUnlocked);
  if (correctCount === totalCount) {
    unlockBadge(state, "perfect", newlyUnlocked);
  }
  saveState(state);
  return newlyUnlocked;
}

/** 習得率 = 習得した問題数 ÷ ジャンルの問題数 */
function unitProgressPercent(state, genreId) {
  if (typeof genreQuestionTotal === "undefined") return 0;
  const total = genreQuestionTotal(genreId);
  return total === 0 ? 0 : Math.round((masteredCount(state, genreId) / total) * 100);
}

function accuracyPercent(state) {
  if (state.totalAnswered === 0) return 0;
  return Math.round((state.totalCorrect / state.totalAnswered) * 100);
}

function genreAccuracyPercent(state, genreId) {
  const s = state.genreStats[genreId];
  if (!s || s.answered === 0) return null;
  return Math.round((s.correct / s.answered) * 100);
}

/** デモ用: 学習記録の例を入れる(復習が数問たまっている状態にする) */
function seedDemoState() {
  const today = todayStr();
  const st = defaultState();
  st.xp = 340;
  st.streak = 5;
  st.lastActiveDate = addDays(today, -1);
  st.totalAnswered = 46;
  st.totalCorrect = 33;
  st.sessionsCompleted = 4;
  st.badges = ["first-quiz", "streak-3", "session-clear"];
  st.genreStats = {
    society: { answered: 10, correct: 7 },
    design: { answered: 6, correct: 5 },
    programming: { answered: 24, correct: 15 },
    network: { answered: 6, correct: 6 },
  };
  const mk = (genreId, stage, due, consecutive) => ({ genreId, stage, due, consecutive, lastAnswerDate: addDays(today, -2) });
  const items = {
    code_p2: mk("programming", "learning", today, 0),
    code_p6: mk("programming", "learning", addDays(today, -1), 0),
    programming_17: mk("programming", "learning", today, 0), // 2進数
    programming_21: mk("programming", "learning", today, 1), // AND演算
    programming_9: mk("programming", "learning", addDays(today, 2), 1),
    app_prog2: mk("programming", "mastered", addDays(today, 5), 2),
    programming_0: mk("programming", "confirmed", null, 2),
    programming_1: mk("programming", "confirmed", null, 2),
    society_0: mk("society", "confirmed", null, 2),
    design_0: mk("design", "mastered", addDays(today, 3), 2),
    network_0: mk("network", "learning", addDays(today, 1), 1),
  };
  st.review = items;
  return st;
}
