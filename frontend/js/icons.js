/* Inforia — オリジナルSVGアイコンセット(絵文字の代替)
 * ICONS.xxx は innerHTML にそのまま差し込める文字列を返す。
 * currentColor を使っているものは親要素のcolorで色を制御できる。
 */

const ICONS = {
  // 学習ストリーク(炎)
  flame: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2c1 3-2.5 4.2-2.5 7.2 0 1.3 1 2.3 2.3 2.3.9 0 1.6-.5 2-1.2.6 1 1 2.2 1 3.4 0 3-2.6 5.3-5.8 5.3S3.2 17.7 3.2 14.7c0-4.8 3.4-6.9 5-10.4.5 1.4.2 2.6-.3 3.7C9.4 5.8 11 3.8 12 2Z"
        fill="url(#flameGrad)" stroke="#c2410c" stroke-width="0.5"/>
      <defs>
        <linearGradient id="flameGrad" x1="4" y1="22" x2="16" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#f59e0b"/>
          <stop offset="1" stop-color="#ef4444"/>
        </linearGradient>
      </defs>
    </svg>`,

  // ナビ: ホーム
  home: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-5a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v5h3a1 1 0 0 0 1-1v-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // ナビ: 成績(バーチャート)
  chart: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="13" width="4" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
      <rect x="10" y="9" width="4" height="11" rx="1" stroke="currentColor" stroke-width="2"/>
      <rect x="16" y="4" width="4" height="16" rx="1" stroke="currentColor" stroke-width="2"/>
    </svg>`,

  // ナビ: ランキング(表彰台)
  trophy: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M7 5H4v1a3 3 0 0 0 3 3M17 5h3v1a3 3 0 0 1-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M12 13v3" stroke="currentColor" stroke-width="2"/>
      <path d="M8 20h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M9 20v-2a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v2" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,

  // ナビ: マイページ(人物)
  user: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" stroke-width="2"/>
      <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

  // 正解チェック
  check: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12.5 10 17l9-10" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // 不正解バツ
  cross: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6l12 12M18 6 6 18" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
    </svg>`,

  // XP星
  star: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5-4.8-4.6 6.6-.9L12 2.5Z"
        fill="#f59e0b" stroke="#d97706" stroke-width="0.5" stroke-linejoin="round"/>
    </svg>`,

  // ロック(未獲得バッジ)
  lock: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" stroke-width="2"/>
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

  // AI生成イメージのプレースホルダー
  image: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
      <circle cx="9" cy="10" r="1.6" stroke="currentColor" stroke-width="1.6"/>
      <path d="M3 17l5.5-5 4 4 3-3L21 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // メール(ログイン画面)
  mail: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.8"/>
      <path d="M4 6.5 12 13l8-6.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // 鍵(パスワード)
  key: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="14.5" r="4" stroke="currentColor" stroke-width="1.8"/>
      <path d="M11 11.5 19 3.5M16.5 6l2 2M19 3.5l2 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // 戻る矢印(閉じるボタンの代わり等)
  close: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

  // 矢印(進む)
  arrowRight: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // バッジ(汎用メダル型。tierごとにCSSで色を変える)
  medal: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="14" r="6.5" fill="currentColor" opacity="0.18"/>
      <circle cx="12" cy="14" r="6.5" stroke="currentColor" stroke-width="1.8"/>
      <path d="M9.5 2 8 8l4 2 4-2-1.5-6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M10.5 12.5 12 11l1.5 1.5-.4 2-1.1.8-1.1-.8-.4-2Z" fill="currentColor"/>
    </svg>`,

  // 王冠(高tierバッジ用)
  crown: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 18 3 8l4.5 3.5L12 6l4.5 5.5L21 8l-1 10H4Z" fill="currentColor" opacity="0.2"/>
      <path d="M4 18 3 8l4.5 3.5L12 6l4.5 5.5L21 8l-1 10H4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M4 20h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,

  // 電球(ヒント)
  bulb: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18h6M10 21h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1.1 2.1h4.8c.1-.9.5-1.6 1.1-2.1A6 6 0 0 0 12 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    </svg>`,

  // キラキラ(AI生成ラベル)
  sparkle: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" fill="currentColor"/>
      <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" fill="currentColor"/>
    </svg>`,
};

function icon(name, extraClass = "") {
  return `<span class="icon ${extraClass}">${ICONS[name] || ""}</span>`;
}

/** プロフィールアイコン(人物アイコン+右下にレベルバッジ)のHTMLを返す */
function avatarHTML(level) {
  return `
    <span class="icon avatar-person">${ICONS.user}</span>
    <span class="avatar-level-badge">Lv.${level}</span>
  `;
}
