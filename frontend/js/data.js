/* Inforia — ジャンル定義・バッジ定義
 * 問題データ本体は js/glossary.js(単語帳) + js/quiz-generator.js(自動生成) に分離。
 * ジャンルは情報Iの教科書に準拠した4分野構成。
 */

const GENRES = [
  { id: "society", title: "情報社会の問題解決" },
  { id: "design", title: "コミュニケーションと情報デザイン" },
  { id: "programming", title: "コンピュータとプログラミング" },
  { id: "network", title: "情報通信ネットワークとデータの活用" },
];

const BADGES = [
  {
    id: "first-quiz",
    name: "はじめの一歩",
    tier: "common",
    icon: "medal",
    condition: "はじめてクイズに正解する",
  },
  {
    id: "streak-3",
    name: "3日坊主卒業",
    tier: "common",
    icon: "flame",
    condition: "3日連続で学習する",
  },
  {
    id: "streak-7",
    name: "週間チャレンジャー",
    tier: "rare",
    icon: "medal",
    condition: "7日連続で学習する",
  },
  {
    id: "session-clear",
    name: "セッションクリア",
    tier: "rare",
    icon: "medal",
    condition: "1回のクイズセッション(10問)を終える",
  },
  {
    id: "perfect",
    name: "パーフェクト",
    tier: "epic",
    icon: "crown",
    condition: "1セッションを全問正解でクリアする",
  },
  {
    id: "level-5",
    name: "レベル5到達",
    tier: "epic",
    icon: "crown",
    condition: "レベル5に到達する",
  },
];
