/**
 * 2022–2026 考研数学二 (110题) · 考研英语二 (240题) 全真题三刷系统
 * 纯原生考场题型作答 + 年份套卷/专题双维筛选 + 英语双语原文阅读 + 三刷进度与错题本
 */

const STORAGE_KEY = "kaoyan_real_exam_2022_2026_v1";
const CUSTOM_QUESTIONS_KEY = "kaoyan_custom_questions_v1";

const SUBJECTS = [
  { id: "math2", name: "📐 考研数学二", badge: "22题×5年=110题" },
  { id: "eng2", name: "🇬🇧 考研英语二", badge: "48题×5年=240题" }
];

const YEARS = [
  { id: "all", name: "全部年份 (2022-2026)", fullRow: true },
  { id: 2026, name: "2026 真题" },
  { id: 2025, name: "2025 真题" },
  { id: 2024, name: "2024 真题" },
  { id: 2023, name: "2023 真题" },
  { id: 2022, name: "2022 真题" }
];

const CHAPTERS_BY_SUBJECT = {
  math2: [
    { id: "all", title: "全部模块与题型" },
    { id: "type_choice", title: "【题型】选择题 (第1–10题)" },
    { id: "type_fill", title: "【题型】填空题 (第11–16题)" },
    { id: "type_solve", title: "【题型】解答题 (第17–22题)" },
    { id: "m_ch1", title: "一、函数、极限、连续" },
    { id: "m_ch2", title: "二、一元函数微分学" },
    { id: "m_ch3", title: "三、一元函数积分学" },
    { id: "m_ch4", title: "四、常微分方程" },
    { id: "m_ch5", title: "五、多元函数微积分" },
    { id: "m_ch6", title: "六、线性代数" }
  ],
  eng2: [
    { id: "all", title: "全部题型 (第1–48题)" },
    { id: "e_ch1", title: "一、完形填空 (第1–20题)" },
    { id: "e_ch2", title: "二、阅读理解 Part A (第21–40题)" },
    { id: "e_ch3", title: "三、新题型 Part B (第41–45题)" },
    { id: "e_ch4", title: "四、英译汉 Section III (第46题)" },
    { id: "e_ch5", title: "五、大小作文 Section IV (第47–48题)" }
  ]
};

// 高频重复记忆速查库（用于「高频速记 & AI导入」标签页）
const HIGH_FREQ_DOCS = {
  math2: [
    {
      title: "一、泰勒展开与等价无穷小替换核心表 (x → 0)",
      items: [
        "sin x = x − <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>6</span></span>x<sup>3</sup> + o(x<sup>3</sup>) &nbsp;|&nbsp; x − sin x ~ <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>6</span></span>x<sup>3</sup>",
        "tan x = x + <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>3</span></span>x<sup>3</sup> + o(x<sup>3</sup>) &nbsp;|&nbsp; tan x − x ~ <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>3</span></span>x<sup>3</sup>",
        "arcsin x = x + <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>6</span></span>x<sup>3</sup> + o(x<sup>3</sup>) &nbsp;|&nbsp; arctan x = x − <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>3</span></span>x<sup>3</sup> + o(x<sup>3</sup>)",
        "1 − cos x ~ <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span>x<sup>2</sup> &nbsp;|&nbsp; cos x = 1 − <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span>x<sup>2</sup> + <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>24</span></span>x<sup>4</sup> + o(x<sup>4</sup>)",
        "ln(1 + x) = x − <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span>x<sup>2</sup> + <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>3</span></span>x<sup>3</sup> + o(x<sup>3</sup>) &nbsp;|&nbsp; x − ln(1+x) ~ <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span>x<sup>2</sup>",
        "e<sup>x</sup> = 1 + x + <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span>x<sup>2</sup> + <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>6</span></span>x<sup>3</sup> + o(x<sup>3</sup>) &nbsp;|&nbsp; (1+x)<sup>α</sup> − 1 ~ αx"
      ]
    },
    {
      title: "二、高数高频定积分公式与几何物理公式",
      items: [
        "点火公式 (Wallis)：∫<sub>0</sub><sup>π/2</sup> sin<sup>n</sup>x dx = ∫<sub>0</sub><sup>π/2</sup> cos<sup>n</sup>x dx = <span class='frac'><span class='frac-num'>n−1</span><span class='frac-den'>n</span></span>·<span class='frac'><span class='frac-num'>n−3</span><span class='frac-den'>n−2</span></span>…（奇乘 1，偶乘 π/2）",
        "曲率与曲率半径：K = <span class='frac'><span class='frac-num'>|y''|</span><span class='frac-den'>(1 + y'<sup>2</sup>)<sup>3/2</sup></span></span>，R = <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>K</span></span>",
        "绕 x 轴旋转体体积：V<sub>x</sub> = π ∫<sub>a</sub><sup>b</sup> y<sup>2</sup>(x) dx &nbsp;|&nbsp; 绕 y 轴柱壳法：V<sub>y</sub> = 2π ∫<sub>a</sub><sup>b</sup> x|y(x)| dx",
        "弧长公式：s = ∫<sub>a</sub><sup>b</sup> √(1 + y'<sup>2</sup>) dx = ∫<sub>α</sub><sup>β</sup> √(x'<sup>2</sup> + y'<sup>2</sup>) dt"
      ]
    },
    {
      title: "三、线性代数必背核心恒等式与秩不等式",
      items: [
        "伴随矩阵：AA<sup>*</sup> = A<sup>*</sup>A = |A|E，|A<sup>*</sup>| = |A|<sup>n−1</sup>，r(A<sup>*</sup>) = n (当 r(A)=n)、1 (当 r(A)=n−1)、0 (当 r(A)&lt;n−1)",
        "矩阵的秩：r(A + B) ≤ r(A) + r(B)；若 AB = O，则 r(A) + r(B) ≤ n；r(A<sup>T</sup>A) = r(A)",
        "特征值性质：∑λ<sub>i</sub> = tr(A)，∏λ<sub>i</sub> = |A|；实对称矩阵不同特征值的特征向量必正交"
      ]
    }
  ],
  eng2: [
    {
      title: "一、完形填空高频逻辑关系词速查",
      items: [
        "让步转折（必考最高频）：however / nevertheless / whereas / while / by contrast / in spite of / despite / albeit",
        "因果推导：therefore / consequently / accordingly / hence / thus / attribute...to... / stem from / result in",
        "例证与递进：for instance / specifically / in particular / moreover / furthermore / in addition"
      ]
    },
    {
      title: "二、阅读理解 Part A 六大题型破题铁律",
      items: [
        "细节题：题干关键词精准定位 → 正确选项必是原文定位句的「同义改写/上下义替换」，原词照抄但篡改逻辑必错",
        "推理题 (infer/imply)：忠于原文字面边界，优先选段落首尾句或转折句的同义概括，切忌主观跨步推演",
        "主旨题 (best title / mainly about)：串联各段首句及全文转折核心词，包含「全文中心词 + 作者态度倾向」者胜出",
        "态度题：正面 (supportive / optimistic / approving)；负面 (critical / skeptical / dubious)；死背绝不选词 (indifferent / biased / puzzled / indulgent)"
      ]
    },
    {
      title: "三、英语二大小作文黄金高分句架",
      items: [
        "小作文开头：I am writing this email on behalf of the Student Union to warmly invite you to... / express my sincere gratitude for...",
        "大作文图表描述 (第1段)：As is vividly depicted in the bar/pie/line chart, the proportion/number of... witnessed a dramatic surge from... in... to... in...",
        "大作文原因剖析 (第2段)：Several primary factors account for this remarkable phenomenon. First and foremost,... Furthermore,...",
        "大作文总结展望 (第3段)：Taking all these factors into consideration, we may safely draw the conclusion that this trend will continue to..."
      ]
    }
  ]
};

let allQuestions = [];
let passagesMap = {};
let appState = {
  activeSubject: "math2",
  activeTab: "practice",       // 'practice' | 'wrong-book' | 'ai-hub'
  activeYear: "all",           // 'all' | 2026 | 2025 | 2024 | 2023 | 2022
  activeChapter: "all",
  passFilter: "all",           // 'all' | 'unfinished' | 'pass0' | 'pass1' | 'pass2' | 'pass3'
  currentQId: "M2026_01",
  dotsCollapsed: false,
  passageState: {
    showZh: false,
    tallMode: false,
    collapsed: false
  },
  records: {},                 // { [qId]: { passes: 0..3, wrongCount: 0, wrongNote: "", resolved: false, lastOpt: null, revealed: false, draft: "" } }
  wrongFilter: "unresolved"
};

function initQuestionBank() {
  passagesMap = window.KAOYAN_PASSAGES || {};
  const baseList = Array.isArray(window.KAOYAN_QUESTIONS) ? window.KAOYAN_QUESTIONS : [];
  let customList = [];
  try {
    const raw = localStorage.getItem(CUSTOM_QUESTIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) customList = parsed;
    }
  } catch (e) {
    console.warn("读取自定义题库失败:", e);
  }
  allQuestions = [...baseList, ...customList];
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      appState = {
        ...appState,
        ...parsed,
        passageState: { ...appState.passageState, ...(parsed.passageState || {}) },
        records: parsed.records || {}
      };
    }
  } catch (e) {
    console.warn("读取本地状态失败:", e);
  }
  allQuestions.forEach((q) => {
    if (!appState.records[q.id]) {
      appState.records[q.id] = {
        passes: 0,
        wrongCount: 0,
        wrongNote: "",
        resolved: false,
        lastOpt: null,
        revealed: false,
        draft: ""
      };
    }
  });
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (e) {
    console.warn("保存状态失败:", e);
  }
}

function getRecord(qId) {
  if (!appState.records[qId]) {
    appState.records[qId] = {
      passes: 0,
      wrongCount: 0,
      wrongNote: "",
      resolved: false,
      lastOpt: null,
      revealed: false,
      draft: ""
    };
  }
  return appState.records[qId];
}

function getSubjectQuestions(subjectId = appState.activeSubject) {
  return allQuestions.filter((q) => q.subject === subjectId);
}

function matchChapterOrType(q, chapterFilter) {
  if (chapterFilter === "all") return true;
  if (chapterFilter === "type_choice") return q.qType === "choice";
  if (chapterFilter === "type_fill") return q.qType === "fill";
  if (chapterFilter === "type_solve") return q.qType === "solve";
  return q.chapter === chapterFilter;
}

function getFilteredQuestions() {
  const list = getSubjectQuestions().filter((q) => {
    const rec = getRecord(q.id);
    if (appState.activeYear !== "all" && Number(q.year) !== Number(appState.activeYear)) {
      return false;
    }
    if (!matchChapterOrType(q, appState.activeChapter)) {
      return false;
    }
    if (appState.passFilter === "unfinished" && rec.passes >= 3) return false;
    if (appState.passFilter === "pass0" && rec.passes !== 0) return false;
    if (appState.passFilter === "pass1" && rec.passes !== 1) return false;
    if (appState.passFilter === "pass2" && rec.passes !== 2) return false;
    if (appState.passFilter === "pass3" && rec.passes < 3) return false;
    return true;
  });

  // 排序：如果选择了具体某一年份，严格按题号 1 -> 22/48 升序；若为全部年份，按年份降序 + 题号升序
  list.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return (a.qNum || 0) - (b.qNum || 0);
  });
  return list;
}

function renderAll() {
  renderSubjectBar();
  renderGlobalHeaderStats();
  renderSidebar();
  renderQuestionDots();
  renderMainStage();
}

function renderSubjectBar() {
  const container = document.getElementById("subject-pills-container");
  if (!container) return;
  container.innerHTML = SUBJECTS.map((s) => {
    const count = getSubjectQuestions(s.id).length;
    const isActive = appState.activeSubject === s.id;
    return `
      <button class="subject-pill ${isActive ? "active" : ""}" onclick="switchSubject('${s.id}')">
        <span>${s.name}</span>
        <span class="sub-badge">${count}题</span>
      </button>
    `;
  }).join("");
}

function switchSubject(subjectId) {
  if (appState.activeSubject === subjectId) return;
  appState.activeSubject = subjectId;
  appState.activeChapter = "all";
  const subQs = getFilteredQuestions();
  if (subQs.length > 0) {
    appState.currentQId = subQs[0].id;
  }
  saveState();
  renderAll();
}

function renderGlobalHeaderStats() {
  const subQs = getSubjectQuestions();
  const total = subQs.length || 1;
  let p1 = 0, p2 = 0, p3 = 0, unresolvedWrong = 0;

  subQs.forEach((q) => {
    const r = getRecord(q.id);
    if (r.passes >= 1) p1++;
    if (r.passes >= 2) p2++;
    if (r.passes >= 3) p3++;
    if (r.wrongCount > 0 && !r.resolved) unresolvedWrong++;
  });

  document.getElementById("stat-pass1").textContent = `${p1}/${total}`;
  document.getElementById("stat-pass2").textContent = `${p2}/${total}`;
  document.getElementById("stat-pass3").textContent = `${p3}/${total}`;
  document.getElementById("wrong-count-badge").textContent = unresolvedWrong;
}

function renderSidebar() {
  const subQs = getSubjectQuestions();

  // 1. 渲染年份套卷列表
  const yearListEl = document.getElementById("year-list");
  if (yearListEl) {
    yearListEl.innerHTML = YEARS.map((yr) => {
      const qs = yr.id === "all" ? subQs : subQs.filter((q) => Number(q.year) === Number(yr.id));
      const done3 = qs.filter((q) => getRecord(q.id).passes >= 3).length;
      const isActive = String(appState.activeYear) === String(yr.id);
      return `
        <div class="year-item ${yr.fullRow ? "full-row" : ""} ${isActive ? "active" : ""}" onclick="setYearFilter('${yr.id}')">
          <span>${yr.name}</span>
          <span class="chapter-meta">${done3}/${qs.length}★</span>
        </div>
      `;
    }).join("");
  }

  // 2. 渲染考点/题型模块列表
  const chapterListEl = document.getElementById("chapter-list");
  if (chapterListEl) {
    const chapters = CHAPTERS_BY_SUBJECT[appState.activeSubject] || [];
    const basePool = appState.activeYear === "all"
      ? subQs
      : subQs.filter((q) => Number(q.year) === Number(appState.activeYear));

    chapterListEl.innerHTML = chapters.map((ch) => {
      const qs = basePool.filter((q) => matchChapterOrType(q, ch.id));
      const done3 = qs.filter((q) => getRecord(q.id).passes >= 3).length;
      const isActive = appState.activeChapter === ch.id;
      return `
        <div class="chapter-item ${isActive ? "active" : ""}" onclick="setChapterFilter('${ch.id}')">
          <span>${ch.title}</span>
          <span class="chapter-meta"><span>${done3}/${qs.length}★</span></span>
        </div>
      `;
    }).join("");
  }

  // 3. 刷次筛选高亮
  document.querySelectorAll("[data-pass-filter]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-pass-filter") === appState.passFilter);
  });
}

function setYearFilter(yrId) {
  appState.activeYear = yrId === "all" ? "all" : Number(yrId);
  const filtered = getFilteredQuestions();
  if (filtered.length > 0 && !filtered.some((q) => q.id === appState.currentQId)) {
    appState.currentQId = filtered[0].id;
  }
  saveState();
  renderAll();
}

function setChapterFilter(chId) {
  appState.activeChapter = chId;
  const filtered = getFilteredQuestions();
  if (filtered.length > 0 && !filtered.some((q) => q.id === appState.currentQId)) {
    appState.currentQId = filtered[0].id;
  }
  saveState();
  renderAll();
}

function setPassFilter(filterVal) {
  appState.passFilter = filterVal;
  const filtered = getFilteredQuestions();
  if (filtered.length > 0 && !filtered.some((q) => q.id === appState.currentQId)) {
    appState.currentQId = filtered[0].id;
  }
  saveState();
  renderAll();
}

function toggleDotsCollapse() {
  appState.dotsCollapsed = !appState.dotsCollapsed;
  saveState();
  renderQuestionDots();
}

function renderQuestionDots() {
  const stripCard = document.getElementById("question-strip-card");
  if (appState.activeTab !== "practice") {
    stripCard.style.display = "none";
    return;
  }
  stripCard.style.display = "block";

  const filtered = getFilteredQuestions();
  const labelEl = document.getElementById("filtered-count-label");
  const yearBadge = appState.activeYear === "all" ? "2022–2026全真题" : `${appState.activeYear}年真题套卷`;
  labelEl.textContent = `📋 ${yearBadge} · 当前筛选共 ${filtered.length} 题`;

  const toggleBtn = document.getElementById("toggle-dots-btn");
  const grid = document.getElementById("question-dots-grid");
  if (toggleBtn) {
    toggleBtn.textContent = appState.dotsCollapsed ? "展开题号卡 ▼" : "收起题号卡 ▲";
  }
  if (appState.dotsCollapsed) {
    grid.style.display = "none";
    return;
  }
  grid.style.display = "flex";

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="font-size:13px;color:var(--text-muted);padding:4px 0;">当前筛选条件下暂无题目，请切换左侧年份或刷次筛选。</div>`;
    return;
  }

  grid.innerHTML = filtered.map((q) => {
    const rec = getRecord(q.id);
    const isCurrent = q.id === appState.currentQId;
    const hasWrong = rec.wrongCount > 0 && !rec.resolved;
    const stars = "★".repeat(rec.passes) + "☆".repeat(3 - rec.passes);
    // 如果选了单一年份，直接显示 第 1..48 题号；如果是全部年份，显示 26-01
    const shortLabel = appState.activeYear === "all"
      ? `${String(q.year).slice(2)}-${String(q.qNum).padStart(2, "0")}`
      : `${q.qNum}`;
    return `
      <button
        class="q-dot pass-${rec.passes} ${isCurrent ? "current" : ""} ${hasWrong ? "has-wrong" : ""}"
        title="${q.title}"
        onclick="selectQuestion('${q.id}')"
      >
        <span>${shortLabel}</span>
        <span class="q-dot-stars">${stars}</span>
      </button>
    `;
  }).join("");
}

function selectQuestion(qId) {
  appState.currentQId = qId;
  saveState();
  renderQuestionDots();
  renderMainStage();
}

function switchTab(tabName) {
  appState.activeTab = tabName;
  document.querySelectorAll(".nav-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
  });

  const appContainer = document.querySelector(".app-container");
  const leftSidebar = document.getElementById("left-sidebar");
  if (tabName === "practice") {
    appContainer.classList.remove("single-col");
    leftSidebar.style.display = "block";
  } else {
    appContainer.classList.add("single-col");
    leftSidebar.style.display = "none";
  }

  saveState();
  renderQuestionDots();
  renderMainStage();
}

function renderMainStage() {
  const container = document.getElementById("main-view-content");
  if (appState.activeTab === "practice") {
    renderPracticeCard(container);
  } else if (appState.activeTab === "wrong-book") {
    renderWrongBookView(container);
  } else if (appState.activeTab === "ai-hub") {
    renderAiHubView(container);
  }
}

/* ==========================================================================
   核心视图 1：2022–2026 真题原生刷题面板
   ========================================================================== */
function renderPracticeCard(container) {
  const filtered = getFilteredQuestions();
  let q = filtered.find((item) => item.id === appState.currentQId);
  if (!q && filtered.length > 0) {
    q = filtered[0];
    appState.currentQId = q.id;
  }

  if (!q) {
    container.innerHTML = `
      <div class="question-card" style="text-align:center;padding:48px 20px;">
        <h3 style="margin-bottom:8px;">🎉 当前筛选条件下没有待刷真题</h3>
        <p style="color:var(--text-muted);font-size:14px;margin-bottom:16px;">您可以切换左侧「真题年份」或点击下方按钮查看全部真题。</p>
        <button class="btn btn-primary" onclick="setPassFilter('all')">显示全部真题</button>
      </div>
    `;
    return;
  }

  const rec = getRecord(q.id);
  const chList = CHAPTERS_BY_SUBJECT[q.subject] || [];
  const chObj = chList.find((c) => c.id === q.chapter);
  const typeBadge = q.qType === "choice"
    ? { label: "客观选择题", cls: "tag-type-term" }
    : q.qType === "fill"
    ? { label: "客观填空题", cls: "tag-type-short" }
    : { label: "主观解答 / 译写题", cls: "tag-type-calc" };

  const currentIdx = filtered.findIndex((item) => item.id === q.id);
  const prevQ = currentIdx > 0 ? filtered[currentIdx - 1] : null;
  const nextQ = currentIdx < filtered.length - 1 ? filtered[currentIdx + 1] : null;

  const starHtml = [1, 2, 3].map((lvl) => {
    const filled = rec.passes >= lvl ? `filled-${rec.passes}` : "";
    return `<span class="star-icon ${filled}">★</span>`;
  }).join("");

  const passStatusText =
    rec.passes === 0 ? "0刷 (未掌握)" :
    rec.passes === 1 ? "一刷已过 ★☆☆" :
    rec.passes === 2 ? "二刷已过 ★★☆" : "三刷通关 ★★★";

  // 英语二原文阅读框（若有 passageId）
  const passageHtml = q.passageId && passagesMap[q.passageId]
    ? renderPassagePanel(q, passagesMap[q.passageId])
    : "";

  // 根据题型渲染考场原生作答区
  let interactionHtml = "";
  if (q.qType === "choice") {
    interactionHtml = renderChoiceQuestionBody(q, rec);
  } else if (q.qType === "fill") {
    interactionHtml = renderFillQuestionBody(q, rec);
  } else {
    interactionHtml = renderSolveQuestionBody(q, rec);
  }

  container.innerHTML = `
    <div class="question-card">
      <div class="q-card-header">
        <div>
          <div class="q-tags">
            <span class="q-tag" style="background:#1e40af;color:#fff;">${q.year}年真题 · 第${q.qNum}题</span>
            <span class="q-tag tag-chapter">${chObj ? chObj.title : q.chapter}</span>
            <span class="q-tag ${typeBadge.cls}">${typeBadge.label}</span>
            ${q.kp ? `<span class="q-tag" style="background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;">考点：${q.kp}</span>` : ""}
          </div>
          <h2 class="q-title">${q.title}</h2>
        </div>

        <div class="pass-controller">
          <div class="pass-stars-badge" title="每做对/掌握1遍自动点亮1颗星，满3颗星即完成三刷">
            <div>${starHtml}</div>
            <span>${passStatusText}</span>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
            ${rec.passes < 3 ? `<button class="btn btn-outline btn-xs" onclick="manualAddPass('${q.id}')">➕ 记入本遍通过 (+1★)</button>` : ""}
            ${rec.passes > 0 ? `<button class="btn btn-outline btn-xs" onclick="resetQuestionPasses('${q.id}')">重置刷次</button>` : ""}
          </div>
        </div>
      </div>

      ${passageHtml}

      <!-- 真题题干 -->
      <div class="q-prompt-box">
        ${q.stem}
      </div>

      <!-- 原生考场交互区 -->
      <div id="stage-Dynamic-Area">
        ${interactionHtml}
      </div>

      <!-- 底部上下题导航与错题本按钮 -->
      <div class="btn-row" style="border-top:1px solid var(--border-light);padding-top:16px;margin-top:22px;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-outline" ${!prevQ ? "disabled style='opacity:0.45;cursor:not-allowed;'" : `onclick="selectQuestion('${prevQ.id}')"`}>
            ⬅️ 上一题 ${prevQ ? `(第${prevQ.qNum}题)` : ""}
          </button>
          <button class="btn btn-outline" ${!nextQ ? "disabled style='opacity:0.45;cursor:not-allowed;'" : `onclick="selectQuestion('${nextQ.id}')"`}>
            下一题 ${nextQ ? `(第${nextQ.qNum}题)` : ""} ➡️
          </button>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-danger btn-sm" onclick="addQuestionToWrongBook('${q.id}', '手动加入重点复盘')">
            📕 加入错题本 ${rec.wrongCount > 0 && !rec.resolved ? `(已记错 ${rec.wrongCount} 次)` : ""}
          </button>
        </div>
      </div>
    </div>
  `;
}

/* 英语二原文双语阅读框 */
function renderPassagePanel(q, passage) {
  const ps = appState.passageState;
  if (ps.collapsed) {
    return `
      <div class="passage-panel">
        <div class="passage-header">
          <div class="passage-title">📖 ${passage.title}（已折叠）</div>
          <button class="btn btn-outline btn-xs" onclick="togglePassageState('collapsed')">👁️ 展开原文阅读面板</button>
        </div>
      </div>
    `;
  }

  // 对完形填空 (1-20题) 自动高亮当前题号空格
  let formattedEn = (passage.en || "").replace(/\n/g, "<br>");
  if (q.qNum >= 1 && q.qNum <= 20) {
    const blankRegex = new RegExp(`(\\b${q.qNum}\\b)(?=\\s*[A-Za-z,\\.;—\\-\\)]|\\s*<br>)`, "g");
    let replaced = false;
    formattedEn = formattedEn.replace(blankRegex, (m) => {
      if (!replaced) {
        replaced = true;
        return `<span class="cloze-active-blank">[第 ${q.qNum} 空]</span>`;
      }
      return m;
    });
  }

  const formattedZh = (passage.zh || "").replace(/\n/g, "<br>");

  return `
    <div class="passage-panel">
      <div class="passage-header">
        <div class="passage-title">
          <span>📖 ${passage.title}</span>
          <span style="font-size:11.5px;color:var(--text-muted);font-weight:500;">（支持上下滚动 · 做同篇阅读时无需重复翻页）</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn ${ps.showZh ? "btn-primary" : "btn-outline"} btn-xs" onclick="togglePassageState('showZh')">
            🇨🇳 ${ps.showZh ? "隐藏全文译文" : "对照全文译文"}
          </button>
          <button class="btn btn-outline btn-xs" onclick="togglePassageState('tallMode')">
            ↕️ ${ps.tallMode ? "标准高度" : "加高阅读框"}
          </button>
          <button class="btn btn-outline btn-xs" onclick="togglePassageState('collapsed')">
            收起原文 ▲
          </button>
        </div>
      </div>
      <div class="passage-body ${ps.tallMode ? "tall" : ""}">
        <div>${formattedEn}</div>
        ${ps.showZh && formattedZh ? `
          <div class="passage-zh-block">
            <div style="font-weight:700;color:var(--primary);margin-bottom:6px;">【全文参考译文 / 候选项详解】</div>
            ${formattedZh}
          </div>
        ` : ""}
      </div>
    </div>
  `;
}

function togglePassageState(key) {
  appState.passageState[key] = !appState.passageState[key];
  saveState();
  renderMainStage();
}

/* 1. 客观选择题作答区（数二 1–10 题、英二 1–45 题） */
function renderChoiceQuestionBody(q, rec) {
  const options = Array.isArray(q.options) ? q.options : ["A", "B", "C", "D"];
  const answered = rec.lastOpt !== null && rec.lastOpt !== undefined;
  const isRevealed = answered || rec.revealed;
  const correctLetter = String(q.answer || "A").trim().toUpperCase().charAt(0);

  // 如果是新题型 A-G 短选项，使用网格紧凑排布
  const isShortLetters = options.length > 4 && options.every((o) => o.trim().length <= 3);

  const optionsHtml = options.map((optStr, idx) => {
    const letter = ["A", "B", "C", "D", "E", "F", "G"][idx] || String(idx);
    // 剥离选项开头自带的 "A. " 或 "[A] " 避免重复显示字母圆圈
    const cleanText = String(optStr).replace(/^(?:\[\s*[A-G]\s*\]|[A-G][\.\、\s])\s*/i, "").trim();

    let stateCls = "";
    if (isRevealed) {
      if (letter === correctLetter) {
        stateCls = "correct";
      } else if (rec.lastOpt === letter) {
        stateCls = "wrong";
      }
    }

    return `
      <button class="mcq-option ${stateCls}" onclick="submitChoiceOption('${q.id}', '${letter}')">
        <span class="option-letter">${letter}</span>
        <span style="flex:1;">${cleanText || letter}</span>
      </button>
    `;
  }).join("");

  return `
    <div>
      ${answered ? `
        <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-subtle);padding:8px 14px;border-radius:8px;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
          <span style="font-size:13.5px;font-weight:600;color:${rec.lastOpt === correctLetter ? "var(--success)" : "var(--danger)"};">
            ${rec.lastOpt === correctLetter
              ? `✅ 本遍回答正确（您选了 ${rec.lastOpt}）！当前已完成 ${rec.passes}/3 刷`
              : `❌ 本遍回答有误（您选了 ${rec.lastOpt}，正确答案为 ${correctLetter}），已记入错题本`}
          </span>
          <button class="btn btn-primary btn-xs" onclick="retryQuestionForNextPass('${q.id}')">
            🔄 再刷一遍（遮挡答案冲击下一刷）
          </button>
        </div>
      ` : ""}

      <div class="mcq-options" style="${isShortLetters ? "display:grid;grid-template-columns:repeat(auto-fit,minmax(95px,1fr));" : ""}">
        ${optionsHtml}
      </div>

      ${!isRevealed ? `
        <div style="display:flex;gap:10px;">
          <button class="btn btn-outline btn-sm" onclick="revealAnswerOnly('${q.id}')">👁️ 直接看答案与详尽解析</button>
        </div>
      ` : renderAnalysisAndTipsBox(q, rec)}
    </div>
  `;
}

function submitChoiceOption(qId, chosenLetter) {
  const q = allQuestions.find((item) => item.id === qId);
  if (!q) return;
  const rec = getRecord(qId);
  const correctLetter = String(q.answer || "A").trim().toUpperCase().charAt(0);

  // 如果已经选过，点击选项直接允许重新作答判分
  const wasAlreadyAnswered = rec.lastOpt !== null && rec.lastOpt !== undefined;
  rec.lastOpt = chosenLetter;
  rec.revealed = true;

  if (chosenLetter === correctLetter) {
    if (!wasAlreadyAnswered && rec.passes < 3) {
      rec.passes += 1;
    }
  } else {
    rec.wrongCount += 1;
    rec.resolved = false;
  }

  saveState();
  renderGlobalHeaderStats();
  renderSidebar();
  renderQuestionDots();
  renderMainStage();
}

function retryQuestionForNextPass(qId) {
  const rec = getRecord(qId);
  rec.lastOpt = null;
  rec.revealed = false;
  saveState();
  renderMainStage();
}

function revealAnswerOnly(qId) {
  const rec = getRecord(qId);
  rec.revealed = true;
  saveState();
  renderMainStage();
}

/* 2. 客观填空题作答区（数二 11–16 题） */
function renderFillQuestionBody(q, rec) {
  return `
    <div>
      <div class="fill-answer-box">
        <div style="font-size:13.5px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">
          ✍️ 请在草稿纸上算出结果后填入下方（或直接点击核对标准答案）：
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
          <input
            type="text"
            class="step-num-input"
            style="flex:1;min-width:220px;"
            placeholder="在此输入您的计算结果（支持分式如 3π/2、31e 等）..."
            value="${escapeHtml(rec.draft || "")}"
            oninput="saveQuestionDraft('${q.id}', this.value)"
          />
          <button class="btn btn-primary" onclick="revealAnswerOnly('${q.id}')">
            🔍 核对标准答案 & 展开解析
          </button>
          ${rec.revealed ? `
            <button class="btn btn-outline btn-sm" onclick="retryQuestionForNextPass('${q.id}')">
              🙈 隐藏答案重做
            </button>
          ` : ""}
        </div>
      </div>

      ${rec.revealed ? `
        <div style="background:#eff6ff;border:1.5px solid #93c5fd;border-radius:10px;padding:14px 16px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <div>
            <span style="font-size:13px;font-weight:700;color:#1e40af;">【标准答案】</span>
            <span style="font-size:16px;font-weight:800;color:#0f172a;margin-left:8px;">${q.answer}</span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-success btn-sm" onclick="gradeSelfSubjective('${q.id}', true)">
              ✅ 我算对了（刷次 +1★，当前 ${rec.passes}/3）
            </button>
            <button class="btn btn-danger btn-sm" onclick="gradeSelfSubjective('${q.id}', false)">
              ❌ 算错了（记入错题本）
            </button>
          </div>
        </div>
        ${renderAnalysisAndTipsBox(q, rec)}
      ` : ""}
    </div>
  `;
}

/* 3. 主观解答题 / 英译汉 / 大小作文作答区（数二 17–22 题、英二 46–48 题） */
function renderSolveQuestionBody(q, rec) {
  const placeholderText = q.subject === "math2"
    ? "可在现实草稿纸上推导，也可在此记录关键方程、换元步骤或最终结果..."
    : q.qNum === 46
    ? "请在此输入您的中文翻译草稿（完成后点击下方按钮对照标准参考译文与采分点）..."
    : "请在此输入您的作文提纲、核心句或完整习作（完成后点击下方按钮对照高分范文）...";

  return `
    <div>
      <div class="recall-area">
        <textarea
          class="recall-textarea"
          placeholder="${placeholderText}"
          oninput="saveQuestionDraft('${q.id}', this.value)"
        >${escapeHtml(rec.draft || "")}</textarea>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
          <button class="btn btn-primary" onclick="revealAnswerOnly('${q.id}')">
            👁️ 展开标准答案、步骤详解与高分范文
          </button>
          ${rec.revealed ? `
            <button class="btn btn-outline btn-sm" onclick="retryQuestionForNextPass('${q.id}')">
              🙈 收起答案重新演练
            </button>
          ` : ""}
        </div>
      </div>

      ${rec.revealed ? `
        <div style="background:#eff6ff;border:1.5px solid #93c5fd;border-radius:10px;padding:14px 16px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <div style="flex:1;min-width:240px;">
            <span style="font-size:13px;font-weight:700;color:#1e40af;">【核心答案 / 译文概览】</span>
            <span style="font-size:14.5px;font-weight:700;color:#0f172a;margin-left:6px;">${q.answer}</span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-success btn-sm" onclick="gradeSelfSubjective('${q.id}', true)">
              ✅ 本遍已掌握（刷次 +1★，当前 ${rec.passes}/3）
            </button>
            <button class="btn btn-danger btn-sm" onclick="gradeSelfSubjective('${q.id}', false)">
              ❌ 步骤卡壳 / 未掌握（记入错题本）
            </button>
          </div>
        </div>
        ${renderAnalysisAndTipsBox(q, rec)}
      ` : ""}
    </div>
  `;
}

function renderAnalysisAndTipsBox(q, rec) {
  return `
    ${(q.tips || q.kp) ? `
      <div class="tips-kp-panel" style="margin-top:14px;">
        <div class="tips-box">
          <strong>🎯 考场破题技巧：</strong><br>
          ${q.tips || "先审清题干核心条件，结合标准解析复盘关键步骤。"}
        </div>
        <div class="kp-box">
          <strong>📚 关联核心考点：</strong>
          <div style="margin-top:6px;font-weight:600;">${q.kp || "考研核心常考题型"}</div>
        </div>
      </div>
    ` : ""}

    <div class="explanation-panel">
      <div class="explanation-title">
        <span>📖 真题权威精解与步骤推导</span>
        <span>正确答案：<strong>${q.answer}</strong></span>
      </div>
      <div class="explanation-body">${q.analysis}</div>
    </div>
  `;
}

function saveQuestionDraft(qId, val) {
  const rec = getRecord(qId);
  rec.draft = val;
  saveState();
}

function gradeSelfSubjective(qId, isCorrect) {
  const rec = getRecord(qId);
  rec.revealed = true;
  if (isCorrect) {
    if (rec.passes < 3) rec.passes += 1;
  } else {
    rec.wrongCount += 1;
    rec.resolved = false;
  }
  saveState();
  renderGlobalHeaderStats();
  renderSidebar();
  renderQuestionDots();
  renderMainStage();
}

function manualAddPass(qId) {
  const rec = getRecord(qId);
  if (rec.passes < 3) {
    rec.passes += 1;
    saveState();
    renderAll();
  }
}

function resetQuestionPasses(qId) {
  const rec = getRecord(qId);
  rec.passes = 0;
  rec.lastOpt = null;
  rec.revealed = false;
  saveState();
  renderAll();
}

function addQuestionToWrongBook(qId, reason) {
  const rec = getRecord(qId);
  rec.wrongCount += 1;
  rec.resolved = false;
  if (!rec.wrongNote) rec.wrongNote = reason;
  saveState();
  renderGlobalHeaderStats();
  renderQuestionDots();
  renderMainStage();
}

/* ==========================================================================
   核心视图 2：错题本与薄弱真题复盘 (Wrong Question Book)
   ========================================================================== */
function renderWrongBookView(container) {
  const wrongQs = getSubjectQuestions().filter((q) => {
    const r = getRecord(q.id);
    if (r.wrongCount <= 0) return false;
    if (appState.wrongFilter === "unresolved") return !r.resolved;
    return true;
  });

  container.innerHTML = `
    <div class="question-card">
      <div class="q-card-header">
        <div>
          <h2 class="q-title">📕 真题错题本与薄弱点复盘</h2>
          <p style="font-size:13.5px;color:var(--text-muted);margin-top:4px;">
            做错的选择题或自评未掌握的填空/解答题会自动收录至此，支持记录错因并一键跳回原题二刷、三刷。
          </p>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <button class="filter-chip ${appState.wrongFilter === "unresolved" ? "active" : ""}" onclick="setWrongFilter('unresolved')">
            待攻克 (${getSubjectQuestions().filter((q) => getRecord(q.id).wrongCount > 0 && !getRecord(q.id).resolved).length})
          </button>
          <button class="filter-chip ${appState.wrongFilter === "all" ? "active" : ""}" onclick="setWrongFilter('all')">
            全部历史错题 (${getSubjectQuestions().filter((q) => getRecord(q.id).wrongCount > 0).length})
          </button>
        </div>
      </div>

      ${wrongQs.length === 0 ? `
        <div style="text-align:center;padding:42px 20px;color:var(--text-muted);">
          <div style="font-size:36px;margin-bottom:8px;">🎉</div>
          <div style="font-size:15px;font-weight:600;color:var(--text-secondary);">当前没有待攻克的错题！</div>
          <p style="font-size:13px;margin-top:4px;">继续保持，去完成剩余真题的一刷、二刷和三刷吧。</p>
        </div>
      ` : `
        <div class="wrong-book-container">
          ${wrongQs.map((q) => {
            const r = getRecord(q.id);
            return `
              <div class="wrong-item-card ${r.resolved ? "resolved" : ""}">
                <div class="wrong-meta-bar">
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <span class="badge-pill badge-danger">累计错 ${r.wrongCount} 次</span>
                    <span class="badge-pill badge-primary">当前 ${r.passes}/3 刷</span>
                    <strong>${q.title}</strong>
                  </div>
                  <div style="display:flex;gap:8px;">
                    <button class="btn btn-primary btn-sm" onclick="jumpToWrongQuestion('${q.id}')">
                      🎯 跳回原真题重刷
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="toggleResolveWrong('${q.id}')">
                      ${r.resolved ? "↩️ 重新标记未掌握" : "✅ 标记已彻底消灭"}
                    </button>
                  </div>
                </div>
                <div style="font-size:14px;color:var(--text-secondary);margin-bottom:8px;">
                  <strong>题干：</strong>${q.stem}
                </div>
                <div style="font-size:13.5px;color:#065f46;background:#ecfdf5;padding:10px 12px;border-radius:6px;border:1px solid #a7f3d0;">
                  <strong>【标准答案】${q.answer}</strong><br>
                  ${q.analysis}
                </div>
                <input
                  type="text"
                  class="wrong-note-input"
                  placeholder="✍️ 记录错因心得（如：等价无穷小阶数不够 / 被强干扰项偷换概念误导）..."
                  value="${escapeHtml(r.wrongNote || "")}"
                  onchange="saveWrongNote('${q.id}', this.value)"
                />
              </div>
            `;
          }).join("")}
        </div>
      `}
    </div>
  `;
}

function setWrongFilter(val) {
  appState.wrongFilter = val;
  renderMainStage();
}

function jumpToWrongQuestion(qId) {
  const q = allQuestions.find((item) => item.id === qId);
  if (q) {
    appState.activeSubject = q.subject;
    appState.activeYear = "all";
    appState.activeChapter = "all";
    appState.passFilter = "all";
  }
  appState.currentQId = qId;
  switchTab("practice");
}

function toggleResolveWrong(qId) {
  const r = getRecord(qId);
  r.resolved = !r.resolved;
  saveState();
  renderGlobalHeaderStats();
  renderQuestionDots();
  renderMainStage();
}

function saveWrongNote(qId, text) {
  const r = getRecord(qId);
  r.wrongNote = text;
  saveState();
}

/* ==========================================================================
   核心视图 3：高频重复记忆总结文档 & 外部 AI 题库导入中心
   ========================================================================== */
function renderAiHubView(container) {
  const docs = HIGH_FREQ_DOCS[appState.activeSubject] || HIGH_FREQ_DOCS.math2;

  const aiPromptTemplate = `你现在是考研命题专家（考研数学二 / 考研英语二）。请将我发给你的真题或讲义解析，整理为以下可直接导入刷题网页的 JSON 数组格式（严禁输出任何原始 LaTeX 反斜杠代码如 \\frac 或 $，分式统一使用 <span class="frac"><span class="frac-num">分子</span><span class="frac-den">分母</span></span>，上下标使用 <sup> 和 <sub>）：

[
  {
    "id": "CUSTOM_${Date.now().toString().slice(-4)}_01",
    "subject": "${appState.activeSubject}",
    "year": 2026,
    "qNum": 1,
    "qType": "choice",
    "chapter": "${appState.activeSubject === "math2" ? "m_ch1" : "e_ch2"}",
    "title": "真题或模拟题标题",
    "stem": "题干完整 HTML 内容",
    "options": ["A. 选项A", "B. 选项B", "C. 选项C", "D. 选项D"],
    "answer": "A",
    "analysis": "详尽步骤解析 HTML",
    "tips": "考场秒杀与破题技巧",
    "kp": "核心考点名称"
  }
]`;

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:20px;">
      <div class="question-card">
        <div class="q-card-header">
          <div>
            <h2 class="q-title">📚 2022–2026 必背高频重复知识点总结 (${appState.activeSubject === "math2" ? "考研数学二" : "考研英语二"})</h2>
            <p style="font-size:13.5px;color:var(--text-muted);margin-top:4px;">
              提炼近五年真题中反复出现的公式、定理与破题母模版，刷题卡壳时随时对照。
            </p>
          </div>
        </div>
        <div class="kp-grid">
          ${docs.map((sec) => `
            <div class="kp-summary-card">
              <div>
                <h3 style="font-size:15px;color:var(--primary);margin-bottom:8px;">${sec.title}</h3>
                <ul style="padding-left:18px;font-size:13.5px;color:var(--text-secondary);line-height:1.8;">
                  ${sec.items.map((it) => `<li style="margin-bottom:6px;">${it}</li>`).join("")}
                </ul>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="question-card">
        <div class="q-card-header">
          <div>
            <h2 class="q-title">🤖 外部 AI 扩展题库一键接入中心</h2>
            <p style="font-size:13.5px;color:var(--text-muted);margin-top:4px;">
              如果您有其他年份真题、模拟卷（如李林6+4、张宇8+4）或错题讲义，复制下方提示词发给任意 AI，将生成的 JSON 粘贴至下方即可并入本系统刷题。
            </p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="copyAiPrompt()">📋 一键复制 AI 转换提示词</button>
        </div>

        <pre class="prompt-code-box" id="ai-prompt-box">${escapeHtml(aiPromptTemplate)}</pre>

        <div style="margin-top:16px;">
          <div style="font-size:13.5px;font-weight:700;margin-bottom:6px;">📥 粘贴外部 AI 生成的 JSON 数组并导入题库：</div>
          <textarea
            id="json-import-input"
            class="json-import-textarea"
            placeholder='在此粘贴以 [ 开头、以 ] 结尾的 JSON 数组...'
          ></textarea>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <button class="btn btn-success" onclick="importCustomJsonQuestions()">➕ 立即校验并导入题库</button>
            <button class="btn btn-danger btn-sm" onclick="clearCustomJsonQuestions()">🗑️ 清空外部扩展题目</button>
            <span id="json-import-msg" style="font-size:13px;font-weight:600;"></span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function copyAiPrompt() {
  const box = document.getElementById("ai-prompt-box");
  if (!box) return;
  navigator.clipboard.writeText(box.textContent).then(() => {
    alert("✅ 已复制 AI 提示词！可直接发给任意 AI 生成扩展题库。");
  });
}

function importCustomJsonQuestions() {
  const input = document.getElementById("json-import-input");
  const msgEl = document.getElementById("json-import-msg");
  if (!input || !msgEl) return;
  try {
    let raw = input.value.trim();
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length === 0) {
      throw new Error("顶层必须是包含至少 1 道题目的非空 JSON 数组 [...]");
    }
    const existingRaw = localStorage.getItem(CUSTOM_QUESTIONS_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    const merged = [...existing, ...arr];
    localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(merged));
    initQuestionBank();
    loadState();
    renderAll();
    msgEl.style.color = "var(--success)";
    msgEl.textContent = `🎉 成功导入 ${arr.length} 道题目！`;
    input.value = "";
  } catch (e) {
    msgEl.style.color = "var(--danger)";
    msgEl.textContent = `❌ JSON 解析失败：${e.message}`;
  }
}

function clearCustomJsonQuestions() {
  localStorage.removeItem(CUSTOM_QUESTIONS_KEY);
  initQuestionBank();
  loadState();
  renderAll();
  const msgEl = document.getElementById("json-import-msg");
  if (msgEl) {
    msgEl.style.color = "var(--primary)";
    msgEl.textContent = "已清空外部扩展题目，恢复 350 道内置真题。";
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

window.addEventListener("DOMContentLoaded", () => {
  initQuestionBank();
  loadState();
  renderAll();
});
