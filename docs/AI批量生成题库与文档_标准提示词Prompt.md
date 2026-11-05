# 🤖 让其他 AI 批量生成「考研三刷网页题库与高频知识点」的标准提示词 (Prompts)

> **使用指南**：
> 1. 您可以将下方的 **【提示词模板 A（数学二）】**、**【提示词模板 B（英语二）】** 或 **【提示词模板 C（专业课/通用高频背诵卡）】** 直接复制发送给任何大模型（如 DeepSeek、ChatGPT、Claude、Kimi、豆包等），并把某一年份的真题 PDF 或テキスト发给它。
> 2. 别的 AI 会严格按照本网页的数据结构输出 **标准 JSON 数组**。
> 3. 拿到别的 AI 输出的 JSON 后，您既可以**直接粘贴到本刷题网页顶部的「📥 AI 题库导入」弹窗中一键生效**，也可以发回给我由我直接写入仓库代码中！

---

## 📋 提示词模板 A：让 AI 拆解【考研数学二真题】并生成带做题技巧的三刷 JSON

请复制以下完整框内文字发给其他 AI：

```markdown
你现在是考研数学二（302）顶级命题研究专家与前端题库数据工程师。我将向你提供考研数学二的真题内容（或指定年份与题号）。请你将其按考点分类拆解，并严格输出为可直接接入我本地《考研全科三刷通关系统》的 JSON 数组格式。

### ⚠️ 极重要格式要求（必须 100% 遵守）：
1. **严禁输出未渲染的 LaTeX 代码串**（禁止出现 `\frac`、`\int`、`$$`、`\lambda` 等反斜杠源码）！
2. **所有数学公式必须使用纯 HTML 直观标签与 Unicode 数学符号**：
   - 上下分式必须写为：`<span class='frac'><span class='frac-num'>分子</span><span class='frac-den'>分母</span></span>`
   - 独立公式块包裹在：`<div class='formula-card'>...</div>`
   - 上标用 `<sup>...</sup>`，下标用 `<sub>...</sub>`，斜体变量用 `<i>...</i>`
   - 常用符号直接使用 Unicode：`∫`（积分）、`∑`（求和）、`→`（趋于）、`∞`（无穷）、`≤`、`≥`、`≠`、`≈`、`×`、`±`、`√`、`∂`、`π`、`λ`、`μ`、`α`、`β`、`Δ`。
3. **每道题必须包含三刷递进数据**：
   - `mcq`（一刷·概念/破题方向四选一）
   - `cloze`（二刷·关键公式或核心步骤挖空，用 `{{0}}`, `{{1}}` 占位）
   - `rubric`（三刷·草稿纸关键得分步骤自检清单，3~4条）
   - `tips`（考场破题秒杀技巧/避坑指南）
   - `knowledgePoints`（本题关联的需高频重复背诵的知识点数组）

### 📐 标准 JSON Schema 模板（请严格输出纯 JSON 数组 `[...]`）：
[
  {
    "id": "M26_01",
    "subject": "math2",
    "year": 2026,
    "chapter": "m_ch1",
    "type": "calc",
    "typeName": "草稿纸计算题",
    "title": "【2026数二真题·第1题】高阶无穷小与泰勒展开求参数",
    "prompt": "已知当 <i>x</i> → 0 时，<i>ax</i><sup>2</sup> + <i>bx</i> + arcsin <i>x</i> 与 (1 + <i>x</i><sup>2</sup>)<sup>1/3</sup> − 1 是等价无穷小，求常数 <i>a</i>, <i>b</i> 的值。",
    "tips": "💡 秒杀技巧：见到加减法无穷小等价问题，立刻用泰勒公式展开到与分母同阶！由于右端 (1+x²)¹/³ - 1 ~ (1/3)x² 是二阶无穷小，左端的一阶项 (b+1)x 系数必须为 0，二次项系数 a 必须等于 1/3！",
    "knowledgePoints": [
      "等价无穷小充要条件：lim(α/β) = 1，同阶且主部系数相等",
      "泰勒展开：arcsin x = x + x³/6 + o(x³)",
      "广义二项式展开：(1 + u)^α - 1 ~ α·u (u → 0)"
    ],
    "mcq": {
      "question": "【一刷·破题快筛】本题右端 (1+x²)¹/³ - 1 当 x→0 时的等价无穷小主部及左端 x 一次项系数应满足：",
      "options": [
        "右端等价于 (1/3)x²，故左端一次项系数 b + 1 = 0 且二次项系数 a = 1/3，得 a = 1/3, b = -1",
        "右端等价于 (1/3)x，故 a = 0, b = 1/3",
        "右端等价于 3x²，故 a = 3, b = -1",
        "右端等价于 (1/3)x²，故 a = 1/3, b = 1"
      ],
      "answer": 0
    },
    "cloze": {
      "text": "当 x→0 时，(1+x²)¹/³ − 1 ~ {{0}}x²；而 arcsin x = x + x³/6 + o(x³)，故左端 = (b+1)x + ax² + o(x²)。由等价无穷小定义知 b+1 = {{1}} 且 a = {{2}}，解得 b = {{3}}。",
      "answers": ["1/3", "0", "1/3", "-1"]
    },
    "rubric": [
      "写出右端等价无穷小：(1+x²)¹/³ - 1 ~ (1/3)x²",
      "写出左端泰勒展开：ax² + bx + arcsin x = (b+1)x + ax² + o(x²)",
      "对比同阶系数得 b + 1 = 0 且 a = 1/3，准确算出 a = 1/3, b = -1"
    ],
    "answerHtml": "<strong>【标准解析】</strong><div class='formula-card'>当 <i>x</i> → 0 时，<span class='frac'><span class='frac-num'>1</span><span class='frac-den'>3</span></span><i>x</i><sup>2</sup> ~ (1 + <i>x</i><sup>2</sup>)<sup>1/3</sup> − 1</div>又因为 arcsin <i>x</i> = <i>x</i> + <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>6</span></span><i>x</i><sup>3</sup> + <i>o</i>(<i>x</i><sup>3</sup>)，代入左端得：<div class='formula-card'><i>ax</i><sup>2</sup> + <i>bx</i> + arcsin <i>x</i> = (<i>b</i> + 1)<i>x</i> + <i>ax</i><sup>2</sup> + <i>o</i>(<i>x</i><sup>2</sup>)</div>由两式等价无穷小可得：<i>b</i> + 1 = 0，<i>a</i> = <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>3</span></span>，即 <strong><i>a</i> = 1/3，<i>b</i> = −1</strong>。"
  }
]

其中 `chapter` 字段请根据考点归类填入以下 6 个固定章节 ID 之一：
- `"m_ch1"`：一、函数、极限与连续
- `"m_ch2"`：二、一元函数微分学与中值定理
- `"m_ch3"`：三、一元函数积分学与几何物理应用
- `"m_ch4"`：四、常微分方程
- `"m_ch5"`：五、多元函数微分学与二重积分
- `"m_ch6"`：六、线性代数（行列式/矩阵/方程组/特征值二次型）

现在，请根据我接下来发给你的数学二真题内容，生成对应的完整 JSON 数组：
```

---

## 📋 提示词模板 B：让 AI 拆解【考研英语二真题】并生成带做题技巧的三刷 JSON

请复制以下完整框内文字发给其他 AI：

```markdown
你现在是考研英语二（204）资深阅卷人与教研专家。我将向你提供考研英语二的真题材料（完形填空、阅读理解 Part A、新题型 Part B、翻译 Section III 或写作 Section IV）。请你将其按题型模块拆解，并严格输出为可直接接入我本地《考研全科三刷通关系统》的 JSON 数组格式。

### ⚠️ 格式与内容要求：
1. 每道题必须提炼出极高价值的 `tips`（考场定位技巧、同义替换拆解、干扰项排除原因或长难句切分公式）与 `knowledgePoints`（核心必背词汇/词组、高频语法点或万能写作功能句）。
2. 每道题包含三刷递进训练：
   - `mcq`（一刷·真题原题四选一或核心句意辨析）
   - `cloze`（二刷·原文同义替换词、高频短语或长难句主干填空，用 `{{0}}`, `{{1}}` 占位）
   - `rubric`（三刷·全文复盘/翻译采分点/作文背诵自检清单）
3. `chapter` 字段请填入以下 5 个固定模块 ID 之一：
   - `"e_ch1"`：一、完形填空（逻辑衔接与词义辨析）
   - `"e_ch2"`：二、阅读理解 Part A（细节/主旨/推断/态度）
   - `"e_ch3"`：三、新题型 Part B（小标题与多项对应）
   - `"e_ch4"`：四、英译汉 Section III（长难句拆分与核心词译法）
   - `"e_ch5"`：五、写作 Section IV（小作文书信 & 大作文图表模板）

### 📐 标准 JSON Schema 模板（请严格输出纯 JSON 数组 `[...]`）：
[
  {
    "id": "E25_TR01",
    "subject": "eng2",
    "year": 2025,
    "chapter": "e_ch4",
    "type": "short",
    "typeName": "真题精析",
    "title": "【2025英二真题·翻译46题】对话中的尴尬沉默（长难句拆分与精译）",
    "prompt": "请精译2025年英语二翻译核心长难句：Researchers analysed the frequency and impact of gaps greater than 2 seconds during conversations, including an overview of previous studies which indicate that the fear of awkward silences can be so extreme that people avoid talking to strangers, even though doing so is likely to be an enjoyable experience.",
    "tips": "💡 翻译四步拆分技巧：① 找主干（Researchers analysed the frequency and impact...）；② 介词短语 including... 顺译为补充说明；③ which 引导定语从句修饰 previous studies，长定语后置直接译为『这些研究表明……』；④ so...that...（如此……以至于……）与 even though（尽管……）按中文逻辑顺译。",
    "knowledgePoints": [
      "gap [n.] 间隙，停顿（语境译为：沉默间隙）",
      "awkward silence 尴尬的沉默",
      "so... that... 如此……以至于……（结果状语从句）",
      "even though 即使，尽管（让步状语从句）"
    ],
    "mcq": {
      "question": "【一刷·结构与词义快筛】句中 'which indicate that the fear of awkward silences can be so extreme that...' 的语法功能与准确译法是：",
      "options": [
        "定语从句修饰 previous studies，内嵌 that 宾语从句与 so...that 结果状语从句；译为：这些研究表明，对尴尬沉默的恐惧可能会极端到让人避免与陌生人交谈",
        "状语从句修饰 analysed；译为：为了表明尴尬的沉默是极端的",
        "同位语从句解释 gaps；译为：这种停顿表明陌生人交谈很愉快",
        "形式主语从句"
      ],
      "answer": 0
    },
    "cloze": {
      "text": "研究人员分析了交谈中超过2秒的{{0}}的出现频率及其影响，其中包括对先前研究的概述；这些研究表明，人们对{{1}}的恐惧可能会极端到{{2}}与陌生人交谈，{{3}}这样做很可能是一次愉快的经历。",
      "answers": ["停顿", "尴尬沉默", "避免", "尽管"]
    },
    "rubric": [
      "主干准确：研究人员分析了交谈中超过2秒的停顿（沉默间隙）的频率和影响",
      "定语从句拆分自然：包括对先前研究的综述，这些研究表明……",
      "结果与让步逻辑完整：对尴尬沉默的恐惧如此极端以至于人们避免与陌生人交谈，尽管这样做很可能是愉快的体验"
    ],
    "answerHtml": "<strong>【标准参考译文与采分点拆解】</strong><div class='formula-card'>① <strong>主干</strong>：Researchers analysed the frequency and impact of gaps greater than 2 seconds during conversations<br>👉 译文：研究人员分析了交谈过程中超过2秒的停顿的出现频率及其影响，</div><div class='formula-card'>② <strong>状语+定语从句</strong>：including an overview of previous studies which indicate that...<br>👉 译文：其中包括对先前研究的综述，这些研究表明，</div><div class='formula-card'>③ <strong>结果+让步从句</strong>：the fear of awkward silences can be so extreme that people avoid talking to strangers, even though doing so is likely to be an enjoyable experience.<br>👉 译文：对尴尬沉默的恐惧可能会如此极端，以至于人们避免与陌生人交谈，尽管这样做很可能是一次愉快的经历。</div>"
  }
]

现在，请根据我接下来发给你的英语二真题内容，生成对应的完整 JSON 数组：
```
