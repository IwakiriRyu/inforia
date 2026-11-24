/* Inforia — 出題ロジック
 * 1セッション(10問)は、単語帳(GLOSSARY)から自動生成する基本問題に加えて、
 * コーディング問題・共通テスト対策の応用問題(question-bank.js)を混ぜて出題する。
 * 復習セッションは、期限が来た問題(state.js の review)を再出題する。
 */

const QUESTIONS_PER_SESSION = 10;
const SPECIAL_QUESTIONS_PER_SESSION = 3; // コーディング/応用問題の目安出題数
const DIAGRAM_BASIC_PER_SESSION = 2; // 説明図のある基本問題の目安出題数

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pickDistractors(pool, excludeIndex, count) {
  const candidates = pool.map((_, i) => i).filter((i) => i !== excludeIndex);
  return shuffle(candidates).slice(0, count);
}

/**
 * 単語帳の1エントリから基本問題を1問作る。
 * direction: "term" = 定義文を見て用語を選ぶ / "definition" = 用語を見て定義文を選ぶ
 * choiceNotes: 各選択肢が何を表すか(「よくある間違い」の解説に使う)
 */
function buildBasicQuestion(genreId, termIndex, direction) {
  const pool = GLOSSARY[genreId];
  const [term, definition] = pool[termIndex];
  const distractorIndexes = pickDistractors(pool, termIndex, 3);
  const idxs = [termIndex, ...distractorIndexes];

  let question, choiceTexts, choiceNotesRaw;
  if (direction === "term") {
    question = `次の説明に当てはまる用語を選びなさい。\n「${definition}」`;
    choiceTexts = idxs.map((i) => pool[i][0]);
    choiceNotesRaw = idxs.map((i) => `「${pool[i][0]}」は、${pool[i][1].replace(/。$/, "")}という意味。`);
  } else {
    question = `「${term}」の説明として正しいものを選びなさい。`;
    choiceTexts = idxs.map((i) => pool[i][1]);
    choiceNotesRaw = idxs.map((i) => `この説明は「${pool[i][0]}」のもの。`);
  }

  const order = shuffle(choiceTexts.map((_, i) => i));
  const choices = order.map((i) => choiceTexts[i]);
  const choiceNotes = order.map((i) => choiceNotesRaw[i]);
  const answer = order.indexOf(0);
  const distractorTerm = pool[distractorIndexes[0]][0];

  return {
    id: `${genreId}_${termIndex}`,
    genreId,
    type: "basic",
    code: null,
    question,
    choices,
    answer,
    explanation: `${term} — ${definition}`,
    choiceNotes,
    distractorTerm,
    term,
    image: TERM_DIAGRAMS[term] || null,
  };
}

/** コーディング/応用問題の選択肢をシャッフルしたコピーを返す(答えの位置を毎回変える) */
function shuffleQuestionChoices(q) {
  const order = shuffle(q.choices.map((_, i) => i));
  return {
    ...q,
    choices: order.map((i) => q.choices[i]),
    answer: order.indexOf(q.answer),
  };
}

function getSpecialPool(genreId) {
  const coding = genreId === "programming" ? CODING_QUESTIONS.programming : [];
  const applied = APPLIED_QUESTIONS[genreId] || [];
  return [...coding, ...applied];
}

/** ジャンルの問題総数(単語帳+手作り問題)。習得率の分母に使う */
function genreQuestionTotal(genreId) {
  return (GLOSSARY[genreId]?.length || 0) + getSpecialPool(genreId).length;
}

/** IDから問題を作り直す(復習用)。基本問題の出題方向は毎回ランダム */
function getQuestionById(id) {
  const m = /^(\w+)_(\d+)$/.exec(id);
  if (m && GLOSSARY[m[1]] && GLOSSARY[m[1]][Number(m[2])]) {
    return buildBasicQuestion(m[1], Number(m[2]), Math.random() < 0.5 ? "term" : "definition");
  }
  for (const g of GENRES) {
    const found = getSpecialPool(g.id).find((q) => q.id === id);
    if (found) return shuffleQuestionChoices(found);
  }
  return null;
}

/** 指定ジャンルから10問のセッションを生成する(基本問題+コーディング/応用問題の混合) */
function getSessionQuestions(genreId, count = QUESTIONS_PER_SESSION) {
  const specialPool = getSpecialPool(genreId);
  const specialCount = Math.min(SPECIAL_QUESTIONS_PER_SESSION, specialPool.length, count);
  const chosenSpecial = shuffle(specialPool)
    .slice(0, specialCount)
    .map(shuffleQuestionChoices);

  const basicCount = count - chosenSpecial.length;
  const basicPool = GLOSSARY[genreId];
  const allIdx = basicPool.map((_, i) => i);
  // 説明図のある用語を一部必ず混ぜる(構造・手順・関係を図で確かめられるようにする)
  const withDiagram = shuffle(allIdx.filter((i) => TERM_DIAGRAMS[basicPool[i][0]]));
  const diagramPick = withDiagram.slice(0, Math.min(DIAGRAM_BASIC_PER_SESSION, basicCount));
  const rest = shuffle(allIdx.filter((i) => !diagramPick.includes(i))).slice(0, basicCount - diagramPick.length);
  const chosenBasic = [...diagramPick, ...rest].map((termIndex) =>
    buildBasicQuestion(genreId, termIndex, Math.random() < 0.5 ? "term" : "definition")
  );

  return shuffle([...chosenBasic, ...chosenSpecial]);
}

/** 復習セッション(期限が来た問題。1日の上限あり) */
function getReviewQuestions(state, limit = REVIEW_DAILY_LIMIT) {
  return getDueReviewIds(state)
    .slice(0, limit)
    .map(getQuestionById)
    .filter(Boolean);
}
