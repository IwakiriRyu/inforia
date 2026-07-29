/* Inforia — コーディング問題・応用問題バンク
 * 単語帳(GLOSSARY)の一問一答だけでなく、コードを読ませる問題や
 * 共通テスト対策を意識した応用問題を出題するための手作りデータ。
 *
 * 注意: 実際の大学入学共通テストの過去問をそのまま収録することは著作権上できないため、
 * ここに含まれる応用問題はすべて出題形式を参考にしたオリジナル問題です(過去問そのものではありません)。
 *
 * 各問題の形式:
 * { id, genreId, type: "coding" | "applied", code, question, choices, answer, explanation, image }
 * image は { svg, caption } または null(nullの場合はAI生成予定のプレースホルダーを表示)
 */

const CODING_QUESTIONS = {
  programming: [
    {
      id: "code_p1",
      genreId: "programming",
      type: "coding",
      code: "a = 3\nb = 5\nprint(a * b)",
      question: "次のコードを実行したときの出力として正しいものを選びなさい。",
      choices: ["15", "8", "35", "53"],
      answer: 0,
      explanation: "a=3, b=5 が代入され、a*b は 3×5 = 15 になります。",
      image: {
        svg: svgVariableTrace([
          { label: "a", value: "3" },
          { label: "b", value: "5" },
          { label: "a*b", value: "15" },
        ]),
        caption: "変数の値を追跡した図",
      },
    },
    {
      id: "code_p2",
      genreId: "programming",
      type: "coding",
      code: "x = 10\nfor i in range(3):\n    x = x + i\nprint(x)",
      question: "このforループを実行した後のxの値として正しいものを選びなさい。",
      choices: ["10", "13", "16", "3"],
      answer: 1,
      explanation: "range(3)は0,1,2を返すので、x=10→+0→+1→+2で最終的に13になります。",
      image: {
        svg: svgVariableTrace([
          { label: "初期値", value: "10" },
          { label: "+0", value: "10" },
          { label: "+1", value: "11" },
          { label: "+2", value: "13" },
        ]),
        caption: "xの値がループごとに変化する様子",
      },
    },
    {
      id: "code_p3",
      genreId: "programming",
      type: "coding",
      code: "def add(a, b):\n    return a + b\n\nprint(add(4, 6))",
      question: "この関数を実行した結果として正しいものを選びなさい。",
      choices: ["46", "10", "4", "エラー"],
      answer: 1,
      explanation: "add(a,b)はa+bを返す関数なので、add(4,6)は4+6=10を返します。",
      image: {
        svg: svgVariableTrace([
          { label: "a", value: "4" },
          { label: "b", value: "6" },
          { label: "a+b", value: "10" },
        ]),
        caption: "関数の引数と戻り値の関係",
      },
    },
    {
      id: "code_p4",
      genreId: "programming",
      type: "coding",
      code: "nums = [1, 2, 3, 4, 5]\nprint(nums[2])",
      question: "このコードの実行結果として正しいものを選びなさい。",
      choices: ["1", "2", "3", "5"],
      answer: 2,
      explanation: "Pythonのリストは0番目から数えるため、nums[2]は3番目の要素である3です。",
      image: {
        svg: svgVariableTrace([
          { label: "nums[0]", value: "1" },
          { label: "nums[1]", value: "2" },
          { label: "nums[2]", value: "3" },
        ]),
        caption: "リストのインデックスと値の対応",
      },
    },
    {
      id: "code_p5",
      genreId: "programming",
      type: "coding",
      code: 's = "Python"\nprint(len(s))',
      question: "このコードの実行結果として正しいものを選びなさい。",
      choices: ["5", "6", "7", "エラー"],
      answer: 1,
      explanation: '"Python"は6文字なので、len(s)は6を返します。',
      image: {
        svg: svgVariableTrace([
          { label: "s", value: '"Python"' },
          { label: "len(s)", value: "6" },
        ]),
        caption: "文字列の長さを求める処理",
      },
    },
    {
      id: "code_p6",
      genreId: "programming",
      type: "coding",
      code: "total = 0\nfor i in range(1, 5):\n    total += i\nprint(total)",
      question: "このコードを実行したときの出力として正しいものを選びなさい。",
      choices: ["6", "8", "10", "15"],
      answer: 2,
      explanation: "range(1,5)は1,2,3,4を返すので、1+2+3+4=10になります。",
      image: {
        svg: svgVariableTrace([
          { label: "初期値", value: "0" },
          { label: "+1", value: "1" },
          { label: "+2", value: "3" },
          { label: "+3", value: "6" },
          { label: "+4", value: "10" },
        ]),
        caption: "totalが加算されていく様子",
      },
    },
    {
      id: "code_p7",
      genreId: "programming",
      type: "coding",
      code: "a = 2\nb = 3\nc = a ** b\nprint(c)",
      question: "このコードを実行したときの出力として正しいものを選びなさい。",
      choices: ["5", "6", "8", "9"],
      answer: 2,
      explanation: "a**bはaのb乗を意味するので、2の3乗である8が出力されます。",
      image: {
        svg: svgVariableTrace([
          { label: "a", value: "2" },
          { label: "b", value: "3" },
          { label: "a**b", value: "8" },
        ]),
        caption: "べき乗の計算過程",
      },
    },
    {
      id: "code_p8",
      genreId: "programming",
      type: "coding",
      code: 'n = 7\nif n % 2 == 0:\n    print("偶数")\nelse:\n    print("奇数")',
      question: "このコードを実行したときの出力として正しいものを選びなさい。",
      choices: ["偶数", "奇数", "エラー", "何も表示されない"],
      answer: 1,
      explanation: "7を2で割った余りは1(0でない)なので、else節が実行され「奇数」が出力されます。",
      image: null,
    },
  ],
};

const APPLIED_QUESTIONS = {
  society: [
    {
      id: "app_soc1",
      genreId: "society",
      type: "applied",
      code: null,
      question:
        "友人が写っている写真をSNSに投稿する前に、最も適切な行動を選びなさい。",
      choices: [
        "友人に許可を取ってから投稿する",
        "すぐに投稿して後で友人に伝える",
        "顔にモザイクをかけず、位置情報も付けて投稿する",
        "匿名アカウントなら許可なく投稿してよい",
      ],
      answer: 0,
      explanation:
        "肖像権・プライバシーの観点から、他人が写っている写真を投稿する際は事前に本人の許可を取ることが適切です。",
      image: {
        svg: svgCompare("事前に許可を取ってから投稿", "許可なく無断で投稿", "left"),
        caption: "適切な行動と不適切な行動の比較",
      },
    },
    {
      id: "app_soc2",
      genreId: "society",
      type: "applied",
      code: null,
      question:
        "安全なパスワード管理として最も適切なものを選びなさい。",
      choices: [
        "複数のサービスで同じパスワードを使い回す",
        "誕生日など推測されやすい文字列を使う",
        "サービスごとに異なる複雑なパスワードを設定する",
        "付箋にパスワードを書いてパソコンに貼っておく",
      ],
      answer: 2,
      explanation:
        "使い回すと1つの流出で他のサービスも危険になるため、サービスごとに異なる複雑なパスワードを設定するのが安全です。",
      image: {
        svg: svgCompare("サービスごとに違うパスワード", "全部同じパスワードを使い回す", "left"),
        caption: "パスワード管理の適切な方法の比較",
      },
    },
    {
      id: "app_soc3",
      genreId: "society",
      type: "applied",
      code: null,
      question:
        "身に覚えのない「アカウントが停止されます」というメールが届いた。取るべき行動として最も適切なものを選びなさい。",
      choices: [
        "すぐにメール内のリンクからログイン情報を入力する",
        "メール内のリンクは使わず、公式サイトに直接アクセスして確認する",
        "友人にそのままメールを転送して意見を聞く",
        "件名だけを見て信用できるか判断する",
      ],
      answer: 1,
      explanation:
        "フィッシング詐欺を避けるため、メール内のリンクは使わず、公式サイトへ直接アクセスして確認するのが安全です。",
      image: null,
    },
    {
      id: "app_soc4",
      genreId: "society",
      type: "applied",
      code: null,
      question:
        "レポートでWebサイトの文章を使う際、著作権法上最も適切な行動を選びなさい。",
      choices: [
        "出典を明記し、引用部分を「」で示して引用する",
        "著作権者に無断で丸ごとコピーして貼り付ける",
        "出典を書かずに自分の言葉のように書く",
        "公開されている情報なら自由に使ってよい",
      ],
      answer: 0,
      explanation:
        "適切な引用は、出典を明記し、引用部分を明確に区別し、自分の文章が主体であることが条件です。",
      image: null,
    },
  ],

  design: [
    {
      id: "app_des1",
      genreId: "design",
      type: "applied",
      code: null,
      question:
        "非常口のマークのように、言語に関わらず意味が伝わるピクトグラムが重視される理由として最も適切なものを選びなさい。",
      choices: [
        "誰が見ても同じ意味を素早く理解できるようにするため",
        "デザイナーの個性を表現するため",
        "文字を使わない方が必ず安価に作れるため",
        "法律で色を統一する義務があるため",
      ],
      answer: 0,
      explanation:
        "ピクトグラムは言語や年齢を問わず直感的に伝わるよう設計された、ユニバーサルデザインの代表例です。",
      image: {
        svg: svgCompare("絵記号で誰にでも伝わる", "特定の言語の文字のみで表示", "left"),
        caption: "ピクトグラムと文字表示の比較",
      },
    },
    {
      id: "app_des2",
      genreId: "design",
      type: "applied",
      code: null,
      question:
        "見出しと本文の文字サイズの差(ジャンプ率)を大きくすると、読み手にどのような効果があるか、最も適切なものを選びなさい。",
      choices: [
        "見出しが目立ち、情報の強弱が伝わりやすくなる",
        "文章全体が読みにくくなるだけで効果はない",
        "印刷コストが必ず下がる",
        "文字コードの種類が変化する",
      ],
      answer: 0,
      explanation:
        "ジャンプ率を大きくすると見出しと本文の強弱がはっきりし、情報の優先度が伝わりやすくなります。",
      image: null,
    },
    {
      id: "app_des3",
      genreId: "design",
      type: "applied",
      code: null,
      question:
        "赤色と緑色だけで「合格」「不合格」を区別する資料には、どのような配慮が不足しているか、最も適切なものを選びなさい。",
      choices: [
        "色覚の個人差に配慮したカラーユニバーサルデザインの観点",
        "著作権の観点",
        "通信速度の観点",
        "サーバー容量の観点",
      ],
      answer: 0,
      explanation:
        "色だけで意味を区別すると、色の見え方に個人差がある人に伝わらないことがあるため、形やテキストの併用が必要です。",
      image: {
        svg: svgCompare("色+形やテキストを併用", "色だけで区別する", "left"),
        caption: "配色のみに頼るデザインの問題点",
      },
    },
    {
      id: "app_des4",
      genreId: "design",
      type: "applied",
      code: null,
      question:
        "聞き手に伝わりやすいプレゼンスライドの作り方として、最も適切なものを選びなさい。",
      choices: [
        "1枚に伝えたい要点を1つに絞り、図や余白を活用する",
        "文字をできるだけ小さくして情報を詰め込む",
        "読み上げ用の原稿をすべてそのまま貼り付ける",
        "アニメーションを多用して注意を分散させる",
      ],
      answer: 0,
      explanation:
        "1スライド1メッセージを意識し、余白や図解を活用することで、聞き手が要点を理解しやすくなります。",
      image: null,
    },
  ],

  programming: [
    {
      id: "app_prog1",
      genreId: "programming",
      type: "applied",
      code: "total = 0\nfor i in range(1, 3):\n    for j in range(1, 3):\n        total += i * j\nprint(total)",
      question: "次のコードを実行したときの出力として正しいものを選びなさい。",
      choices: ["6", "8", "9", "12"],
      answer: 2,
      explanation:
        "i,jはそれぞれ1,2を取り、i×jは(1,1)=1,(1,2)=2,(2,1)=2,(2,2)=4となり、合計は1+2+2+4=9です。",
      image: {
        svg: svgVariableTrace([
          { label: "(1,1)", value: "+1" },
          { label: "(1,2)", value: "+2" },
          { label: "(2,1)", value: "+2" },
          { label: "(2,2)", value: "+4" },
          { label: "合計", value: "9" },
        ]),
        caption: "二重ループでtotalが加算される様子",
      },
    },
    {
      id: "app_prog2",
      genreId: "programming",
      type: "applied",
      code: 'score = 59\nif score >= 60:\n    result = "合格"\nelse:\n    result = "不合格"\nprint(result)',
      question: "このコードの実行結果として正しいものを選びなさい。",
      choices: ["合格", "不合格", "エラー", "何も表示されない"],
      answer: 1,
      explanation: "scoreは59で60未満のため、else節が実行され「不合格」が表示されます。",
      image: {
        svg: svgVariableTrace([
          { label: "score", value: "59" },
          { label: "60以上?", value: "False" },
          { label: "result", value: '"不合格"' },
        ]),
        caption: "条件分岐の判定の流れ",
      },
    },
    {
      id: "app_prog3",
      genreId: "programming",
      type: "applied",
      code: "nums = [4, 8, 15, 16]\ncount = 0\nfor n in nums:\n    if n % 2 == 0:\n        count += 1\nprint(count)",
      question: "このコードを実行したときの出力として正しいものを選びなさい。",
      choices: ["1", "2", "3", "4"],
      answer: 2,
      explanation: "リストの中の偶数は4,8,16の3個なので、countは3になります。",
      image: {
        svg: svgVariableTrace([
          { label: "4", value: "偶数" },
          { label: "8", value: "偶数" },
          { label: "15", value: "奇数" },
          { label: "16", value: "偶数" },
        ]),
        caption: "各要素が偶数かどうかの判定",
      },
    },
    {
      id: "app_prog4",
      genreId: "programming",
      type: "applied",
      code: null,
      question:
        "a = True, b = False のとき、次の式の結果として正しいものを選びなさい。\n(a and not b) or (not a and b)",
      choices: ["True", "False", "エラー", "None"],
      answer: 0,
      explanation:
        "a and not b は True and True で True。not a and b は False and False で False。全体は True or False で True になります。",
      image: null,
    },
  ],

  network: [
    {
      id: "app_net1",
      genreId: "network",
      type: "applied",
      code: null,
      question:
        "5人のテストの点数が 65, 70, 70, 80, 90 のとき、中央値として正しいものを選びなさい。",
      choices: ["65", "70", "75", "80"],
      answer: 1,
      explanation: "データを昇順に並べると65,70,70,80,90となり、真ん中の値である70が中央値です。",
      image: {
        svg: svgBarChart([
          { label: "Aさん", value: 65 },
          { label: "Bさん", value: 70, highlight: true },
          { label: "Cさん", value: 70, highlight: true },
          { label: "Dさん", value: 80 },
          { label: "Eさん", value: 90 },
        ]),
        caption: "5人の点数の分布(中央の2人を強調)",
      },
    },
    {
      id: "app_net2",
      genreId: "network",
      type: "applied",
      code: null,
      question:
        "自宅のスマホがWi-Fiに接続されているのに正しく通信できないとき、まず確認すべきこととして最も適切なものを選びなさい。",
      choices: [
        "IPアドレスが正しく割り当てられているか",
        "ディスプレイの明るさ設定",
        "アプリのアイコンの色",
        "充電器のメーカー",
      ],
      answer: 0,
      explanation:
        "通信ができない場合、まずネットワーク上の住所であるIPアドレスが正しく割り当てられているかを確認します。",
      image: null,
    },
    {
      id: "app_net3",
      genreId: "network",
      type: "applied",
      code: null,
      question:
        "回線交換方式に比べてパケット交換方式が優れている点として、最も適切なものを選びなさい。",
      choices: [
        "1つの回線を複数の通信で効率よく共有できる",
        "必ず通信速度が2倍になる",
        "暗号化が不要になる",
        "回線工事が不要になる",
      ],
      answer: 0,
      explanation:
        "パケット交換方式はデータを分割して送るため、1つの回線を複数の通信で効率よく共有できます。",
      image: null,
    },
    {
      id: "app_net4",
      genreId: "network",
      type: "applied",
      code: null,
      question:
        "あるデータで「アイスクリームの売上」と「水難事故の件数」に強い相関が見られた。この結果の解釈として最も適切なものを選びなさい。",
      choices: [
        "気温の上昇という共通の要因が影響している可能性があり、直接の因果関係とは限らない",
        "アイスクリームを食べると必ず水難事故が起きる",
        "相関があるので因果関係も証明された",
        "この2つは無関係であり誤差にすぎない",
      ],
      answer: 0,
      explanation:
        "相関関係があっても因果関係があるとは限りません。この例では気温という共通の要因が影響していると考えられます。",
      image: null,
    },
  ],
};
