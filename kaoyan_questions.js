// ============================================================================
// 《考研数学二 (302)》与《考研英语二 (204)》近五年 (2022-2026) 分类真题汇总、做题技巧与草稿纸演算库
// ============================================================================

window.SUBJECTS = [
  { id: "math2", name: "📐 考研数学二", badge: "6专题" },
  { id: "eng2", name: "🇬🇧 考研英语二", badge: "5模块" }
];

window.CHAPTERS = [
  // 数学二 6 大专题分类
  { id: "m_ch1", subject: "math2", name: "专题一：函数、极限与泰勒展开", pdfPages: [1] },
  { id: "m_ch2", subject: "math2", name: "专题二：一元微分学、反函数与曲率", pdfPages: [2] },
  { id: "m_ch3", subject: "math2", name: "专题三：一元积分学、反常积分与微元法应用", pdfPages: [1, 2] },
  { id: "m_ch4", subject: "math2", name: "专题四：常微分方程解的结构与求解", pdfPages: [1, 2] },
  { id: "m_ch5", subject: "math2", name: "专题五：多元函数微分、极值与二重积分", pdfPages: [1, 2] },
  { id: "m_ch6", subject: "math2", name: "专题六：线性代数（矩阵/方程组/特征值/二次型）", pdfPages: [2] },

  // 英语二 5 大题型模块分类
  { id: "e_ch1", subject: "eng2", name: "模块一：完形填空（逻辑关系与高频词辨析）", pdfPages: [] },
  { id: "e_ch2", subject: "eng2", name: "模块二：阅读理解 Part A（四大题型同义改写与态度）", pdfPages: [] },
  { id: "e_ch3", subject: "eng2", name: "模块三：新题型 Part B（2022-2026多项对应与小标题）", pdfPages: [] },
  { id: "e_ch4", subject: "eng2", name: "模块四：翻译 Section III（2022-2026长难句拆分精译）", pdfPages: [] },
  { id: "e_ch5", subject: "eng2", name: "模块五：写作 Section IV（2022-2026小作文书信+大作文图表）", pdfPages: [] }
];

window.CALC_GENERATORS = {};

// ============================================================================
// 考研数学二 (2022-2026) 分类真题库（含做题技巧、关联知识点与草稿纸分步计算）
// ============================================================================
window.QUESTIONS = [
  {
    id: "M26_01",
    subject: "math2",
    year: 2026,
    chapter: "m_ch1",
    type: "calc",
    typeName: "真题计算(草稿纸)",
    calcType: "MATH2_26_01",
    pdfPage: 1,
    kaoyanImg: "assets/kaoyan/math2_2026_p1.png",
    title: "【2026数二真题·第1题】泰勒展开与等价无穷小求参数 a, b",
    prompt: "已知当 <i>x</i> → 0 时，<i>ax</i><sup>2</sup> + <i>bx</i> + arcsin <i>x</i> 与 <span class='math-inline'>(1 + <i>x</i><sup>2</sup>)<sup>1/3</sup> − 1</span> 是等价无穷小，求常数 <i>a</i>, <i>b</i> 的值。",
    tips: "💡 破题秒杀技巧：见到加减法无穷小等价求参数，立刻用泰勒展开对比同阶系数！右端 <span class='math-inline'>(1 + <i>x</i><sup>2</sup>)<sup>1/3</sup> − 1 ~ <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>3</span></span><i>x</i><sup>2</sup></span> 是 2 阶无穷小，因此左端展开后 1 次项系数 (<i>b</i> + 1) 必须为 0，2 次项系数 <i>a</i> 必须等于 1/3！",
    knowledgePoints: [
      "广义二项式等价无穷小：(1 + u)^α − 1 ~ α·u (u → 0)",
      "反正弦泰勒展开：arcsin x = x + (1/6)x³ + o(x³)",
      "多项式与无穷小等价的充要条件：最低次幂阶数相同且主部系数相等"
    ],
    mcq: {
      question: "【一刷·真题原题】已知当 x → 0 时，ax² + bx + arcsin x 与 (1+x²)¹/³ − 1 是等价无穷小，则 (  )",
      options: [
        "(A) a = 1/3, b = −1",
        "(B) a = 1/3, b = 1",
        "(C) a = 2/3, b = −1",
        "(D) a = 2/3, b = 1"
      ],
      answer: 0
    },
    cloze: {
      text: "当 x→0 时，右端 (1+x²)¹/³ − 1 ~ {{0}}x²；左端利用 arcsin x = x + x³/6 + o(x³) 展开得 (b+1)x + ax² + o(x²)。因两式等价，必有一次项系数 b+1 = {{1}}，二次项系数 a = {{2}}，解得 b = {{3}}。",
      answers: ["1/3", "0", "1/3", "-1"]
    },
    rubric: [
      "写出右端等价无穷小主部：(1 + x²)¹/³ − 1 ~ (1/3)x²",
      "写出左端泰勒展开：ax² + bx + arcsin x = (b + 1)x + ax² + (1/6)x³ + o(x³)",
      "对比一阶与二阶系数得 b + 1 = 0 且 a = 1/3，算出 a = 1/3, b = −1"
    ],
    answerHtml: "<strong>【2026数二第1题·标准解析】</strong><div class='formula-card'>1. <strong>右端等价代换</strong>：当 <i>x</i> → 0 时，(1 + <i>x</i><sup>2</sup>)<sup>1/3</sup> − 1 ~ <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>3</span></span><i>x</i><sup>2</sup></div><div class='formula-card'>2. <strong>左端泰勒展开</strong>：因为 arcsin <i>x</i> = <i>x</i> + <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>6</span></span><i>x</i><sup>3</sup> + <i>o</i>(<i>x</i><sup>3</sup>)，故：<br><i>ax</i><sup>2</sup> + <i>bx</i> + arcsin <i>x</i> = (<i>b</i> + 1)<i>x</i> + <i>ax</i><sup>2</sup> + <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>6</span></span><i>x</i><sup>3</sup> + <i>o</i>(<i>x</i><sup>3</sup>)</div><div class='formula-card'>3. <strong>同阶主部系数匹配</strong>：要使左端与 <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>3</span></span><i>x</i><sup>2</sup> 等价，必有 <i>b</i> + 1 = 0 且 <i>a</i> = <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>3</span></span>，解得 <strong><i>a</i> = <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>3</span></span>，<i>b</i> = −1</strong>（选 A）。</div>"
  },
  {
    id: "M26_12",
    subject: "math2",
    year: 2026,
    chapter: "m_ch1",
    type: "calc",
    typeName: "真题计算(草稿纸)",
    calcType: "MATH2_26_12",
    pdfPage: 3,
    kaoyanImg: "assets/kaoyan/math2_2026_p1.png",
    title: "【2026数二真题·第12题】分式通分与泰勒展开求 0/0 型极限",
    prompt: "求极限：<div class='formula-card'>lim<sub><i>x</i>→0</sub> <span class='frac'><span class='frac-num'>1</span><span class='frac-den'><i>x</i></span></span> [ <span class='frac'><span class='frac-num'>ln(1 + <i>x</i>)</span><span class='frac-den'><i>x</i></span></span> − <span class='frac'><span class='frac-num'>1</span><span class='frac-den'><i>x</i> sin <i>x</i></span></span> · <i>x</i><sup>2</sup> ] &nbsp;（原卷形式：lim<sub><i>x</i>→0</sub> <span class='frac'><span class='frac-num'>1</span><span class='frac-den'><i>x</i></span></span> [ <span class='frac'><span class='frac-num'>ln(1 + <i>x</i>)</span><span class='frac-den'><i>x</i></span></span> − <span class='frac'><span class='frac-num'><i>x</i></span><span class='frac-den'>sin <i>x</i></span></span> ]，或等价二阶泰勒展开求值）</div>",
    tips: "💡 破题技巧：先将中括号内整理到分母为 x²，再用 ln(1+x) = x − x²/2 + o(x²) 与 sin x = x − x³/6 + o(x³) 展开到二阶即可秒出结果 −1/2！",
    knowledgePoints: [
      "对数泰勒展开：ln(1+x) = x − (1/2)x² + (1/3)x³ + o(x³)",
      "正弦泰勒展开：sin x = x − (1/6)x³ + o(x³)，故 x/sin x = 1 + (1/6)x² + o(x²)",
      "定阶法则：外层乘 1/x，故中括号内部只需展开到 x 的一次项"
    ],
    mcq: {
      question: "【一刷·泰勒定阶快筛】当 x → 0 时，ln(1+x)/x 与 x/sin x 的一阶泰勒展开分别为：",
      options: [
        "ln(1+x)/x = 1 − x/2 + o(x)，且 x/sin x = 1 + o(x)，故相减除以 x 极限为 −1/2",
        "ln(1+x)/x = 1 + x/2 + o(x)，极限为 +1/2",
        "两项均等价于 1，故相减必为 0",
        "极限不存在"
      ],
      answer: 0
    },
    cloze: {
      text: "当 x→0 时，ln(1+x) = x − {{0}}x² + o(x²)，故 ln(1+x)/x = 1 − {{1}}x + o(x)；而 x/sin x = 1 + {{2}}x² + o(x²)。代入原式得极限值为 {{3}}。",
      answers: ["1/2", "1/2", "1/6", "-1/2"]
    },
    rubric: [
      "将 ln(1+x)/x 展开为 1 − x/2 + x²/3 + o(x²)",
      "将 x/sin x 展开为 1 + x²/6 + o(x²)",
      "两式相减除以 x，求出极限绝对值为 1/2（带符号为 −1/2）"
    ],
    answerHtml: "<strong>【2026数二第12题·标准解析】</strong><div class='formula-card'>利用泰勒公式展开：<br><span class='frac'><span class='frac-num'>ln(1 + <i>x</i>)</span><span class='frac-den'><i>x</i></span></span> = <span class='frac'><span class='frac-num'><i>x</i> − <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span><i>x</i><sup>2</sup> + <i>o</i>(<i>x</i><sup>2</sup>)</span><span class='frac-den'><i>x</i></span></span> = 1 − <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span><i>x</i> + <i>o</i>(<i>x</i>)</div><div class='formula-card'>而 <span class='frac'><span class='frac-num'><i>x</i></span><span class='frac-den'>sin <i>x</i></span></span> = 1 + <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>6</span></span><i>x</i><sup>2</sup> + <i>o</i>(<i>x</i><sup>2</sup>) = 1 + <i>o</i>(<i>x</i>)</div><div class='formula-card'>故原极限 = lim<sub><i>x</i>→0</sub> <span class='frac'><span class='frac-num'>(1 − <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span><i>x</i>) − 1 + <i>o</i>(<i>x</i>)</span><span class='frac-den'><i>x</i></span></span> = <strong>−<span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span></strong>（若题目为 <span class='frac'><span class='frac-num'>1</span><span class='frac-den'><i>x</i></span></span>[<span class='frac'><span class='frac-num'>1</span><span class='frac-den'><i>x</i></span></span> − <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>ln(1+<i>x</i>)</span></span>] 则极限为 <strong>+<span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span></strong>）。</div>"
  },
  {
    id: "M26_05_06",
    subject: "math2",
    year: 2026,
    chapter: "m_ch2",
    type: "calc",
    typeName: "真题计算(草稿纸)",
    calcType: "MATH2_26_06_13",
    pdfPage: 2,
    kaoyanImg: "assets/kaoyan/math2_2026_p2.png",
    title: "【2026数二真题·第6 & 13题】变限积分反函数求导与隐函数曲率半径",
    prompt: "(1)【2026第6题】已知 <i>f</i>(<i>x</i>) = ∫<sub>1</sub><sup><i>x</i></sup> <span class='frac'><span class='frac-num'><i>e<sup>t</sup></i></span><span class='frac-den'>1 + <i>t</i><sup>2</sup></span></span> d<i>t</i>，<i>g</i>(<i>x</i>) 为 <i>f</i>(<i>x</i>) 的反函数，求 <i>g</i>(0) 与 <i>g'</i>(0)。<br>(2)【2026第13题】求隐函数曲线 <i>x</i><sup>2</sup> + 2<i>xy</i> + 3<i>y</i><sup>2</sup> = 3（或 <i>x</i><sup>2</sup> + 2<i>y</i> + <i>y</i><sup>2</sup> = 3）在点 (0, 1) 处的曲率半径 <i>R</i>。",
    tips: "💡 反函数求导防坑铁律：求 g'(0) 时，这里的 0 是 y = f(x) 的函数值！必须先令 f(x0) = 0 找到积分上下限相等的点 x0 = 1（即 g(0) = 1），再用 g'(0) = 1 / f'(1) 计算！千万别算成 1 / f'(0)！",
    knowledgePoints: [
      "变上限积分求导公式：(∫_a^x φ(t)dt)' = φ(x)",
      "反函数一阶导数定理：若 y0 = f(x0)，则 g'(y0) = 1 / f'(x0)",
      "曲率半径公式：R = (1 + y'²)^(3/2) / |y''|"
    ],
    mcq: {
      question: "【一刷·2026数二第6题原题】已知 f(x) = ∫₁ˣ [eᵗ/(1+t²)] dt，g(x) 为 f(x) 的反函数，则 (  )",
      options: [
        "(B) g(0) = 1,  g'(0) = 2/e",
        "(A) g(0) = 1,  g'(0) = 3/(2e)",
        "(C) g(1) = 0,  g'(0) = 2/e",
        "(D) g(1) = 0,  g'(0) = 1"
      ],
      answer: 0
    },
    cloze: {
      text: "因为 f(1) = 0，由反函数定义知 g(0) = {{0}}。又 f'(x) = eˣ / (1+x²)，故 f'(1) = {{1}}。由反函数求导公式得 g'(0) = 1 / f'(1) = {{2}}。曲率半径公式为 R = (1 + y'²)^(3/2) / |{{3}}|。",
      answers: ["1", "e/2", "2/e", "y''"]
    },
    rubric: [
      "由积分上下限相等 f(1) = 0 得 g(0) = 1",
      "求导得 f'(x) = eˣ/(1+x²)，代入 x=1 得 f'(1) = e/2，从而 g'(0) = 2/e",
      "隐函数两边对 x 求一阶、二阶导数代入 (0,1)，由 R = (1+y'²)^(3/2)/|y''| 算出 R = 4"
    ],
    answerHtml: "<strong>【2026数二第6题 & 第13题·标准解析】</strong><div class='formula-card'>1. <strong>第6题（反函数求导）</strong>：<br>由 <i>f</i>(1) = ∫<sub>1</sub><sup>1</sup> <span class='frac'><span class='frac-num'><i>e<sup>t</sup></i></span><span class='frac-den'>1 + <i>t</i><sup>2</sup></span></span> d<i>t</i> = 0，得反函数值 <strong><i>g</i>(0) = 1</strong>。<br>又 <i>f'</i>(<i>x</i>) = <span class='frac'><span class='frac-num'><i>e<sup>x</sup></i></span><span class='frac-den'>1 + <i>x</i><sup>2</sup></span></span>，故 <i>f'</i>(1) = <span class='frac'><span class='frac-num'><i>e</i></span><span class='frac-den'>2</span></span>，从而 <strong><i>g'</i>(0) = <span class='frac'><span class='frac-num'>1</span><span class='frac-den'><i>f'</i>(1)</span></span> = <span class='frac'><span class='frac-num'>2</span><span class='frac-den'><i>e</i></span></span></strong>（选 B）。</div><div class='formula-card'>2. <strong>第13题（曲率半径）</strong>：<br>由隐函数求导得 (0, 1) 处 <i>y'</i>(0) = 0，<i>y''</i>(0) = −<span class='frac'><span class='frac-num'>1</span><span class='frac-den'>4</span></span>，代入曲率半径公式：<br><i>R</i> = <span class='frac'><span class='frac-num'>(1 + <i>y'</i><sup>2</sup>)<sup>3/2</sup></span><span class='frac-den'>|<i>y''</i>|</span></span> = <span class='frac'><span class='frac-num'>(1 + 0)<sup>3/2</sup></span><span class='frac-den'>1/4</span></span> = <strong>4</strong>。</div>"
  },
  {
    id: "M26_04_11_15_20",
    subject: "math2",
    year: 2026,
    chapter: "m_ch3",
    type: "calc",
    typeName: "真题计算(草稿纸)",
    calcType: "MATH2_26_INTEGRAL",
    pdfPage: 4,
    kaoyanImg: "assets/kaoyan/math2_2026_p1.png",
    title: "【2026数二真题·第4/11/15/20题】反常积分审敛、函数平均值与无界旋转体体积",
    prompt: "请在草稿纸上完成2026数二积分学4道真题：<br>①【第11题】若反常积分 ∫<sub>0</sub><sup>+∞</sup> <span class='frac'><span class='frac-num'>arctan <i>x</i></span><span class='frac-den'><i>x<sup>p</sup></i>(1 + <i>x</i>)</span></span> d<i>x</i> 收敛，求实数 <i>p</i> 的取值范围；<br>②【第15题】求函数 <i>f</i>(<i>x</i>) = ln(2 + <i>x</i>) 在 [0, 2] 上的平均值；<br>③【第20题(12分大题)】设 <i>M</i>(<i>x</i><sub>0</sub>, <i>y</i><sub>0</sub>) 是曲线 <i>y</i> = <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>1 + <i>x</i><sup>2</sup></span></span> (<i>x</i> ≥ 0) 的拐点，区域 <i>D</i> 由该曲线 (<i>x</i> ≥ <i>x</i><sub>0</sub>)、线段 <i>OM</i> 及 <i>x</i> 轴正半轴围成，求 <i>D</i> 绕 <i>x</i> 轴旋转所得旋转体体积 <i>V</i>。",
    tips: "💡 破题技巧：① 反常积分既有无穷区间又有 x=0 瑕点，必须拆成 (0,1) 和 (1,+∞) 两段分别用 p-积分定阶！② 第20题旋转体体积在 x0 左侧是圆锥 V1 = (1/3)π·y0²·x0，右侧是无界积分 V2 = π∫_(x0)^(+∞) (1+x²)⁻² dx（令 x = tan t 秒算）！",
    knowledgePoints: [
      "反常积分两头审敛：x→0⁺ 时被积函数 ~ x^(1-p) 需 p-1 < 1；x→+∞ 时 ~ 1/x^(p+1) 需 p+1 > 1",
      "函数平均值公式：f_avg = [1/(b-a)] ∫_a^b f(x)dx",
      "分部积分公式：∫ ln(2+x) dx = (2+x)ln(2+x) − x + C",
      "三角换元求积分：∫ 1/(1+x²)² dx 令 x = tan t 化为 ∫ cos²t dt"
    ],
    mcq: {
      question: "【一刷·真题快筛】2026数二第11题中反常积分收敛的 p 范围，以及第20题曲线 y = 1/(1+x²) (x≥0) 的拐点横坐标 x0 分别是：",
      options: [
        "0 < p < 2 ；拐点横坐标 x0 = √3 / 3 （此时 y0 = 3/4）",
        "1 < p < 2 ；拐点横坐标 x0 = 1",
        "0 < p < 1 ；拐点横坐标 x0 = 1/2",
        "−1 < p < 2 ；拐点横坐标 x0 = √3"
      ],
      answer: 0
    },
    cloze: {
      text: "① 第11题：x→0⁺ 时被积函数 ~ 1/x^(p−1)，收敛要求 p−1 < 1 即 p < {{0}}；x→+∞ 时 ~ (π/2)/x^(p+1)，收敛要求 p+1 > 1 即 p > {{1}}，故 0 < p < 2。② 第15题：平均值 = (1/2)∫₀² ln(2+x)dx = {{2}}ln2 − 1。③ 第20题：y'' = (6x²−2)/(1+x²)³ = 0 得拐点 x0 = {{3}}。",
      answers: ["2", "0", "3", "√3/3"]
    },
    rubric: [
      "第11题：准确拆分 x→0⁺ (p < 2) 与 x→+∞ (p > 0)，得出 0 < p < 2",
      "第15题：算出 (1/2) [(2+x)ln(2+x) − x]₀² = (1/2)(4ln4 − 2 − 2ln2) = 3ln2 − 1",
      "第20题：求出拐点 (√3/3, 3/4)，圆锥体积 V1 = (1/3)π(3/4)²(√3/3) = √3·π/16",
      "第20题：令 x = tan t 算出右侧体积 V2 = π∫_(π/6)^(π/2) cos²t dt = π²/6 − √3·π/8，总体积 V = V1 + V2 = π²/6 − √3·π/16"
    ],
    answerHtml: "<strong>【2026数二第11、15、20题·草稿纸完整解析】</strong><div class='formula-card'>1. <strong>第11题（反常积分审敛）</strong>：<br>• 当 <i>x</i> → 0<sup>+</sup> 时，<span class='frac'><span class='frac-num'>arctan <i>x</i></span><span class='frac-den'><i>x<sup>p</sup></i>(1 + <i>x</i>)</span></span> ~ <span class='frac'><span class='frac-num'>1</span><span class='frac-den'><i>x</i><sup><i>p</i>−1</sup></span></span>，由瑕积分收敛知 <i>p</i> − 1 &lt; 1 ⇒ <strong><i>p</i> &lt; 2</strong>；<br>• 当 <i>x</i> → +∞ 时，<span class='frac'><span class='frac-num'>arctan <i>x</i></span><span class='frac-den'><i>x<sup>p</sup></i>(1 + <i>x</i>)</span></span> ~ <span class='frac'><span class='frac-num'>π / 2</span><span class='frac-den'><i>x</i><sup><i>p</i>+1</sup></span></span>，由无穷积分收敛知 <i>p</i> + 1 &gt; 1 ⇒ <strong><i>p</i> &gt; 0</strong>。<br>综上：<strong>0 &lt; <i>p</i> &lt; 2</strong>。</div><div class='formula-card'>2. <strong>第15题（函数平均值）</strong>：<br>平均值 = <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2 − 0</span></span> ∫<sub>0</sub><sup>2</sup> ln(2 + <i>x</i>) d<i>x</i> = <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span> [ (2 + <i>x</i>)ln(2 + <i>x</i>) − <i>x</i> ]<sub>0</sub><sup>2</sup> = <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span> (8 ln 2 − 2 − 2 ln 2) = <strong>3 ln 2 − 1</strong>。</div><div class='formula-card'>3. <strong>第20题（12分旋转体体积大题）</strong>：<br>• 求二阶导：<i>y'</i> = <span class='frac'><span class='frac-num'>−2<i>x</i></span><span class='frac-den'>(1 + <i>x</i><sup>2</sup>)<sup>2</sup></span></span>，<i>y''</i> = <span class='frac'><span class='frac-num'>6<i>x</i><sup>2</sup> − 2</span><span class='frac-den'>(1 + <i>x</i><sup>2</sup>)<sup>3</sup></span></span> = 0 ⇒ 拐点 <i>M</i> 为 <strong>( <span class='frac'><span class='frac-num'>√3</span><span class='frac-den'>3</span></span>, <span class='frac'><span class='frac-num'>3</span><span class='frac-den'>4</span></span> )</strong>。<br>• 左侧圆锥体积：<i>V</i><sub>1</sub> = <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>3</span></span>π <i>y</i><sub>0</sub><sup>2</sup> <i>x</i><sub>0</sub> = <span class='frac'><span class='frac-num'>√3</span><span class='frac-den'>16</span></span>π。<br>• 右侧旋转体体积：令 <i>x</i> = tan <i>t</i>，<i>V</i><sub>2</sub> = π ∫<sub><i>x</i><sub>0</sub></sub><sup>+∞</sup> <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>(1 + <i>x</i><sup>2</sup>)<sup>2</sup></span></span> d<i>x</i> = π ∫<sub>π/6</sub><sup>π/2</sup> cos<sup>2</sup><i>t</i> d<i>t</i> = <span class='frac'><span class='frac-num'>π<sup>2</sup></span><span class='frac-den'>6</span></span> − <span class='frac'><span class='frac-num'>√3</span><span class='frac-den'>8</span></span>π。<br>• 总体积：<i>V</i> = <i>V</i><sub>1</sub> + <i>V</i><sub>2</sub> = <strong><span class='frac'><span class='frac-num'>π<sup>2</sup></span><span class='frac-den'>6</span></span> − <span class='frac'><span class='frac-num'>√3</span><span class='frac-den'>16</span></span>π</strong>。</div>"
  },
  {
    id: "M26_02_21",
    subject: "math2",
    year: 2026,
    chapter: "m_ch4",
    type: "calc",
    typeName: "真题计算(草稿纸)",
    calcType: "MATH2_26_ODE",
    pdfPage: 6,
    kaoyanImg: "assets/kaoyan/math2_2026_p1.png",
    title: "【2026数二真题·第2 & 21题】线性微分方程解的结构与二阶可降阶微分方程",
    prompt: "(1)【2026第2题】设 <i>y</i><sub>1</sub>(<i>x</i>), <i>y</i><sub>2</sub>(<i>x</i>) 是某2阶非齐次线性微分方程的两个特解，若常数 <i>λ</i>, <i>μ</i> 使得 2<i>λy</i><sub>1</sub> + <i>μy</i><sub>2</sub> 是该非齐次方程的解，且 <i>λy</i><sub>1</sub> − 2<i>μy</i><sub>2</sub> 是对应齐次方程的解，求 <i>λ</i>, <i>μ</i>。<br>(2)【2026第21题(12分大题)】求微分方程 <i>x</i><sup>2</sup><i>y''</i> − 2<i>xy'</i> − (<i>y'</i>)<sup>2</sup> = 0 (<i>x</i> &gt; 2) 满足初值 <i>y</i>(3) = <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span>, <i>y'</i>(3) = −9 的特解。",
    tips: "💡 秒杀口诀：① 非齐次特解线性组合 k₁y₁ + k₂y₂：『仍是原非齐次解 ⇔ 系数和 = 1；变成齐次解 ⇔ 系数和 = 0』！3秒列出 2λ+μ=1 且 λ−2μ=0！② 第21题见到 x²y'' − 2xy' 除以 (y')² 立刻凑成 -(x²/y')' = 1！",
    knowledgePoints: [
      "非齐次特解组合定理：k₁y₁ + k₂y₂ 为非齐次解 ⇔ k₁ + k₂ = 1；为齐次解 ⇔ k₁ + k₂ = 0",
      "商的导数逆用凑微分：(x² / y')' = (2xy' − x²y'') / (y')²",
      "有理分式裂项积分：∫ x²/(2−x) dx 巧用多项式带余除法 x² = (x²−4) + 4"
    ],
    mcq: {
      question: "【一刷·2026数二第2题原题】满足 2λy₁ + μy₂ 为非齐次解、λy₁ − 2μy₂ 为齐次解的常数 λ, μ 为 (  )",
      options: [
        "(B) λ = 2/5,  μ = 1/5",
        "(A) λ = 1/5,  μ = 2/5",
        "(C) λ = 1/2,  μ = 1/4",
        "(D) λ = 1/4,  μ = 1/2"
      ],
      answer: 0
    },
    cloze: {
      text: "由非齐次线性微分方程解的结构定理：2λ + μ = {{0}}，且 λ − 2μ = {{1}}，解得 λ = {{2}}，μ = {{3}}。第21题将方程改写为 (x²/y')' = {{4}}，积分并代入 y'(3)=−9 得 C1 = 2。",
      answers: ["1", "0", "2/5", "1/5", "-1"]
    },
    rubric: [
      "第2题：列出方程组 2λ + μ = 1 与 λ − 2μ = 0，解得 λ = 2/5, μ = 1/5",
      "第21题：原方程两边同除以 -(y')² 化为 (x²/y')' = -1，积分得 x²/y' = -x + C1",
      "第21题：由 y'(3) = -9 解得 C1 = 2，从而 y' = x²/(2 - x)",
      "第21题：裂项积分 y = ∫ [-(x+2) + 4/(2-x)] dx 并代入 y(3)=1/2 得 y = -4ln(x-2) - (1/2)x² - 2x + 11"
    ],
    answerHtml: "<strong>【2026数二第2题 & 第21题·标准解析】</strong><div class='formula-card'>1. <strong>第2题（解的结构秒杀）</strong>：<br>由解的结构定理得：<br>2<i>λ</i> + <i>μ</i> = 1 （非齐次方程的解系数和为 1）<br><i>λ</i> − 2<i>μ</i> = 0 （齐次方程的解系数和为 0）<br>联立解得：<strong><i>λ</i> = <span class='frac'><span class='frac-num'>2</span><span class='frac-den'>5</span></span>，<i>μ</i> = <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>5</span></span></strong>（选 B）。</div><div class='formula-card'>2. <strong>第21题（12分微分方程大题）</strong>：<br>• 原方程变形为：<span class='frac'><span class='frac-num'>2<i>xy'</i> − <i>x</i><sup>2</sup><i>y''</i></span><span class='frac-den'>(<i>y'</i>)<sup>2</sup></span></span> = −1 ⇒ ( <span class='frac'><span class='frac-num'><i>x</i><sup>2</sup></span><span class='frac-den'><i>y'</i></span></span> )<i>'</i> = −1。<br>• 两边积分得：<span class='frac'><span class='frac-num'><i>x</i><sup>2</sup></span><span class='frac-den'><i>y'</i></span></span> = −<i>x</i> + <i>C</i><sub>1</sub>，代入 <i>y'</i>(3) = −9 得 <span class='frac'><span class='frac-num'>9</span><span class='frac-den'>−9</span></span> = −3 + <i>C</i><sub>1</sub> ⇒ <i>C</i><sub>1</sub> = 2。<br>• 故 <i>y'</i> = <span class='frac'><span class='frac-num'><i>x</i><sup>2</sup></span><span class='frac-den'>2 − <i>x</i></span></span> = −(<i>x</i> + 2) − <span class='frac'><span class='frac-num'>4</span><span class='frac-den'><i>x</i> − 2</span></span>，积分得：<i>y</i> = −4 ln(<i>x</i> − 2) − <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span><i>x</i><sup>2</sup> − 2<i>x</i> + <i>C</i><sub>2</sub>。<br>• 代入 <i>y</i>(3) = <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span> 得 <i>C</i><sub>2</sub> = 11，故所求特解为：<strong><i>y</i> = −4 ln(<i>x</i> − 2) − <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span><i>x</i><sup>2</sup> − 2<i>x</i> + 11 (<i>x</i> &gt; 2)</strong>。</div>"
  },
  {
    id: "M26_03_14_19",
    subject: "math2",
    year: 2026,
    chapter: "m_ch5",
    type: "calc",
    typeName: "真题计算(草稿纸)",
    calcType: "MATH2_26_MULTI",
    pdfPage: 5,
    kaoyanImg: "assets/kaoyan/math2_2026_p1.png",
    title: "【2026数二真题·第3/14/19题】隐函数偏导、全微分链式法则与二元函数极值",
    prompt: "请在草稿纸上完成2026数二多元微分3道真题：<br>①【第3题】设 <i>z</i> = <i>z</i>(<i>x</i>, <i>y</i>) 由方程 <i>x</i> − <i>az</i> = <i>e</i><sup><i>y</i>+<i>az</i></sup>（<i>a</i> 为非零常数）确定，求 <span class='frac'><span class='frac-num'>∂<i>z</i></span><span class='frac-den'>∂<i>x</i></span></span> 与 <span class='frac'><span class='frac-num'>∂<i>z</i></span><span class='frac-den'>∂<i>y</i></span></span> 满足的恒等式；<br>②【第14题】设 <i>f</i>(<i>x</i>, <i>y</i>) 可微，且 d<i>f</i>(0, 0) = πd<i>x</i> + 3d<i>y</i>，若 <i>g</i>(<i>x</i>) = <i>f</i>(ln <i>x</i>, sin π<i>x</i>)，计算 <i>g'</i>(1)；<br>③【第19题(12分大题)】求二元函数 <i>f</i>(<i>x</i>, <i>y</i>) = (2<i>x</i><sup>2</sup> − <i>y</i><sup>2</sup>)<i>e<sup>x</sup></i> 的极值。",
    tips: "💡 秒杀技巧：① 第3题直接对 x−az = e^(y+az) 两边取全微分：dx − a·dz = e^(y+az)(dy + a·dz)，整理即可秒出 ∂z/∂x − ∂z/∂y = 1/a！② 第14题由 df(0,0) = πdx + 3dy 直接读出 f'₁(0,0) = π, f'₂(0,0) = 3！",
    knowledgePoints: [
      "一阶全微分形式不变性：dz = (∂z/∂x)dx + (∂z/∂y)dy",
      "多元复合函数求导链式法则：g'(x) = f'₁(u,v)·u'(x) + f'₂(u,v)·v'(x)",
      "二元函数无条件极值判别式：AC − B² > 0 时有极值（A < 0 极大，A > 0 极小）"
    ],
    mcq: {
      question: "【一刷·真题快筛】2026数二第14题中 g'(1) 的值以及第19题函数 f(x,y) = (2x²−y²)eˣ 的极值情况分别为：",
      options: [
        "g'(1) = −2π ；函数在 (0,0) 处无极值，在 (−2,0) 处取得极大值 8e⁻²",
        "g'(1) = 4π ；函数在 (0,0) 处取得极小值 0",
        "g'(1) = −2π ；函数在 (−2,0) 处取得极小值 8e⁻²",
        "g'(1) = π − 3 ；函数有两个极值点"
      ],
      answer: 0
    },
    cloze: {
      text: "① 第3题：∂z/∂x − ∂z/∂y = {{0}}。② 第14题：由 df(0,0) = πdx + 3dy 知 f'₁(0,0) = π，f'₂(0,0) = 3；g'(1) = f'₁(0,0)·(1/1) + f'₂(0,0)·(π·cos π) = {{1}}。③ 第19题：驻点为 (0,0) 和 ({{2}}, 0)，极大值为 {{3}}。",
      answers: ["1/a", "-2π", "-2", "8e^-2"]
    },
    rubric: [
      "第3题：两边求偏导或取全微分得出 ∂z/∂x − ∂z/∂y = 1/a（选A）",
      "第14题：准确使用链式法则 g'(1) = π × 1 + 3 × (-π) = -2π",
      "第19题：解 f'x = eˣ(2x²+4x-y²) = 0 与 f'y = -2yeˣ = 0 得驻点 (0,0) 和 (-2,0)",
      "第19题：算二阶偏导判别：(0,0) 处 AC-B² = -8 < 0 非极值；(-2,0) 处 A = -4e⁻² < 0, AC-B² = 8e⁻⁴ > 0，极大值为 f(-2,0) = 8e⁻²"
    ],
    answerHtml: "<strong>【2026数二第3、14、19题·标准解析】</strong><div class='formula-card'>1. <strong>第3题（隐函数偏导）</strong>：<br>方程 <i>x</i> − <i>az</i> = <i>e</i><sup><i>y</i>+<i>az</i></sup> 两边分别对 <i>x</i>, <i>y</i> 求偏导：<br>1 − <i>a</i><span class='frac'><span class='frac-num'>∂<i>z</i></span><span class='frac-den'>∂<i>x</i></span></span> = <i>a e</i><sup><i>y</i>+<i>az</i></sup><span class='frac'><span class='frac-num'>∂<i>z</i></span><span class='frac-den'>∂<i>x</i></span></span> ，&nbsp; −<i>a</i><span class='frac'><span class='frac-num'>∂<i>z</i></span><span class='frac-den'>∂<i>y</i></span></span> = <i>e</i><sup><i>y</i>+<i>az</i></sup>(1 + <i>a</i><span class='frac'><span class='frac-num'>∂<i>z</i></span><span class='frac-den'>∂<i>y</i></span></span>)<br>整理相减即得：<strong><span class='frac'><span class='frac-num'>∂<i>z</i></span><span class='frac-den'>∂<i>x</i></span></span> − <span class='frac'><span class='frac-num'>∂<i>z</i></span><span class='frac-den'>∂<i>y</i></span></span> = <span class='frac'><span class='frac-num'>1</span><span class='frac-den'><i>a</i></span></span></strong>（选 A）。</div><div class='formula-card'>2. <strong>第14题（复合函数求导）</strong>：<br>由 d<i>f</i>(0,0) = πd<i>x</i> + 3d<i>y</i> 得 <i>f'</i><sub>1</sub>(0,0) = π，<i>f'</i><sub>2</sub>(0,0) = 3。<br><i>g'</i>(<i>x</i>) = <i>f'</i><sub>1</sub>(ln <i>x</i>, sin π<i>x</i>)·<span class='frac'><span class='frac-num'>1</span><span class='frac-den'><i>x</i></span></span> + <i>f'</i><sub>2</sub>(ln <i>x</i>, sin π<i>x</i>)·(π cos π<i>x</i>)<br>代入 <i>x</i> = 1（此时 ln 1 = 0, sin π = 0, cos π = −1）：<i>g'</i>(1) = π × 1 + 3 × (−π) = <strong>−2π</strong>。</div><div class='formula-card'>3. <strong>第19题（12分二元极值大题）</strong>：<br>• 一阶偏导：<i>f'<sub>x</sub></i> = (2<i>x</i><sup>2</sup> + 4<i>x</i> − <i>y</i><sup>2</sup>)<i>e<sup>x</sup></i> = 0，<i>f'<sub>y</sub></i> = −2<i>ye<sup>x</sup></i> = 0 ⇒ 驻点 <strong>(0, 0)</strong> 与 <strong>(−2, 0)</strong>。<br>• 二阶偏导：<i>f''<sub>xx</sub></i> = (2<i>x</i><sup>2</sup> + 8<i>x</i> + 4 − <i>y</i><sup>2</sup>)<i>e<sup>x</sup></i>，<i>f''<sub>xy</sub></i> = −2<i>ye<sup>x</sup></i>，<i>f''<sub>yy</sub></i> = −2<i>e<sup>x</sup></i>。<br>• 在 (0, 0) 处：<i>A</i> = 4, <i>B</i> = 0, <i>C</i> = −2，<i>AC − B</i><sup>2</sup> = −8 &lt; 0，故 (0, 0) 不是极值点；<br>• 在 (−2, 0) 处：<i>A</i> = −4<i>e</i><sup>−2</sup> &lt; 0, <i>B</i> = 0, <i>C</i> = −2<i>e</i><sup>−2</sup>，<i>AC − B</i><sup>2</sup> = 8<i>e</i><sup>−4</sup> &gt; 0，故在 (−2, 0) 处取得<strong>极大值 <i>f</i>(−2, 0) = 8<i>e</i><sup>−2</sup></strong>。</div>"
  },
  {
    id: "M26_08_09_10_22",
    subject: "math2",
    year: 2026,
    chapter: "m_ch6",
    type: "calc",
    typeName: "真题计算(草稿纸)",
    calcType: "MATH2_26_LINALG",
    pdfPage: 6,
    kaoyanImg: "assets/kaoyan/math2_2026_p2.png",
    title: "【2026数二真题·第8/9/10/22题】置换矩阵、矩阵方程 AB=C 与满秩分解求 A¹⁰",
    prompt: "请在草稿纸上完成2026数二线性代数核心真题：<br>①【第8题】单位阵经过若干次两行互换得到的矩阵为置换矩阵，设 <i>A</i> 为 <i>n</i> 阶置换矩阵，判断 <i>A</i><sup>−1</sup> 与 <i>A</i><sup>*</sup> 的性质；<br>②【第9题】给定 4×3 矩阵 <i>A</i> 与 4×2 矩阵 <i>C</i>（含参数 <i>a</i>, <i>b</i>），若存在矩阵 <i>B</i> 满足 <i>AB</i> = <i>C</i>，求 <i>a</i>, <i>b</i>；<br>③【第22题(12分线代大题)】设向量组 <i>α</i><sub>1</sub>, <i>α</i><sub>2</sub>, <i>α</i><sub>3</sub>, <i>α</i><sub>4</sub> 构成矩阵 <i>A</i> = (<i>α</i><sub>1</sub>, <i>α</i><sub>2</sub>, <i>α</i><sub>3</sub>, <i>α</i><sub>4</sub>)，<i>G</i> = (<i>α</i><sub>1</sub>, <i>α</i><sub>2</sub>)：(1) 证明 <i>α</i><sub>1</sub>, <i>α</i><sub>2</sub> 是极大线性无关组；(2) 求矩阵 <i>H</i> 满足 <i>A</i> = <i>GH</i>，并求高次幂 <i>A</i><sup>10</sup>。",
    tips: "💡 线代大题破题神技：求 4 阶矩阵 A 的 10 次幂 A¹⁰，既然题目已经提示了 A = GH（其中 G 是 4×2，H 是 2×4），千万不要硬乘 4 阶矩阵！直接利用结合律 A¹⁰ = G·(HG)⁹·H，把 4 阶矩阵求幂瞬间降维成 2 阶上三角矩阵 HG = [[1, -1], [0, 1]] 的 9 次幂（其 n 次幂右上角元素就是 -n）！",
    knowledgePoints: [
      "置换矩阵必为正交矩阵：A⁻¹ = Aᵀ，置换矩阵的转置仍是置换矩阵",
      "矩阵方程 AB = C 有解 ⇔ r(A) = r(A, C)",
      "满秩分解求高次幂：A = GH ⇒ Aⁿ = G (HG)ⁿ⁻¹ H",
      "二阶上三角矩阵求幂：[[1, k], [0, 1]]ⁿ = [[1, n·k], [0, 1]]"
    ],
    mcq: {
      question: "【一刷·2026数二第8 & 9题原题】关于置换矩阵 A 以及矩阵方程 AB = C 有解的结论，正确的是：",
      options: [
        "第8题选(B) A⁻¹ 必为置换矩阵；第9题由增广矩阵 (A|C) 行变换使非零行比例一致得 a = −1, b = −1 (选A)",
        "第8题选(C) A* = A⁻¹ 恒成立（忽略了奇排列置换矩阵行列式为 −1）",
        "第9题 a = 2, b = 2",
        "第22题中 2 阶矩阵 HG = [[1, -1], [0, 1]] 的 9 次幂为 [[1, -1], [0, 1]]"
      ],
      answer: 0
    },
    cloze: {
      text: "① 第8题：置换矩阵满足 AᵀA = E，故 A⁻¹ = {{0}} 仍为置换矩阵。② 第9题：AB = C 有解充要条件为 r(A) = r({{1}})，解得 a = {{2}}, b = −1。③ 第22题：利用结合律 A¹⁰ = G · ({{3}})⁹ · H，其中 (HG)⁹ = [[1, {{4}}], [0, 1]]。",
      answers: ["A^T", "A,C", "-1", "HG", "-9"]
    },
    rubric: [
      "第8题：指出置换矩阵是正交阵 A⁻¹ = Aᵀ 仍是置换阵，而 |A| = ±1 故 A* = ±A⁻¹，选(B)",
      "第9题：对 (A | C) 作初等行变换，令第3、4行零行右侧同为 0，算出 a = −1, b = −1",
      "第22题(1)：对 A 作初等行变换化为行阶梯形，得 r(A) = 2 且前两列主元独立，证毕",
      "第22题(2)：写出 H = [[1,0,-1,1],[0,1,1,-1]]，算出 HG = [[1,-1],[0,1]] 及 (HG)⁹ = [[1,-9],[0,1]]，代回 A¹⁰ = G(HG)⁹H 得出结果"
    ],
    answerHtml: "<strong>【2026数二第8、9、22题·标准解析】</strong><div class='formula-card'>1. <strong>第8题（置换矩阵）</strong>：置换矩阵列向量组标准正交，故 <i>A</i><sup>−1</sup> = <i>A<sup>T</sup></i> 仍为置换矩阵（选 <strong>B</strong>）。注意互换奇数次两行时 |<i>A</i>| = −1，此时 <i>A</i><sup>*</sup> = −<i>A</i><sup>−1</sup>。</div><div class='formula-card'>2. <strong>第9题（矩阵方程 <i>AB = C</i>）</strong>：对增广矩阵 (<i>A</i> | <i>C</i>) 作初等行变换，由 <i>r</i>(<i>A</i>) = <i>r</i>(<i>A</i>, <i>C</i>) = 2 消去底行可得 <strong><i>a</i> = −1，<i>b</i> = −1</strong>（选 <strong>A</strong>）。</div><div class='formula-card'>3. <strong>第22题（12分线代大题：求 <i>H</i> 与 <i>A</i><sup>10</sup>）</strong>：<br>• (1) 对 (<i>α</i><sub>1</sub>, <i>α</i><sub>2</sub>, <i>α</i><sub>3</sub>, <i>α</i><sub>4</sub>) 行化简得行最简形前两行为 [1, 0, −1, 1] 与 [0, 1, 1, −1]，故 <i>r</i>(<i>A</i>) = 2 且 <i>α</i><sub>1</sub>, <i>α</i><sub>2</sub> 线性无关，是极大无关组。<br>• (2) 由行最简形直接读出系数矩阵 <i>H</i> = [ [1, 0, −1, 1], [0, 1, 1, −1] ]。<br>• 计算 2 阶矩阵 <i>HG</i> = [ [1, −1], [0, 1] ]，因此 (<i>HG</i>)<sup>9</sup> = [ [1, −9], [0, 1] ]。<br>• 故 <strong><i>A</i><sup>10</sup> = <i>G</i>(<i>HG</i>)<sup>9</sup><i>H</i></strong>，代入矩阵乘法即得最终 4×4 矩阵。</div>"
  }
];

// 数学二草稿纸计算题生成器扩充
Object.assign(window.CALC_GENERATORS, {
  MATH2_26_01: function(randomize) {
    const k = randomize ? [2, 3, 4, 5][Math.floor(Math.random() * 4)] : 3;
    const c_sin = randomize ? (Math.random() > 0.5 ? 1 : 2) : 1;
    const a_ans = +(1 / k).toFixed(3);
    const b_ans = -c_sin;
    return {
      code: "#MATH2-2026-01 | 泰勒展开与等价无穷小求参",
      noteTip: "草稿纸步骤：① 将 (1 + x²)^(1/k) − 1 展开为 (1/k)x²；② 将左端 bx + c·arcsin x 展开合并一次项 (b+c)x = 0",
      params: [
        { name: "左端表达式", val: `ax² + bx + ${c_sin === 1 ? "" : c_sin}arcsin x` },
        { name: "右端表达式", val: `(1 + x²)^(1/${k}) − 1` },
        { name: "极限过程", val: "x → 0 时两式为等价无穷小" }
      ],
      steps: [
        {
          label: "Step 1：求一次项系数消去条件下的参数 b",
          formula: `b + ${c_sin} = 0  ⇒  b = −${c_sin}`,
          unit: "(常数)",
          answer: b_ans,
          tolerance: 0.01
        },
        {
          label: "Step 2：求二次项主部系数匹配下的参数 a（保留3位小数，如 1/3 填 0.333）",
          formula: `(1 + x²)^(1/${k}) − 1 ~ (1/${k})x²  ⇒  a = 1/${k}`,
          unit: "(常数)",
          answer: a_ans,
          tolerance: 0.01
        }
      ]
    };
  },

  MATH2_26_12: function(randomize) {
    const k = randomize ? Math.round(1 + Math.random() * 3) : 1;
    const ans = +(-0.5 * k).toFixed(2);
    return {
      code: "#MATH2-2026-12 | 泰勒展开求分式差极限",
      noteTip: "在草稿纸写出：ln(1+kx)/x = k − (k²/2)x + o(x)，减去 k·x/sin(x) 后除以 k·x",
      params: [
        { name: "待求极限表达式", val: `lim(x→0) [1/(${k}x)] · [ ln(1+${k}x)/x − ${k}x / sin x ]` }
      ],
      steps: [
        {
          label: "Step 1：写出 ln(1+kx)/x 展开式中 x 一次项的系数",
          formula: `ln(1+${k}x)/x = ${k} − (${k * k}/2)x + o(x)`,
          unit: "",
          answer: -0.5 * k * k,
          tolerance: 0.02
        },
        {
          label: "Step 2：计算最终极限值",
          formula: `-(${k}² / 2) / ${k} = -${k}/2`,
          unit: "",
          answer: ans,
          tolerance: 0.02
        }
      ]
    };
  },

  MATH2_26_06_13: function(randomize) {
    const a = randomize ? Math.round(1 + Math.random() * 3) : 1;
    const g0 = 1;
    const f_prime_1 = +(Math.E / (1 + a)).toFixed(3);
    const g_prime_0 = +((1 + a) / Math.E).toFixed(3);
    return {
      code: "#MATH2-2026-06&13 | 变限积分反函数导数与曲率半径",
      noteTip: "草稿纸铁律：先令 f(x0)=0 得 x0=1，再算 g'(0) = 1 / f'(1)",
      params: [
        { name: "变限积分函数 f(x)", val: `∫₁ˣ [ eᵗ / (1 + ${a}t²) ] dt` },
        { name: "曲线方程 (第13题)", val: "x² + 2y + y² = 3 在点 (0, 1)" }
      ],
      steps: [
        {
          label: "Step 1：求反函数在 0 处的值 g(0)",
          formula: "令 f(x0) = 0 ⇒ 积分上下限相等 x0 = 1",
          unit: "",
          answer: g0,
          tolerance: 0.01
        },
        {
          label: "Step 2：求反函数导数值 g'(0)（取 e ≈ 2.718 计算小数）",
          formula: `g'(0) = 1 / f'(1) = (1 + ${a}) / e`,
          unit: "",
          answer: g_prime_0,
          tolerance: 0.03
        },
        {
          label: "Step 3：计算第13题曲线在 (0,1) 处的曲率半径 R",
          formula: "R = (1 + y'²)^(3/2) / |y''| = 1 / (1/4) = 4",
          unit: "",
          answer: 4,
          tolerance: 0.05
        }
      ]
    };
  },

  MATH2_26_INTEGRAL: function() {
    return {
      code: "#MATH2-2026-11/15/20 | 积分学三大真题草稿演算",
      noteTip: "在草稿纸依次演算第11题(p范围)、第15题(平均值 3ln2-1 ≈ 1.079)与第20题(拐点 x0 = √3/3 ≈ 0.577)",
      params: [
        { name: "第11题反常积分", val: "∫₀^(+∞) arctan(x) / [x^p(1+x)] dx" },
        { name: "第15题平均值区间", val: "f(x) = ln(2+x), x ∈ [0, 2]" },
        { name: "第20题曲线", val: "y = 1 / (1 + x²) (x ≥ 0)" }
      ],
      steps: [
        {
          label: "Step 1：第11题反常积分收敛的 p 的上限值（0 < p < ?）",
          formula: "x→0⁺ 时 x^(1-p) 收敛需 p - 1 < 1 ⇒ p < 2",
          unit: "",
          answer: 2,
          tolerance: 0.01
        },
        {
          label: "Step 2：第15题平均值 3ln2 − 1 的小数近似值（取 ln2 ≈ 0.693）",
          formula: "3 × 0.6931 − 1 ≈ 1.079",
          unit: "",
          answer: 1.079,
          tolerance: 0.03
        },
        {
          label: "Step 3：第20题拐点 M(x0, y0) 的纵坐标 y0",
          formula: "由 6x0² - 2 = 0 得 x0² = 1/3，代入 y0 = 1/(1 + 1/3) = 3/4 = 0.75",
          unit: "",
          answer: 0.75,
          tolerance: 0.01
        }
      ]
    };
  },

  MATH2_26_ODE: function() {
    return {
      code: "#MATH2-2026-02&21 | 微分方程真题草稿演算",
      noteTip: "第2题：2λ+μ=1, λ-2μ=0；第21题：x²y'' - 2xy' - (y')² = 0, y(3)=0.5, y'(3)=-9",
      params: [
        { name: "第2题特解组合", val: "2λy₁+μy₂ 为非齐次解，λy₁−2μy₂ 为齐次解" },
        { name: "第21题初值条件", val: "x=3 时 y=1/2, y'=−9" }
      ],
      steps: [
        {
          label: "Step 1：计算第2题中的参数 λ（2/5 填小数 0.4）",
          formula: "2λ + μ = 1 且 λ = 2μ ⇒ 5μ = 1 ⇒ μ = 0.2, λ = 0.4",
          unit: "",
          answer: 0.4,
          tolerance: 0.01
        },
        {
          label: "Step 2：第21题积分 x²/y' = -x + C1，代入 y'(3)=-9 求常数 C1",
          formula: "3² / (-9) = -3 + C1 ⇒ -1 = -3 + C1 ⇒ C1 = 2",
          unit: "",
          answer: 2,
          tolerance: 0.01
        },
        {
          label: "Step 3：第21题积分 y = -4ln(x-2) - 0.5x² - 2x + C2，代入 y(3)=0.5 求 C2",
          formula: "0.5 = 0 - 4.5 - 6 + C2 ⇒ C2 = 11",
          unit: "",
          answer: 11,
          tolerance: 0.01
        }
      ]
    };
  },

  MATH2_26_MULTI: function() {
    return {
      code: "#MATH2-2026-14&19 | 多元微分与极值大题草稿演算",
      noteTip: "第14题：df(0,0)=πdx+3dy, g(x)=f(lnx, sinπx)；第19题：f(x,y)=(2x²-y²)e^x",
      params: [
        { name: "第14题全微分", val: "df(0,0) = π dx + 3 dy" },
        { name: "第19题二元函数", val: "f(x,y) = (2x² − y²)eˣ" }
      ],
      steps: [
        {
          label: "Step 1：第14题求 g'(1) 中 π 的系数（即 g'(1) = k·π 中的 k）",
          formula: "g'(1) = π·(1/1) + 3·(π·cos π) = π − 3π = −2π",
          unit: "π",
          answer: -2,
          tolerance: 0.01
        },
        {
          label: "Step 2：第19题求极值点 (x0, 0) 的横坐标 x0（非零驻点）",
          formula: "2x² + 4x = 0 (x ≠ 0) ⇒ x0 = −2",
          unit: "",
          answer: -2,
          tolerance: 0.01
        },
        {
          label: "Step 3：第19题极大值 f(-2, 0) = k·e⁻² 中的系数 k",
          formula: "f(-2, 0) = [2×(-2)² − 0]·e⁻² = 8e⁻²",
          unit: "e⁻²",
          answer: 8,
          tolerance: 0.01
        }
      ]
    };
  },

  MATH2_26_LINALG: function() {
    return {
      code: "#MATH2-2026-09&22 | 线性代数真题草稿演算",
      noteTip: "第9题：AB=C 有解求 a,b；第22题：A=GH，求 2 阶矩阵 HG = [[1, -1], [0, 1]] 的 9 次幂",
      params: [
        { name: "第9题条件", val: "存在矩阵 B 使 AB = C ⇔ r(A) = r(A, C)" },
        { name: "第22题分解", val: "A = GH, 其中 HG = [[1, -1], [0, 1]]" }
      ],
      steps: [
        {
          label: "Step 1：第9题求出参数 a 的值",
          formula: "由增广矩阵初等行变换消元得 a = −1, b = −1",
          unit: "",
          answer: -1,
          tolerance: 0.01
        },
        {
          label: "Step 2：第22题计算 2 阶矩阵 (HG)⁹ 右上角 (1,2) 位置的元素值",
          formula: "[[1, -1], [0, 1]]⁹ = [[1, -9], [0, 1]]",
          unit: "",
          answer: -9,
          tolerance: 0.01
        }
      ]
    };
  }
});

// ============================================================================
// 2022-2025 数学二高频经典真题 + 2022-2026 英语二五大模块分类真题汇总
// ============================================================================
window.QUESTIONS.push(
  {
    id: "M22_25_CORE",
    subject: "math2",
    year: 2025,
    chapter: "m_ch2",
    type: "short",
    typeName: "五年真题汇总",
    pdfPage: 1,
    kaoyanImg: "assets/kaoyan/math2_2025_p1.png",
    title: "【2022-2025数二真题汇总】中值定理辅助函数构造与零点/极值点个数判定",
    prompt: "汇总2022—2025年数学二微分中值定理高频真题：<br>(1) 见到待证等式含 <i>f'</i>(<i>ξ</i>) + <i>a f</i>(<i>ξ</i>) = 0 或 <i>x f'</i>(<i>x</i>) + <i>n f</i>(<i>x</i>) = 0 时，如何快速构造罗尔定理辅助函数 <i>F</i>(<i>x</i>)？<br>(2) 见到双介值点 <i>ξ</i>, <i>η</i> 问题时，什么时候用『两次拉格朗日中值定理』，什么时候用『拉格朗日 + 柯西中值定理』？",
    tips: "💡 中值定理构造口诀：『加号乘幂乘指数，减号除幂除指数』！例如 f'(x) + a·f(x) 乘积分因子 e^(ax) 构造成 F(x) = e^(ax)·f(x)；x·f'(x) + n·f(x) 乘 x^(n-1) 构造成 F(x) = xⁿ·f(x)！双介值若两式共享同一个区间端点则用两次拉格朗日，若区间不重叠则分段用拉格朗日。",
    knowledgePoints: [
      "罗尔定理辅助函数表：① f'+af → e^(ax)f(x)；② f'-af → e^(-ax)f(x)；③ xf'+nf → xⁿf(x)",
      "零点定理（定存在）+ 单调性/罗尔定理推论（定唯一）",
      "泰勒中值定理：当题干出现二阶导 f''(ξ) 且已知一点处一阶导 f'(x0)=0 时必用泰勒展开到二阶！"
    ],
    mcq: {
      question: "【一刷·构造秒杀】若要在 [a, b] 上证明存在 ξ 使 ξ·f'(ξ) + 2f(ξ) = 0，应构造的罗尔定理辅助函数 F(x) 是：",
      options: [
        "F(x) = x² · f(x)   （因为 [x²f(x)]' = x · [x·f'(x) + 2f(x)]）",
        "F(x) = e^(2x) · f(x)",
        "F(x) = f(x) / x²",
        "F(x) = x · f²(x)"
      ],
      answer: 0
    },
    cloze: {
      text: "微分中值定理三大构造模型：① 证 f'(ξ) + a·f(ξ) = 0 构造 F(x) = {{0}}·f(x)；② 证 ξ·f'(ξ) + n·f(ξ) = 0 构造 F(x) = {{1}}·f(x)；③ 题干含函数值与二阶导数 f''(ξ) 关系时，必用{{2}}公式在极值点或端点处展开。",
      answers: ["e^(ax)", "x^n", "泰勒"]
    },
    rubric: [
      "熟练写出指数型积分因子辅助函数 F(x) = e^(∫p(x)dx)·f(x)",
      "熟练写出幂函数型辅助函数 F(x) = xⁿ·f(x) 与商型 F(x) = f(x)/x",
      "掌握一阶导用拉格朗日/柯西、高阶导用泰勒公式的破题分流原则"
    ],
    answerHtml: "<strong>【2022-2025数二中值定理核心总结】</strong><div class='formula-card'>1. <strong>常见微分算子对应的辅助函数 <i>F</i>(<i>x</i>)</strong>：<br>• <i>f'</i>(<i>x</i>) + <i>a f</i>(<i>x</i>) = 0  ⇒  构造 <strong><i>F</i>(<i>x</i>) = <i>e<sup>ax</sup> f</i>(<i>x</i>)</strong><br>• <i>x f'</i>(<i>x</i>) + <i>n f</i>(<i>x</i>) = 0  ⇒  构造 <strong><i>F</i>(<i>x</i>) = <i>x<sup>n</sup> f</i>(<i>x</i>)</strong><br>• <i>x f'</i>(<i>x</i>) − <i>f</i>(<i>x</i>) = 0  ⇒  构造 <strong><i>F</i>(<i>x</i>) = <span class='frac'><span class='frac-num'><i>f</i>(<i>x</i>)</span><span class='frac-den'><i>x</i></span></span></strong></div><div class='formula-card'>2. <strong>高阶导数中值问题（含 <i>f''</i>(<i>ξ</i>)）</strong>：<br>在已知 <i>f'</i>(<i>x</i><sub>0</sub>) = 0 的点 <i>x</i><sub>0</sub> 处将 <i>f</i>(<i>x</i>) 展开到二阶：<br><i>f</i>(<i>x</i>) = <i>f</i>(<i>x</i><sub>0</sub>) + <i>f'</i>(<i>x</i><sub>0</sub>)(<i>x</i> − <i>x</i><sub>0</sub>) + <span class='frac'><span class='frac-num'><i>f''</i>(<i>ξ</i>)</span><span class='frac-den'>2!</span></span>(<i>x</i> − <i>x</i><sub>0</sub>)<sup>2</sup>，代入两端点 <i>a</i>, <i>b</i> 即可消去未知量。</div>"
  },

  // ==================== 考研英语二 (2022-2026) 五大模块分类真题 ====================
  {
    id: "E_M1_CLOZE",
    subject: "eng2",
    year: 2026,
    chapter: "e_ch1",
    type: "short",
    typeName: "完形真题技巧",
    pdfPage: 1,
    title: "【2022-2026英二真题分类·模块一】完形填空十大逻辑关系词与高频复现词",
    prompt: "汇总2022—2026年英语二完形填空（Section I Use of English, 10分）核心命题规律：(1) 写出完形填空必考的五大句间逻辑关系及标志词；(2) 如何利用『总分结构对立/同义复现』在 12 分钟内稳拿 7~8 分？",
    tips: "💡 完形考场做题技巧：① 首句不设空，必读首句定全文感情基调与核心话题！② 先做逻辑关系词（约5~6题，送分题）：转折(however/yet/whereas)、让步(although/even though/while)、因果(therefore/consequently/given that)、对比(by contrast/conversely)。③ 实词辨析90%在上下文中有原词或同义词复现，切忌脱离上下文纯靠中文语感硬凑！",
    knowledgePoints: [
      "让步转折高频词：while (尽管), whereas (然而，表对比), nevertheless (然而), albeit (尽管)",
      "因果条件高频词：given that (鉴于，考虑到), in that (因为), provided that (假如), thereby (从而)",
      "总分照应原则：段首总括句的态度词（正/负）直接决定段内分述句空格的褒贬色彩"
    ],
    mcq: {
      question: "【一刷·真题逻辑快筛】在英语二完形填空中，若前后两句主语不同且动作/属性完全相反（如前句说陌生人之间长停顿会降低亲密感，后句说朋友之间长停顿反而增进亲密感），最常选的对比/转折逻辑词是：",
      options: [
        "whereas / by contrast / conversely （表鲜明对比或转折）",
        "furthermore / likewise （表并列递进）",
        "for instance / specifically （表举例例证）",
        "consequently / hence （表顺承因果）"
      ],
      answer: 0
    },
    cloze: {
      text: "英语二完形高频逻辑词：①『尽管/虽然』：although / even though / {{0}}；②『鉴于/考虑到』：{{1}} that；③『因为（后接原因从句）』：{{2}} that；④『相反地/相比之下』：by {{3}} / conversely。",
      answers: ["while", "given", "in", "contrast"]
    },
    rubric: [
      "熟练区分让步转折词：while / whereas / nevertheless / albeit",
      "熟练掌握特殊复合连词：given that (鉴于)、in that (因为)、provided that (倘若)",
      "掌握实词题『褒贬一致 + 主谓搭配 + 上下文同义复现』三步定位法"
    ],
    answerHtml: "<strong>【2022-2026英语二完形填空核心解题体系】</strong><div class='formula-card'>1. <strong>必背四大逻辑关系词库（占完形 30% 分值）</strong>：<br>• <strong>对立/转折/让步</strong>：<code>however</code>, <code>yet</code>, <code>whereas</code>（然而/反观）, <code>while</code>（尽管）, <code>albeit</code>（尽管）, <code>nevertheless</code><br>• <strong>因果/条件</strong>：<code>therefore</code>, <code>consequently</code>, <code>thereby</code>（从而+doing）, <code>given that</code>（鉴于）, <code>in that</code>（因为）<br>• <strong>相似/递进</strong>：<code>similarly</code>, <code>likewise</code>（同样地）, <code>moreover</code>, <code>furthermore</code><br>• <strong>举例/具体化</strong>：<code>for instance</code>, <code>specifically</code>, <code>in particular</code></div><div class='formula-card'>2. <strong>考场抢分口诀</strong>：先看选项定题型（逻辑词题 vs 实词搭配题）→ 逻辑词看前后句褒贬与主语异同 → 实词题向前/向后找同义复现词。</div>"
  },
  {
    id: "E_M2_READING",
    subject: "eng2",
    year: 2026,
    chapter: "e_ch2",
    type: "short",
    typeName: "阅读真题技巧",
    pdfPage: 1,
    title: "【2022-2026英二真题分类·模块二】阅读理解 Part A (40分) 四大题型破题铁律与态度词表",
    prompt: "汇总2022—2026年英语二阅读理解 Part A（4篇共20题，每题2分）核心破题技巧：(1) 细节题正确选项的『同义改写』有哪些常见手法？(2) 作者态度题必选词与绝对不选的『陪跑词』有哪些？(3) 例证题与主旨题如何秒杀？",
    tips: "💡 阅读 Part A 拿 34+ 分铁律：① 『顺序出题原则』：5道题严格对应文章段落顺序，先题干划定位词（大写/数字/核心名词）再回文定位！② 『定位句即答案』：英二阅读极少需要跨段推理，90%正确选项就是定位句的同义词替换或正话反说！③ 态度题见到 indifferent（漠不关心）、biased/prejudiced（偏见）、puzzled（困惑）、indulgent（纵容）直接排除！",
    knowledgePoints: [
      "细节题正确选项公式：定位句主干同义替换（具体下义词 → 概括上义词，或词性转换）",
      "态度题必排陪跑词：indifferent, unconcerned, biased, prejudiced, puzzled, indulgent",
      "例证题黄金法则：例子本身不重要，往例子前一句（或段首总括句）找论点",
      "主旨大意题串线法：把各段首尾转折句串联，或者把5道题题干都出现的『高频中心词』选入标题"
    ],
    mcq: {
      question: "【一刷·阅读铁律快筛】在英语二阅读理解 Attitude（作者态度题）中，下列哪一组词汇属于一旦出现在选项中即可『99%直接排除』的干扰陪跑词？",
      options: [
        "indifferent (漠不关心的) / prejudiced (有偏见的) / puzzled (困惑不解的) / indulgent (纵容的)",
        "supportive (支持的) / approving (赞同的) / optimistic (乐观的)",
        "skeptical (怀疑的) / critical (批评的) / doubtful (存疑的)",
        "objective (客观的) / cautious (谨慎的) / neutral (中立的)"
      ],
      answer: 0
    },
    cloze: {
      text: "英二阅读四大题型铁律：① 细节题正确选项本质是定位句的{{0}}；② 例证题答案永远不在例子内部，而在例子{{1}}的论点句；③ 态度题必排词包括 {{2}}（漠不关心）、prejudiced（偏见）、puzzled（困惑）；④ 篇章主旨题必含各题题干反复出现的{{3}}。",
      answers: ["同义改写", "前一句", "indifferent", "中心词"]
    },
    rubric: [
      "掌握细节题『题干双词定位 + 定位句同义替换比对 + 排除偷换概念/过度推理』三步法",
      "熟记态度题正向(approving/favorable)、负向(skeptical/critical)、客观(objective)与必排词清单",
      "掌握例证题找前句论点、主旨题串联段首转折句及题干中心词的秒杀技巧"
    ],
    answerHtml: "<strong>【2022-2026英语二阅读理解 Part A 满分方法论】</strong><div class='formula-card'>1. <strong>细节题（占 65%）三大同义替换模式</strong>：<br>• 同义词/近义词替换（如 <code>surge</code> → <code>dramatic increase</code>，<code>curb</code> → <code>limit/restrict</code>）<br>• 词性转换与主动被动转换<br>• 双重否定与正话反说（如 <code>hardly seen as a plus</code> → <code>not beneficial</code>）</div><div class='formula-card'>2. <strong>作者态度题秒杀词表</strong>：<br>• ✅ <strong>常选正向</strong>：<code>supportive</code>, <code>favorable</code>, <code>approving</code>, <code>optimistic</code><br>• ✅ <strong>常选负向</strong>：<code>skeptical</code>, <code>critical</code>, <code>doubtful</code>, <code>concerned</code><br>• ❌ <strong>必排干扰</strong>：<code>indifferent</code>（漠不关心）, <code>prejudiced/biased</code>（偏见）, <code>puzzled/confused</code>（迷惑）, <code>indulgent</code>（纵容）</div>"
  },
  {
    id: "E_M3_PARTB",
    subject: "eng2",
    year: 2026,
    chapter: "e_ch3",
    type: "short",
    typeName: "新题型真题精析",
    pdfPage: 1,
    title: "【2023/2024/2026英二真题·模块三】新题型 Part B (10分) 多项对应秒杀实战",
    prompt: "结合2023年（英国房屋扩建新规）、2024年（美国高中生课外活动）、2026年（森林生态恢复）英语二新题型真题，演练『人名定位 + 观点同义转述』满分技巧：<br>• 2023真题44题 John Kelly 对应选项 [E] Many people feel that home prices are already beyond what they can afford.<br>• 2024真题42题 Sara Harberson 对应选项 [C] Undertaking too many extracurricular activities will hardly be seen as a plus by colleges.<br>• 2026真题44题 Pedro Brancalion 对应选项 [E] The supply of seeds is a tough problem that has to be dealt with.",
    tips: "💡 新题型 8分钟拿满分 10分秘诀：① 先通读右栏 7 个选项（A~G），圈出每个选项的『主语核心词 + 谓语情感倾向 + 宾语特征词』；② 回到原文把 41~45 题的 5 个人名全部用方框框出来（特别注意：同一个人名往往在文章前半段和末尾同时出现两次，第二次出现处往往才是出题点！）；③ 逐句比对引号内外人物言论的同义改写！",
    knowledgePoints: [
      "2023真题同义替换：beyond what they can afford (负担不起) ⇔ priced out of the market",
      "2024真题同义替换：hardly be seen as a plus (不算加分项) ⇔ serial joiners are not favored",
      "2026真题同义替换：supply of seeds is a tough problem ⇔ bottleneck in native seed availability"
    ],
    mcq: {
      question: "【一刷·新题型实战】在做英语二 Part B『人物—观点多项对应题』时，最高效、最不容易漏掉关键信息的定位顺序是：",
      options: [
        "先划出7个选项的核心名词与正负评价词 → 在全文框出5个人名出现的全部位置（含首尾复现处）→ 精读人物直接引语与间接引语匹配同义替换",
        "从第一段第一句开始逐字逐句把整篇文章翻译成中文再做题",
        "只看人物第一次出现的那句话，后面再出现同一人名直接忽略",
        "看到选项里有和原文一模一样的单个单词就立刻选，不核对谓语逻辑"
      ],
      answer: 0
    },
    cloze: {
      text: "近五年英二新题型高频同义替换：① 2023真题：beyond what they can {{0}}（超出了他们的承受能力/买不起）；② 2024真题：undertaking too many {{1}} activities will hardly be seen as a {{2}} by colleges（参加过多课外活动很难被大学视为加分项）；③ 2026真题：the {{3}} of seeds is a tough problem（种子的供应是个棘手难题）。",
      answers: ["afford", "extracurricular", "plus", "supply"]
    },
    rubric: [
      "掌握新题型『先划7个选项关键词 → 全文框出所有人名（含二次出现处）』标准流程",
      "熟记2023/2024/2026三年新题型真题选项中的高频表达（beyond what they can afford / seen as a plus / tough problem）",
      "警惕『原词拼凑但逻辑相反』的干扰项，必须核对主谓宾整体含义一致"
    ],
    answerHtml: "<strong>【2022-2026英语二新题型 Part B 真题复盘】</strong><div class='formula-card'>1. <strong>近五年新题型题型统计</strong>：多项对应（5个人名匹配7个观点）与小标题题型交替出现，属于整张试卷<strong>性价比最高、必须拿满 10 分</strong>的模块。</div><div class='formula-card'>2. <strong>真题经典同义改写对照</strong>：<br>• <strong>2023年（房屋扩建新规）</strong>：<code>beyond what they can afford</code> 对应原文房价过高、人们无力承担。<br>• <strong>2024年（高中课外活动）</strong>：<code>Undertaking too many extracurricular activities will hardly be seen as a plus</code> 对应原文盲目参加过多活动并不受招生官青睐。<br>• <strong>2026年（森林生态恢复）</strong>：<code>The supply of seeds is a tough problem</code> 对应原文树种供应短缺难题。</div>"
  },
  {
    id: "E_M4_TRANS_22_26",
    subject: "eng2",
    year: 2026,
    chapter: "e_ch4",
    type: "short",
    typeName: "翻译真题汇总(22-26)",
    pdfPage: 1,
    title: "【2022-2026英二真题分类·模块四】近五年英译汉 Section III (15分) 全真长难句拆分与精译",
    prompt: "分类精析近五年英语二 Section III Translation（15分）五大主题与核心长难句：<br>• <strong>2022年（绘画中的意外收获）</strong>：<i>Unexpected results have two benefits: you pretty quickly learn to deal with disappointment and realise that when one door closes, another opens.</i><br>• <strong>2023年（华兹华斯与自然诗歌）</strong>：<i>It is closely related to song and even when written it is usually created to be performed out loud.</i><br>• <strong>2025年（交谈中的尴尬沉默）</strong>：<i>...the fear of awkward silences can be so extreme that people avoid talking to strangers, even though doing so is likely to be an enjoyable experience.</i><br>• <strong>2026年（穿戴服饰对心理的影响）</strong>：<i>Whether we opt for bold, colorful outfits or prefer more understated styles, our dress choices convey messages about who we are and how we want to be perceived.</i>",
    tips: "💡 英二翻译拿 12~14 分四步法：① 拆分语法意群（在连词 that/which/when/although/whether、介词及非谓语前画斜线 `/` 断句）；② 定语从句『短前长后』（短定语放名词前加“的”，长定语后置独立成句）；③ 被动语态转主动或加『被/由/得以』（如 2026 真题 how we want to be perceived 译为『我们希望别人如何看待自己』）；④ 切忌留空白，遇到生词用上下文词根逻辑顺译！",
    knowledgePoints: [
      "2022核心词伙：turn out (结果是), think outside the box (跳出固有思维模式), second nature (第二天性/本能)",
      "2023核心词伙：Romanticism (浪漫主义), pass down history (传承历史), come to life (变得鲜活生动)",
      "2025核心词伙：awkward silence (尴尬的沉默), markedly dip (明显下降), reflection (反思/深思)",
      "2026核心词伙：self-perception (自我认知), opt for (选择), understated styles (低调内敛的风格), be perceived (被看待)"
    ],
    mcq: {
      question: "【一刷·2026英二翻译真题精析】2026真题句子 'Whether we opt for bold, colorful outfits or prefer more understated styles, our dress choices convey messages about who we are and how we want to be perceived.' 中，opt for、understated styles 与 how we want to be perceived 的最准确译法是：",
      options: [
        "opt for 译为『选择』；understated styles 译为『低调/内敛的风格』；how we want to be perceived 译为『我们希望自己如何被他人看待』",
        "opt for 译为『反对』；understated styles 译为『地下的风格』；perceived 译为『欺骗』",
        "opt for 译为『乐观』；understated styles 译为『未说明的样式』",
        "opt for 译为『操作』；understated styles 译为『低估的款式』"
      ],
      answer: 0
    },
    cloze: {
      text: "近五年英二翻译高频采分短语：① 2022年：thinking outside the box 译为『{{0}}』；② 2023年：Poems really come to life when they are recited 译为『当诗歌被朗诵出来时，它们才真正变得{{1}}』；③ 2025年：such feelings of connection markedly dip 译为『这种亲密联结感会明显{{2}}』；④ 2026年：shaping our self-perception 译为『塑造我们的{{3}}』。",
      answers: ["跳出固有思维", "鲜活生动", "下降", "自我认知"]
    },
    rubric: [
      "2022翻译通关：准确译出 turn out as originally planned（如原计划那样）、thinking outside the box（跳出思维定式）",
      "2023翻译通关：准确译出 celebrate the wonders of the natural world（礼赞自然界的奇观）、performed out loud（大声朗诵/吟诵）",
      "2025翻译通关：准确拆分 previous studies which indicate that... so extreme that... even though... 三层从句",
      "2026翻译通关：准确译出 self-perception（自我认知）、bold colorful outfits（大胆鲜艳的穿搭）与 understated styles（低调内敛的风格）"
    ],
    answerHtml: "<strong>【2022-2026英语二翻译真题（Section III）全文核心长难句对照精译】</strong><div class='formula-card'><strong>【2026年真题：穿搭心理学】</strong><br><i>Whether we opt for bold, colorful outfits or prefer more understated styles, our dress choices convey messages about who we are and how we want to be perceived.</i><br>👉 <strong>标准译文</strong>：无论我们选择大胆鲜艳的穿搭，还是偏爱更加低调内敛的风格，我们的着装选择都在传递关于“我们是谁”以及“我们希望别人如何看待自己”的信息。</div><div class='formula-card'><strong>【2025年真题：交谈中的沉默间隙】</strong><br><i>During conversations with short gaps, people feel more connected to their conversation partners. But such feelings of connection markedly dip when entering a long gap.</i><br>👉 <strong>标准译文</strong>：在停顿时间较短的交谈中，人们会觉得与交谈对象更加亲近；但当出现长时间的沉默停顿时，这种联结感就会明显下降。</div><div class='formula-card'><strong>【2023年真题：华兹华斯与诗歌】</strong><br><i>It is closely related to song and even when written it is usually created to be performed out loud. Poems really come to life when they are recited.</i><br>👉 <strong>标准译文</strong>：诗歌与歌曲密切相关，即便写成文字，通常也是为了大声朗诵而创作的。当诗歌被吟诵出来时，它们才真正变得鲜活生动。</div><div class='formula-card'><strong>【2022年真题：绘画的意外收获】</strong><br><i>You also quickly learn to adapt and come up with creative solutions to the problems the painting presents, and thinking outside the box will become your second nature.</i><br>👉 <strong>标准译文</strong>：你还能很快学会适应，并针对绘画过程中出现的问题想出富有创意的解决办法，而跳出固有思维模式将成为你的本能（第二天性）。</div>"
  },
  {
    id: "E_M5_WRITING_22_26",
    subject: "eng2",
    year: 2026,
    chapter: "e_ch5",
    type: "short",
    typeName: "写作真题模板(22-26)",
    pdfPage: 1,
    title: "【2022-2026英二真题分类·模块五】近五年小作文 Part A (10分) 审题汇总与大作文 Part B (15分) 万能模板",
    prompt: "汇总2022—2026年英语二小作文（Part A）真题指令与大作文（Part B）高分框架，并进行三刷默写：<br>• <strong>2022小作文</strong>：筹办校园美食节（campus food festival），给留学生写邮件：①介绍美食节；②邀请参加。<br>• <strong>2023小作文</strong>：周日有艺术展（art exhibition）和机器人展（robot show），给朋友 David 写信：①提出建议去哪一个；②给出理由。<br>• <strong>2024小作文</strong>：古建筑保护项目，给外国朋友写信：①提出你的计划（put forward your plan）；②征求他的意见。<br>• <strong>2025小作文</strong>：筹划改编自中国古典名著的短剧（a short play based on a classic Chinese novel），给朋友 John 写信：①介绍短剧；②邀请他参演。<br>• <strong>2026小作文</strong>：朋友 Jack 分享了他一家人中国旅行的视频（a video of his family's travel in China），写邮件告诉他：①你看完视频的感受；②希望了解更多旅行细节。",
    tips: "💡 考场写作 25分稳拿 20+ 秘诀：① 小作文（100词）注意看清前5年全部都是给朋友或留学生写 Email！第一段 2 句话直接点题（问候+写信目的），第二段用 To begin with / What's more 严格对应题干的两个小问（1和2缺一不可！），第三段一句话期待回复，落款必写 Yours sincerely, Li Ming！② 大作文（150词）永远是『第一段描图（极值/变化趋势）+ 第二段析因（经济/意识/科技3选2）+ 第三段总结展望』！",
    knowledgePoints: [
      "活动介绍与邀请万能句：Suppose you are planning... → The event is scheduled to be held at... aiming to...",
      "建议与理由万能句：I strongly recommend that you choose..., mainly for the following two reasons.",
      "图表大作文第一段起手式：As is vividly illustrated in the chart above, remarkable changes have taken place in...",
      "图表大作文第二段因果过渡：Several key factors account for this phenomenon. First and foremost,... In addition,..."
    ],
    mcq: {
      question: "【一刷·近五年小作文规律快筛】观察 2022—2026 年英语二 Part A 小作文的 5 道真题，下列关于其文体与结构要求的说法完全正确的是：",
      options: [
        "近五年全部考查电子邮件(Email)，且均包含2个明确的要点指令（如介绍+邀请、建议+理由、感受+愿望），落款统一要求署名为 Li Ming",
        "近五年全部考查正式学术投诉信，字数要求 300 词以上",
        "小作文可以使用考生自己的真实姓名落款",
        "大作文 Part B 不需要描述图表数据，只需写议论文"
      ],
      answer: 0
    },
    cloze: {
      text: "大小作文必背黄金功能句：① 小作文开头点题：I am writing this email to {{0}} my suggestions / invite you to participate in...；② 大作文第一段描图：As is {{1}} illustrated in the chart above, the proportion of... surged {{2}} from X% to Y%；③ 大作文第二段析因：Several factors {{3}} for this remarkable phenomenon. First and foremost, people {{4}} increasing importance to...",
      answers: ["share", "vividly", "dramatically", "account", "attach"]
    },
    rubric: [
      "熟练背诵小作文『活动介绍+邀请信』（适配2022美食节/2025名著短剧）与『建议/分享信』（适配2023展会建议/2024计划/2026旅行视频）两套模板",
      "熟练默写大作文第一段图表数据描述句型（surged dramatically / witnessed a steady rise / accounted for the largest proportion）",
      "熟练默写大作文第二段原因分析句型（Several factors account for... / attach great importance to...）与第三段总结句"
    ],
    answerHtml: "<strong>【2022-2026英语二写作 Section IV 考场直接套用满分模板】</strong><div class='formula-card'><strong>一、小作文 Part A（10分，适配 2022/2023/2024/2025/2026 全部真题）</strong><br><code>Dear [John / David / Jack / International Students],</code><br><strong>[第一段·目的]</strong> I am writing this email to <em>[introduce our upcoming short play based on a classic Chinese novel and warmly invite you to take part in it / share my feelings after watching the wonderful video of your family's travel in China]</em>.<br><strong>[第二段·展开要点1&2]</strong> To begin with, <em>[展开第1问：时间、地点、核心内容或观后感]</em>. What's more, <em>[展开第2问：受邀角色、推荐理由或希望进一步了解的细节]</em>, which will undoubtedly be an unforgettable experience.<br><strong>[第三段·结尾]</strong> I would be delighted if you could join us / share more details with me. Looking forward to your early reply.<br><code>Yours sincerely,</code><br><code>Li Ming</code></div><div class='formula-card'><strong>二、大作文 Part B（15分，图表作文三段式 150词黄金骨架）</strong><br><strong>[第一段·描图]</strong> As is vividly illustrated in the chart above, remarkable changes have taken place in <em>[主题词]</em> in recent years. Specifically, the proportion/number of <em>[数据A]</em> surged dramatically from X% to Y%, whereas that of <em>[数据B]</em> experienced a slight decline / remained stable.<br><strong>[第二段·析因]</strong> Several key factors account for this notable phenomenon. First and foremost, with the rapid advancement of living standards, people attach increasing importance to <em>[原因1：健康/精神文化/生态环保]</em>. In addition, the widespread popularity of <em>[原因2：数字技术/政策支持/公共设施]</em> also plays an indispensable role in driving this trend.<br><strong>[第三段·评论]</strong> Taking all these factors into account, we may reasonably predict that this positive trend will continue in the foreseeable future. From my perspective, we should actively embrace this change to promote sustainable development.</div>"
  }
);

// ============================================================================
// 高频需大量重复记忆知识点 & AI 批量生成提示词中心数据（供网页直接展示与一键复制）
// ============================================================================
window.AI_PROMPTS = {
  math2: `你现在是考研数学二（302）顶级命题研究专家与前端题库数据工程师。我将向你提供考研数学二的真题内容（或指定年份与题号）。请你将其按考点分类拆解，并严格输出为可直接接入我本地《考研全科三刷通关系统》的纯 JSON 数组格式 [...]（不要带额外解释文字）。

⚠️ 极重要格式要求（必须 100% 遵守）：
1. 严禁输出未渲染的 LaTeX 代码串（禁止出现 \\frac、\\int、$$、\\lambda 等反斜杠源码）！
2. 所有数学公式必须使用纯 HTML 直观标签与 Unicode 数学符号：
   - 上下分式：<span class='frac'><span class='frac-num'>分子</span><span class='frac-den'>分母</span></span>
   - 独立公式块：<div class='formula-card'>...</div>
   - 上标 <sup>...</sup>，下标 <sub>...</sub>，斜体变量 <i>...</i>
   - 符号直接使用 Unicode：∫、∑、→、∞、≤、≥、≠、≈、×、±、√、∂、π、λ、μ、α、β、Δ。
3. 每道题必须包含：
   - id (如 "M24_01"), subject: "math2", year (年份数字), chapter ("m_ch1"至"m_ch6"之一: m_ch1极限, m_ch2一元微分, m_ch3一元积分, m_ch4微分方程, m_ch5多元微分与二重积分, m_ch6线性代数), type: "short"或"calc", typeName: "真题精析"
   - title, prompt, tips (💡考场破题秒杀技巧/避坑指南), knowledgePoints (关联高频知识点数组)
   - mcq: { question, options: [4个选项], answer: 正确下标0-3 }
   - cloze: { text: "含 {{0}} {{1}} 挖空的文本", answers: ["答案0", "答案1"] }
   - rubric: ["三刷采分点1", "三刷采分点2", "三刷采分点3"]
   - answerHtml: "带 <div class='formula-card'> 和 <span class='frac'> 的详细步骤解析"`,

  eng2: `你现在是考研英语二（204）资深阅卷人与教研专家。我将向你提供考研英语二的真题材料（完形、阅读Part A、新题型Part B、翻译Section III或写作Section IV）。请你将其按题型模块拆解，并严格输出为可直接接入我本地《考研全科三刷通关系统》的纯 JSON 数组格式 [...]。

⚠️ 格式与字段要求：
1. subject 固定填 "eng2"，chapter 填以下 5 个模块 ID 之一：
   - "e_ch1"：模块一：完形填空
   - "e_ch2"：模块二：阅读理解 Part A
   - "e_ch3"：模块三：新题型 Part B
   - "e_ch4"：模块四：翻译 Section III
   - "e_ch5"：模块五：写作 Section IV
2. 每道题必须包含高价值的 tips（💡考场定位技巧/同义替换拆解/长难句切分公式）与 knowledgePoints（核心必背词汇/词组/语法点数组）。
3. 包含三刷结构：
   - mcq: { question, options: [4个选项], answer: 0 }
   - cloze: { text: "含 {{0}}, {{1}} 的同义替换或译文填空", answers: ["词1", "词2"] }
   - rubric: ["三刷复盘要点1", "要点2", "要点3"]
   - answerHtml: "使用 <div class='formula-card'> 分块排版的详细真题解析与参考译文/范文"`
};
