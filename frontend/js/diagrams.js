/* Inforia — 解説用オリジナル図解ジェネレータ(SVG)
 * 本番ではLLM APIが問題ごとに解説画像を自動生成する想定だが、
 * コーディング問題・応用問題の一部には、その仕組みを具体的にイメージしてもらうため
 * 実際に描画したオリジナルの図解をあらかじめ用意している。
 */

const DIAGRAM_COLORS = {
  navy: "#0f1f4d",
  blue: "#2563eb",
  teal: "#14b8a6",
  green: "#16a34a",
  red: "#dc2626",
  gray: "#94a3b8",
  bg: "#f8fafc",
};

/** 変数の状態変化を箱と矢印で示す図(コーディング問題向け) */
function svgVariableTrace(steps) {
  const many = steps.length >= 5;
  const boxW = many ? 84 : steps.length === 4 ? 96 : 108;
  const boxH = 64;
  const gap = many ? 28 : 40;
  const width = steps.length * boxW + (steps.length - 1) * gap + 20;
  const height = 110;

  const boxes = steps
    .map((step, i) => {
      const x = 10 + i * (boxW + gap);
      const y = (height - boxH) / 2;
      const arrow =
        i < steps.length - 1
          ? `<path d="M${x + boxW + 6} ${y + boxH / 2} L${x + boxW + gap - 6} ${
              y + boxH / 2
            }" stroke="${DIAGRAM_COLORS.gray}" stroke-width="2" marker-end="url(#arrow)"/>`
          : "";
      return `
        <g>
          <rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="10"
            fill="#fff" stroke="${DIAGRAM_COLORS.blue}" stroke-width="2"/>
          <text x="${x + boxW / 2}" y="${y + 22}" text-anchor="middle"
            font-size="12" font-weight="700" fill="${DIAGRAM_COLORS.gray}">${escapeXml(step.label)}</text>
          <text x="${x + boxW / 2}" y="${y + 46}" text-anchor="middle"
            font-size="18" font-weight="800" fill="${DIAGRAM_COLORS.navy}">${escapeXml(step.value)}</text>
        </g>
        ${arrow}
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto;">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="${DIAGRAM_COLORS.gray}"/>
        </marker>
      </defs>
      ${boxes}
    </svg>
  `;
}

/** 棒グラフ(データ活用の応用問題向け) */
function svgBarChart(bars, opts = {}) {
  const width = 320;
  const height = 180;
  const paddingBottom = 34;
  const paddingTop = 16;
  const chartH = height - paddingBottom - paddingTop;
  const barW = (width - 20) / bars.length - 14;
  const maxVal = opts.max || Math.max(...bars.map((b) => b.value)) * 1.15;

  const barsSvg = bars
    .map((b, i) => {
      const x = 10 + i * (barW + 14);
      const h = (b.value / maxVal) * chartH;
      const y = paddingTop + (chartH - h);
      const highlight = b.highlight ? DIAGRAM_COLORS.teal : DIAGRAM_COLORS.blue;
      return `
        <rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="4" fill="${highlight}"/>
        <text x="${x + barW / 2}" y="${y - 6}" text-anchor="middle" font-size="12" font-weight="800" fill="${DIAGRAM_COLORS.navy}">${b.value}</text>
        <text x="${x + barW / 2}" y="${height - paddingBottom + 18}" text-anchor="middle" font-size="11" fill="${DIAGRAM_COLORS.gray}">${escapeXml(b.label)}</text>
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto;">
      <line x1="10" y1="${height - paddingBottom}" x2="${width - 10}" y2="${height - paddingBottom}" stroke="${DIAGRAM_COLORS.gray}" stroke-width="1.5"/>
      ${barsSvg}
    </svg>
  `;
}

/** 2つの選択肢を並べて適切/不適切を示す図(判断・シナリオ問題向け) */
function svgCompare(leftLabel, rightLabel, correctSide) {
  const width = 320;
  const height = 140;
  const panelW = 140;
  const panelH = 90;
  const gap = 20;
  const leftX = 10;
  const rightX = 10 + panelW + gap;
  const y = 20;

  const panel = (x, label, isCorrect) => `
    <rect x="${x}" y="${y}" width="${panelW}" height="${panelH}" rx="12"
      fill="${isCorrect ? "#f0fdf4" : "#fef2f2"}"
      stroke="${isCorrect ? DIAGRAM_COLORS.green : DIAGRAM_COLORS.red}" stroke-width="2.5"/>
    <circle cx="${x + panelW - 20}" cy="${y + 20}" r="13" fill="${isCorrect ? DIAGRAM_COLORS.green : DIAGRAM_COLORS.red}"/>
    <text x="${x + panelW - 20}" y="${y + 25}" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">${isCorrect ? "○" : "×"}</text>
    <foreignObject x="${x + 10}" y="${y + 34}" width="${panelW - 20}" height="${panelH - 40}">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:12px; font-weight:700; line-height:1.5; color:${DIAGRAM_COLORS.navy}; text-align:center;">${escapeXml(label)}</div>
    </foreignObject>
  `;

  return `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto;">
      ${panel(leftX, leftLabel, correctSide === "left")}
      ${panel(rightX, rightLabel, correctSide === "right")}
    </svg>
  `;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
