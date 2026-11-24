/* Inforia — 背景アニメーション(0/1などの記号がゆっくり浮かぶ)
 * #fxBg があるページで自動的に動く。動きを減らす設定の端末では止める(CSS側)。
 */
(function () {
  const host = document.getElementById("fxBg");
  if (!host) return;
  const TOKENS = ["0", "1", "01", "10", "{ }", "< >", "//", "AND", "#"];
  const COUNT = 18;
  for (let i = 0; i < COUNT; i++) {
    const s = document.createElement("span");
    s.textContent = TOKENS[i % TOKENS.length];
    s.style.left = `${Math.round((i / COUNT) * 100 + Math.random() * 4)}%`;
    s.style.fontSize = `${14 + Math.round(Math.random() * 22)}px`;
    s.style.animationDuration = `${14 + Math.random() * 14}s`;
    s.style.animationDelay = `${-Math.random() * 24}s`;
    host.appendChild(s);
  }
})();
