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

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function daysBetween(a, b) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(b) - new Date(a)) / msPerDay);
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

/** 1問の解答を記録する(正解時はXP・進捗・バッジも更新)。獲得バッジ一覧を返す */
function recordAnswer(state, genreId, termId, isCorrect, questionType) {
  const beforeLevel = levelFromXp(state.xp);
  const newlyUnlocked = [];

  state.totalAnswered += 1;
  touchStreak(state);

  if (!state.genreStats[genreId]) {
    state.genreStats[genreId] = { answered: 0, correct: 0 };
  }
  state.genreStats[genreId].answered += 1;

  const xpAward = XP_BY_TYPE[questionType] ?? XP_BY_TYPE.basic;

  if (isCorrect) {
    state.totalCorrect += 1;
    state.genreStats[genreId].correct += 1;
    state.xp += xpAward;

    if (!state.unitProgress[genreId]) {
      state.unitProgress[genreId] = { correctIds: [] };
    }
    if (!state.unitProgress[genreId].correctIds.includes(termId)) {
      state.unitProgress[genreId].correctIds.push(termId);
    }

    if (state.totalCorrect === 1) unlockBadge(state, "first-quiz", newlyUnlocked);

    const afterLevel = levelFromXp(state.xp);
    if (afterLevel > beforeLevel && afterLevel >= 5) {
      unlockBadge(state, "level-5", newlyUnlocked);
    }
  }

  if (state.streak >= 3) unlockBadge(state, "streak-3", newlyUnlocked);
  if (state.streak >= 7) unlockBadge(state, "streak-7", newlyUnlocked);

  saveState(state);
  return newlyUnlocked;
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

function unitProgressPercent(state, genreId) {
  if (typeof GLOSSARY === "undefined" || !GLOSSARY[genreId]) return 0;
  const total = GLOSSARY[genreId].length;
  const done = state.unitProgress[genreId]?.correctIds.length || 0;
  return total === 0 ? 0 : Math.round((done / total) * 100);
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
