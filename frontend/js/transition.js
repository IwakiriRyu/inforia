/* Inforia — 画面遷移アニメーション「潜る」
 * ログイン・新規登録に成功したとき、手前に出てきた画面がそのまま水の中へ潜り、
 * ホームが水面から現れる。head 内で読み込むこと(ホーム側の演出を、画面が出る前に始めるため)。
 */
(function () {
  const FLAG = "inforia_dive";
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
