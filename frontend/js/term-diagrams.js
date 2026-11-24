/* Inforia — 説明図(構造・手順・関係を示す図)と「よくある間違い」データ
 * 方針: 説明図は構造・手順・関係だけを示し、飾りの絵は入れない。
 * 本実装ではAIが図の仕様(データ)を出し、人が確認したあと、テンプレートで描画する。
 * ここでは試作として、手作成した仕様をテンプレートで描画している。
 */

const C2 = DIAGRAM_COLORS;

function lines(text) {
  return String(text).split("\n");
}

/** 箱と矢印の流れ図。items: [{top?, main}], edges: 矢印の上に付ける短い文字(省略可) */
function svgFlow(items, edges = [], opts = {}) {
  const boxW = opts.boxW || 104;
  const boxH = 70;
  const maxEdge = Math.max(0, ...edges.map((e) => (e ? e.length : 0)));
  const gap = maxEdge ? Math.max(58, maxEdge * 10 + 22) : 40;
  const width = items.length * boxW + (items.length - 1) * gap + 20;
  const height = 120;
  const y = (height - boxH) / 2;
  const id = "ar" + Math.random().toString(36).slice(2, 7);
  const parts = items
    .map((it, i) => {
      const x = 10 + i * (boxW + gap);
      const ls = lines(it.main);
      const longest = Math.max(...ls.map((l) => l.length));
      const fs = longest <= 5 ? 17 : longest <= 7 ? 14 : 12;
      const topY = y + 18;
      const mainStart = it.top ? y + 44 : y + boxH / 2 - ((ls.length - 1) * (fs + 3)) / 2 + fs / 3;
      const mainText = ls
        .map((l, k) => `<text x="${x + boxW / 2}" y="${mainStart + k * (fs + 3)}" text-anchor="middle" font-size="${fs}" font-weight="800" fill="${C2.navy}">${escapeXml(l)}</text>`)
        .join("");
      const top = it.top
        ? `<text x="${x + boxW / 2}" y="${topY}" text-anchor="middle" font-size="11" font-weight="700" fill="${C2.gray}">${escapeXml(it.top)}</text>`
        : "";
      const arrow =
        i < items.length - 1
          ? `<path d="M${x + boxW + 6} ${height / 2} L${x + boxW + gap - 6} ${height / 2}" stroke="${C2.gray}" stroke-width="2" marker-end="url(#${id})"/>` +
            (edges[i]
              ? `<text x="${x + boxW + gap / 2}" y="${height / 2 - 8}" text-anchor="middle" font-size="10" font-weight="700" fill="${C2.blue}">${escapeXml(edges[i])}</text>`
              : "")
          : "";
      return `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="10" fill="#fff" stroke="${opts.highlight === i ? C2.teal : C2.blue}" stroke-width="2"/>${top}${mainText}${arrow}`;
    })
    .join("");
  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto;">
    <defs><marker id="${id}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="${C2.gray}"/></marker></defs>${parts}</svg>`;
}

/** 2進数の桁の重みと合計 */
function svgBits(bits) {
  const n = bits.length;
  const cell = 52;
  const width = n * cell + 20;
  const height = 150;
  const weights = bits.split("").map((_, i) => 2 ** (n - 1 - i));
  const sum = bits.split("").reduce((a, b, i) => a + (b === "1" ? weights[i] : 0), 0);
  const cells = bits
    .split("")
    .map((b, i) => {
      const x = 10 + i * cell;
      return `<text x="${x + cell / 2}" y="22" text-anchor="middle" font-size="12" font-weight="700" fill="${C2.gray}">${weights[i]}</text>
        <rect x="${x + 3}" y="32" width="${cell - 6}" height="44" rx="8" fill="${b === "1" ? "#dbeafe" : "#fff"}" stroke="${C2.blue}" stroke-width="2"/>
        <text x="${x + cell / 2}" y="62" text-anchor="middle" font-size="20" font-weight="800" fill="${C2.navy}">${b}</text>`;
    })
    .join("");
  const expr = bits
    .split("")
    .map((b, i) => (b === "1" ? weights[i] : null))
    .filter((v) => v !== null)
    .join(" + ");
  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto;">
    ${cells}
    <text x="${width / 2}" y="112" text-anchor="middle" font-size="14" font-weight="800" fill="${C2.navy}">${expr} = ${sum}</text>
    <text x="${width / 2}" y="136" text-anchor="middle" font-size="11" fill="${C2.gray}">1の桁の重みを足す</text></svg>`;
}

/** 真理値表 */
function svgTruth(header, rows) {
  const cols = header.length;
  const widths = header.map((h, i) => (i === cols - 1 ? Math.max(64, h.length * 11 + 18) : 56));
  const xs = widths.reduce((acc, w, i) => (acc.push(i === 0 ? 10 : acc[i - 1] + widths[i - 1]), acc), []);
  const rh = 30;
  const width = widths.reduce((a, b) => a + b, 0) + 20;
  const height = (rows.length + 1) * rh + 20;
  const cells = [header, ...rows]
    .map((r, ri) =>
      r
        .map((v, ci) => {
          const x = xs[ci];
          const y = 10 + ri * rh;
          const last = ci === cols - 1;
          const fill = ri === 0 ? C2.navy : last ? "#dbeafe" : "#fff";
          const color = ri === 0 ? "#fff" : C2.navy;
          return `<rect x="${x}" y="${y}" width="${widths[ci]}" height="${rh}" fill="${fill}" stroke="#cbd5e1"/>
            <text x="${x + widths[ci] / 2}" y="${y + 20}" text-anchor="middle" font-size="14" font-weight="800" fill="${color}">${v}</text>`;
        })
        .join("")
    )
    .join("");
  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="width:${Math.min(100, (width / 320) * 100)}%; max-width:${width * 1.4}px; height:auto; display:block; margin:0 auto;">${cells}</svg>`;
}

/** 階層(上から下へ積んだ層)。layers: [{name, note}] */
function svgLayers(layers, highlight) {
  const rowH = 44;
  const width = 320;
  const height = layers.length * (rowH + 8) + 12;
  const rows = layers
    .map((l, i) => {
      const y = 8 + i * (rowH + 8);
      const hl = highlight === i;
      return `<rect x="10" y="${y}" width="${width - 20}" height="${rowH}" rx="8" fill="${hl ? "#ccfbf1" : "#eff6ff"}" stroke="${hl ? C2.teal : C2.blue}" stroke-width="2"/>
        <text x="24" y="${y + 27}" font-size="14" font-weight="800" fill="${C2.navy}">${escapeXml(l.name)}</text>
        <text x="${width - 24}" y="${y + 27}" text-anchor="end" font-size="11" font-weight="700" fill="${C2.gray}">${escapeXml(l.note || "")}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto;">${rows}</svg>`;
}

/** 配列(番号と値) */
function svgArray(values, indexLabel = "") {
  const cell = 54;
  const width = values.length * cell + 20;
  const cells = values
    .map((v, i) => {
      const x = 10 + i * cell;
      return `<text x="${x + cell / 2}" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="${C2.gray}">${i}</text>
        <rect x="${x + 2}" y="28" width="${cell - 4}" height="42" rx="6" fill="#fff" stroke="${C2.blue}" stroke-width="2"/>
        <text x="${x + cell / 2}" y="56" text-anchor="middle" font-size="17" font-weight="800" fill="${C2.navy}">${escapeXml(v)}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 ${width} 96" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto;">${cells}
    <text x="${width / 2}" y="90" text-anchor="middle" font-size="11" fill="${C2.gray}">${escapeXml(indexLabel || "上の数字は番号(0から始まる)")}</text></svg>`;
}

/** スタック(後入れ先出し)/ キュー(先入れ先出し) */
function svgStack() {
  const cells = ["C", "B", "A"]
    .map(
      (v, i) => `<rect x="130" y="${28 + i * 38}" width="80" height="34" rx="6" fill="${i === 0 ? "#ccfbf1" : "#fff"}" stroke="${C2.blue}" stroke-width="2"/>
      <text x="170" y="${51 + i * 38}" text-anchor="middle" font-size="16" font-weight="800" fill="${C2.navy}">${v}</text>`
    )
    .join("");
  return `<svg viewBox="0 0 340 150" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto;">
    <path d="M122 20 L122 138 L218 138 L218 20" fill="none" stroke="${C2.gray}" stroke-width="2"/>${cells}
    <text x="52" y="46" text-anchor="middle" font-size="12" font-weight="700" fill="${C2.blue}">入れる(push)</text>
    <path d="M30 56 L104 56" stroke="${C2.blue}" stroke-width="2"/>
    <text x="290" y="46" text-anchor="middle" font-size="12" font-weight="700" fill="${C2.red}">出す(pop)</text>
    <path d="M236 56 L310 56" stroke="${C2.red}" stroke-width="2"/>
    <text x="170" y="12" text-anchor="middle" font-size="11" fill="${C2.gray}">出入口は同じ上側。最後に入れたCが最初に出る</text></svg>`;
}
function svgQueue() {
  const cells = ["A", "B", "C"]
    .map(
      (v, i) => `<rect x="${100 + i * 52}" y="50" width="46" height="44" rx="6" fill="${i === 0 ? "#ccfbf1" : "#fff"}" stroke="${C2.blue}" stroke-width="2"/>
      <text x="${123 + i * 52}" y="78" text-anchor="middle" font-size="16" font-weight="800" fill="${C2.navy}">${v}</text>`
    )
    .join("");
  return `<svg viewBox="0 0 340 130" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto;">
    <path d="M92 44 L264 44 M92 100 L264 100" stroke="${C2.gray}" stroke-width="2"/>${cells}
    <text x="40" y="76" text-anchor="middle" font-size="12" font-weight="700" fill="${C2.red}">出す</text>
    <path d="M60 72 L86 72" stroke="${C2.red}" stroke-width="2"/>
    <text x="300" y="76" text-anchor="middle" font-size="12" font-weight="700" fill="${C2.blue}">入れる</text>
    <path d="M290 72 L268 72" stroke="${C2.blue}" stroke-width="2"/>
    <text x="170" y="22" text-anchor="middle" font-size="11" fill="${C2.gray}">先に入れたAが最初に出る(入口と出口が反対側)</text></svg>`;
}

/** 光の三原色(加法混色) */
function svgAdditive() {
  return `<svg viewBox="0 0 320 170" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto;">
    <circle cx="140" cy="68" r="42" fill="#ef4444" fill-opacity="0.65"/>
    <circle cx="182" cy="68" r="42" fill="#22c55e" fill-opacity="0.65"/>
    <circle cx="161" cy="104" r="42" fill="#3b82f6" fill-opacity="0.65"/>
    <text x="118" y="60" font-size="14" font-weight="800" fill="#fff">R</text>
    <text x="198" y="60" font-size="14" font-weight="800" fill="#fff">G</text>
    <text x="158" y="130" font-size="14" font-weight="800" fill="#fff">B</text>
    <text x="161" y="86" text-anchor="middle" font-size="13" font-weight="800" fill="${C2.navy}">白</text>
    <text x="270" y="86" text-anchor="middle" font-size="12" font-weight="700" fill="${C2.gray}">3色を全部</text>
    <text x="270" y="102" text-anchor="middle" font-size="12" font-weight="700" fill="${C2.gray}">重ねると白</text></svg>`;
}

/** 文字サイズの差(ジャンプ率) */
function svgJump() {
  const block = (x, big, label, ok) => `
    <rect x="${x}" y="8" width="145" height="110" rx="10" fill="#fff" stroke="${ok ? C2.green : C2.gray}" stroke-width="2"/>
    <text x="${x + 12}" y="${big ? 44 : 34}" font-size="${big ? 22 : 13}" font-weight="800" fill="${C2.navy}">見出し</text>
    <rect x="${x + 12}" y="62" width="110" height="6" rx="3" fill="#cbd5e1"/><rect x="${x + 12}" y="76" width="96" height="6" rx="3" fill="#cbd5e1"/><rect x="${x + 12}" y="90" width="104" height="6" rx="3" fill="#cbd5e1"/>
    <text x="${x + 72}" y="136" text-anchor="middle" font-size="12" font-weight="700" fill="${ok ? C2.green : C2.gray}">${label}</text>`;
  return `<svg viewBox="0 0 320 146" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto;">${block(10, true, "大:強弱が分かる", true)}${block(165, false, "小:差が小さい", false)}</svg>`;
}

/** 相関と因果(共通の要因) */
function svgConfound() {
  const box = (x, y, t, c) => `<rect x="${x}" y="${y}" width="110" height="44" rx="10" fill="#fff" stroke="${c}" stroke-width="2"/>
    <text x="${x + 55}" y="${y + 27}" text-anchor="middle" font-size="13" font-weight="800" fill="${C2.navy}">${t}</text>`;
  return `<svg viewBox="0 0 340 190" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto;">
    <defs><marker id="cf" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="${C2.gray}"/></marker></defs>
    ${box(115, 8, "気温の上昇", C2.teal)}${box(10, 118, "アイスの売上", C2.blue)}${box(220, 118, "水難事故の数", C2.blue)}
    <path d="M140 54 L70 112" stroke="${C2.gray}" stroke-width="2" marker-end="url(#cf)"/>
    <path d="M200 54 L270 112" stroke="${C2.gray}" stroke-width="2" marker-end="url(#cf)"/>
    <path d="M124 140 L214 140" stroke="${C2.red}" stroke-width="2" stroke-dasharray="5 4"/>
    <text x="170" y="182" text-anchor="middle" font-size="11" font-weight="700" fill="${C2.red}">この2つに相関はあるが、原因と結果ではない</text></svg>`;
}

/** パケット交換方式(データを分けて送り、受け手でつなぐ) */
function svgPackets() {
  const pk = (x, y, n) => `<rect x="${x}" y="${y}" width="40" height="26" rx="5" fill="#fff" stroke="${C2.blue}" stroke-width="2"/><text x="${x + 20}" y="${y + 18}" text-anchor="middle" font-size="13" font-weight="800" fill="${C2.navy}">${n}</text>`;
  return `<svg viewBox="0 0 340 140" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto;">
    <rect x="8" y="48" width="64" height="44" rx="10" fill="#eff6ff" stroke="${C2.blue}" stroke-width="2"/><text x="40" y="74" text-anchor="middle" font-size="12" font-weight="800" fill="${C2.navy}">データ</text>
    <rect x="268" y="48" width="64" height="44" rx="10" fill="#eff6ff" stroke="${C2.blue}" stroke-width="2"/><text x="300" y="74" text-anchor="middle" font-size="12" font-weight="800" fill="${C2.navy}">受け手</text>
    <path d="M76 70 L110 70" stroke="${C2.gray}" stroke-width="2"/>
    ${pk(116, 18, "①")}${pk(176, 18, "②")}${pk(116, 56, "③")}${pk(176, 56, "④")}
    <text x="168" y="110" text-anchor="middle" font-size="11" font-weight="700" fill="${C2.blue}">小さな単位(パケット)に分けて、空いた道で送る</text>
    <path d="M222 70 L262 70" stroke="${C2.gray}" stroke-width="2"/>
    <text x="168" y="128" text-anchor="middle" font-size="11" fill="${C2.gray}">1本の回線を、ほかの通信と共有できる</text></svg>`;
}

/** 分岐(条件によって2つの道に分かれる) */
function svgBranch(cond, yes, no) {
  const box = (x, y, w, t, c) => `<rect x="${x}" y="${y}" width="${w}" height="46" rx="10" fill="#fff" stroke="${c}" stroke-width="2"/><text x="${x + w / 2}" y="${y + 29}" text-anchor="middle" font-size="15" font-weight="800" fill="${C2.navy}">${t}</text>`;
  return `<svg viewBox="0 0 340 150" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto;">
    <defs><marker id="br" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="${C2.gray}"/></marker></defs>
    ${box(10, 52, 110, cond, C2.blue)}${box(220, 8, 110, yes, C2.teal)}${box(220, 96, 110, no, C2.teal)}
    <path d="M122 68 L214 33" stroke="${C2.gray}" stroke-width="2" marker-end="url(#br)"/>
    <path d="M122 82 L214 119" stroke="${C2.gray}" stroke-width="2" marker-end="url(#br)"/>
    <text x="176" y="42" text-anchor="middle" font-size="11" font-weight="700" fill="${C2.blue}">はい</text>
    <text x="176" y="118" text-anchor="middle" font-size="11" font-weight="700" fill="${C2.blue}">いいえ</text></svg>`;
}

/** 反復(条件が成り立つ間、処理を繰り返す) */
function svgLoop(cond, body, exit) {
  const box = (x, y, w, t, c) => `<rect x="${x}" y="${y}" width="${w}" height="46" rx="10" fill="#fff" stroke="${c}" stroke-width="2"/><text x="${x + w / 2}" y="${y + 29}" text-anchor="middle" font-size="15" font-weight="800" fill="${C2.navy}">${t}</text>`;
  return `<svg viewBox="0 0 340 162" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto;">
    <defs><marker id="lp" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="${C2.gray}"/></marker></defs>
    ${box(10, 40, 100, cond, C2.blue)}${box(150, 40, 100, body, C2.teal)}${box(150, 108, 100, exit, C2.gray)}
    <path d="M112 63 L144 63" stroke="${C2.gray}" stroke-width="2" marker-end="url(#lp)"/>
    <path d="M200 38 L200 12 L60 12 L60 34" fill="none" stroke="${C2.gray}" stroke-width="2" marker-end="url(#lp)"/>
    <path d="M60 88 L60 131 L144 131" fill="none" stroke="${C2.gray}" stroke-width="2" marker-end="url(#lp)"/>
    <text x="130" y="8" text-anchor="middle" font-size="11" font-weight="700" fill="${C2.blue}">終わったら条件へ戻る</text>
    <text x="108" y="123" text-anchor="middle" font-size="11" font-weight="700" fill="${C2.blue}">いいえ</text>
    <text x="128" y="56" text-anchor="middle" font-size="11" font-weight="700" fill="${C2.blue}">はい</text></svg>`;
}

/* ── 用語ごとの説明図(用語名 → {svg, caption}) ──
 * 構造・手順・関係を示せる用語だけに付ける(図を付けない用語もある)。 */
const TERM_DIAGRAMS = {
  共通鍵暗号方式: {
    svg: svgFlow([{ main: "平文" }, { main: "暗号文" }, { main: "平文" }], ["同じ鍵で暗号化", "同じ鍵で復号"], { boxW: 86 }),
    caption: "暗号化と復号で、同じ鍵を使う",
  },
  公開鍵暗号方式: {
    svg: svgFlow([{ main: "平文" }, { main: "暗号文" }, { main: "平文" }], ["公開鍵で暗号化", "秘密鍵で復号"], { boxW: 86 }),
    caption: "暗号化と復号で、別の鍵(公開鍵と秘密鍵)を使う",
  },
  標本化: {
    svg: svgFlow([{ top: "アナログ", main: "連続した波" }, { top: "標本化", main: "一定間隔で\n値をとる" }, { top: "量子化", main: "値を整数\nに丸める" }, { top: "符号化", main: "2進数で\n表す" }], [], { boxW: 88 }),
    caption: "A/D変換の手順:標本化 → 量子化 → 符号化",
  },
  量子化: {
    svg: svgFlow([{ top: "アナログ", main: "連続した波" }, { top: "標本化", main: "一定間隔で\n値をとる" }, { top: "量子化", main: "値を整数\nに丸める" }, { top: "符号化", main: "2進数で\n表す" }], [], { boxW: 88, highlight: 2 }),
    caption: "A/D変換の手順(量子化は2番目の段階)",
  },
  符号化: {
    svg: svgFlow([{ top: "アナログ", main: "連続した波" }, { top: "標本化", main: "一定間隔で\n値をとる" }, { top: "量子化", main: "値を整数\nに丸める" }, { top: "符号化", main: "2進数で\n表す" }], [], { boxW: 88, highlight: 3 }),
    caption: "A/D変換の手順(符号化は最後の段階)",
  },
  "A/D変換": {
    svg: svgFlow([{ top: "アナログ", main: "連続した波" }, { top: "標本化", main: "一定間隔で\n値をとる" }, { top: "量子化", main: "値を整数\nに丸める" }, { top: "符号化", main: "2進数で\n表す" }], [], { boxW: 88 }),
    caption: "A/D変換の手順:標本化 → 量子化 → 符号化",
  },
  加法混色: { svg: svgAdditive(), caption: "光の三原色(R・G・B)を重ねると明るくなり、全部で白になる" },
  ランレングス圧縮: {
    svg: svgFlow([{ top: "元のデータ", main: "AAAABBB" }, { top: "圧縮後", main: "A4B3" }], ["連続を数える"], { boxW: 120 }),
    caption: "同じ値が続く部分を「値+回数」で表す",
  },
  コミュニケーションモデル: {
    svg: svgFlow([{ main: "送り手" }, { main: "メディア" }, { main: "受け手" }], ["伝える", "届く"], { boxW: 86 }),
    caption: "送り手 → メディア(媒体) → 受け手。ノイズで伝わりにくくなり、フィードバックで返る",
  },
  "2進数": { svg: svgBits("1011"), caption: "2進数1011を10進数にする(桁の重みは8・4・2・1)" },
  AND演算: { svg: svgTruth(["A", "B", "A AND B"], [["0", "0", "0"], ["0", "1", "0"], ["1", "0", "0"], ["1", "1", "1"]]), caption: "ANDは、両方が1のときだけ1" },
  OR演算: { svg: svgTruth(["A", "B", "A OR B"], [["0", "0", "0"], ["0", "1", "1"], ["1", "0", "1"], ["1", "1", "1"]]), caption: "ORは、どちらか一方でも1なら1" },
  XOR演算: { svg: svgTruth(["A", "B", "A XOR B"], [["0", "0", "0"], ["0", "1", "1"], ["1", "0", "1"], ["1", "1", "0"]]), caption: "XORは、AとBが異なるときだけ1" },
  NOT演算: { svg: svgTruth(["A", "NOT A"], [["0", "1"], ["1", "0"]]), caption: "NOTは、0と1を入れ替える" },
  スタック: { svg: svgStack(), caption: "後に入れたものが先に出る(後入れ先出し)" },
  キュー: { svg: svgQueue(), caption: "先に入れたものが先に出る(先入れ先出し)" },
  配列: { svg: svgArray(["10", "20", "30", "40"]), caption: "同じ種類のデータを並べ、番号(添字)で取り出す" },
  関数: {
    svg: svgFlow([{ top: "引数", main: "入力" }, { top: "関数", main: "処理する" }, { top: "戻り値", main: "出力" }], ["渡す", "返す"], { boxW: 86 }),
    caption: "引数を受け取り、処理して、戻り値を返す",
  },
  引数: {
    svg: svgFlow([{ top: "引数", main: "入力" }, { top: "関数", main: "処理する" }, { top: "戻り値", main: "出力" }], ["渡す", "返す"], { boxW: 86, highlight: 0 }),
    caption: "関数に渡す値が引数",
  },
  戻り値: {
    svg: svgFlow([{ top: "引数", main: "入力" }, { top: "関数", main: "処理する" }, { top: "戻り値", main: "出力" }], ["渡す", "返す"], { boxW: 86, highlight: 2 }),
    caption: "関数が返す値が戻り値",
  },
  二分探索: {
    svg: svgFlow([{ top: "1回目", main: "真ん中と\n比べる" }, { top: "2回目", main: "半分に\n絞る" }, { top: "3回目", main: "さらに\n半分に" }], ["探す範囲が", "半分ずつ"], { boxW: 88 }),
    caption: "並んだデータで、探す範囲を毎回半分にしていく",
  },
  "TCP/IP": {
    svg: svgLayers([{ name: "アプリケーション層", note: "HTTP・SMTP" }, { name: "トランスポート層", note: "TCP・UDP" }, { name: "インターネット層", note: "IP" }, { name: "リンク層", note: "Ethernet・Wi-Fi" }]),
    caption: "TCP/IPの4つの層(上から下へデータが渡る)",
  },
  クライアントサーバシステム: {
    svg: svgFlow([{ main: "クライアント" }, { main: "サーバ" }], ["要求(リクエスト)"], { boxW: 120 }),
    caption: "クライアントが要求し、サーバが応答する",
  },
  DNS: {
    svg: svgFlow([{ top: "人が使う", main: "ドメイン名" }, { top: "変換", main: "DNS" }, { top: "機械が使う", main: "IPアドレス" }], ["問い合わせ", "答える"], { boxW: 92 }),
    caption: "ドメイン名をIPアドレスに変換する",
  },
  パケット交換方式: { svg: svgPackets(), caption: "データを小さな単位に分けて送り、受け手でつなぎ直す" },
  相関関係: { svg: svgConfound(), caption: "相関があっても、原因と結果とは限らない" },
  因果関係: { svg: svgConfound(), caption: "相関と因果は別。共通の要因があることがある" },
  SaaS: {
    svg: svgLayers([{ name: "アプリケーション", note: "SaaSで提供" }, { name: "プラットフォーム", note: "PaaSで提供" }, { name: "サーバ・ネットワーク", note: "IaaSで提供" }]),
    caption: "クラウドの提供範囲(SaaSはアプリまで、PaaSは基盤まで、IaaSはサーバ設備まで)",
  },
  順次構造: {
    svg: svgFlow([{ main: "処理A" }, { main: "処理B" }, { main: "処理C" }], ["次へ", "次へ"], { boxW: 86 }),
    caption: "上から順に1つずつ実行する",
  },
  分岐構造: { svg: svgBranch("条件は?", "処理A", "処理B"), caption: "条件によって、実行する処理を選ぶ" },
  反復構造: { svg: svgLoop("続ける?", "処理", "終わる"), caption: "条件が成り立つ間、同じ処理を繰り返す" },
};

/* ── 手作り問題(コーディング/応用)に後付けする説明図 ── */
const QUESTION_DIAGRAMS = {
  code_p8: {
    svg: svgFlow([{ top: "n % 2", main: "7 ÷ 2 の\n余り = 1" }, { top: "余りは0?", main: "False" }, { top: "else節", main: "「奇数」" }], ["", ""], { boxW: 92 }),
    caption: "余りが0でないので、else節が実行される",
  },
  app_soc3: {
    svg: svgFlow([{ top: "届いたメール", main: "リンクは\n使わない" }, { top: "自分で開く", main: "公式サイト" }, { top: "確認する", main: "本当に\n停止?" }], ["", ""], { boxW: 92 }),
    caption: "メールのリンクではなく、公式サイトから直接確認する",
  },
  app_soc4: { svg: svgCompare("出典を明記し、引用部分を区別する", "無断で丸ごとコピーする", "left"), caption: "引用の条件:出典の明記と、引用部分の区別" },
  app_des2: { svg: svgJump(), caption: "文字サイズの差(ジャンプ率)が大きいと、情報の強弱が伝わる" },
  app_des4: { svg: svgCompare("1枚に要点を1つ。図や余白を活用", "文字を小さくして詰め込む", "left"), caption: "1スライド1メッセージ" },
  app_prog4: {
    svg: svgFlow([{ top: "a and not b", main: "T and T\n= True" }, { top: "not a and b", main: "F and F\n= False" }, { top: "or で結ぶ", main: "True" }], ["", ""], { boxW: 92 }),
    caption: "式を部分ごとに分けて、TrueかFalseに置き換える",
  },
  app_net2: {
    svg: svgFlow([{ top: "スマホ", main: "Wi-Fiに接続" }, { top: "確認する", main: "IPアドレス" }, { top: "通信", main: "できる" }], ["", ""], { boxW: 92 }),
    caption: "接続だけでなく、IPアドレスの割り当てを確認する",
  },
  app_net3: { svg: svgPackets(), caption: "パケット交換方式:データを分けて送り、回線を共有する" },
  app_net4: { svg: svgConfound(), caption: "共通の要因(気温)が両方に影響している" },
};

/* ── 手作り問題の「よくある間違い」 ── */
const PITFALLS = {
  code_p1: "a*b を a+b(8)と取り違えたり、数字を並べて「35」と読んだりしやすい。",
  code_p2: "range(3)を1,2,3と考えると16になる。range(3)は0,1,2を返す。",
  code_p3: "4と6を並べて「46」としやすい。関数は足した値を返す。",
  code_p4: "リストを1から数えて、2番目の「2」を選びやすい。番号は0から始まる。",
  code_p5: "P・y・t・h・o・n の文字数を数え間違えて5や7を選びやすい。",
  code_p6: "range(1,5)の終わりの5は含まれない。1〜5を足すと15になってしまう。",
  code_p7: "a**b を a×b(6)や a+b(5)と取り違えやすい。**はべき乗を表す。",
  code_p8: "7%2 を商(3)と考えやすい。%は余りで、0のときだけ偶数になる。",
  app_soc1: "「あとで伝えればよい」と考えがち。他人が写った写真は、投稿前に許可を取る。",
  app_soc2: "覚えやすさを優先して、使い回しや誕生日にしがち。1つ流出すると他にも広がる。",
  app_soc3: "メールのリンクからログインすると、偽サイトに情報を渡してしまう。",
  app_soc4: "「出典を書けば丸ごとコピーしてよい」と誤解しやすい。引用には条件がある。",
  app_des1: "デザイナーの好みやコストが理由だと考えがち。目的は、誰にでも素早く伝わること。",
  app_des2: "強弱が大きいと読みにくくなると思いやすい。強弱は、情報の優先度を伝える。",
  app_des3: "色の見え方には個人差がある。色だけで区別すると、伝わらない人がいる。",
  app_des4: "情報量が多いほど親切だと考えがち。1枚1メッセージの方が伝わる。",
  app_prog1: "i×jの組み合わせ(4通り)の数え漏れや、i×jを足し忘れて個数だけ数えやすい。",
  app_prog2: "59は60に近いので合格と思いやすい。条件は 59 >= 60 で、False になる。",
  app_prog3: "奇数も数えて4にしたり、偶数の合計(28)と取り違えやすい。数えるのは偶数の個数。",
  app_prog4: "式を一度に考えると、andとorの順序を取り違えやすい。部分ごとにTrue/Falseへ置き換える。",
  app_net1: "平均値の75を選びやすい。中央値は、並べたときの真ん中の値。",
  app_net2: "画面の明るさのような見た目の設定に目が向きやすい。通信は、住所(IPアドレス)から確認する。",
  app_net3: "「必ず2倍速い」のような言い切りに注意。優れている点は、回線の共有のしやすさ。",
  app_net4: "相関があれば原因と結果の関係だと思いやすい。共通の要因を疑う。",
};

/* ── 手作り問題へ、説明図と「よくある間違い」を結びつける ── */
(function attachExtras() {
  const pools = [];
  Object.values(CODING_QUESTIONS).forEach((a) => pools.push(...a));
  Object.values(APPLIED_QUESTIONS).forEach((a) => pools.push(...a));
  pools.forEach((q) => {
    if (!q.image && QUESTION_DIAGRAMS[q.id]) q.image = QUESTION_DIAGRAMS[q.id];
    q.pitfall = PITFALLS[q.id] || null;
  });
})();
