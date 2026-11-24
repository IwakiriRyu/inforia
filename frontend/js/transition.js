/* Inforia — 画面遷移アニメーション「潜る」
 * ログイン・新規登録に成功したとき、手前に出てきた画面がそのまま水の中へ潜り、
 * ホームが水面から現れる。head 内で読み込むこと(ホーム側の演出を、画面が出る前に始めるため)。
 */
(function () {
  const FLAG = "inforia_dive";
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const EXPAND_FLAG = "inforia_expand";
  try {
    if (sessionStorage.getItem(EXPAND_FLAG) === "1") {
      sessionStorage.removeItem(EXPAND_FLAG);
      if (!reduce) {
        document.documentElement.classList.add("expand-entering");
        setTimeout(() => document.documentElement.classList.remove("expand-entering"), 900);
      }
    }
  } catch (e) {}

  // ── 到着側: 潜ってきた直後だけ、水面から現れる演出を流す ──
  try {
    if (sessionStorage.getItem(FLAG) === "1") {
      sessionStorage.removeItem(FLAG);
      if (!reduce) {
        document.documentElement.classList.add("dive-entering");
        setTimeout(() => document.documentElement.classList.remove("dive-entering"), 1400);
      }
    }
  } catch (e) {}

  // ── カードが画面いっぱいに広がってから移動する(ホーム→クイズ) ──
  window.expandTo = function (el, url) {
    if (reduce || !el.animate) {
      window.location.href = url;
      return;
    }
    try {
      sessionStorage.setItem(EXPAND_FLAG, "1");
    } catch (e) {}
    const r = el.getBoundingClientRect();
    const layer = document.createElement("div");
    layer.className = "expand-layer";
    layer.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;`;
    document.body.appendChild(layer);
    layer.animate(
      [
        { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, borderRadius: "16px" },
        { left: "0px", top: "0px", width: `${window.innerWidth}px`, height: `${window.innerHeight}px`, borderRadius: "0px" },
      ],
      { duration: 420, easing: "cubic-bezier(0.5, 0, 0.2, 1)", fill: "forwards" }
    );
    setTimeout(() => {
      window.location.href = url;
    }, 440);
  };

  // ── 出発側: 画面を潜らせてから移動する ──
  window.diveTo = function (url) {
    if (reduce) {
      window.location.href = url;
      return;
    }
    try {
      sessionStorage.setItem(FLAG, "1");
    } catch (e) {}
    const overlay = document.createElement("div");
    overlay.className = "dive-overlay";
    overlay.innerHTML = '<i></i><i></i><i></i>';
    document.body.appendChild(overlay);
    document.documentElement.classList.add("diving");
    setTimeout(() => {
      window.location.href = url;
    }, 1300);
  };
})();
