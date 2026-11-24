/* Inforia — 演出(紙吹雪・数字のカウントアップ・シェイクなど)
 * 「動きを減らす」設定の端末では、動きを伴う演出を省く(数字は最終値をそのまま出す)。
 */
const Fx = (function () {
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const COLORS = ["#2563eb", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#22c55e"];

  /** 数字をfromからtoまで数え上げる。fmt(値)で表示文字列を作る */
  function countUp(el, to, opts) {
    const { from = 0, dur = 900, fmt = (v) => String(v), delay = 0 } = opts || {};
    if (!el) return;
    if (reduce || from === to) {
      el.textContent = fmt(to);
      return;
    }
    el.textContent = fmt(from);
    setTimeout(() => {
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(from + (to - from) * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
  }

  /** originの位置から紙吹雪を飛ばす */
  function confetti(origin, count) {
    if (reduce || !origin || !origin.animate) return;
    const r = origin.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const n = count || 28;
    for (let i = 0; i < n; i++) {
      const d = document.createElement("i");
      d.className = "fx-confetti";
      d.style.left = `${cx}px`;
      d.style.top = `${cy}px`;
      d.style.background = COLORS[i % COLORS.length];
      d.style.width = `${6 + Math.random() * 5}px`;
      d.style.height = `${9 + Math.random() * 7}px`;
      document.body.appendChild(d);
      const angle = (-150 + Math.random() * 120) * (Math.PI / 180);
      const dist = 90 + Math.random() * 150;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const rot = (Math.random() - 0.5) * 720;
      const anim = d.animate(
        [
          { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
          { transform: `translate(${dx}px,${dy}px) rotate(${rot}deg)`, opacity: 1, offset: 0.55 },
          { transform: `translate(${dx * 1.15}px,${dy + 190}px) rotate(${rot * 1.6}deg)`, opacity: 0 },
        ],
        { duration: 1200 + Math.random() * 600, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" }
      );
      anim.onfinish = () => d.remove();
    }
  }

  return { reduce, countUp, confetti };
})();
