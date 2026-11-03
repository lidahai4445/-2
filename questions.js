// ============================================================================
// 《光电子器件》全考点三刷题库（基于《光电子器件重点内容.docx》与9页扫描笔记《光电子器件(1).pdf》）
// 包含：第1~7章全部名词解释、简答题、图解分析题与现实草稿纸辅助计算题
// ============================================================================

window.CHAPTERS = [
  { id: "ch1", name: "第一章 光通信系统与器件概论", pdfPages: [1] },
  { id: "ch2", name: "第二章 半导体光源 (LED与LD)", pdfPages: [1, 2, 3] },
  { id: "ch3", name: "第三章 光纤分类、特性与制造", pdfPages: [3, 4] },
  { id: "ch4", name: "第四章 光电检测器 (PIN与APD) 及前置放大", pdfPages: [4, 5, 6] },
  { id: "ch5", name: "第五章 光放大器 (EDFA/FRA/FBA/SOA)", pdfPages: [6, 7] },
  { id: "ch6", name: "第六章 光调制器与物理效应", pdfPages: [8] },
  { id: "ch7", name: "第七章 光纤连接器与光耦合器", pdfPages: [8, 9] }
];

window.QUESTIONS = [
  // ==================== 第一章 ====================
  {
    id: "Q01",
    chapter: "ch1",
    type: "short",
    typeName: "简答题",
    pdfPage: 1,
    title: "光纤通信系统的组成部分（信号传输完整链路）",
    prompt: "简述光纤通信系统的基本组成部分，并按信号从发端到收端的传输顺序写出完整链路。",
    mcq: {
      question: "【一刷·概念快筛】按照笔记第1页，光纤通信系统中信号从发射到接收的正确顺序是：",
      options: [
        "信息源 → 电发射机 → 光发射机 → 光纤 → 光放大器 → 光接收机 → 电接收机",
        "信息源 → 光发射机 → 电发射机 → 光纤 → 光接收机 → 光放大器 → 电接收机",
        "信息源 → 电发射机 → 光调制器 → 光接收机 → 光纤 → 电接收机",
        "电发射机 → 信息源 → 光纤 → 光发射机 → 光放大器 → 光接收机"
      ],
      answer: 0
    },
    cloze: {
      text: "光通信系统组成链路：信息源 → {{0}} → {{1}} → 光纤 → {{2}} → {{3}} → 电接收机。",
      answers: ["电发射机", "光发射机", "光放大器", "光接收机"]
    },
    rubric: [
      "发端部分：信息源 → 电发射机 → 光发射机（实现电/光转换 E/O）",
      "传输与中继部分：光纤 → 光放大器（补偿光纤传输损耗）",
      "收端部分：光接收机（实现光/电转换 O/E）→ 电接收机"
    ],
    answerHtml: "<strong>标准答案（笔记P1第1题）：</strong><br>信息源 → <strong>电发射机</strong> → <strong>光发射机</strong> → <strong>光纤</strong> → <strong>光放大器</strong> → <strong>光接收机</strong> → <strong>电接收机</strong>。"
  },
  {
    id: "Q02",
    chapter: "ch1",
    type: "short",
    typeName: "简答题",
    pdfPage: 1,
    title: "与光纤通信系统相关的光电子器件有哪些？",
    prompt: "列举与光纤通信系统相关的核心有源与无源光电子器件（至少写出8种）。",
    mcq: {
      question: "【一刷·概念快筛】以下哪一组全部属于光纤通信系统中的无源光器件？",
      options: [
        "光开关、光衰减器、光耦合器、光纤连接器",
        "光源(LED/LD)、光放大器(EDFA)、光耦合器、光纤连接器",
        "光发射机、光接收机、PIN光电二极管、光开关",
        "激光器(LD)、雪崩光电二极管(APD)、光衰减器"
      ],
      answer: 0
    },
    cloze: {
      text: "系统光电子器件包括：光发射机、{{0}}、光纤、光接收机、{{1}}、光源；以及无源器件：{{2}}、光衰减器、{{3}}、光纤连接器。",
      answers: ["光调制器", "光放大器", "光开关", "光耦合器"]
    },
    rubric: [
      "传输与有源核心器件：光发射机、光调制器、光纤、光接收机、光放大器、光源",
      "控制与连接无源器件：光开关、光衰减器、光耦合器、光纤连接器"
    ],
    answerHtml: "<strong>标准答案（笔记P1第2题）：</strong><br>① <strong>光发射机、光调制器、光纤、光接收机、光放大器、光源</strong>；<br>② <strong>光开关、光衰减器、光耦合器、光纤连接器</strong>。"
  },

  // ==================== 第二章 ====================
  {
    id: "Q03",
    chapter: "ch2",
    type: "term",
    typeName: "名词解释",
    pdfPage: 1,
    title: "名词解释：LED、LD、DH",
    prompt: "请分别解释名词：LED、LD、DH（异质结）的定义与物理含义。",
    mcq: {
      question: "【一刷·概念快筛】关于 LED、LD 和 DH 的含义，下列说法正确的是：",
      options: [
        "LED是发光二极管，LD是半导体激光器，DH是由两种带隙宽度不同的半导体材料组成的p-n、p-p或n-n结",
        "LED是半导体激光器，LD是发光二极管，DH是同质PN结",
        "LED是有阈值受激辐射器件，LD是无阈值自发辐射器件",
        "DH是指由相同禁带宽度的P型和N型材料构成的结"
      ],
      answer: 0
    },
    cloze: {
      text: "1. LED：{{0}}；2. LD：{{1}}；3. DH（异质结）：由两种{{2}}不同的半导体材料组成的 p-n、p-p 或 n-n 结。",
      answers: ["发光二极管", "半导体激光器", "带隙宽度"]
    },
    rubric: [
      "LED：发光二极管（Light Emitting Diode），基于自发辐射发光的无阈值半导体光源",
      "LD：半导体激光器（Laser Diode），基于受激辐射发光的有阈值相干半导体光源",
      "DH：异质结（双异质结），由两种带隙宽度（禁带宽度Eg）不同的半导体材料组成的 p-n、p-p 或 n-n 结"
    ],
    answerHtml: "<strong>标准答案（笔记P1第3题）：</strong><br>• <strong>LED</strong>：发光二极管。<br>• <strong>LD</strong>：半导体激光器。<br>• <strong>DH（异质结）</strong>：两种<strong>带隙宽度不同</strong>的半导体材料组成的 p-n、p-p 或 n-n 结。"
  },
  {
    id: "Q04",
    chapter: "ch2",
    type: "short",
    typeName: "简答题",
    pdfPage: 1,
    title: "LED 和 LD 的工作原理及 LD 的分类",
    prompt: "分别简述 LED 和 LD 的发光工作原理（包括LD产生激光的三个必要条件），并写出 LD 的5种主要分类。",
    mcq: {
      question: "【一刷·概念快筛】LED 与 LD 的核心发光机理分别是 ______，且 LD 工作必须具备的三个条件是 ______：",
      options: [
        "LED为自发辐射，LD为受激辐射；LD须有增益介质、谐振腔和泵浦源",
        "LED为受激辐射，LD为自发辐射；LD须有偏置电路、滤波器和透镜",
        "两者均为受激辐射，只是谐振腔长度不同",
        "LED靠雪崩倍增发光，LD靠光电效应发光"
      ],
      answer: 0
    },
    cloze: {
      text: "LED原理：{{0}}（PN结加正向偏压后势垒降低，注入的非平衡少子在扩散过程中复合发光）。LD原理：{{1}}，必须有{{2}}、谐振腔和{{3}}。LD分类包括F-P型、{{4}}（分布反馈）、DBR、量子阱(QW)和{{5}}（垂直腔面发射）。",
      answers: ["自发辐射", "受激辐射", "增益介质", "泵浦源", "DFB", "VCSEL"]
    },
    rubric: [
      "LED工作原理：自发辐射。PN结加正向偏压后势垒降低，注入的非平衡少子在扩散过程中复合发光（光子能量 hv=Eg）",
      "LD工作原理：受激辐射。必须具备增益介质、谐振腔和泵浦源（当 I≥Ith 时有源区实现粒子数反转，受激辐射占主导）",
      "LD的5大分类：① 法布里-珀罗(F-P)型 LD；② 分布反馈(DFB) LD；③ 分布Bragg反射器(DBR) LD；④ 量子阱(QW) LD；⑤ 垂直腔面发射激光器(VCSEL)"
    ],
    answerHtml: "<strong>标准答案（笔记P1-P2第4题）：</strong><br>1. <strong>LED工作原理</strong>：<strong>自发辐射</strong>。PN结加正向偏压后，势垒降低，注入的非平衡少子在扩散过程中复合发光（光子能量 <i>hν = E<sub>g</sub></i>）。<br>2. <strong>LD工作原理</strong>：<strong>受激辐射</strong>。必须有<strong>增益介质、谐振腔和泵浦源</strong>（当注入电流 <i>I &lt; I<sub>th</sub></i> 时自发辐射占主导发普通荧光；当 <i>I ≥ I<sub>th</sub></i> 时实现粒子数反转，受激辐射占主导发出激光）。<br>3. <strong>LD的分类</strong>：① 法布里-珀罗(F-P)型 LD；② 分布反馈(DFB) LD；③ 分布Bragg反射器(DBR) LD；④ 量子阱(QW) LD；⑤ 垂直腔面发射激光器(VCSEL)。"
  },
  {
    id: "Q05",
    chapter: "ch2",
    type: "short",
    typeName: "简答题",
    pdfPage: 1,
    title: "LED 和 LD 的特性参数及温度/P-I特性对比",
    prompt: "简述 LED 和 LD 的主要特性参数，并对比两者在 P-I 电光转换特性和温度特性上的核心差异。",
    mcq: {
      question: "【一刷·概念快筛】对比 LED 与 LD 的特性参数，下列说法错误的是：",
      options: [
        "LED是无阈值器件，P-I曲线线性范围大；温度升高时峰值波长向短波长方向移动",
        "LED谱线宽度一般短波长为30~50nm，长波长材料为60~120nm，发散角大(θ⊥=30°, θ∥=120°)",
        "LD是阈值器件，对温度极其敏感，温度T升高时外微分量子效率ηD下降，阈值电流Ith按Ith=I0·exp(T/T0)指数增大",
        "LED响应速度采用高掺杂和高注入电流密度时一般为200~300MHz"
      ],
      answer: 0
    },
    cloze: {
      text: "LED是{{0}}器件，输出光功率与注入电流成正比；温度升高时输出光功率减少，峰值波长变{{1}}（向长波长移动）。LD是{{2}}器件，其特性参数包括中心波长 λp=hc/Eg、{{3}} Ith 和外微分量子效率 ηD；随温度升高，LD的 ηD {{4}}，阈值电流 Ith {{5}}。",
      answers: ["非阈值", "大", "阈值", "阈值电流", "下降", "加大"]
    },
    rubric: [
      "LED特性参数：①中心波长 λp=1.2396/Eg(μm)；②谱线宽度 Δλ（一般30~50nm，长波长60~120nm）；③发散角（θ⊥=30°, θ∥=120°）；④响应速度（200~300MHz）；⑤温度特性（T升高功率减小约-0.01/K，峰值波长变大/红移，可不用温控）；⑥输出光功率与注入电流成正比（非阈值器件）",
      "LD特性参数：①中心波长 λp=hc/Eg；②阈值电流 Ith（P-I陡峭段外延与电流轴交点）；③外微分量子效率 ηD；④温度特性（极敏感：ηD随T升高而下降；Ith随T升高而加大，满足 Ith=I0·exp(T/T0)，T0为特征温度）"
    ],
    answerHtml: "<strong>标准答案（笔记P1-P3）：</strong><br>• <strong>LED特性参数</strong>：① 中心波长 <i>λ<sub>p</sub></i>；② 谱线宽度 <i>Δλ = λ<sub>2</sub> − λ<sub>1</sub></i>（一般 30~50 nm，长波长材料 60~120 nm）；③ 自发辐射发散角 <i>θ<sub>⊥</sub> = 30°, θ<sub>∥</sub> = 120°</i>；④ 响应速度（高掺杂高注入电流密度下 200~300 MHz）；⑤ 温度特性：温度升高，输出光功率减少（变化率 −0.01/K），峰值波长变大（向长波长微移）；⑥ 电光转换：<strong>非阈值器件</strong>，输出光功率与注入电流成正比。<br>• <strong>LD特性参数</strong>：① 中心波长 <span class='frac'><span class='frac-num'><i>hc</i></span><span class='frac-den'><i>E<sub>g</sub></i></span></span>；② <strong>阈值电流 <i>I<sub>th</sub></i></strong>（陡峭部分外延与电流轴交点）；③ <strong>外微分量子效率 <i>η<sub>D</sub></i></strong>：<div class='formula-card'><i>η<sub>D</sub></i> = <span class='frac'><span class='frac-num'>(<i>P<sub>ex</sub></i> − <i>P<sub>th</sub></i>) / <i>hν</i></span><span class='frac-den'>(<i>I</i> − <i>I<sub>th</sub></i>) / <i>e</i><sub>0</sub></span></span> ≈ <span class='frac'><span class='frac-num'><i>P<sub>ex</sub></i> / <i>hν</i></span><span class='frac-den'>(<i>I</i> − <i>I<sub>th</sub></i>) / <i>e</i><sub>0</sub></span></span></div>④ <strong>温度特性</strong>：LD对温度很敏感，温度 <i>T</i> 升高时 <i>η<sub>D</sub></i> 下降，阈值电流 <i>I<sub>th</sub></i> 随 <i>T</i> 升高而加大，满足 <strong><i>I<sub>th</sub></i> = <i>I</i><sub>0</sub> · exp(<i>T</i> / <i>T</i><sub>0</sub>)</strong>（<i>T</i><sub>0</sub> 为特征温度）。"
  },
  {
    id: "Q06",
    chapter: "ch2",
    type: "short",
    typeName: "简答题",
    pdfPage: 1,
    title: "LD直接调制时偏置电流选择注意事项及LD工作控制方式",
    prompt: "简答：(1) LD直接调制时偏置电流的选择需要注意些什么？为什么？(2) LD使用时应进行什么控制？",
    mcq: {
      question: "【一刷·概念快筛】LD直接调制时，关于偏置电流选择和工作控制的说法正确的是：",
      options: [
        "加大偏置电流使其逼近阈值以抑制张弛振荡，但不能使消光比大于10%；需采用温度控制ATC和自动功率控制APC",
        "偏置电流应设为0以获得最大消光比；无需进行温度控制",
        "偏置电流越小越能抑制张弛振荡，消光比应大于50%",
        "只需采用自动频率控制AFC，不需要温度控制ATC"
      ],
      answer: 0
    },
    cloze: {
      text: "LD偏置电流选择：加大偏置电流使其逼近{{0}}，这样可以抑制{{1}}，但不能使{{2}}大于10%。LD控制方式：温度控制（{{3}}）和自动功率控制（{{4}}）。",
      answers: ["阈值", "张弛振荡", "消光比", "ATC", "APC"]
    },
    rubric: [
      "偏置电流选择：加大偏置电流使其逼近阈值电流 Ith",
      "作用与限制：逼近阈值可以抑制张弛振荡，但不能使消光比大于 10%",
      "LD控制电路：温度控制（ATC）和自动功率控制（APC）"
    ],
    answerHtml: "<strong>标准答案（笔记P1底部）：</strong><br>1. <strong>LD偏置电流选择</strong>：加大偏置电流使其<strong>逼近阈值</strong>，这样可以<strong>抑制张弛振荡</strong>；但<strong>不能使消光比大于 10%</strong>。<br>2. <strong>LD控制方式</strong>：<strong>温度控制（ATC）</strong>与<strong>自动功率控制（APC）</strong>。"
  },
  {
    id: "Q07",
    chapter: "ch2",
    type: "calc",
    typeName: "草稿纸计算题",
    pdfPage: 2,
    calcType: "LED_LD_PI_ETA",
    title: "【计算1】LED/LD 中心波长、阈值电流与外微分量子效率综合计算",
    prompt: "已知某 InGaAsP/InP 半导体激光器(LD)有源区材料禁带宽度 Eg = 0.9535 eV。由其 P-I 特性曲线测得：陡峭线性段在注入电流 I1 = 20 mA 时刚开始激射（Pth ≈ 0.2 mW），当注入电流 I = 60 mA 时，输出光功率 Pex = 16.2 mW。请在草稿纸上依次计算：(1) 发光中心波长 λp (μm)；(2) 阈值电流 Ith (mA) 与斜率效率 ΔP/ΔI (mW/mA)；(3) 外微分量子效率 ηD (%)。",
    mcq: {
      question: "【一刷·公式快筛】LD 外微分量子效率 ηD 的定义式与中心波长简便公式分别为：",
      options: [
        "ηD = [(Pex - Pth)/hν] / [(I - Ith)/e0]，且 λp(μm) = 1.2396 / Eg(eV)",
        "ηD = (Pex / I) × 100%，且 λp(μm) = Eg(eV) / 1.2396",
        "ηD = [(I - Ith)/e0] / [(Pex - Pth)/hν]，且 λp = h·Eg / c",
        "ηD = 10 lg(Pex / Pth)"
      ],
      answer: 0
    },
    cloze: {
      text: "光子能量 hν = Eg，故峰值波长 λp = hc/Eg = {{0}} / Eg(eV) (μm)。外微分量子效率 ηD = [ (Pex - Pth) / {{1}} ] / [ (I - {{2}}) / e0 ]。",
      answers: ["1.2396", "hv", "Ith"]
    },
    rubric: [
      "正确写出并计算中心波长 λp = hc/Eg = 1.2396 / Eg(eV)",
      "由P-I曲线外延法确定阈值电流 Ith，并计算斜率效率 k = (Pex - Pth)/(I - Ith)",
      "代入外微分量子效率公式 ηD = [(Pex - Pth)/hν] / [(I - Ith)/e0] = (e0/hν)·(ΔP/ΔI) = (ΔP/ΔI) / Eg(V) 算出百分比"
    ],
    answerHtml: "<strong>草稿纸标准演算步骤（笔记P2-P3）：</strong><div class='formula-card'>1. <strong>中心波长</strong>：<i>λ<sub>p</sub></i> = <span class='frac'><span class='frac-num'>1.2396</span><span class='frac-den'><i>E<sub>g</sub></i>(eV)</span></span> = <span class='frac'><span class='frac-num'>1.2396</span><span class='frac-den'>0.9535</span></span> ≈ <strong>1.30 μm</strong>（即 1300 nm）</div><div class='formula-card'>2. <strong>阈值电流与斜率效率</strong>：<i>I<sub>th</sub></i> = <strong>20 mA</strong>，斜率效率 <span class='frac'><span class='frac-num'>Δ<i>P</i></span><span class='frac-den'>Δ<i>I</i></span></span> = <span class='frac'><span class='frac-num'>16.2 − 0.2</span><span class='frac-den'>60 − 20</span></span> = <strong>0.40 mW/mA</strong>（即 0.40 W/A）</div><div class='formula-card'>3. <strong>外微分量子效率 <i>η<sub>D</sub></i></strong>：<i>η<sub>D</sub></i> = <span class='frac'><span class='frac-num'>(<i>P<sub>ex</sub></i> − <i>P<sub>th</sub></i>) / <i>hν</i></span><span class='frac-den'>(<i>I</i> − <i>I<sub>th</sub></i>) / <i>e</i><sub>0</sub></span></span> = <span class='frac'><span class='frac-num'>Δ<i>P</i> / Δ<i>I</i></span><span class='frac-den'><i>E<sub>g</sub></i>(V)</span></span> = <span class='frac'><span class='frac-num'>0.40</span><span class='frac-den'>0.9535</span></span> ≈ <strong>41.95%</strong></div>"
  },

  // ==================== 第三章 ====================
  {
    id: "Q08",
    chapter: "ch3",
    type: "term",
    typeName: "名词解释",
    pdfPage: 3,
    title: "名词解释：5种单模光纤（G.652 / G.653 / G.654 / G.655 / 色散平坦光纤）",
    prompt: "请解释并对比笔记P3中的5种单模光纤：非色散位移光纤(G.652)、色散位移光纤(G.653)、截止波长位移光纤(G.654)、非零色散位移光纤(G.655)、色散平坦光纤的工作波长、色散/衰减特点及适用系统。",
    mcq: {
      question: "【一刷·概念快筛】关于 G.652、G.653、G.654、G.655 四种 ITU-T 单模光纤，对应关系完全正确的是：",
      options: [
        "G.652非色散位移(1310nm零色散/1550nm最低衰减)；G.653色散位移(均为1550nm)；G.654截止波长位移(海底光缆)；G.655非零色散位移(1550nm色散低但非0，用于WDM)",
        "G.652用于波分复用WDM；G.655用于海底光缆；G.654有两个零色散点",
        "G.653在1550nm处色散很大，专门用于抑制四波混频",
        "G.654是渐变折射率多模光纤，截止波长在850nm"
      ],
      answer: 0
    },
    cloze: {
      text: "1. 非色散位移光纤({{0}})：色散零点1310nm，衰减最低点1550nm，适合2.5Gb/s系统；2. 色散位移光纤({{1}})：色散零点与衰减最低点都是1550nm，适用于长距离大容量通信；3. 截止波长位移光纤({{2}})：截止波长1260nm→1500nm，用于{{3}}通信系统；4. 非零色散位移光纤({{4}})：1550nm处色散低但不为0，用于{{5}}传输系统；5. 色散平坦光纤：有两个零色散点(1310、1550nm)，适用于波分复用系统。",
      answers: ["G.652", "G.653", "G.654", "海底光缆", "G.655", "波分复用"]
    },
    rubric: [
      "非色散位移光纤 (G.652)：工作波长1310nm或1550nm，色散零点1310nm，衰减最低点1550nm，适合2.5Gb/s系统",
      "色散位移光纤 (G.653)：色散零点和衰减最低点都是1550nm，适用于长距离、大容量通信系统",
      "截止波长位移光纤 (G.654)：非色散位移，截止波长1260nm移至1500nm，1550nm衰减极低，用于海底光缆通信系统",
      "非零色散位移光纤 (G.655)：1550nm处色散低但不为0（抑制四波混频），用于波分复用(WDM)传输系统",
      "色散平坦光纤：有两个零色散点（1310nm、1550nm），适用于波分复用系统"
    ],
    answerHtml: "<strong>标准答案（笔记P3第6题）：</strong><br>1. <strong>非色散位移光纤（G.652）</strong>：工作波长 1310 nm 或 1550 nm，色散零点 1310 nm，衰减最低点 1550 nm，适合 2.5 Gb/s 系统。<br>2. <strong>色散位移光纤（G.653）</strong>：色散零点与衰减最低点<strong>都是 1550 nm</strong>，适用于长距离、大容量通信系统。<br>3. <strong>截止波长位移光纤（G.654）</strong>：非色散位移，截止波长 1260 nm → 1500 nm，用于<strong>海底光缆通信系统</strong>。<br>4. <strong>非零色散位移光纤（G.655）</strong>：1550 nm 处<strong>色散低但不为 0</strong>，用于<strong>波分复用（WDM）传输系统</strong>。<br>5. <strong>色散平坦光纤</strong>：有两个零色散点（1310 nm、1550 nm），适用于波分复用系统。"
  },
  {
    id: "Q09",
    chapter: "ch3",
    type: "short",
    typeName: "简答题",
    pdfPage: 3,
    title: "光纤的分类方法与单模光纤的特性参数",
    prompt: "简述：(1) 光纤按材料、按折射率分布、按传输模式分别如何分类？(2) 单模光纤的主要特性参数有哪些（写出尺寸、归一化频率V公式及单模条件、衰减系数公式）？",
    mcq: {
      question: "【一刷·概念快筛】单模光纤的纤芯直径、包层直径典型值以及单模传输的归一化频率 V 条件分别是：",
      options: [
        "纤芯直径 8~10 μm，包层直径 125 μm，单模条件 V ≤ 2.4048",
        "纤芯直径 50 μm，包层直径 125 μm，单模条件 V ≥ 2.4048",
        "纤芯直径 8~10 mm，包层直径 125 mm，单模条件 V ≤ 1.24",
        "纤芯直径 125 μm，包层直径 250 μm，单模条件 V ≤ 3.1416"
      ],
      answer: 0
    },
    cloze: {
      text: "按折射率分：阶跃折射率分布({{0}})和梯度n分布({{1}})；按模式分：多模({{2}}，A类)和单模({{3}}，B类)。单模光纤纤芯直径一般{{4}}μm，包层直径{{5}}μm；单模条件为归一化频率 V ≤ {{6}}；衰减系数 α = (10/L)·lg(Pin/Pout)。",
      answers: ["SI", "GI", "MMF", "SMF", "8-10", "125", "2.4048"]
    },
    rubric: [
      "光纤分类方法：①按材料分：石英、玻璃、塑料、液芯；②按折射率分：阶跃折射率分布(SI)、梯度n分布(GI)；③按传输模式分：多模(MMF, A类)、单模(SMF, B类)",
      "单模光纤几何参数：纤芯直径一般 8~10 μm，包层直径 125 μm",
      "归一化频率与单模条件：V = (2πa·NA)/λ0，单模条件 V ≤ 2.4048",
      "衰减系数公式：α = (10/L) lg(Pin / Pout)"
    ],
    answerHtml: "<strong>标准答案（笔记P3第7、8题）：</strong><br>1. <strong>光纤分类方法</strong>：<br>  • <strong>按材料分</strong>：石英、玻璃、塑料、液芯；<br>  • <strong>按折射率分</strong>：阶跃折射率分布（SI）、梯度 <i>n</i> 分布（GI）；<br>  • <strong>按传输模式分</strong>：多模（MMF，A类）、单模（SMF，B类）。<br>2. <strong>单模光纤特性参数</strong>：<br>  • 几何尺寸：纤芯直径一般 <strong>8~10 μm</strong>，包层直径 <strong>125 μm</strong>；<div class='formula-card'>• <strong>归一化频率</strong>：<i>V</i> = <span class='frac'><span class='frac-num'>2π<i>a</i> · NA</span><span class='frac-den'><i>λ</i><sub>0</sub></span></span> ，单模传输条件为：<strong><i>V</i> ≤ 2.4048</strong></div><div class='formula-card'>• <strong>衰减系数</strong>：<i>α</i> = <span class='frac'><span class='frac-num'>10</span><span class='frac-den'><i>L</i></span></span> lg <span class='frac'><span class='frac-num'><i>P<sub>in</sub></i></span><span class='frac-den'><i>P<sub>out</sub></i></span></span> (dB/km)</div>"
  },
  {
    id: "Q10",
    chapter: "ch3",
    type: "short",
    typeName: "简答题",
    pdfPage: 3,
    title: "影响光纤通信的光纤非线性效应与石英光纤预制棒制造方法",
    prompt: "简答：(1) 影响光纤通信的光纤非线性效应分为哪两类、共哪5种？(2) 石英光纤制造的完整工艺流程及预制棒制造的4种化学汽相沉积法是什么？",
    mcq: {
      question: "【一刷·概念快筛】光纤非线性效应中的“非线性折射率调制”包含哪三种效应？预制棒制造的4种方法英文缩写是什么？",
      options: [
        "自相位调制(SPM)、交叉相位调制(XPM)、四波混频(FWM)；预制棒四法：OVPD、VAD、MCVD、PCVD",
        "受激拉曼散射(SRS)、受激布里渊散射(SBS)、瑞利散射；预制棒四法：LED、LD、PIN、APD",
        "电光效应、磁光效应、声光效应；预制棒四法：EDFA、FRA、FBA、SOA",
        "插入损耗、回波损耗、附加损耗；预制棒四法：G.652、G.653、G.654、G.655"
      ],
      answer: 0
    },
    cloze: {
      text: "光纤非线性效应分为：(1)受激散射：受激{{0}}散射(SRS)和受激{{1}}散射(SBS)；(2)非线性折射率调制：自相位调制({{2}})、交叉相位调制({{3}})、四波混频({{4}})。预制棒4种制造方法：外汽相沉积法(OVPD)、汽相轴向沉积法({{5}})、改进的化学汽相沉积法({{6}})、等离子体激活化学汽相沉积法(PCVD)。",
      answers: ["拉曼", "布里渊", "SPM", "XPM", "FWM", "VAD", "MCVD"]
    },
    rubric: [
      "光纤非线性效应产生原因：光场较弱时为线性介质，光场加强后表现出非线性",
      "两大类5种非线性效应：①受激散射：受激拉曼散射(SRS)、受激布里渊散射(SBS)；②非线性折射率调制：自相位调制(SPM)、交叉相位调制(XPM)、四波混频(FWM)",
      "光纤制造总流程：原料 → 提纯 → 预制棒制造 → 拉丝 → 涂覆 → 筛选 → 合格光纤",
      "预制棒制造4法：①外汽相沉积法(OVPD)；②汽相轴向沉积法(VAD)；③改进的化学汽相沉积法(MCVD)；④等离子体激活化学汽相沉积法(PCVD)"
    ],
    answerHtml: "<strong>标准答案（笔记P3第9题、P4第10题）：</strong><br>1. <strong>光纤非线性效应</strong>：<br>  • <strong>受激散射</strong>：① 受激拉曼散射（SRS）；② 受激布里渊散射（SBS）。<br>  • <strong>非线性折射率调制</strong>：① 自相位调制（SPM）；② 交叉相位调制（XPM）；③ 四波混频（FWM）。<br>2. <strong>石英光纤制造流程与预制棒方法</strong>：<br>  • 流程：<strong>原料 → 提纯 → 预制棒制造 → 拉丝 → 涂覆 → 筛选 → 合格光纤</strong>。<br>  • 预制棒4种方法：① <strong>外汽相沉积法（OVPD）</strong>；② <strong>汽相轴向沉积法（VAD）</strong>；③ <strong>改进的化学汽相沉积法（MCVD）</strong>；④ <strong>等离子体激活化学汽相沉积法（PCVD）</strong>。"
  },

  // ==================== 第四章 ====================
  {
    id: "Q11",
    chapter: "ch4",
    type: "term",
    typeName: "名词解释",
    pdfPage: 4,
    title: "名词解释与工作原理：PIN PD 与 APD",
    prompt: "解释 PIN PD（PIN光电二极管）和 APD（雪崩光电二极管）的结构定义、工作原理及两者的特性参数。",
    mcq: {
      question: "【一刷·概念快筛】关于 PIN PD 和 APD 的结构与工作原理，下列说法正确的是：",
      options: [
        "PIN在P区和N区之间加入一层接近本征的掺杂很低的N区(I层)以提高量子效率；APD利用强反向偏压下载流子碰撞电离产生雪崩倍增",
        "PIN具有内部雪崩倍增效应(G>1)，而APD没有内部增益(G=1)",
        "发生光电效应要求入射光子能量 hv ≤ Eg，故只有波长大于上限截止波长 λc 的光才能被吸收",
        "APD的P区和N区掺杂浓度极低，不需要加反向偏压即可产生雪崩倍增"
      ],
      answer: 0
    },
    cloze: {
      text: "PIN PD：在P区和N区之间加入一层接近本征的掺杂很低的N区，能提高{{0}}，使光子被充分吸收。发生光电效应须满足 hv ≥ {{1}}，上限截止波长 λc = hc/Eg = {{2}}/Eg(eV) (μm)。APD：{{3}}光电二极管，反向偏压较高时，场区的电子、空穴被加速与晶格碰撞产生新的{{4}}，使反向电流增大；平均雪崩增益 G = {{5}} / 初始或未倍增光生电流。",
      answers: ["量子效率", "Eg", "1.24", "雪崩", "电子-空穴对", "倍增光生电流"]
    },
    rubric: [
      "PIN PD定义与原理：在P区和N区之间加入一层接近本征的掺杂很低的N区(I层)；PIN结构能够提高量子效率，使光子被充分吸收",
      "光电效应条件与特性参数：须满足 hv ≥ Eg，上限截止波长 λc = hc/Eg = 1.24/Eg(eV) (μm)；特性参数含上限截止波长、光电转换效率、响应速度",
      "APD定义与原理：雪崩光电二极管（P区、N区掺杂浓度高）。反向偏压较高时，场区的电子、空穴被加速，与晶格碰撞产生新的电子-空穴对，再加速、再碰撞，使载流子浓度增加，反向电流增大",
      "平均雪崩增益公式：G = 倍增光生电流 / 初始（或未倍增）光生电流"
    ],
    answerHtml: "<strong>标准答案（笔记P4第11、12题）：</strong><br>1. <strong>PIN PD</strong>：在 P 区和 N 区之间加入一层接近本征的掺杂很低的 N 区（I层）。<br>  • <strong>工作原理</strong>：PIN 结构能够提高量子效率，使光子被充分吸收。<br>  • <strong>特性参数</strong>：① 发生光电效应须满足 <i>hν ≥ E<sub>g</sub></i>；② 光电转换效率；③ 响应速度。<div class='formula-card'><strong>上限截止波长公式</strong>：<i>λ<sub>c</sub></i> = <span class='frac'><span class='frac-num'><i>hc</i></span><span class='frac-den'><i>E<sub>g</sub></i></span></span> = <span class='frac'><span class='frac-num'>1.24</span><span class='frac-den'><i>E<sub>g</sub></i>(eV)</span></span> (μm)</div>2. <strong>APD（雪崩光电二极管）</strong>：P区、N区掺杂浓度高。<br>  • <strong>工作原理</strong>：反向偏压较高时，场区的电子、空穴被加速，与晶格碰撞，产生新的电子-空穴对，再加速、再碰撞，使载流子浓度增加，反向电流增大。<div class='formula-card'><strong>平均雪崩增益公式</strong>：<i>G</i> = <span class='frac'><span class='frac-num'>倍增光生电流 <i>I<sub>M</sub></i></span><span class='frac-den'>初始或未倍增光生电流 <i>I<sub>p</sub></i></span></span></div>"
  },
  {
    id: "Q12",
    chapter: "ch4",
    type: "short",
    typeName: "简答题",
    pdfPage: 5,
    title: "影响 APD 平均雪崩增益 G 的因素和特性及响应速度（笔记P5图解）",
    prompt: "简述：(1) 影响 APD 平均雪崩增益 G 的三个因素及其 G-V 曲线规律；(2) APD 的工作偏压如何选择？(3) APD 的响应速度取决于哪三个因素？与 PIN 相比如何？",
    mcq: {
      question: "【一刷·概念快筛】根据笔记第5页 APD 的特性曲线，关于平均雪崩增益 G 的说法正确的是：",
      options: [
        "G与反向偏压、温度、波长有关：一般应在V略小于击穿电压VB下使用；温度升高时碰撞电离系数下降导致G减小、VB升高；同一反偏下波长越大G越大",
        "温度升高时，载流子热运动加剧，因此相同反向偏压下雪崩增益G增大、击穿电压VB降低",
        "APD应在V大于击穿电压VB的区域工作以获得最大饱和增益",
        "同一反向偏压下，入射光波长越短，雪崩增益G越大"
      ],
      answer: 0
    },
    cloze: {
      text: "APD平均雪崩增益 G 与{{0}}有关、与{{1}}有关、与{{2}}有关。(1)随反向偏压V接近击穿电压VB时G迅速增大，一般应在V{{3}}VB状态下使用；(2)温度升高时，载流子碰撞电离化系数下降，导致G{{4}}、击穿电压{{5}}；(3)同一反向偏压下，波长越大增益越{{6}}。",
      answers: ["反向偏压", "温度", "波长", "略小于", "减小", "升高", "大"]
    },
    rubric: [
      "三大影响因素：G 与反向偏压 V 有关、与温度 T 有关、与入射波长 λ 有关",
      "G-V曲线与偏压选择：V接近击穿电压VB时G迅速增大，V=VB时达最大后出现增益饱和效应；偏压过小增益太小，过大噪声大且易击穿烧毁，一般应在 V 略小于 VB 状态下使用",
      "温度关系：击穿电压对温度很敏感；载流子碰撞电离化系数随温度升高而下降，导致 G 减小、击穿电压 VB 升高（需随环境温度调整工作电压）",
      "波长关系：同一反向偏压下，波长越大增益 G 越大",
      "APD响应速度3因素：①光生电子通过吸收区到达增益区的时间；②倍增过程在P层累积并产生电子-空穴对的时间；③增益区产生的电子-空穴对穿过P区的时间（APD本身响应时间比PIN长，但因有内部增益对电子预放大要求小，系统总速度更快）"
    ],
    answerHtml: "<strong>标准答案（笔记P4-P5）：</strong><br>1. <strong>影响 APD 平均雪崩增益 <i>G</i> 的三大因素及特性</strong>：<br>  • <strong>与反向偏压 <i>V</i> 的关系</strong>：<i>G</i> 随外加反向偏压接近击穿电压 <i>V<sub>B</sub></i> 时迅速增大，<i>V = V<sub>B</sub></i> 时出现<strong>增益饱和效应</strong>。工作偏压过小时增益太小，过大时噪声大且易击穿烧毁，<strong>一般应在 <i>V</i> 略小于 <i>V<sub>B</sub></i> 状态下使用</strong>。<br>  • <strong>与温度 <i>T</i> 的关系</strong>：击穿电压对温度很敏感。载流子碰撞电离化系数随温度升高而下降，导致 <strong><i>G</i> 减小、击穿电压 <i>V<sub>B</sub></i> 升高</strong>，必须随环境温度变化相应调整工作电压。<br>  • <strong>与波长 <i>λ</i> 的关系</strong>：同一反向偏压下，<strong>波长越大增益越大</strong>。<br>2. <strong>APD响应速度的3个决定因素</strong>：① 光生电子通过吸收区到达增益区的时间；② 倍增过程在P层累积并产生电子-空穴对的时间；③ 增益区产生的电子-空穴对穿过P区的时间。（APD响应时间比PIN长一些，但实际应用中对电子预放大的要求较小，总速度更快）。"
  },
  {
    id: "Q13",
    chapter: "ch4",
    type: "short",
    typeName: "简答题",
    pdfPage: 6,
    title: "光接收机前置放大器的种类和特点",
    prompt: "光接收机的前置放大器有哪三种类型？请分别简述它们各自的特点与适用场景。",
    mcq: {
      question: "【一刷·概念快筛】具有“高带宽、低噪声、动态范围较大”优点，在现代高速光接收机中最常采用的前置放大器是：",
      options: [
        "互阻抗前置放大器（跨阻放大器 TIA）",
        "低阻抗前置放大器",
        "高阻抗前置放大器",
        "掺铒光纤放大器"
      ],
      answer: 0
    },
    cloze: {
      text: "光接收机3种前置放大器：①{{0}}前置放大器：线路简单，动态范围大，噪声也较大；②{{1}}前置放大器：动态范围小，噪声较小，一般用于码速率较低的系统；③{{2}}前置放大器：高带宽，低噪声，动态范围较大。",
      answers: ["低阻抗", "高阻抗", "互阻抗"]
    },
    rubric: [
      "① 低阻抗前置放大器：线路简单，动态范围大，但噪声也较大",
      "② 高阻抗前置放大器：动态范围小，噪声较小，一般用于码速率较低的系统",
      "③ 互阻抗前置放大器：高带宽，低噪声，动态范围较大"
    ],
    answerHtml: "<strong>标准答案（笔记P6第13题）：</strong><br>① <strong>低阻抗前置放大器</strong>：线路简单，动态范围大，噪声也较大。<br>② <strong>高阻抗前置放大器</strong>：动态范围小，噪声较小，一般用于码速率较低的系统。<br>③ <strong>互阻抗前置放大器</strong>：高带宽，低噪声，动态范围较大。"
  },
  {
    id: "Q14",
    chapter: "ch4",
    type: "calc",
    typeName: "草稿纸计算题",
    pdfPage: 4,
    calcType: "PIN_APD_GAIN",
    title: "【计算2】光电检测器截止波长 λc 与 APD 平均雪崩增益 G 计算",
    prompt: "已知某半导体光电检测器材料的禁带宽度 Eg = 0.75 eV。当入射光功率 Pin = 2 μW 时，未倍增的初始光生电流 Ip = 1.6 μA；在加接近击穿电压的反向偏压后，APD 输出的倍增光生电流 IM = 64 μA。请在草稿纸上计算：(1) 该检测器的上限截止波长 λc (μm)；(2) 未倍增时的响应度 R0 (A/W)；(3) APD 的平均雪崩增益 G。",
    mcq: {
      question: "【一刷·公式快筛】若某光电二极管材料禁带宽度 Eg = 1.0 eV，则其能响应的最大入射光波长（上限截止波长 λc）约为：",
      options: [
        "1.24 μm（超过1.24 μm的光子能量小于Eg，无法产生光电效应）",
        "0.80 μm",
        "1.55 μm",
        "2.40 μm"
      ],
      answer: 0
    },
    cloze: {
      text: "发生光电效应须满足 hv ≥ Eg，因此入射光波长必须满足 λ ≤ λc = {{0}} / Eg(eV) (μm)；APD 平均雪崩增益 G = {{1}} / Ip。",
      answers: ["1.24", "IM"]
    },
    rubric: [
      "计算上限截止波长 λc = 1.24 / Eg = 1.24 / 0.75 ≈ 1.653 μm",
      "计算初始响应度 R0 = Ip / Pin = 1.6 μA / 2 μW = 0.8 A/W",
      "计算平均雪崩增益 G = IM / Ip = 64 / 1.6 = 40"
    ],
    answerHtml: "<strong>草稿纸标准演算步骤（笔记P4第11、12题）：</strong><div class='formula-card'>1. <strong>上限截止波长</strong>：<i>λ<sub>c</sub></i> = <span class='frac'><span class='frac-num'>1.24</span><span class='frac-den'><i>E<sub>g</sub></i>(eV)</span></span> = <span class='frac'><span class='frac-num'>1.24</span><span class='frac-den'>0.75</span></span> ≈ <strong>1.653 μm</strong></div><div class='formula-card'>2. <strong>初始响应度</strong>：<i>R</i><sub>0</sub> = <span class='frac'><span class='frac-num'><i>I<sub>p</sub></i></span><span class='frac-den'><i>P<sub>in</sub></i></span></span> = <span class='frac'><span class='frac-num'>1.6 μA</span><span class='frac-den'>2 μW</span></span> = <strong>0.80 A/W</strong></div><div class='formula-card'>3. <strong>平均雪崩增益</strong>：<i>G</i> = <span class='frac'><span class='frac-num'><i>I<sub>M</sub></i></span><span class='frac-den'><i>I<sub>p</sub></i></span></span> = <span class='frac'><span class='frac-num'>64 μA</span><span class='frac-den'>1.6 μA</span></span> = <strong>40</strong></div>"
  }
];

// ==================== 第五章 ~ 第七章 题库与草稿纸计算题引擎 ====================
window.QUESTIONS.push(
  // ==================== 第五章 ====================
  {
    id: "Q15",
    chapter: "ch5",
    type: "term",
    typeName: "名词解释",
    pdfPage: 6,
    title: "名词解释与工作原理：光纤激光器、EDFA、FRA、FBA、SOA",
    prompt: "解释名词并说明核心物理原理：光纤激光器（及波长变换器）、EDFA、FRA、FBA、SOA。",
    mcq: {
      question: "【一刷·概念快筛】关于 EDFA、FRA、FBA 的中文全称与放大的核心物理机制，完全正确的是：",
      options: [
        "EDFA(掺铒光纤放大器)：受激辐射；FRA(光纤拉曼放大器)：受激拉曼散射(SRS)；FBA(光纤布里渊放大器)：受激布里渊散射(SBS)；SOA：半导体光放大器",
        "EDFA：受激拉曼散射；FRA：受激辐射；FBA：自发辐射",
        "EDFA是掺镱放大器；FRA是法布里-珀罗放大器；FBA是反馈放大器",
        "SOA是光纤布拉格光栅放大器，靠声光效应放大"
      ],
      answer: 0
    },
    cloze: {
      text: "光纤激光器：泵浦光子被吸收，使介质中{{0}}被反转，产生受激辐射（波长变换器：产生另一种波长的光）。EDFA是{{1}}，原理是{{2}}；FRA是{{3}}，原理是{{4}}(SRS)；FBA是{{5}}，原理是{{6}}(SBS)；SOA是{{7}}。",
      answers: ["粒子数", "掺铒光纤放大器", "受激辐射", "光纤拉曼放大器", "受激拉曼散射", "光纤布里渊放大器", "受激布里渊散射", "半导体光放大器"]
    },
    rubric: [
      "光纤激光器：泵浦光子被吸收，使介质中粒子数被反转，产生受激辐射（波长变换器：产生另一种波长的光）",
      "EDFA：掺铒光纤放大器，原理是受激辐射（基态粒子吸收980nm泵浦光跃迁到高能级再非辐射跃迁至亚稳态，或直接吸收1480nm泵浦光到亚稳态形成粒子数反转，在1550nm信号光引发下受激辐射放大）",
      "FRA：光纤拉曼放大器，原理是受激拉曼散射（SRS）",
      "FBA：光纤布里渊放大器，原理是受激布里渊散射（SBS）",
      "SOA：半导体光放大器"
    ],
    answerHtml: "<strong>标准答案（笔记P6第14题、P7）：</strong><br>• <strong>光纤激光器</strong>：泵浦光子被吸收，使介质中<strong>粒子数被反转，产生受激辐射</strong>（波长变换器：产生另一种波长的光）。<br>• <strong>EDFA（掺铒光纤放大器）</strong>：原理为<strong>受激辐射</strong>。基态粒子吸收 980 nm 泵浦光跃迁到高能级后非辐射跃迁回亚稳态，或直接吸收 1480 nm 泵浦光跃迁到亚稳态形成<strong>粒子数反转</strong>；在 1550 nm 信号光引发下回到基态发生受激辐射放大。<br>• <strong>FRA（光纤拉曼放大器）</strong>：原理为<strong>受激拉曼散射（SRS）</strong>。<br>• <strong>FBA（光纤布里渊放大器）</strong>：原理为<strong>受激布里渊散射（SBS）</strong>。<br>• <strong>SOA</strong>：<strong>半导体光放大器</strong>。"
  },
  {
    id: "Q16",
    chapter: "ch5",
    type: "short",
    typeName: "简答题",
    pdfPage: 7,
    title: "影响 EDFA 增益的因素有哪些？简述其变化规律（笔记P6-P7重点）",
    prompt: "写出 EDFA 增益 G 的分贝定义式，指出影响 EDFA 增益的 4 个因素，并分别简述增益与这 4 个因素的关系（含最佳光纤长度、小信号增益、饱和输出功率、小信号增益波长带宽的概念）。",
    mcq: {
      question: "【一刷·概念快筛】关于影响 EDFA 增益的四个因素及其特性规律，下列说法正确的是：",
      options: [
        "增益与泵浦光功率、输入信号光功率、光纤长度、输入信号波长有关；光纤长度过长时后段Er3+吸收信号光，故存在最佳光纤长度",
        "掺铒光纤长度越长，EDFA的总增益就一定越大，不存在最佳长度",
        "一定的泵浦光功率下，输入信号光功率越大，EDFA的增益越大",
        "饱和输出功率是指增益下降到0 dB时的输出功率"
      ],
      answer: 0
    },
    cloze: {
      text: "EDFA增益 G = 10 lg(Ps_out / Ps_in)，与{{0}}、{{1}}、{{2}}和{{3}}四个因素有关。(a)泵浦功率较大时增益趋向{{4}}；(b)光纤长度超过一定范围后泵浦功率消耗到阈值以下，故存在获得最大增益的{{5}}；(c)线性范围内的增益称为{{6}}，增益下降3dB时的输出信号光功率称为{{7}}；(d)增益下降3dB时的波长间隔称为小信号增益波长带宽（可达{{8}}nm以上）。",
      answers: ["泵浦光功率", "信号光功率", "光纤长度", "输入信号波长", "饱和", "最佳光纤长度", "小信号增益", "饱和输出功率", "35"]
    },
    rubric: [
      "增益定义与4因素：G = 10 lg(Ps_out / Ps_in)，与①泵浦光功率、②信号光功率、③光纤长度、④输入信号波长皆有关",
      "(a) 增益与泵浦光功率：信号较小时增益较高；泵浦功率较大时，增益趋向饱和",
      "(b) 增益与光纤长度：泵浦功率一定时，光纤长度超过一定范围会使泵浦功率消耗到阈值功率以下，无法使Er3+粒子数反转反而使信号光衰减，故存在一个获得最大增益的「最佳光纤长度」",
      "(c) 增益与输入信号功率：一定泵浦功率下，信号越小增益越大。工作在线性范围内的增益称为「小信号增益」；增益相对于小信号增益下降3dB时的输出信号光功率称为「饱和输出功率」",
      "(d) 增益与输入信号波长：增益比小信号增益下降3dB时的波长间隔称为「小信号增益波长带宽」，可达 35nm 以上"
    ],
    answerHtml: "<strong>标准答案（笔记P6第14题、P7完整图解）：</strong><div class='formula-card'><strong>EDFA 增益定义</strong>：<i>G</i> = 10 lg <span class='frac'><span class='frac-num'><i>P<sub>s</sub><sup>out</sup></i></span><span class='frac-den'><i>P<sub>s</sub><sup>in</sup></i></span></span> (dB)</div>增益与 <strong>①泵浦光功率、②信号光功率、③光纤长度、④输入信号波长</strong> 有关：<br>1. <strong>与泵浦光功率关系</strong>：信号较小时增益较高，泵浦功率较大时，<strong>增益趋向饱和</strong>。<br>2. <strong>与光纤长度关系</strong>：泵浦功率一定时，光纤过长会使泵浦功率消耗到阈值以下，不足以使 Er<sup>3+</sup> 粒子数反转，导致信号光衰减，故存在获得最大增益的<strong>最佳光纤长度</strong>。<br>3. <strong>与输入信号功率关系</strong>：一定泵浦功率下，<strong>信号越小增益越大</strong>。线性范围内的增益称为<strong>小信号增益</strong>；增益下降 3 dB 时的输出光功率称为<strong>饱和输出功率</strong>。<br>4. <strong>与输入信号波长关系</strong>：增益比小信号增益下降 3 dB 时的波长间隔称为<strong>小信号增益波长带宽</strong>（可达 35 nm 以上）。"
  },
  {
    id: "Q17",
    chapter: "ch5",
    type: "calc",
    typeName: "草稿纸计算题",
    pdfPage: 6,
    calcType: "FRA_PUMP_WAVELENGTH",
    title: "【计算3·必考】FRA（光纤拉曼放大器）与 FBA 对目标信号放大所需泵浦光波长计算",
    prompt: "【笔记P6原题】在光纤拉曼放大器(FRA)中，已知待放大的目标信号光波长 λs = 1550 nm，石英光纤的拉曼频移 Δf_Raman = 13 THz（取光速 c = 3.0 × 10^8 m/s）。请在现实草稿纸上按笔记P6的三步法计算：(1) 目标信号光频率 fs (THz)；(2) 所需泵浦光频率 fp (THz)；(3) 所需泵浦光波长 λp (nm)。",
    mcq: {
      question: "【一刷·公式快筛】根据笔记第6页，FRA 算泵浦光波长的三步公式与 FBA 的泵浦频率公式分别是：",
      options: [
        "FRA：① fs = c/λs → ② fp = fs + Δf_Raman(13THz) → ③ λp = c/fp；FBA：fp = fs + (2n·vA)/(c/fp)",
        "FRA：λp = λs + 13 nm；FBA：fp = fs - (2n·vA)/c",
        "FRA：① fs = c·λs → ② fp = fs - 13 THz → ③ λp = fp/c",
        "FRA的泵浦波长总是大于信号波长（即 λp > 1550 nm）"
      ],
      answer: 0
    },
    cloze: {
      text: "FRA算泵浦波长三步法：①目标信号频率 fs = {{0}}；②泵浦频率 fp = fs + {{1}}（约13 THz）；③泵浦波长 λp = {{2}}。在FBA中，泵浦频率 fp = fs + {{3}} / (c/fp)，其中n为折射率，vA为纤中声速。",
      answers: ["c/λs", "Δf_Raman", "c/fp", "2n·vA"]
    },
    rubric: [
      "第一步：计算目标信号频率 fs = c / λs = (3×10^8) / (1550×10^-9) ≈ 193.55 THz",
      "第二步：计算泵浦频率 fp = fs + Δf_Raman = 193.55 + 13 = 206.55 THz",
      "第三步：计算泵浦波长 λp = c / fp = (3×10^8) / (206.55×10^12) ≈ 1452.4 nm"
    ],
    answerHtml: "<strong>草稿纸标准演算步骤（笔记P6下半页原题）：</strong><div class='formula-card'>1. <strong>求目标信号频率 <i>f<sub>s</sub></i></strong>：<i>f<sub>s</sub></i> = <span class='frac'><span class='frac-num'><i>c</i></span><span class='frac-den'><i>λ<sub>s</sub></i></span></span> = <span class='frac'><span class='frac-num'>3 × 10<sup>8</sup> m/s</span><span class='frac-den'>1550 × 10<sup>−9</sup> m</span></span> ≈ <strong>193.55 THz</strong></div><div class='formula-card'>2. <strong>求泵浦频率 <i>f<sub>p</sub></i></strong>：<i>f<sub>p</sub></i> = <i>f<sub>s</sub></i> + Δ<i>f</i><sub>Raman</sub> = 193.55 + 13 = <strong>206.55 THz</strong></div><div class='formula-card'>3. <strong>求泵浦波长 <i>λ<sub>p</sub></i></strong>：<i>λ<sub>p</sub></i> = <span class='frac'><span class='frac-num'><i>c</i></span><span class='frac-den'><i>f<sub>p</sub></i></span></span> = <span class='frac'><span class='frac-num'>3 × 10<sup>8</sup></span><span class='frac-den'>206.55 × 10<sup>12</sup></span></span> ≈ <strong>1452.4 nm</strong></div><div class='formula-card'><em>附 FBA（光纤布里渊放大器）公式：</em> <i>f<sub>p</sub></i> = <i>f<sub>s</sub></i> + <span class='frac'><span class='frac-num'>2 <i>n v<sub>A</sub></i></span><span class='frac-den'><i>c</i> / <i>f<sub>p</sub></i></span></span> （<i>n</i> 为折射率，<i>v<sub>A</sub></i> 为纤中声速）</div>"
  },

  // ==================== 第六章 ====================
  {
    id: "Q18",
    chapter: "ch6",
    type: "term",
    typeName: "名词解释",
    pdfPage: 8,
    title: "名词解释：电光效应、声光效应、磁光效应、间接调制器",
    prompt: "请按照笔记P8第15题，准确写出：电光效应、声光效应、磁光效应、间接调制器的定义。",
    mcq: {
      question: "【一刷·概念快筛】关于电光效应、声光效应和磁光效应的物理本质，对应正确的是：",
      options: [
        "电光效应：外电场下晶体折射率变化；声光效应：超声波作用下折射率变化使光波被衍射；磁光效应：外加磁场下线偏振光的偏振面发生旋转",
        "电光效应使光发生衍射；声光效应使偏振面旋转；磁光效应改变半导体禁带宽度",
        "三种效应都只能在气体介质中发生，不能在晶体中发生",
        "间接调制器是指直接改变激光器注入电流进行调制的器件"
      ],
      answer: 0
    },
    cloze: {
      text: "1. 电光效应：晶体在外电场下，{{0}}发生变化，影响光波的传输特性；2. 声光效应：晶体在{{1}}作用下折射率发生变化，光波通过时会被{{2}}，衍射光属性随超声波场变化；3. 磁光效应：某些晶体在外加磁场作用下，可使通过它的{{3}}的偏振面发生旋转；4. 间接调制器：调制信号改变其{{4}}。",
      answers: ["折射率", "超声波", "衍射", "线偏光", "物理特性"]
    },
    rubric: [
      "电光效应：晶体在外电场下，折射率发生变化，影响光波的传输特性",
      "声光效应：晶体在超声波作用下，折射率发生变化，光波通过时会被衍射，衍射光属性随超声波场变化",
      "磁光效应：某些晶体在外加磁场的作用下，可使通过它的线偏光的偏振面发生旋转",
      "间接调制器：调制信号改变其物理特性"
    ],
    answerHtml: "<strong>标准答案（笔记P8第15题）：</strong><br>• <strong>电光效应</strong>：晶体在外电场下，<strong>折射率发生变化</strong>，影响光波的传输特性。<br>• <strong>声光效应</strong>：晶体在超声波作用下，折射率发生变化，<strong>光波通过时会被衍射</strong>，衍射光属性随超声波场变化。<br>• <strong>磁光效应</strong>：某些晶体在外加磁场的作用下，可使通过它的<strong>线偏光的偏振面发生旋转</strong>。<br>• <strong>间接调制器</strong>：调制信号改变其<strong>物理特性</strong>。"
  },
  {
    id: "Q19",
    chapter: "ch6",
    type: "short",
    typeName: "简答题",
    pdfPage: 8,
    title: "光调制器的分类（笔记P8第16题完整树状图）",
    prompt: "请按笔记P8第16题的树状图，完整默写光调制器的分类（含直接/间接调制、按工作原理分、按调整参数分及脉冲调制的6个子类）。",
    mcq: {
      question: "【一刷·概念快筛】在光调制器分类中，间接调制（外调制）按工作原理和按调整参数分别可分为：",
      options: [
        "按原理分：电光、磁光、声光；按调整参数分：调幅、调相、调频、脉冲调制(幅度/间隔/频率/宽度/位置/编码)、强度调制",
        "按原理分：PIN、APD、EDFA；按调整参数分：单模、多模",
        "按原理分：F-P、DFB、DBR；按调整参数分：OVPD、VAD、MCVD",
        "按原理分：低阻抗、高阻抗、互阻抗"
      ],
      answer: 0
    },
    cloze: {
      text: "光调制器分为：直接调制（{{0}}）和间接调制（{{1}}）。其中外调制：(1)按工作原理分：{{2}}、{{3}}、{{4}}；(2)按调整参数分：调幅、{{5}}、调频、{{6}}（含幅度、间隔、频率、宽度、位置、编码）和{{7}}。",
      answers: ["内调制", "外调制", "电光", "磁光", "声光", "调相", "脉冲调制", "强度调制"]
    },
    rubric: [
      "一级分类：直接调制（内调制）和 间接调制（外调制）",
      "间接调制按工作原理分：电光、磁光、声光",
      "间接调制按调整参数分：调幅、调相、调频、脉冲调制（幅度、间隔、频率、宽度、位置、编码）、强度调制"
    ],
    answerHtml: "<strong>标准答案（笔记P8第16题）：</strong><br>光调制器分为：<strong>直接调制（内调制）</strong> 与 <strong>间接调制（外调制）</strong>。<br>其中<strong>间接调制（外调制）</strong>：<br>1. <strong>按工作原理分</strong>：电光、磁光、声光。<br>2. <strong>按调整参数分</strong>：调幅、调相、调频、<strong>脉冲调制</strong>（幅度、间隔、频率、宽度、位置、编码）、强度调制。"
  },

  // ==================== 第七章 ====================
  {
    id: "Q20",
    chapter: "ch7",
    type: "term",
    typeName: "名词解释",
    pdfPage: 8,
    title: "名词解释：光纤连接器、光纤活动连接器、光纤固定连接器、光耦合器",
    prompt: "解释名词：光纤连接器（含活动连接器与固定连接器的定义、固定连接器的要求与4种制作方法）以及光耦合器。",
    mcq: {
      question: "【一刷·概念快筛】关于光纤活动连接器、固定连接器和光耦合器的说法，正确的是：",
      options: [
        "固定连接器使光纤间永久连接，要求损耗低、后向反射光小、操作简便、性能稳定，制作方法有熔接法、V型槽法、毛细管法、套管法；光耦合器使光信号在特殊耦合区耦合后再分配",
        "固定连接器必须能随时拆卸重复使用，损耗通常比活动连接器大得多",
        "活动连接器只能用于光纤与光纤之间，不能用于光纤与有源器件之间",
        "光耦合器是一种有源光电转换器件"
      ],
      answer: 0
    },
    cloze: {
      text: "光纤连接器分为光纤{{0}}连接器和光纤{{1}}连接器。固定连接器作用是使光纤间{{2}}连接，制作方法有{{3}}、V型槽法、毛细管法、套管法。{{4}}是能使光信号在特殊耦合区发生耦合，并进行再分配的器件。",
      answers: ["活动", "固定", "永久性", "熔接法", "光耦合器"]
    },
    rubric: [
      "光纤活动连接器：可用于光纤与光纤之间的活动连接，也可用于光纤与有源器件、其他无源器件、系统和仪表进行活动连接",
      "光纤固定连接器：使一对或几对光纤之间永久性连接；要求损耗低、后向反射光小、操作简便、性能稳定；4种制作方法：熔接法、V型槽法、毛细管法、套管法",
      "光耦合器：能使光信号在特殊耦合区发生耦合，并进行再分配的器件"
    ],
    answerHtml: "<strong>标准答案（笔记P8第17题）：</strong><br>• <strong>光纤连接器</strong>：分为<strong>光纤活动连接器</strong>和<strong>光纤固定连接器</strong>。<br>• <strong>光纤活动连接器</strong>：可用于光纤与光纤之间的活动连接，也可用于光纤与有源器件、光纤与其他无源器件、光纤与系统和仪表进行活动连接。<br>• <strong>光纤固定连接器</strong>：使一对或几对光纤之间永久性连接，要求<strong>损耗低、后向反射光小、操作简便、性能稳定</strong>。制作方法有：<strong>熔接法、V型槽法、毛细管法、套管法</strong>。<br>• <strong>光耦合器</strong>：是能使光信号在特殊耦合区发生耦合，并进行再分配的器件。"
  },
  {
    id: "Q21",
    chapter: "ch7",
    type: "short",
    typeName: "简答题",
    pdfPage: 8,
    title: "影响光纤活动连接器的因素与光纤熔接机对准方法",
    prompt: "简答：(1) 影响光纤活动连接器的因素有哪些（3项大指标与造成插入损耗的5项具体原因）？(2) 光纤熔接机光纤对准的方法有哪3种？",
    mcq: {
      question: "【一刷·概念快筛】造成光纤活动连接器插入损耗的5个具体物理因素以及光纤熔接机的3种对准方法分别是：",
      options: [
        "5因素：纤芯错位、光纤倾斜、光纤端面间隙、纤芯直径不同、光纤端面菲涅尔反射；3对准法：功率监测法、纤芯直视法、包层对准法",
        "5因素：受激拉曼、受激布里渊、自相位调制、交叉相位调制、四波混频；3对准法：OVPD、VAD、MCVD",
        "5因素：温度、偏压、波长、光纤长度、泵浦功率；3对准法：ATC、APC、AFC",
        "5因素：分光比、方向性、附加损耗、隔离度、带宽；3对准法：电光法、磁光法、声光法"
      ],
      answer: 0
    },
    cloze: {
      text: "影响光纤活动连接器的3大因素：{{0}}、回波损耗、重复性与互换性。其中插入损耗的5个因素：纤芯{{1}}、光纤{{2}}、光纤端面{{3}}、纤芯直径不同、光纤端面{{4}}反射。光纤对准的3种方法：{{5}}、纤芯直视法、{{6}}。",
      answers: ["插入损耗", "错位", "倾斜", "间隙", "菲涅尔", "功率监测法", "包层对准法"]
    },
    rubric: [
      "影响光纤活动连接器的3项指标：插入损耗、回波损耗、重复性与互换性",
      "影响插入损耗的5项具体因素：①纤芯错位；②光纤倾斜；③光纤端面间隙；④纤芯直径不同；⑤光纤端面菲涅尔反射",
      "光纤对准3种方法：①功率监测法；②纤芯直视法；③包层对准法"
    ],
    answerHtml: "<strong>标准答案（笔记P8下半页）：</strong><br>1. <strong>影响光纤活动连接器的因素</strong>：<br>  • 三大指标：<strong>插入损耗、回波损耗、重复性与互换性</strong>。<br>  • 引起<strong>插入损耗</strong>的5项原因：① <strong>纤芯错位</strong>；② <strong>光纤倾斜</strong>；③ <strong>光纤端面间隙</strong>；④ <strong>纤芯直径不同</strong>；⑤ <strong>光纤端面菲涅尔反射</strong>。<br>2. <strong>光纤对准方法（3种）</strong>：① <strong>功率监测法</strong>；② <strong>纤芯直视法</strong>；③ <strong>包层对准法</strong>。"
  },
  {
    id: "Q22",
    chapter: "ch7",
    type: "short",
    typeName: "简答题",
    pdfPage: 9,
    title: "光耦合器的分类和特性参数（笔记P9第18题）",
    prompt: "简答：(1) 光耦合器按功能、按端口形式、按工作带宽、按传导模式分别如何分类？(2) 描述光耦合器的4个主要技术指标（插入损耗、附加损耗、分光比、方向性）的定义与公式，并说明哪个指标能真正反映器件制造工艺质量。",
    mcq: {
      question: "【一刷·概念快筛】在光耦合器的技术指标中，哪一个指标不能单独反映器件制作质量的优劣？哪一个指标才是体现器件制造工艺固有损耗的指标？",
      options: [
        "插入损耗(I·L)与分光比有很大关系，不能单独反映器件质量优劣；附加损耗(E·L)才体现器件制造工艺质量",
        "附加损耗不能反映质量，只有分光比(C·R)能反映制造工艺质量",
        "插入损耗越小说明固有损耗一定越小，与分光比无关",
        "方向性(D·L)是指正向传输的输出总功率与输入功率之比"
      ],
      answer: 0
    },
    cloze: {
      text: "光耦合器按功能分：光{{0}}分配耦合器和光{{1}}分配耦合器；从端口形式分：X形、Y形、星形、树形。参数公式：①插入损耗 I·Li = -10 lg({{2}}) (dB)；②附加损耗 E·L = -10 lg({{3}}) (dB)，体现器件制造工艺质量的是{{4}}；③分光比 C·Ri = P_outi / ΣP_outi × 100%；④方向性 D·L = -10 lg(P_in2 / P_in1) (dB)。",
      answers: ["功率", "波长", "Pouti/Pin", "ΣPouti/Pin", "附加损耗"]
    },
    rubric: [
      "光耦合器4维分类：①按功能：光功率分配、光波长分配；②按端口形式：X形、Y形、星形、树形；③按工作带宽：单工作窗口宽带、单工作窗口窄带、双工作窗口宽带；④按传导模式：多模、单模",
      "① 插入损耗 I·Li = -10 lg(Pouti / Pin) (dB)：指定输出端口光功率相对全部输入功率的分贝数（受分光比影响，不能单独反映器件质量优劣）",
      "② 附加损耗 E·L = -10 lg(ΣPouti / Pin) (dB)：输出端口光功率总和相对全部输入功率的分贝数（体现器件制造工艺质量，反映附加固有损耗）",
      "③ 分光比 C·Ri = (Pouti / ΣPouti) × 100%：各输出端口输出光功率相对输出总光功率的百分数",
      "④ 方向性 D·L = -10 lg(Pin2 / Pin1) (dB)：衡量定向传输特性，Pin2为1端注入时由非注入端2端输出的后向光功率"
    ],
    answerHtml: "<strong>标准答案（笔记P9第18题）：</strong><br>1. <strong>光耦合器的分类</strong>：<br>  • <strong>按功能</strong>：光功率分配耦合器、光波长分配耦合器；<br>  • <strong>从端口形式</strong>：X形、Y形、星形、树形耦合器；<br>  • <strong>按工作带宽</strong>：单工作窗口宽带、单工作窗口窄带、双工作窗口宽带耦合器；<br>  • <strong>按传导模式</strong>：多模、单模。<br>2. <strong>四大技术参数与公式</strong>：<div class='formula-card'>① <strong>插入损耗</strong>：<i>I · L<sub>i</sub></i> = −10 lg <span class='frac'><span class='frac-num'><i>P<sub>outi</sub></i></span><span class='frac-den'><i>P<sub>in</sub></i></span></span> (dB) &nbsp;（与分光比有关，不能单独反映器件质量优劣）</div><div class='formula-card'>② <strong>附加损耗</strong>：<i>E · L</i> = −10 lg <span class='frac'><span class='frac-num'>∑<i>P<sub>outi</sub></i></span><span class='frac-den'><i>P<sub>in</sub></i></span></span> (dB) &nbsp;（<strong>体现器件制造工艺质量</strong>，反映附加固有损耗）</div><div class='formula-card'>③ <strong>分光比</strong>：<i>C · R<sub>i</sub></i> = <span class='frac'><span class='frac-num'><i>P<sub>outi</sub></i></span><span class='frac-den'>∑<i>P<sub>outi</sub></i></span></span> × 100%</div><div class='formula-card'>④ <strong>方向性</strong>：<i>D · L</i> = −10 lg <span class='frac'><span class='frac-num'><i>P<sub>in2</sub></i></span><span class='frac-den'><i>P<sub>in1</sub></i></span></span> (dB)</div>"
  },
  {
    id: "Q23",
    chapter: "ch7",
    type: "calc",
    typeName: "草稿纸计算题",
    pdfPage: 9,
    calcType: "COUPLER_PARAMS",
    title: "【计算4·必考】2×2（X形）光耦合器插入损耗、附加损耗、分光比与方向性计算",
    prompt: "【笔记P9核心计算】某 2×2 X形光耦合器（端口1、2为输入侧，端口3、4为输出侧），由端口1注入光功率 Pin1 = 1.00 mW（即 1000 μW），测得输出端口3光功率 Pout3 = 630 μW，输出端口4光功率 Pout4 = 270 μW，非注入端2后向输出光功率 Pin2 = 0.10 μW。请在现实草稿纸上计算：(1) 输出总功率 ΣPout (μW) 与端口3的分光比 C·R3 (%)；(2) 附加损耗 E·L (dB)；(3) 端口3的插入损耗 I·L3 (dB) 与端口4的插入损耗 I·L4 (dB)；(4) 方向性 D·L (dB)。",
    mcq: {
      question: "【一刷·公式快筛】已知光耦合器附加损耗为 E·L (dB)，第 i 端口分光比为 C·Ri，则第 i 端口插入损耗 I·Li 与它们的关系为：",
      options: [
        "I·Li = E·L - 10 lg(C·Ri)  （因为 Pouti/Pin = (ΣPout/Pin) × (Pouti/ΣPout)）",
        "I·Li = E·L + 10 lg(C·Ri)",
        "I·Li = E·L × C·Ri",
        "I·Li = -10 lg(E·L)"
      ],
      answer: 0
    },
    cloze: {
      text: "耦合器计算4大核心公式：①输出总功率 ΣPout = Pout3 + Pout4；②分光比 C·R3 = {{0}} × 100%；③附加损耗 E·L = -10 lg({{1}}) (dB)；④插入损耗 I·L3 = -10 lg({{2}}) (dB)；⑤方向性 D·L = -10 lg(Pin2 / Pin1) (dB)。",
      answers: ["Pout3/ΣPout", "ΣPout/Pin1", "Pout3/Pin1"]
    },
    rubric: [
      "计算输出总功率 ΣPout = 630 + 270 = 900 μW，分光比 C·R3 = 630/900 = 70%，C·R4 = 30%",
      "计算附加损耗 E·L = -10 lg(900 / 1000) = -10 lg(0.9) ≈ 0.458 dB",
      "计算插入损耗 I·L3 = -10 lg(630 / 1000) ≈ 2.007 dB，I·L4 = -10 lg(270 / 1000) ≈ 5.686 dB",
      "计算方向性 D·L = -10 lg(0.10 / 1000) = -10 lg(10^-4) = 40 dB"
    ],
    answerHtml: "<strong>草稿纸标准演算步骤（笔记P9）：</strong><div class='formula-card'>1. <strong>输出总功率与分光比</strong>：∑<i>P<sub>out</sub></i> = 630 + 270 = <strong>900 μW</strong>；&nbsp; <i>C · R</i><sub>3</sub> = <span class='frac'><span class='frac-num'>630</span><span class='frac-den'>900</span></span> × 100% = <strong>70%</strong>，<i>C · R</i><sub>4</sub> = <strong>30%</strong></div><div class='formula-card'>2. <strong>附加损耗 <i>E · L</i></strong>：<i>E · L</i> = −10 lg <span class='frac'><span class='frac-num'>900</span><span class='frac-den'>1000</span></span> = −10 lg(0.9) ≈ <strong>0.458 dB</strong></div><div class='formula-card'>3. <strong>插入损耗 <i>I · L<sub>i</sub></i></strong>：<i>I · L</i><sub>3</sub> = −10 lg <span class='frac'><span class='frac-num'>630</span><span class='frac-den'>1000</span></span> ≈ <strong>2.007 dB</strong> ，&nbsp; <i>I · L</i><sub>4</sub> = −10 lg <span class='frac'><span class='frac-num'>270</span><span class='frac-den'>1000</span></span> ≈ <strong>5.686 dB</strong></div><div class='formula-card'>4. <strong>方向性 <i>D · L</i></strong>：<i>D · L</i> = −10 lg <span class='frac'><span class='frac-num'>0.10</span><span class='frac-den'>1000</span></span> = −10 lg(10<sup>−4</sup>) = <strong>40 dB</strong></div>"
  },
  {
    id: "Q24",
    chapter: "ch3",
    type: "calc",
    typeName: "草稿纸计算题",
    pdfPage: 3,
    calcType: "SMF_V_ALPHA",
    title: "【计算5】单模光纤归一化频率 V 与衰减系数 α 计算",
    prompt: "【笔记P3第8题公式实战】已知某阶跃型单模光纤纤芯半径 a = 4.2 μm，数值孔径 NA = 0.12，工作波长 λ0 = 1.55 μm。当输入光功率 Pin = 2.0 mW 时，经过 L = 20 km 光纤传输后输出光功率 Pout = 0.50 mW。请在草稿纸上计算：(1) 归一化频率 V（并判断是否满足 V ≤ 2.4048 单模条件）；(2) 光纤传输总损耗 (dB) 与衰减系数 α (dB/km)。",
    mcq: {
      question: "【一刷·公式快筛】光纤长度 L = 10 km，输入功率 Pin = 10 mW，输出功率 Pout = 1 mW，则该光纤的衰减系数 α 为：",
      options: [
        "1.0 dB/km （因为 α = (10/L) lg(Pin/Pout) = (10/10) lg(10) = 1.0 dB/km）",
        "10 dB/km",
        "0.1 dB/km",
        "2.0 dB/km"
      ],
      answer: 0
    },
    cloze: {
      text: "单模光纤归一化频率 V = (2πa·NA) / λ0，单模传输条件为 V ≤ {{0}}；光纤衰减系数 α = ({{1}} / L) · lg(Pin / Pout) (dB/km)。",
      answers: ["2.4048", "10"]
    },
    rubric: [
      "代入 V = (2π × 4.2 × 0.12) / 1.55 ≈ 2.043，因 2.043 ≤ 2.4048，满足单模传输条件",
      "计算总衰减 10 lg(2.0 / 0.50) = 10 lg(4) ≈ 6.02 dB",
      "计算衰减系数 α = 6.02 / 20 ≈ 0.301 dB/km"
    ],
    answerHtml: "<strong>草稿纸标准演算步骤（笔记P3第8题）：</strong><div class='formula-card'>1. <strong>归一化频率 <i>V</i></strong>：<i>V</i> = <span class='frac'><span class='frac-num'>2π<i>a</i> · NA</span><span class='frac-den'><i>λ</i><sub>0</sub></span></span> = <span class='frac'><span class='frac-num'>2 × 3.1416 × 4.2 × 0.12</span><span class='frac-den'>1.55</span></span> ≈ <strong>2.043</strong> &nbsp;（因 2.043 ≤ 2.4048，属于单模传输）</div><div class='formula-card'>2. <strong>总损耗与衰减系数 <i>α</i></strong>：<i>α</i> = <span class='frac'><span class='frac-num'>10</span><span class='frac-den'><i>L</i></span></span> lg <span class='frac'><span class='frac-num'><i>P<sub>in</sub></i></span><span class='frac-den'><i>P<sub>out</sub></i></span></span> = <span class='frac'><span class='frac-num'>10</span><span class='frac-den'>20</span></span> lg <span class='frac'><span class='frac-num'>2.0</span><span class='frac-den'>0.50</span></span> = 0.5 × 6.0206 ≈ <strong>0.301 dB/km</strong></div>"
  },
  {
    id: "Q25",
    chapter: "ch5",
    type: "calc",
    typeName: "草稿纸计算题",
    pdfPage: 7,
    calcType: "EDFA_GAIN_DBM",
    title: "【计算6】EDFA 光功率 dBm 换算与放大器增益 G 计算",
    prompt: "【笔记P7第3节公式实战】已知输入到 EDFA 的小信号光功率 Ps_in = 10 μW（即 0.01 mW），经掺铒光纤放大后输出信号光功率 Ps_out = 10 mW。请在草稿纸上计算：(1) 输入信号光功率的 dBm 值（利用 10 lg(Ps / 1mW)）；(2) 输出信号光功率的 dBm 值；(3) EDFA 的信号增益 G (dB)。",
    mcq: {
      question: "【一刷·公式快筛】根据笔记第7页，光功率 1 mW 和 0.1 mW 对应的 dBm 值分别是：",
      options: [
        "0 dBm 和 -10 dBm （因为 P(dBm) = 10 lg(P / 1mW)）",
        "10 dBm 和 1 dBm",
        "1 dBm 和 0 dBm",
        "-10 dBm 和 -20 dBm"
      ],
      answer: 0
    },
    cloze: {
      text: "光功率分贝毫瓦换算公式：P(dBm) = 10 lg( Ps / {{0}} )；EDFA增益公式：G(dB) = 10 lg( Ps_out / {{1}} ) = Ps_out(dBm) - Ps_in(dBm)。",
      answers: ["1mW", "Ps_in"]
    },
    rubric: [
      "计算输入功率 dBm 值：Ps_in(dBm) = 10 lg(0.01 mW / 1 mW) = -20 dBm",
      "计算输出功率 dBm 值：Ps_out(dBm) = 10 lg(10 mW / 1 mW) = +10 dBm",
      "计算 EDFA 增益：G = 10 lg(10 / 0.01) = 10 - (-20) = 30 dB"
    ],
    answerHtml: "<strong>草稿纸标准演算步骤（笔记P7）：</strong><div class='formula-card'>1. <strong>输入光功率 dBm</strong>：<i>P<sub>s</sub><sup>in</sup></i>(dBm) = 10 lg <span class='frac'><span class='frac-num'>0.01 mW</span><span class='frac-den'>1 mW</span></span> = <strong>−20 dBm</strong></div><div class='formula-card'>2. <strong>输出光功率 dBm</strong>：<i>P<sub>s</sub><sup>out</sup></i>(dBm) = 10 lg <span class='frac'><span class='frac-num'>10 mW</span><span class='frac-den'>1 mW</span></span> = <strong>+10 dBm</strong></div><div class='formula-card'>3. <strong>EDFA 增益 <i>G</i></strong>：<i>G</i> = 10 lg <span class='frac'><span class='frac-num'><i>P<sub>s</sub><sup>out</sup></i></span><span class='frac-den'><i>P<sub>s</sub><sup>in</sup></i></span></span> = 10 − (−20) = <strong>30 dB</strong></div>"
  }
);

// ============================================================================
// 现实草稿纸计算题动态参数生成器（支持原题固定参数 + 随机变参无限刷）
// ============================================================================
window.CALC_GENERATORS = {
  LED_LD_PI_ETA: function(randomize) {
    const Eg = randomize ? +(0.80 + Math.random() * 0.62).toFixed(4) : 0.9535;
    const Ith = randomize ? Math.round(15 + Math.random() * 25) : 20;
    const I = randomize ? Ith + Math.round(30 + Math.random() * 40) : 60;
    const Pth = 0.2;
    const slope = randomize ? +(0.25 + Math.random() * 0.30).toFixed(2) : 0.40;
    const Pex = +(Pth + slope * (I - Ith)).toFixed(2);
    const lambda_um = +(1.2396 / Eg).toFixed(3);
    const eta_D = +((slope / Eg) * 100).toFixed(2);

    return {
      code: "#CALC-01 | P2-P3 LED与LD特性计算",
      noteTip: "请在实体草稿纸写下公式：<i>λ<sub>p</sub></i>(μm) = <span class='frac'><span class='frac-num'>1.2396</span><span class='frac-den'><i>E<sub>g</sub></i>(eV)</span></span> 与 <i>η<sub>D</sub></i> = <span class='frac'><span class='frac-num'>(<i>P<sub>ex</sub></i> − <i>P<sub>th</sub></i>) / <i>hν</i></span><span class='frac-den'>(<i>I</i> − <i>I<sub>th</sub></i>) / <i>e</i><sub>0</sub></span></span> = <span class='frac'><span class='frac-num'>Δ<i>P</i> / Δ<i>I</i></span><span class='frac-den'><i>E<sub>g</sub></i></span></span>",
      params: [
        { name: "禁带宽度 Eg", val: Eg + " eV" },
        { name: "阈值点 (Ith, Pth)", val: Ith + " mA, " + Pth + " mW" },
        { name: "工作注入电流 I", val: I + " mA" },
        { name: "输出光功率 Pex", val: Pex + " mW" }
      ],
      steps: [
        {
          label: "Step 1：计算发光中心波长 λp",
          formula: "<i>λ<sub>p</sub></i> = <span class='frac'><span class='frac-num'><i>hc</i></span><span class='frac-den'><i>E<sub>g</sub></i></span></span> = <span class='frac'><span class='frac-num'>1.2396</span><span class='frac-den'><i>E<sub>g</sub></i>(eV)</span></span>",
          unit: "μm",
          answer: lambda_um,
          tolerance: 0.03
        },
        {
          label: "Step 2：计算激光器斜率效率 ΔP/ΔI",
          formula: "<span class='frac'><span class='frac-num'>Δ<i>P</i></span><span class='frac-den'>Δ<i>I</i></span></span> = <span class='frac'><span class='frac-num'><i>P<sub>ex</sub></i> − <i>P<sub>th</sub></i></span><span class='frac-den'><i>I</i> − <i>I<sub>th</sub></i></span></span>",
          unit: "mW/mA (即 W/A)",
          answer: slope,
          tolerance: 0.02
        },
        {
          label: "Step 3：计算外微分量子效率 ηD",
          formula: "<i>η<sub>D</sub></i> = <span class='frac'><span class='frac-num'>Δ<i>P</i> / Δ<i>I</i></span><span class='frac-den'><i>E<sub>g</sub></i>(V)</span></span> × 100%",
          unit: "%",
          answer: eta_D,
          tolerance: 1.2
        }
      ]
    };
  },

  PIN_APD_GAIN: function(randomize) {
    const Eg = randomize ? +(0.72 + Math.random() * 0.40).toFixed(2) : 0.75;
    const Pin = randomize ? +(1.5 + Math.random() * 3.5).toFixed(1) : 2.0;
    const R0 = randomize ? +(0.65 + Math.random() * 0.30).toFixed(2) : 0.80;
    const Ip = +(Pin * R0).toFixed(2);
    const G = randomize ? Math.round(25 + Math.random() * 55) : 40;
    const IM = +(Ip * G).toFixed(2);
    const lambda_c = +(1.24 / Eg).toFixed(3);

    return {
      code: "#CALC-02 | P4 PIN截止波长与APD雪崩增益",
      noteTip: "请在草稿纸写下：上限截止波长 <i>λ<sub>c</sub></i> = <span class='frac'><span class='frac-num'>1.24</span><span class='frac-den'><i>E<sub>g</sub></i>(eV)</span></span> (μm)，平均雪崩增益 <i>G</i> = <span class='frac'><span class='frac-num'><i>I<sub>M</sub></i></span><span class='frac-den'><i>I<sub>p</sub></i></span></span>",
      params: [
        { name: "材料禁带宽度 Eg", val: Eg + " eV" },
        { name: "入射光功率 Pin", val: Pin + " μW" },
        { name: "初始光生电流 Ip", val: Ip + " μA" },
        { name: "倍增光生电流 IM", val: IM + " μA" }
      ],
      steps: [
        {
          label: "Step 1：计算上限截止波长 λc",
          formula: "<i>λ<sub>c</sub></i> = <span class='frac'><span class='frac-num'><i>hc</i></span><span class='frac-den'><i>E<sub>g</sub></i></span></span> = <span class='frac'><span class='frac-num'>1.24</span><span class='frac-den'><i>E<sub>g</sub></i>(eV)</span></span>",
          unit: "μm",
          answer: lambda_c,
          tolerance: 0.03
        },
        {
          label: "Step 2：计算未倍增初始响应度 R0",
          formula: "<i>R</i><sub>0</sub> = <span class='frac'><span class='frac-num'><i>I<sub>p</sub></i></span><span class='frac-den'><i>P<sub>in</sub></i></span></span>",
          unit: "A/W (即 μA/μW)",
          answer: R0,
          tolerance: 0.03
        },
        {
          label: "Step 3：计算 APD 平均雪崩增益 G",
          formula: "<i>G</i> = <span class='frac'><span class='frac-num'>倍增光生电流 <i>I<sub>M</sub></i></span><span class='frac-den'>初始光生电流 <i>I<sub>p</sub></i></span></span>",
          unit: "倍",
          answer: G,
          tolerance: 0.8
        }
      ]
    };
  },

  FRA_PUMP_WAVELENGTH: function(randomize) {
    const lambda_s = randomize ? Math.round(1530 + Math.random() * 35) : 1550;
    const df_raman = randomize ? +(12.8 + Math.random() * 0.6).toFixed(1) : 13.0;
    const fs = +(300000 / lambda_s).toFixed(2);
    const fp = +(fs + df_raman).toFixed(2);
    const lambda_p = +(300000 / fp).toFixed(1);

    return {
      code: "#CALC-03 | P6 FRA拉曼放大器算泵浦波长",
      noteTip: "笔记P6三步法：① <i>f<sub>s</sub></i> = <span class='frac'><span class='frac-num'><i>c</i></span><span class='frac-den'><i>λ<sub>s</sub></i></span></span> → ② <i>f<sub>p</sub></i> = <i>f<sub>s</sub></i> + Δ<i>f</i><sub>Raman</sub> → ③ <i>λ<sub>p</sub></i> = <span class='frac'><span class='frac-num'><i>c</i></span><span class='frac-den'><i>f<sub>p</sub></i></span></span>",
      params: [
        { name: "目标信号波长 λs", val: lambda_s + " nm" },
        { name: "拉曼频移 Δf_Raman", val: df_raman + " THz" },
        { name: "真空光速 c", val: "3.0 × 10⁸ m/s" }
      ],
      steps: [
        {
          label: "Step 1：求目标信号频率 fs",
          formula: "<i>f<sub>s</sub></i> = <span class='frac'><span class='frac-num'><i>c</i></span><span class='frac-den'><i>λ<sub>s</sub></i></span></span> = <span class='frac'><span class='frac-num'>300000</span><span class='frac-den'><i>λ<sub>s</sub></i>(nm)</span></span>",
          unit: "THz",
          answer: fs,
          tolerance: 0.5
        },
        {
          label: "Step 2：求所需泵浦光频率 fp",
          formula: "<i>f<sub>p</sub></i> = <i>f<sub>s</sub></i> + Δ<i>f</i><sub>Raman</sub>",
          unit: "THz",
          answer: fp,
          tolerance: 0.5
        },
        {
          label: "Step 3：求所需泵浦光波长 λp",
          formula: "<i>λ<sub>p</sub></i> = <span class='frac'><span class='frac-num'><i>c</i></span><span class='frac-den'><i>f<sub>p</sub></i></span></span> = <span class='frac'><span class='frac-num'>300000</span><span class='frac-den'><i>f<sub>p</sub></i>(THz)</span></span>",
          unit: "nm",
          answer: lambda_p,
          tolerance: 2.0
        }
      ]
    };
  },

  COUPLER_PARAMS: function(randomize) {
    const Pin1 = 1000;
    const totalOut = randomize ? Math.round(820 + Math.random() * 130) : 900;
    const ratio3 = randomize ? Math.round(50 + Math.random() * 35) : 70;
    const Pout3 = +(totalOut * (ratio3 / 100)).toFixed(1);
    const Pout4 = +(totalOut - Pout3).toFixed(1);
    const Pin2 = randomize ? +(0.05 + Math.random() * 0.20).toFixed(2) : 0.10;

    const CR3 = +((Pout3 / totalOut) * 100).toFixed(1);
    const EL = +(-10 * Math.log10(totalOut / Pin1)).toFixed(3);
    const IL3 = +(-10 * Math.log10(Pout3 / Pin1)).toFixed(3);
    const IL4 = +(-10 * Math.log10(Pout4 / Pin1)).toFixed(3);
    const DL = +(-10 * Math.log10(Pin2 / Pin1)).toFixed(2);

    return {
      code: "#CALC-04 | P9 光耦合器四大参数计算",
      noteTip: "请在草稿纸核对公式：附加损耗 <i>E·L</i> = −10 lg <span class='frac'><span class='frac-num'>∑<i>P<sub>out</sub></i></span><span class='frac-den'><i>P<sub>in</sub></i></span></span>，插入损耗 <i>I·L<sub>i</sub></i> = −10 lg <span class='frac'><span class='frac-num'><i>P<sub>outi</sub></i></span><span class='frac-den'><i>P<sub>in</sub></i></span></span>，分光比 <i>C·R<sub>i</sub></i> = <span class='frac'><span class='frac-num'><i>P<sub>outi</sub></i></span><span class='frac-den'>∑<i>P<sub>out</sub></i></span></span>",
      params: [
        { name: "输入光功率 Pin1", val: Pin1 + " μW" },
        { name: "端口3输出 Pout3", val: Pout3 + " μW" },
        { name: "端口4输出 Pout4", val: Pout4 + " μW" },
        { name: "非注入端2串扰 Pin2", val: Pin2 + " μW" }
      ],
      steps: [
        {
          label: "Step 1：计算端口3的分光比 C·R3",
          formula: "<i>C · R</i><sub>3</sub> = <span class='frac'><span class='frac-num'><i>P<sub>out3</sub></i></span><span class='frac-den'><i>P<sub>out3</sub></i> + <i>P<sub>out4</sub></i></span></span> × 100%",
          unit: "%",
          answer: CR3,
          tolerance: 0.5
        },
        {
          label: "Step 2：计算附加损耗 E·L（体现制造工艺质量）",
          formula: "<i>E · L</i> = −10 lg <span class='frac'><span class='frac-num'><i>P<sub>out3</sub></i> + <i>P<sub>out4</sub></i></span><span class='frac-den'><i>P<sub>in1</sub></i></span></span>",
          unit: "dB",
          answer: EL,
          tolerance: 0.05
        },
        {
          label: "Step 3：计算端口3插入损耗 I·L3",
          formula: "<i>I · L</i><sub>3</sub> = −10 lg <span class='frac'><span class='frac-num'><i>P<sub>out3</sub></i></span><span class='frac-den'><i>P<sub>in1</sub></i></span></span>",
          unit: "dB",
          answer: IL3,
          tolerance: 0.08
        },
        {
          label: "Step 4：计算端口4插入损耗 I·L4 与方向性 D·L（填 D·L 值）",
          formula: "<i>D · L</i> = −10 lg <span class='frac'><span class='frac-num'><i>P<sub>in2</sub></i></span><span class='frac-den'><i>P<sub>in1</sub></i></span></span> &nbsp;（同时草稿纸可算得 <i>I · L</i><sub>4</sub> = " + IL4 + " dB）",
          unit: "dB",
          answer: DL,
          tolerance: 0.3
        }
      ]
    };
  },

  SMF_V_ALPHA: function(randomize) {
    const a = randomize ? +(3.8 + Math.random() * 0.8).toFixed(1) : 4.2;
    const NA = randomize ? +(0.10 + Math.random() * 0.03).toFixed(2) : 0.12;
    const lambda0 = 1.55;
    const L = randomize ? Math.round(15 + Math.random() * 25) : 20;
    const Pin = randomize ? +(1.5 + Math.random() * 2.5).toFixed(2) : 2.0;
    const alpha_real = randomize ? +(0.20 + Math.random() * 0.15).toFixed(3) : 0.301;
    const Pout = +(Pin * Math.pow(10, -(alpha_real * L) / 10)).toFixed(3);
    const V = +((2 * Math.PI * a * NA) / lambda0).toFixed(3);
    const alpha = +((10 / L) * Math.log10(Pin / Pout)).toFixed(3);

    return {
      code: "#CALC-05 | P3 单模光纤V值与衰减系数α",
      noteTip: "笔记P3第8题：<i>V</i> = <span class='frac'><span class='frac-num'>2π<i>a</i> · NA</span><span class='frac-den'><i>λ</i><sub>0</sub></span></span>（单模条件 <i>V</i> ≤ 2.4048），衰减系数 <i>α</i> = <span class='frac'><span class='frac-num'>10</span><span class='frac-den'><i>L</i></span></span> lg <span class='frac'><span class='frac-num'><i>P<sub>in</sub></i></span><span class='frac-den'><i>P<sub>out</sub></i></span></span>",
      params: [
        { name: "纤芯半径 a", val: a + " μm" },
        { name: "数值孔径 NA", val: NA + "" },
        { name: "工作波长 λ0", val: lambda0 + " μm" },
        { name: "光纤长度 L", val: L + " km" },
        { name: "输入功率 Pin", val: Pin + " mW" },
        { name: "输出功率 Pout", val: Pout + " mW" }
      ],
      steps: [
        {
          label: "Step 1：计算归一化频率 V（验证是否 ≤ 2.4048）",
          formula: "<i>V</i> = <span class='frac'><span class='frac-num'>2 × 3.1416 × <i>a</i> × NA</span><span class='frac-den'><i>λ</i><sub>0</sub></span></span>",
          unit: "(无量纲)",
          answer: V,
          tolerance: 0.04
        },
        {
          label: "Step 2：计算光纤衰减系数 α",
          formula: "<i>α</i> = <span class='frac'><span class='frac-num'>10</span><span class='frac-den'><i>L</i></span></span> lg <span class='frac'><span class='frac-num'><i>P<sub>in</sub></i></span><span class='frac-den'><i>P<sub>out</sub></i></span></span>",
          unit: "dB/km",
          answer: alpha,
          tolerance: 0.02
        }
      ]
    };
  },

  EDFA_GAIN_DBM: function(randomize) {
    const Pin_mw = randomize ? +(0.005 + Math.random() * 0.045).toFixed(3) : 0.01;
    const Pout_mw = randomize ? Math.round(5 + Math.random() * 20) : 10;
    const Pin_dbm = +(10 * Math.log10(Pin_mw)).toFixed(2);
    const Pout_dbm = +(10 * Math.log10(Pout_mw)).toFixed(2);
    const G_db = +(Pout_dbm - Pin_dbm).toFixed(2);

    return {
      code: "#CALC-06 | P7 EDFA增益与dBm功率换算",
      noteTip: "笔记P7：<i>P</i>(dBm) = 10 lg <span class='frac'><span class='frac-num'><i>P<sub>s</sub></i></span><span class='frac-den'>1 mW</span></span>，增益 <i>G</i>(dB) = 10 lg <span class='frac'><span class='frac-num'><i>P<sub>s</sub><sup>out</sup></i></span><span class='frac-den'><i>P<sub>s</sub><sup>in</sup></i></span></span> = <i>P<sub>s</sub><sup>out</sup></i>(dBm) − <i>P<sub>s</sub><sup>in</sup></i>(dBm)",
      params: [
        { name: "输入信号功率 Ps_in", val: Pin_mw + " mW (" + (Pin_mw * 1000).toFixed(1) + " μW)" },
        { name: "输出信号功率 Ps_out", val: Pout_mw + " mW" }
      ],
      steps: [
        {
          label: "Step 1：换算输入信号光功率为 dBm",
          formula: "<i>P<sub>s</sub><sup>in</sup></i>(dBm) = 10 lg <span class='frac'><span class='frac-num'><i>P<sub>s</sub><sup>in</sup></i>(mW)</span><span class='frac-den'>1 mW</span></span>",
          unit: "dBm",
          answer: Pin_dbm,
          tolerance: 0.15
        },
        {
          label: "Step 2：换算输出信号光功率为 dBm",
          formula: "<i>P<sub>s</sub><sup>out</sup></i>(dBm) = 10 lg <span class='frac'><span class='frac-num'><i>P<sub>s</sub><sup>out</sup></i>(mW)</span><span class='frac-den'>1 mW</span></span>",
          unit: "dBm",
          answer: Pout_dbm,
          tolerance: 0.15
        },
        {
          label: "Step 3：计算 EDFA 增益 G",
          formula: "<i>G</i>(dB) = 10 lg <span class='frac'><span class='frac-num'><i>P<sub>s</sub><sup>out</sup></i></span><span class='frac-den'><i>P<sub>s</sub><sup>in</sup></i></span></span> = <i>P<sub>s</sub><sup>out</sup></i>(dBm) − <i>P<sub>s</sub><sup>in</sup></i>(dBm)",
          unit: "dB",
          answer: G_db,
          tolerance: 0.2
        }
      ]
    };
  }
};
