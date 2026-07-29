/* Inforia — 共通ボトムナビゲーション */

const NAV_ITEMS = [
  { id: "home", label: "ホーム", href: "index.html", icon: "home" },
  { id: "records", label: "成績", href: "records.html", icon: "chart" },
  { id: "ranking", label: "ランキング", href: "ranking.html", icon: "trophy" },
  { id: "profile", label: "マイページ", href: "profile.html", icon: "user" },
];

function renderBottomNav(activeId) {
  const nav = document.getElementById("bottomNav");
  if (!nav) return;
  nav.innerHTML = NAV_ITEMS.map((item) => {
    const activeClass = item.id === activeId ? "active" : "";
    return `
      <a class="nav-item ${activeClass}" href="${item.href}">
        <span class="nav-icon icon">${ICONS[item.icon]}</span>${item.label}
      </a>
    `;
  }).join("");
}
