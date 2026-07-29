/* Inforia — 出題ロジック
 * 1セッション(10問)は、単語帳(GLOSSARY)から自動生成する基本問題に加えて、
 * コーディング問題・共通テスト対策の応用問題(question-bank.js)を混ぜて出題する。
 */

const QUESTIONS_PER_SESSION = 10;
const SPECIAL_QUESTIONS_PER_SESSION = 3; // コーディング/応用問題の目安出題数

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
 */
function buildBasicQuestion(genreId, termIndex, direction) {
  const pool = GLOSSARY[genreId];
  const [term, definition] = pool[termIndex];
  const distractorIndexes = pickDistractors(pool, termIndex, 3);

  let question, choiceTexts, correctText;
  if (direction === "term") {
    question = `次の説明に当てはまる用語を選びなさい。\n「${definition}」`;
    correctText = term;
    choiceTexts = [term, ...distractorIndexes.map((i) => pool[i][0])];
  } else {
    question = `「${term}」の説明として正しいものを選びなさい。`;
    correctText = definition;
    choiceTexts = [definition, ...distractorIndexes.map((i) => pool[i][1])];
  }

  const order = shuffle(choiceTexts.map((_, i) => i));
  const choices = order.map((i) => choiceTexts[i]);
  const answer = order.indexOf(0);

  return {
    id: `${genreId}_${termIndex}`,
    genreId,
    type: "basic",
    code: null,
    question,
    choices,
    answer,
    explanation: `${term} — ${definition}`,
    image: null,
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

/** 指定ジャンルから10問のセッションを生成する(基本問題+コーディング/応用問題の混合) */
function getSessionQuestions(genreId, count = QUESTIONS_PER_SESSION) {
  const specialPool = getSpecialPool(genreId);
  const specialCount = Math.min(SPECIAL_QUESTIONS_PER_SESSION, specialPool.length, count);
  const chosenSpecial = shuffle(specialPool)
    .slice(0, specialCount)
    .map(shuffleQuestionChoices);

  const basicCount = count - chosenSpecial.length;
  const basicPool = GLOSSARY[genreId];
  const basicIndexes = shuffle(basicPool.map((_, i) => i)).slice(0, basicCount);
  const chosenBasic = basicIndexes.map((termIndex) =>
    buildBasicQuestion(genreId, termIndex, Math.random() < 0.5 ? "term" : "definition")
  );

  return shuffle([...chosenBasic, ...chosenSpecial]);
}
