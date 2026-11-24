/* Inforia — 背景アニメーション(情報に関するアイコンがゆっくり浮かぶ)
 * #fxBg があるページで自動的に動く。動きを減らす設定の端末では止める(CSS側)。
 * 数式や数字に見えないよう、通信・セキュリティ・データ・Webなどのアイコンだけを使う。
 */
(function () {
  const host = document.getElementById("fxBg");
  if (!host) return;

  const wrap = (body) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

  const ICONS_FX = [
    // Wi-Fi(通信)
    wrap('<path d="M2 9a15 15 0 0 1 20 0"/><path d="M5.5 12.5a10 10 0 0 1 13 0"/><path d="M9 16a5 5 0 0 1 6 0"/><circle cx="12" cy="19.5" r="1" fill="currentColor"/>'),
    // 鍵つきの錠(セキュリティ)
    wrap('<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.2" fill="currentColor"/>'),
    // クラウド(データ保存)
    wrap('<path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 17.9 8.6 4.7 4.7 0 0 1 17.5 18z"/>'),
    // メール
    wrap('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6.5L20.5 7"/>'),
    // 地球(インターネット)
    wrap('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/>'),
    // チップ(コンピュータ)
    wrap('<rect x="6.5" y="6.5" width="11" height="11" rx="1.5"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 3v3.5M15 3v3.5M9 17.5V21M15 17.5V21M3 9h3.5M3 15h3.5M17.5 9H21M17.5 15H21"/>'),
    // フォルダ(ファイル)
    wrap('<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
    // ブラウザの窓(Web)
    wrap('<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M3 9h18"/><circle cx="6" cy="6.8" r=".7" fill="currentColor"/><circle cx="8.5" cy="6.8" r=".7" fill="currentColor"/>'),
    // 虫めがね(検索)
    wrap('<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5.5 5.5"/>'),
    // 盾(情報セキュリティ)
    wrap('<path d="M12 3 5 6v5.5c0 4.3 2.8 7.6 7 9.5 4.2-1.9 7-5.2 7-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>'),
    // サーバー
    wrap('<rect x="4" y="4" width="16" height="6" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/><circle cx="7.5" cy="7" r=".8" fill="currentColor"/><circle cx="7.5" cy="17" r=".8" fill="currentColor"/>'),
    // QRコード
    wrap('<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2.5v2.5H14zM18 14h2M14 18.5V20M17.5 18h2.5v2"/>'),
  ];

  const COUNT = 16;
  for (let i = 0; i < COUNT; i++) {
    const s = document.createElement("span");
    s.innerHTML = ICONS_FX[i % ICONS_FX.length];
    s.style.left = `${Math.round((i / COUNT) * 100 + Math.random() * 4)}%`;
    s.style.fontSize = `${22 + Math.round(Math.random() * 22)}px`;
    s.style.animationDuration = `${14 + Math.random() * 14}s`;
    s.style.animationDelay = `${-Math.random() * 24}s`;
    host.appendChild(s);
  }

  // 開始画面だけ: ポインタ(指)に合わせて背景が少しずれる
  if (document.body.classList.contains("splash-body") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener("pointermove", (e) => {
      const dx = (e.clientX / window.innerWidth - 0.5) * -36;
      const dy = (e.clientY / window.innerHeight - 0.5) * -36;
      host.style.transform = `translate(${dx}px, ${dy}px)`;
    });
  }
})();
