/* Inforia — ランキング(モックデータ+自分のXPを合成した仮実装) */

requireAuth();

(function () {
  renderBottomNav("ranking");

  const state = loadState();
  const myEmail = currentUserEmail();
  const { level } = xpProgressInLevel(state.xp);

  const mockUsers = [
    { name: "ゆうと", xp: 480 },
    { name: "みなみ", xp: 420 },
    { name: "そうた", xp: 360 },
    { name: "はるか", xp: 300 },
    { name: "けんじ", xp: 240 },
    { name: "あおい", xp: 180 },
    { name: "りく", xp: 120 },
  ];

  const entries = [
    ...mockUsers.map((u) => ({ ...u, isMe: false })),
    { name: myEmail ? myEmail.split("@")[0] : "あなた", xp: state.xp, isMe: true },
  ].sort((a, b) => b.xp - a.xp);

  const list = document.getElementById("rankingList");
  entries.forEach((entry, i) => {
    const rank = i + 1;
    const rankClass = rank === 1 ? "top1" : rank === 2 ? "top2" : rank === 3 ? "top3" : "";
    const row = document.createElement("div");
    row.className = `rank-row ${rankClass}`;
    row.innerHTML = `
      <div class="rank-num">${rank}</div>
      <div class="rank-avatar">${entry.name.slice(0, 2)}</div>
      <div class="rank-info">
        <div class="rank-name ${entry.isMe ? "me" : ""}">${entry.name}${entry.isMe ? "(あなた)" : ""}</div>
        <div class="rank-meta">Lv.${entry.isMe ? level : Math.max(1, Math.floor(entry.xp / 100) + 1)}</div>
      </div>
      <div class="rank-xp">${entry.xp} XP</div>
    `;
    list.appendChild(row);
  });
})();
