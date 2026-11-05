/**
 * 2022–2026 考研真题三刷系统 · 支持多口令独立空间 & AI 生成 JSON 自动建题库（私人/公开权限）
 */

const STORAGE_KEY_PREFIX = "kaoyan_user_state_v2_";
const ACTIVE_SYNC_ID_KEY = "kaoyan_active_sync_id_v2";
const RECENT_SYNC_IDS_KEY = "kaoyan_recent_sync_ids_v2";
const LEGACY_STORAGE_KEY = "kaoyan_real_exam_2022_2026_v1";

const PRIVATE_BANKS_KEY_PREFIX = "kaoyan_private_banks_v2_";
const PUBLIC_BANKS_CACHE_KEY = "kaoyan_public_banks_cache_v2";

// 云端全局中心（存储口令->私有仓库映射 + 公开共享题库列表）
const GLOBAL_HUB_VAULT_ID = "ff808181a09d98f701a1ab80eeaf416b";
const DEFAULT_VAULT_MAP = {
  lidahai4445: "ff808181a09d98f701a1aae7d2593f3d"
};

const BASE_SUBJECTS = [
  { id: "math2", name: "📐 考研数学二", isBuiltin: true },
  { id: "eng2", name: "🇬🇧 考研英语二", isBuiltin: true }
];

const BASE_YEARS = [
  { id: "all", name: "全部年份 (2022-2026)", fullRow: true },
  { id: 2026, name: "2026 真题" },
  { id: 2025, name: "2025 真题" },
  { id: 2024, name: "2024 真题" },
  { id: 2023, name: "2023 真题" },
  { id: 2022, name: "2022 真题" }
];

const BASE_CHAPTERS_BY_SUBJECT = {
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
let privateBanks = []; // 当前口令专属的私人题库列表
let publicBanks = [];  // 全站公开共享题库列表

let appState = {
  syncId: "",
  updatedAt: 0,
  activeSubject: "math2",
  activeTab: "practice",
  activeYear: "all",
  activeChapter: "all",
  passFilter: "all",
  currentQId: "M2026_01",
  dotsCollapsed: false,
  passageState: {
    showZh: false,
    tallMode: false,
    collapsed: false
  },
  records: {},
  wrongFilter: "unresolved"
};

function normalizeSyncId(rawId) {
  return String(rawId || "").trim().toLowerCase();
}

function touchRecord(rec) {
  const now = Date.now();
  rec.u = now;
  appState.updatedAt = now;
}

function getStorageKeyForSyncId(syncId) {
  const clean = normalizeSyncId(syncId) || "guest";
  return `${STORAGE_KEY_PREFIX}${clean}`;
}

function getPrivateBanksKeyForSyncId(syncId) {
  const clean = normalizeSyncId(syncId) || "guest";
  return `${PRIVATE_BANKS_KEY_PREFIX}${clean}`;
}

function loadCustomBanksForCurrentUser() {
  const cleanId = normalizeSyncId(appState.syncId);
  // 1. 读取当前口令专属私人题库
  privateBanks = [];
  if (cleanId) {
    try {
      const rawPriv = localStorage.getItem(getPrivateBanksKeyForSyncId(cleanId));
      if (rawPriv) {
        const parsed = JSON.parse(rawPriv);
        if (Array.isArray(parsed)) privateBanks = parsed;
      }
    } catch (e) {
      console.warn("读取私人题库失败:", e);
    }
  }
  // 2. 读取公开共享题库本地缓存
  publicBanks = [];
  try {
    const rawPub = localStorage.getItem(PUBLIC_BANKS_CACHE_KEY);
    if (rawPub) {
      const parsed = JSON.parse(rawPub);
      if (Array.isArray(parsed)) publicBanks = parsed;
    }
  } catch (e) {
    console.warn("读取公开题库缓存失败:", e);
  }
}

function savePrivateBanksLocal() {
  const cleanId = normalizeSyncId(appState.syncId);
  if (!cleanId) return;
  try {
    localStorage.setItem(getPrivateBanksKeyForSyncId(cleanId), JSON.stringify(privateBanks));
  } catch (e) {
    console.warn("保存私人题库失败:", e);
  }
}

function savePublicBanksLocal() {
  try {
    localStorage.setItem(PUBLIC_BANKS_CACHE_KEY, JSON.stringify(publicBanks));
  } catch (e) {
    console.warn("保存公开题库缓存失败:", e);
  }
}

// 获取当前用户可见的所有自定义题库（当前口令的私人题库 + 所有公开题库，按 id 去重）
function getVisibleCustomBanks() {
  const cleanId = normalizeSyncId(appState.syncId);
  const map = new Map();
  // 先放公开题库
  publicBanks.forEach((b) => {
    if (b && b.id && Array.isArray(b.questions)) {
      map.set(b.id, { ...b, visibility: "public" });
    }
  });
  // 再放当前口令的私人题库（仅当 ownerSyncId === cleanId 时可见，不区分大小写）
  if (cleanId) {
    privateBanks.forEach((b) => {
      if (b && b.id && Array.isArray(b.questions) && (!b.ownerSyncId || normalizeSyncId(b.ownerSyncId) === cleanId)) {
        map.set(b.id, { ...b, visibility: "private", ownerSyncId: cleanId });
      }
    });
  }
  return Array.from(map.values());
}

function getAllSubjectsList() {
  const customSubs = getVisibleCustomBanks().map((b) => ({
    id: b.id,
    name: `${b.visibility === "private" ? "🔒" : "🌐"} ${b.title}`,
    isBuiltin: false,
    visibility: b.visibility,
    ownerSyncId: b.ownerSyncId
  }));
  return [...BASE_SUBJECTS, ...customSubs];
}

function getChaptersForSubject(subjectId) {
  if (BASE_CHAPTERS_BY_SUBJECT[subjectId]) {
    return BASE_CHAPTERS_BY_SUBJECT[subjectId];
  }
  const bank = getVisibleCustomBanks().find((b) => b.id === subjectId);
  const baseChapters = [
    { id: "all", title: "全部模块与题型" },
    { id: "type_choice", title: "【题型】选择题" },
    { id: "type_fill", title: "【题型】填空题" },
    { id: "type_solve", title: "【题型】解答/主观题" }
  ];
  if (!bank) return baseChapters;
  if (Array.isArray(bank.chapters) && bank.chapters.length > 0) {
    return [...baseChapters, ...bank.chapters];
  }
  // 自动从题目提取唯一章节
  const seen = new Set();
  const dynamicChs = [];
  (bank.questions || []).forEach((q) => {
    const ch = q.chapter || "默认章节";
    if (!seen.has(ch)) {
      seen.add(ch);
      dynamicChs.push({ id: ch, title: ch });
    }
  });
  return [...baseChapters, ...dynamicChs];
}

function getYearsForSubject(subjectId) {
  if (subjectId === "math2" || subjectId === "eng2") {
    return BASE_YEARS;
  }
  const subQs = getSubjectQuestions(subjectId);
  const yearsSet = new Set();
  subQs.forEach((q) => {
    if (q.year) yearsSet.add(Number(q.year));
  });
  const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);
  if (sortedYears.length <= 1) {
    return [{ id: "all", name: `全部题目 (${subQs.length}题)`, fullRow: true }];
  }
  return [
    { id: "all", name: `全部年份/批次`, fullRow: true },
    ...sortedYears.map((y) => ({ id: y, name: `${y} 真题/批次` }))
  ];
}

function rebuildQuestionBankPool() {
  passagesMap = { ...(window.KAOYAN_PASSAGES || {}) };
  const baseList = Array.isArray(window.KAOYAN_QUESTIONS) ? window.KAOYAN_QUESTIONS : [];
  const customQs = [];

  getVisibleCustomBanks().forEach((bank) => {
    if (bank.passages && typeof bank.passages === "object") {
      Object.assign(passagesMap, bank.passages);
    }
    (bank.questions || []).forEach((q, idx) => {
      customQs.push({
        ...q,
        subject: bank.id,
        qNum: q.qNum || idx + 1,
        year: q.year || 2026
      });
    });
  });

  allQuestions = [...baseList, ...customQs];

  // 确保所有题目在 records 中有默认项
  allQuestions.forEach((q) => {
    if (!appState.records[q.id]) {
      appState.records[q.id] = {
        passes: 0,
        wrongCount: 0,
        wrongNote: "",
        resolved: false,
        lastOpt: null,
        revealed: false,
        draft: "",
        u: 0
      };
    }
  });
}

function createFreshRecordsMap() {
  const map = {};
  allQuestions.forEach((q) => {
    map[q.id] = {
      passes: 0,
      wrongCount: 0,
      wrongNote: "",
      resolved: false,
      lastOpt: null,
      revealed: false,
      draft: "",
      u: 0
    };
  });
  return map;
}

function recordRecentSyncId(syncId) {
  const clean = normalizeSyncId(syncId);
  if (!clean) return;
  try {
    const raw = localStorage.getItem(RECENT_SYNC_IDS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const normalizedList = list.map((x) => normalizeSyncId(x)).filter(Boolean);
    const next = [clean, ...normalizedList.filter((x) => x !== clean)].slice(0, 6);
    localStorage.setItem(RECENT_SYNC_IDS_KEY, JSON.stringify(next));
  } catch (e) {}
}

function getRecentSyncIds() {
  try {
    const raw = localStorage.getItem(RECENT_SYNC_IDS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.from(new Set(list.map((x) => normalizeSyncId(x)).filter(Boolean)));
  } catch (e) {
    return [];
  }
}

function loadState(targetSyncId) {
  const savedActiveId = targetSyncId !== undefined
    ? targetSyncId
    : (localStorage.getItem(ACTIVE_SYNC_ID_KEY) || "");

  const cleanId = normalizeSyncId(savedActiveId);

  // 先重置为完全独立的初始状态
  appState = {
    syncId: cleanId,
    updatedAt: 0,
    activeSubject: "math2",
    activeTab: "practice",
    activeYear: "all",
    activeChapter: "all",
    passFilter: "all",
    currentQId: "M2026_01",
    dotsCollapsed: false,
    passageState: {
      showZh: false,
      tallMode: false,
      collapsed: false
    },
    records: {},
    wrongFilter: "unresolved"
  };

  loadCustomBanksForCurrentUser();
  rebuildQuestionBankPool();
  appState.records = createFreshRecordsMap();

  if (!cleanId) return;

  try {
    const userKey = getStorageKeyForSyncId(cleanId);
    let raw = localStorage.getItem(userKey);
    if (!raw && cleanId === "lidahai4445") {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      appState = {
        ...appState,
        ...parsed,
        syncId: cleanId,
        passageState: { ...appState.passageState, ...(parsed.passageState || {}) },
        records: { ...createFreshRecordsMap(), ...(parsed.records || {}) }
      };
    }
  } catch (e) {
    console.warn("读取口令专属本地状态失败:", e);
  }

  // 如果当前激活的题库对新口令不可见，回退到 math2
  const visibleSubIds = getAllSubjectsList().map((s) => s.id);
  if (!visibleSubIds.includes(appState.activeSubject)) {
    appState.activeSubject = "math2";
    appState.currentQId = "M2026_01";
  }
}

function saveState(triggerCloud = false) {
  const cleanId = normalizeSyncId(appState.syncId);
  appState.syncId = cleanId;
  try {
    if (cleanId) {
      localStorage.setItem(ACTIVE_SYNC_ID_KEY, cleanId);
      localStorage.setItem(getStorageKeyForSyncId(cleanId), JSON.stringify(appState));
      recordRecentSyncId(cleanId);
    } else {
      localStorage.setItem(getStorageKeyForSyncId("guest"), JSON.stringify(appState));
    }
  } catch (e) {
    console.warn("保存状态失败:", e);
  }
  if (typeof renderCloudProgressSummary === "function") {
    renderCloudProgressSummary();
  }
  if (triggerCloud && cleanId && typeof scheduleCloudPush === "function") {
    scheduleCloudPush(120);
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
      draft: "",
      u: 0
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

  list.sort((a, b) => {
    if (a.year !== b.year) return (b.year || 0) - (a.year || 0);
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
  const subjects = getAllSubjectsList();
  container.innerHTML = subjects.map((s) => {
    const count = getSubjectQuestions(s.id).length;
    const isActive = appState.activeSubject === s.id;
    return `
      <button class="subject-pill ${isActive ? "active" : ""}" onclick="switchSubject('${escapeHtml(s.id)}')">
        <span>${escapeHtml(s.name)}</span>
        <span class="sub-badge">${count}题</span>
      </button>
    `;
  }).join("") + `
    <button class="subject-pill" style="border-style:dashed;color:var(--primary);" onclick="openSettingsModal('import')" title="使用 AI 生成并上传新题库">
      <span>➕ 导入新题库</span>
    </button>
  `;
}

function switchSubject(subjectId) {
  if (appState.activeSubject === subjectId) return;
  appState.activeSubject = subjectId;
  appState.activeYear = "all";
  appState.activeChapter = "all";
  const subQs = getFilteredQuestions();
  if (subQs.length > 0) {
    appState.currentQId = subQs[0].id;
  }
  saveState(false);
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

function toggleSidebarCollapse() {
  appState.sidebarCollapsed = !appState.sidebarCollapsed;
  saveState(false);
  applySidebarCollapseUI();
}

function applySidebarCollapseUI() {
  const appContainer = document.querySelector(".app-container");
  const leftSidebar = document.getElementById("left-sidebar");
  const fab = document.getElementById("sidebar-expand-fab");
  const isCollapsed = Boolean(appState.sidebarCollapsed);

  if (leftSidebar) {
    leftSidebar.style.display = isCollapsed ? "none" : "block";
  }
  if (appContainer) {
    appContainer.classList.toggle("sidebar-collapsed", isCollapsed);
    appContainer.classList.remove("single-col");
  }
  if (fab) {
    fab.style.display = isCollapsed ? "inline-flex" : "none";
  }
}

function renderSidebar() {
  applySidebarCollapseUI();
  document.querySelectorAll(".nav-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === appState.activeTab);
  });

  const subQs = getSubjectQuestions();
  const years = getYearsForSubject(appState.activeSubject);

  // 1. 渲染年份套卷列表
  const yearListEl = document.getElementById("year-list");
  if (yearListEl) {
    yearListEl.innerHTML = years.map((yr) => {
      const qs = yr.id === "all" ? subQs : subQs.filter((q) => Number(q.year) === Number(yr.id));
      const done3 = qs.filter((q) => getRecord(q.id).passes >= 3).length;
      const isActive = String(appState.activeYear) === String(yr.id);
      return `
        <div class="year-item ${yr.fullRow ? "full-row" : ""} ${isActive ? "active" : ""}" onclick="setYearFilter('${yr.id}')">
          <span>${escapeHtml(yr.name)}</span>
          <span class="chapter-meta">${done3}/${qs.length}★</span>
        </div>
      `;
    }).join("");
  }

  // 2. 渲染考点/题型模块列表
  const chapterListEl = document.getElementById("chapter-list");
  if (chapterListEl) {
    const chapters = getChaptersForSubject(appState.activeSubject);
    const basePool = appState.activeYear === "all"
      ? subQs
      : subQs.filter((q) => Number(q.year) === Number(appState.activeYear));

    chapterListEl.innerHTML = chapters.map((ch) => {
      const qs = basePool.filter((q) => matchChapterOrType(q, ch.id));
      const done3 = qs.filter((q) => getRecord(q.id).passes >= 3).length;
      const isActive = appState.activeChapter === ch.id;
      return `
        <div class="chapter-item ${isActive ? "active" : ""}" onclick="setChapterFilter('${escapeHtml(ch.id)}')">
          <span>${escapeHtml(ch.title)}</span>
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
  saveState(false);
  renderAll();
}

function setChapterFilter(chId) {
  appState.activeChapter = chId;
  const filtered = getFilteredQuestions();
  if (filtered.length > 0 && !filtered.some((q) => q.id === appState.currentQId)) {
    appState.currentQId = filtered[0].id;
  }
  saveState(false);
  renderAll();
}

function setPassFilter(filterVal) {
  appState.passFilter = filterVal;
  const filtered = getFilteredQuestions();
  if (filtered.length > 0 && !filtered.some((q) => q.id === appState.currentQId)) {
    appState.currentQId = filtered[0].id;
  }
  saveState(false);
  renderAll();
}

function toggleDotsCollapse() {
  appState.dotsCollapsed = !appState.dotsCollapsed;
  saveState(false);
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
  const curSub = getAllSubjectsList().find((s) => s.id === appState.activeSubject);
  const subTitle = curSub ? curSub.name : "当前题库";
  labelEl.textContent = `📋 ${subTitle} · 当前筛选共 ${filtered.length} 题${appState.dotsCollapsed ? "（已折叠）" : ""}`;

  const colBtn = document.getElementById("strip-collapse-btn");
  if (colBtn) {
    colBtn.textContent = appState.dotsCollapsed ? "🔽 展开答题卡" : "🔼 收起答题卡";
  }

  const grid = document.getElementById("question-dots-grid");
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
    const shortLabel = appState.activeYear === "all" && q.year
      ? `${String(q.year).slice(-2)}-${String(q.qNum).padStart(2, "0")}`
      : `${q.qNum}`;
    return `
      <button
        class="q-dot pass-${rec.passes} ${isCurrent ? "current" : ""} ${hasWrong ? "has-wrong" : ""}"
        title="${escapeHtml(q.title)}"
        onclick="selectQuestion('${escapeHtml(q.id)}')"
      >
        <span>${shortLabel}</span>
        <span class="q-dot-stars">${stars}</span>
      </button>
    `;
  }).join("");
}

function selectQuestion(qId) {
  appState.currentQId = qId;
  const rec = getRecord(qId);
  rec.revealed = false;
  saveState(false);
  renderQuestionDots();
  renderMainStage();
}

function switchTab(tabName) {
  appState.activeTab = tabName;
  document.querySelectorAll(".nav-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
  });

  applySidebarCollapseUI();
  saveState(false);
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
   核心视图 1：极简真题原生刷题面板（已移除冗余小按钮，统一收拢至右上角设置）
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
        <h3 style="margin-bottom:8px;">🎉 当前筛选条件下没有待刷题目</h3>
        <p style="color:var(--text-muted);font-size:14px;margin-bottom:16px;">您可以切换左侧筛选条件，或点击下方按钮查看全部题目。</p>
        <button class="btn btn-primary" onclick="setPassFilter('all')">显示全部题目</button>
      </div>
    `;
    return;
  }

  const rec = getRecord(q.id);
  const chList = getChaptersForSubject(q.subject);
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
    rec.passes === 0 ? "0刷" :
    rec.passes === 1 ? "一刷已过" :
    rec.passes === 2 ? "二刷已过" : "三刷通关";

  const passageHtml = q.passageId && passagesMap[q.passageId]
    ? renderPassagePanel(q, passagesMap[q.passageId])
    : "";

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
            <span class="q-tag" style="background:#1e40af;color:#fff;">${q.year || 2026} · 第${q.qNum}题</span>
            <span class="q-tag tag-chapter">${escapeHtml(chObj ? chObj.title : (q.chapter || "综合模块"))}</span>
            <span class="q-tag ${typeBadge.cls}">${typeBadge.label}</span>
            ${q.kp ? `<span class="q-tag" style="background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;">考点：${escapeHtml(q.kp)}</span>` : ""}
          </div>
          <h2 class="q-title">${q.title}</h2>
        </div>

        <div class="pass-controller">
          <div class="pass-stars-badge" onclick="openSettingsModal('account')" style="cursor:pointer;" title="点击打开设置可微调刷次">
            <div>${starHtml}</div>
            <span>${passStatusText}</span>
          </div>
        </div>
      </div>

      ${passageHtml}

      <!-- 题干 -->
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
          <button class="btn btn-outline" ${!prevQ ? "disabled style='opacity:0.45;cursor:not-allowed;'" : `onclick="selectQuestion('${escapeHtml(prevQ.id)}')"`}>
            ⬅️ 上一题 ${prevQ ? `(第${prevQ.qNum}题)` : ""}
          </button>
          <button class="btn btn-outline" ${!nextQ ? "disabled style='opacity:0.45;cursor:not-allowed;'" : `onclick="selectQuestion('${escapeHtml(nextQ.id)}')"`}>
            下一题 ${nextQ ? `(第${nextQ.qNum}题)` : ""} ➡️
          </button>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-danger btn-sm" onclick="addQuestionToWrongBook('${escapeHtml(q.id)}', '手动加入重点复盘')">
            📕 加入错题本 ${rec.wrongCount > 0 && !rec.resolved ? `(已记错 ${rec.wrongCount} 次)` : ""}
          </button>
        </div>
      </div>
    </div>
  `;
}

/* 英语二原文双语阅读框（极简头部，高度与折叠控制已收拢至设置） */
function renderPassagePanel(q, passage) {
  const ps = appState.passageState;
  const pTitle = (typeof passage === "object" && passage.title) ? passage.title : `${q.year}年 原文阅读`;

  let contentHtml = "";
  if (typeof passage === "string") {
    contentHtml = passage;
  } else {
    contentHtml = ps.showZh ? (passage.bilingual || passage.en || "") : (passage.en || "");
  }

  if (q.qNum >= 1 && q.qNum <= 20) {
    const targetTag = `<u>&nbsp;<strong>[${q.qNum}]</strong>&nbsp;</u>`;
    contentHtml = contentHtml.split(targetTag).join(`<span class="cloze-active-blank">[第 ${q.qNum} 空]</span>`);
  }

  if (q.qNum >= 41 && q.qNum <= 45) {
    const pbReg = new RegExp(`\\(${q.qNum}\\)_{3,}`, "g");
    contentHtml = contentHtml.replace(pbReg, `<span class="cloze-active-blank">(${q.qNum}) 【当前待选匹配处】</span>`);
  }

  return `
    <div class="passage-panel">
      <div class="passage-header" onclick="togglePassageState('collapsed')" style="cursor:pointer;user-select:none;" title="点击折叠/展开英语原文阅读框">
        <div class="passage-title">
          <span>📖 ${pTitle}${ps.collapsed ? "（已折叠）" : ""}</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;" onclick="event.stopPropagation()">
          <button class="btn ${ps.showZh ? "btn-primary" : "btn-outline"} btn-xs" onclick="togglePassageState('showZh')">
            🇨🇳 ${ps.showZh ? "纯英" : "译文"}
          </button>
          <button class="btn btn-outline btn-xs" onclick="togglePassageState('collapsed')">
            ${ps.collapsed ? "🔽 展开原文" : "🔼 收起原文"}
          </button>
        </div>
      </div>
      ${ps.collapsed ? "" : `
        <div class="passage-body ${ps.tallMode ? "tall" : ""}">
          <div>${contentHtml}</div>
        </div>
      `}
    </div>
  `;
}

function togglePassageState(key) {
  appState.passageState[key] = !appState.passageState[key];
  saveState(false);
  renderMainStage();
}

/* 1. 客观选择题作答区（无论作答正确与否绝不自动展开答案与解析，仅支持手动点击触发） */
function renderChoiceQuestionBody(q, rec) {
  const options = Array.isArray(q.options) ? q.options : ["A", "B", "C", "D"];
  const answered = rec.lastOpt !== null && rec.lastOpt !== undefined;
  const isRevealed = Boolean(rec.revealed);
  const correctLetter = String(q.answer || "A").trim().toUpperCase().charAt(0);
  const isShortLetters = options.length > 4 && options.every((o) => String(o).trim().length <= 3);

  const optionsHtml = options.map((optStr, idx) => {
    const letter = ["A", "B", "C", "D", "E", "F", "G"][idx] || String(idx);
    const cleanText = String(optStr).replace(/^(?:\[\s*[A-G]\s*\]|[A-G][\.\、\s])\s*/i, "").trim();

    let stateCls = "";
    if (isRevealed) {
      if (letter === correctLetter) {
        stateCls = "correct";
      } else if (rec.lastOpt === letter) {
        stateCls = "wrong";
      }
    } else if (answered && rec.lastOpt === letter) {
      stateCls = letter === correctLetter ? "correct" : "wrong";
    }

    return `
      <button class="mcq-option ${stateCls}" onclick="submitChoiceOption('${escapeHtml(q.id)}', '${letter}')">
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
              ? `✅ 本遍回答正确（已选 ${rec.lastOpt}）！当前进度 ${rec.passes}/3 刷`
              : `❌ 本遍回答有误（您选了 ${rec.lastOpt}${isRevealed ? `，正确答案 ${correctLetter}` : ""}），已记入错题本`}
          </span>
          <button class="btn btn-primary btn-xs" onclick="retryQuestionForNextPass('${escapeHtml(q.id)}')">
            🔄 再刷一遍
          </button>
        </div>
      ` : ""}

      <div class="mcq-options" style="${isShortLetters ? "display:grid;grid-template-columns:repeat(auto-fit,minmax(95px,1fr));" : ""}">
        ${optionsHtml}
      </div>

      <div style="display:flex;gap:10px;margin-top:4px;">
        <button class="btn ${isRevealed ? "btn-primary" : "btn-outline"} btn-sm" onclick="toggleRevealAnswer('${escapeHtml(q.id)}')">
          ${isRevealed ? "🙈 收起答案与解析" : "👁️ 查看答案与解析"}
        </button>
      </div>

      ${isRevealed ? renderAnalysisAndTipsBox(q) : ""}
    </div>
  `;
}

function submitChoiceOption(qId, chosenLetter) {
  const q = allQuestions.find((item) => item.id === qId);
  if (!q) return;
  const rec = getRecord(qId);
  const correctLetter = String(q.answer || "A").trim().toUpperCase().charAt(0);

  const wasAlreadyAnswered = rec.lastOpt !== null && rec.lastOpt !== undefined;
  rec.lastOpt = chosenLetter;
  // 严格遵循规则：作答后绝不自动触发查看答案与解析（保持 rec.revealed 原状，仅手动按钮可触发）

  if (chosenLetter === correctLetter) {
    if (!wasAlreadyAnswered && rec.passes < 3) {
      rec.passes += 1;
    }
  } else {
    rec.wrongCount += 1;
    rec.resolved = false;
  }

  touchRecord(rec);
  saveState(true);
  renderGlobalHeaderStats();
  renderSidebar();
  renderQuestionDots();
  renderMainStage();
}

function retryQuestionForNextPass(qId) {
  const rec = getRecord(qId);
  rec.lastOpt = null;
  rec.revealed = false;
  touchRecord(rec);
  saveState(false);
  renderMainStage();
}

function toggleRevealAnswer(qId) {
  const rec = getRecord(qId);
  rec.revealed = !rec.revealed;
  saveState(false);
  renderMainStage();
}

function revealAnswerOnly(qId) {
  const rec = getRecord(qId);
  rec.revealed = true;
  saveState(false);
  renderMainStage();
}

/* 2. 客观填空题作答区 */
function renderFillQuestionBody(q, rec) {
  return `
    <div>
      <div class="fill-answer-box">
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
          <input
            type="text"
            class="step-num-input"
            style="flex:1;min-width:220px;"
            placeholder="在此输入您的计算结果（或在草稿纸算出后直接核对）..."
            value="${escapeHtml(rec.draft || "")}"
            oninput="saveQuestionDraft('${escapeHtml(q.id)}', this.value)"
          />
          <button class="btn btn-primary" onclick="revealAnswerOnly('${escapeHtml(q.id)}')">
            🔍 核对标准答案 & 解析
          </button>
          ${rec.revealed ? `
            <button class="btn btn-outline btn-sm" onclick="retryQuestionForNextPass('${escapeHtml(q.id)}')">
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
            <button class="btn btn-success btn-sm" onclick="gradeSelfSubjective('${escapeHtml(q.id)}', true)">
              ✅ 算对了 (+1★，当前 ${rec.passes}/3)
            </button>
            <button class="btn btn-danger btn-sm" onclick="gradeSelfSubjective('${escapeHtml(q.id)}', false)">
              ❌ 算错了（记入错题本）
            </button>
          </div>
        </div>
        ${renderAnalysisAndTipsBox(q)}
      ` : ""}
    </div>
  `;
}

/* 3. 主观解答题 / 英译汉 / 大小作文作答区 */
function renderSolveQuestionBody(q, rec) {
  const placeholderText = q.subject === "math2"
    ? "可在现实草稿纸上推导，也可在此记录关键步骤或结果..."
    : q.qNum === 46
    ? "请在此输入您的中文翻译草稿（完成后点击下方按钮对照标准译文）..."
    : "请在此输入您的作答提纲或习作（完成后点击下方按钮对照标准解析）...";

  return `
    <div>
      <div class="recall-area">
        <textarea
          class="recall-textarea"
          placeholder="${placeholderText}"
          oninput="saveQuestionDraft('${escapeHtml(q.id)}', this.value)"
        >${escapeHtml(rec.draft || "")}</textarea>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
          <button class="btn btn-primary" onclick="revealAnswerOnly('${escapeHtml(q.id)}')">
            👁️ 展开标准答案与步骤详解
          </button>
          ${rec.revealed ? `
            <button class="btn btn-outline btn-sm" onclick="retryQuestionForNextPass('${escapeHtml(q.id)}')">
              🙈 收起答案重新演练
            </button>
          ` : ""}
        </div>
      </div>

      ${rec.revealed ? `
        <div style="background:#eff6ff;border:1.5px solid #93c5fd;border-radius:10px;padding:14px 16px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <div style="flex:1;min-width:240px;">
            <span style="font-size:13px;font-weight:700;color:#1e40af;">【核心答案】</span>
            <span style="font-size:14.5px;font-weight:700;color:#0f172a;margin-left:6px;">${q.answer}</span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-success btn-sm" onclick="gradeSelfSubjective('${escapeHtml(q.id)}', true)">
              ✅ 本遍已掌握 (+1★，当前 ${rec.passes}/3)
            </button>
            <button class="btn btn-danger btn-sm" onclick="gradeSelfSubjective('${escapeHtml(q.id)}', false)">
              ❌ 未掌握（记入错题本）
            </button>
          </div>
        </div>
        ${renderAnalysisAndTipsBox(q)}
      ` : ""}
    </div>
  `;
}

function renderAnalysisAndTipsBox(q) {
  return `
    ${(q.tips || q.kp) ? `
      <div class="tips-kp-panel" style="margin-top:14px;">
        <div class="tips-box">
          <strong>🎯 考场破题技巧：</strong><br>
          ${q.tips || "先审清题干核心条件，结合标准解析复盘关键步骤。"}
        </div>
        <div class="kp-box">
          <strong>📚 关联核心考点：</strong>
          <div style="margin-top:6px;font-weight:600;">${q.kp || "核心常考题型"}</div>
        </div>
      </div>
    ` : ""}

    <div class="explanation-panel">
      <div class="explanation-title">
        <span>📖 权威精解与步骤推导</span>
        <span>正确答案：<strong>${q.answer}</strong></span>
      </div>
      <div class="explanation-body">${q.analysis}</div>
    </div>
  `;
}

function saveQuestionDraft(qId, val) {
  const rec = getRecord(qId);
  rec.draft = val;
  touchRecord(rec);
  saveState(false);
  scheduleCloudPush(6000);
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
  touchRecord(rec);
  saveState(true);
  renderGlobalHeaderStats();
  renderSidebar();
  renderQuestionDots();
  renderMainStage();
}

function manualAddPassCurrent() {
  if (!appState.currentQId) return;
  const rec = getRecord(appState.currentQId);
  if (rec.passes < 3) {
    rec.passes += 1;
    touchRecord(rec);
    saveState(true);
    renderAll();
  }
}

function resetCurrentQuestionPasses() {
  if (!appState.currentQId) return;
  const rec = getRecord(appState.currentQId);
  rec.passes = 0;
  rec.lastOpt = null;
  rec.revealed = false;
  touchRecord(rec);
  saveState(true);
  renderAll();
}

function addQuestionToWrongBook(qId, reason) {
  const rec = getRecord(qId);
  rec.wrongCount += 1;
  rec.resolved = false;
  if (!rec.wrongNote) rec.wrongNote = reason;
  touchRecord(rec);
  saveState(true);
  renderGlobalHeaderStats();
  renderQuestionDots();
  renderMainStage();
}

/* ==========================================================================
   核心视图 2：错题本与薄弱真题复盘
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
          <h2 class="q-title">📕 错题本与薄弱点复盘</h2>
          <p style="font-size:13.5px;color:var(--text-muted);margin-top:4px;">
            当前口令（<code>${escapeHtml(appState.syncId || "未设口令")}</code>）专属错题记录，支持记录错因并一键跳回原题重刷。
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
                    <button class="btn btn-primary btn-sm" onclick="jumpToWrongQuestion('${escapeHtml(q.id)}')">
                      🎯 跳回原题重刷
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="toggleResolveWrong('${escapeHtml(q.id)}')">
                      ${r.resolved ? "↩️ 重新标记未掌握" : "✅ 标记已消灭"}
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
                  placeholder="✍️ 记录错因心得..."
                  value="${escapeHtml(r.wrongNote || "")}"
                  onchange="saveWrongNote('${escapeHtml(q.id)}', this.value)"
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
  touchRecord(r);
  saveState(true);
  renderGlobalHeaderStats();
  renderQuestionDots();
  renderMainStage();
}

function saveWrongNote(qId, text) {
  const r = getRecord(qId);
  r.wrongNote = text;
  touchRecord(r);
  saveState(true);
}

/* ==========================================================================
   核心视图 3：高频重复记忆总结文档
   ========================================================================== */
function renderAiHubView(container) {
  const docs = HIGH_FREQ_DOCS[appState.activeSubject] || HIGH_FREQ_DOCS.math2;

  container.innerHTML = `
    <div class="question-card">
      <div class="q-card-header">
        <div>
          <h2 class="q-title">📚 必背高频重复知识点总结 (${appState.activeSubject === "eng2" ? "考研英语二" : "考研数学二"})</h2>
          <p style="font-size:13.5px;color:var(--text-muted);margin-top:4px;">
            提炼近五年真题中反复出现的公式、定理与破题母模版，刷题卡壳时随时对照。
          </p>
        </div>
        <button class="btn btn-primary btn-sm" onclick="openSettingsModal('import')">
          📥 使用 AI 生成并导入新题库
        </button>
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
  `;
}

/* ==========================================================================
   统一设置中心 & AI 生成题库上传（私人/公开口令权限） & 多端双通道极速云同步引擎
   ========================================================================== */
let cloudPushTimer = null;
let isPushingNow = false;
let isPullingNow = false;
let pendingPushQueued = false;
let lastCloudSyncTimeStr = "";
let toastHideTimer = null;
let pillResetTimer = null;

function getStandardAiPromptText() {
  return `你现在是专业的考试题库结构化专家。请将我发给你的题目与解析资料，转换为以下标准 JSON 格式（你可以直接生成一个 .json 文件供我下载，或输出纯 JSON 代码块）。
【排版铁律】：严禁输出任何未转义的 LaTeX 反斜杠（如 \\frac 或 $）！数学分式必须使用 <span class='frac'><span class='frac-num'>分子</span><span class='frac-den'>分母</span></span>，上下标使用 <sup>2</sup> 和 <sub>n</sub>，换行使用 <br>。

{
  "bankTitle": "请填写题库名称（如：考研政治肖1000题 / 数二模拟卷）",
  "chapters": [
    { "id": "ch1", "title": "第一部分：基础核心题" },
    { "id": "ch2", "title": "第二部分：拔高综合题" }
  ],
  "questions": [
    {
      "qNum": 1,
      "year": 2026,
      "qType": "choice",
      "chapter": "ch1",
      "title": "第1题（选择题）",
      "stem": "题干完整 HTML 内容...",
      "options": ["A. 选项A内容", "B. 选项B内容", "C. 选项C内容", "D. 选项D内容"],
      "answer": "A",
      "analysis": "详尽步骤解析 HTML...",
      "tips": "考场秒杀与破题技巧...",
      "kp": "关联核心考点名称"
    },
    {
      "qNum": 2,
      "year": 2026,
      "qType": "fill",
      "chapter": "ch2",
      "title": "第2题（填空或简答题，无选项时 qType 填 fill 或 solve）",
      "stem": "填空或解答题题干 HTML...",
      "options": null,
      "answer": "标准答案文本",
      "analysis": "完整推导步骤与采分点解析 HTML...",
      "tips": "易错点提示...",
      "kp": "核心考点"
    }
  ]
}`;
}

function openSettingsModal(defaultTab = "account") {
  const modal = document.getElementById("cloud-sync-modal");
  const input = document.getElementById("sync-id-input");
  if (input) input.value = appState.syncId || "";

  // 同步当前界面偏好复选框状态
  const chkDots = document.getElementById("pref-show-dots");
  if (chkDots) chkDots.checked = !appState.dotsCollapsed;
  const chkZh = document.getElementById("pref-passage-zh");
  if (chkZh) chkZh.checked = Boolean(appState.passageState.showZh);
  const chkTall = document.getElementById("pref-passage-tall");
  if (chkTall) chkTall.checked = Boolean(appState.passageState.tallMode);
  const chkCol = document.getElementById("pref-passage-collapse");
  if (chkCol) chkCol.checked = Boolean(appState.passageState.collapsed);

  const ownerLabel = document.getElementById("current-owner-label");
  if (ownerLabel) ownerLabel.textContent = appState.syncId || "未设置口令（请先在第一栏设置口令）";

  const promptBox = document.getElementById("settings-ai-prompt-box");
  if (promptBox) promptBox.textContent = getStandardAiPromptText();

  renderRecentSyncIdsInModal();
  renderCloudProgressSummary();
  renderCustomBanksManageList();
  switchSettingsTab(defaultTab);
  if (modal) modal.classList.add("open");
}

function closeSettingsModal() {
  const modal = document.getElementById("cloud-sync-modal");
  if (modal) modal.classList.remove("open");
}

function switchSettingsTab(tabId) {
  document.querySelectorAll(".settings-subtab").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-stab") === tabId);
  });
  ["account", "import", "manage"].forEach((id) => {
    const panel = document.getElementById(`stab-panel-${id}`);
    if (panel) panel.style.display = id === tabId ? "block" : "none";
  });
  if (tabId === "manage") {
    renderCustomBanksManageList();
  }
}

function toggleUiPreference(prefKey, checked) {
  if (prefKey === "showDots") {
    appState.dotsCollapsed = !checked;
    renderQuestionDots();
  } else if (prefKey === "showZh") {
    appState.passageState.showZh = checked;
    renderMainStage();
  } else if (prefKey === "tallMode") {
    appState.passageState.tallMode = checked;
    renderMainStage();
  } else if (prefKey === "collapsed") {
    appState.passageState.collapsed = checked;
    renderMainStage();
  }
  saveState(false);
}

function copyStandardAiPrompt() {
  navigator.clipboard.writeText(getStandardAiPromptText()).then(() => {
    const msgEl = document.getElementById("bank-import-status-msg");
    if (msgEl) {
      msgEl.style.color = "var(--success)";
      msgEl.textContent = "✅ 已复制 AI 提示词！请粘贴给任意 AI 并附上您的题目资料生成 .json 文件。";
    }
  });
}

function downloadSampleBankJson() {
  const sample = {
    bankTitle: "示例新题库（数二核心模拟题）",
    chapters: [
      { id: "sim_ch1", title: "一、高等数学精选" },
      { id: "sim_ch2", title: "二、线性代数精选" }
    ],
    questions: [
      {
        qNum: 1,
        year: 2026,
        qType: "choice",
        chapter: "sim_ch1",
        title: "模拟卷 第1题（选择题 5分）",
        stem: "当 <i>x</i> → 0 时，1 − cos <i>x</i> 与 <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span><i>x</i><sup><i>k</i></sup> 是等价无穷小，则 <i>k</i> =（　　）",
        options: ["A. 1", "B. 2", "C. 3", "D. 4"],
        answer: "B",
        analysis: "由等价无穷小公式知，当 <i>x</i> → 0 时，1 − cos <i>x</i> ~ <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span><i>x</i><sup>2</sup>，故 <i>k</i> = 2，选 B。",
        tips: "熟记 1 − cos x ~ (1/2)x²。",
        kp: "等价无穷小阶数判定"
      }
    ]
  };
  const blob = new Blob([JSON.stringify(sample, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ai_question_bank_template.json";
  a.click();
  URL.revokeObjectURL(url);
}

// 解析上传的 JSON 文本并构建标准 Bank 对象
function parseUploadedJsonToBank(rawText, fallbackFileName = "") {
  let cleaned = String(rawText || "").trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const parsed = JSON.parse(cleaned);

  const customTitleInput = document.getElementById("new-bank-title-input");
  const visibilitySelect = document.getElementById("new-bank-visibility-select");
  const visibility = visibilitySelect ? visibilitySelect.value : "private";
  const ownerSyncId = normalizeSyncId(appState.syncId);

  if (!ownerSyncId) {
    throw new Error("请先在「🔑 口令与界面设置」中输入您的专属口令，才能绑定新题库权限！");
  }

  const bankId = `bank_${ownerSyncId.replace(/[^a-zA-Z0-9]/g, "")}_${Date.now().toString().slice(-6)}`;
  let bankTitle = (customTitleInput && customTitleInput.value.trim()) || "";
  let rawQuestions = [];
  let chapters = [];
  let passages = {};

  if (Array.isArray(parsed)) {
    rawQuestions = parsed;
    if (!bankTitle) {
      bankTitle = fallbackFileName.replace(/\.json$/i, "") || `AI导入题库 (${rawQuestions.length}题)`;
    }
  } else if (parsed && typeof parsed === "object") {
    rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];
    if (!bankTitle) {
      bankTitle = parsed.bankTitle || parsed.title || parsed.name || fallbackFileName.replace(/\.json$/i, "") || `AI导入题库`;
    }
    if (Array.isArray(parsed.chapters)) chapters = parsed.chapters;
    if (parsed.passages && typeof parsed.passages === "object") passages = parsed.passages;
  }

  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    throw new Error("JSON 文件中未找到有效的题目数组（questions 不能为空）！");
  }

  const normalizedQuestions = rawQuestions.map((q, idx) => {
    const qNum = Number(q.qNum) || idx + 1;
    const hasOptions = Array.isArray(q.options) && q.options.length >= 2;
    const qType = q.qType || (hasOptions ? "choice" : "solve");
    return {
      id: `${bankId}_Q${String(qNum).padStart(3, "0")}_${idx}`,
      subject: bankId,
      year: Number(q.year) || 2026,
      qNum,
      qType,
      chapter: q.chapter || "default_ch",
      passageId: q.passageId || null,
      title: q.title || `${bankTitle} · 第${qNum}题`,
      stem: q.stem || q.question || "请阅读题目并作答",
      options: hasOptions ? q.options : null,
      answer: String(q.answer ?? "详见解析"),
      analysis: q.analysis || q.explanation || "详见标准答案。",
      tips: q.tips || "",
      kp: q.kp || ""
    };
  });

  return {
    id: bankId,
    title: bankTitle,
    visibility, // 'private' | 'public'
    ownerSyncId,
    createdAt: Date.now(),
    chapters,
    passages,
    questions: normalizedQuestions
  };
}

async function registerNewCustomBank(bank) {
  if (bank.visibility === "private") {
    privateBanks.push(bank);
    savePrivateBanksLocal();
  } else {
    publicBanks.push(bank);
    savePublicBanksLocal();
  }

  rebuildQuestionBankPool();
  appState.activeSubject = bank.id;
  appState.activeYear = "all";
  appState.activeChapter = "all";
  if (bank.questions.length > 0) {
    appState.currentQId = bank.questions[0].id;
  }
  saveState(false);
  renderAll();
  renderCustomBanksManageList();

  // 同步到云端（私人题库推入个人云端仓库，公开题库推入全局公共中心）
  if (bank.visibility === "private") {
    await pushToCloud();
  } else {
    await pushPublicBanksToGlobalHub();
  }
}

async function handleBankJsonFileUpload(event) {
  const files = event.target.files;
  const msgEl = document.getElementById("bank-import-status-msg");
  if (!files || files.length === 0) return;

  let importedCount = 0;
  let totalQs = 0;

  for (const file of Array.from(files)) {
    try {
      const text = await file.text();
      const bank = parseUploadedJsonToBank(text, file.name);
      await registerNewCustomBank(bank);
      importedCount++;
      totalQs += bank.questions.length;
    } catch (err) {
      if (msgEl) {
        msgEl.style.color = "var(--danger)";
        msgEl.textContent = `❌ 文件 [${file.name}] 导入失败：${err.message}`;
      }
      event.target.value = "";
      return;
    }
  }

  event.target.value = "";
  const titleInput = document.getElementById("new-bank-title-input");
  if (titleInput) titleInput.value = "";

  if (msgEl) {
    msgEl.style.color = "var(--success)";
    msgEl.textContent = `🎉 成功生成 ${importedCount} 个新题库（共 ${totalQs} 道题），已自动切换至新题库！`;
  }
}

async function handleBankJsonTextImport() {
  const input = document.getElementById("bank-json-paste-input");
  const msgEl = document.getElementById("bank-import-status-msg");
  if (!input || !input.value.trim()) {
    if (msgEl) {
      msgEl.style.color = "var(--danger)";
      msgEl.textContent = "❌ 请先粘贴 AI 生成的 JSON 文本！";
    }
    return;
  }
  try {
    const bank = parseUploadedJsonToBank(input.value.trim(), "粘贴题库");
    await registerNewCustomBank(bank);
    input.value = "";
    if (msgEl) {
      msgEl.style.color = "var(--success)";
      msgEl.textContent = `🎉 成功生成新题库「${bank.title}」（共 ${bank.questions.length} 道题）！`;
    }
  } catch (err) {
    if (msgEl) {
      msgEl.style.color = "var(--danger)";
      msgEl.textContent = `❌ JSON 解析失败：${err.message}`;
    }
  }
}

function renderCustomBanksManageList() {
  const box = document.getElementById("custom-banks-manage-list");
  if (!box) return;
  const banks = getVisibleCustomBanks();
  const curSyncId = normalizeSyncId(appState.syncId);

  if (banks.length === 0) {
    box.innerHTML = `
      <div style="text-align:center;padding:24px;color:var(--text-muted);font-size:13px;">
        当前暂无自定义题库。您可以点击上方「📥 AI生成并上传题库」上传 <code>.json</code> 文件自动创建！
      </div>
    `;
    return;
  }

  box.innerHTML = banks.map((b) => {
    const isOwner = Boolean(curSyncId && normalizeSyncId(b.ownerSyncId) === curSyncId);
    const isPriv = b.visibility === "private";
    return `
      <div class="custom-bank-card">
        <div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span class="badge-pill ${isPriv ? "badge-primary" : "badge-success"}">
              ${isPriv ? "🔒 私人题库 (仅创建口令可见)" : "🌐 公开题库 (全员可刷)"}
            </span>
            <strong style="font-size:14px;">${escapeHtml(b.title)}</strong>
            <span style="font-size:12px;color:var(--text-muted);">(${b.questions.length} 题)</span>
          </div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">
            创建者口令：<code>${escapeHtml(b.ownerSyncId || "未知")}</code>
            ${isOwner ? `<span style="color:var(--success);font-weight:600;margin-left:6px;">（您拥有最高管理权限）</span>` : `<span style="margin-left:6px;">（只读共享权限）</span>`}
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn btn-primary btn-xs" onclick="switchSubject('${escapeHtml(b.id)}'); closeSettingsModal();">
            🎯 进入刷题
          </button>
          <button class="btn btn-outline btn-xs" onclick="exportSingleCustomBank('${escapeHtml(b.id)}')">
            ⬇️ 导出JSON
          </button>
          ${isOwner ? `
            <button class="btn btn-outline btn-xs" onclick="toggleCustomBankVisibility('${escapeHtml(b.id)}')">
              🔄 转为${isPriv ? "公开共享" : "私人独享"}
            </button>
            <button class="btn btn-danger btn-xs" onclick="deleteCustomBank('${escapeHtml(b.id)}')">
              🗑️ 删除
            </button>
          ` : ""}
        </div>
      </div>
    `;
  }).join("");
}

function exportSingleCustomBank(bankId) {
  const bank = getVisibleCustomBanks().find((b) => b.id === bankId);
  if (!bank) return;
  const exportObj = {
    bankTitle: bank.title,
    chapters: bank.chapters,
    passages: bank.passages,
    questions: bank.questions
  };
  const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${bank.title}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function toggleCustomBankVisibility(bankId) {
  const curSyncId = normalizeSyncId(appState.syncId);
  const privIdx = privateBanks.findIndex((b) => b.id === bankId);
  const pubIdx = publicBanks.findIndex((b) => b.id === bankId);

  if (privIdx !== -1) {
    const bank = privateBanks[privIdx];
    if (normalizeSyncId(bank.ownerSyncId) !== curSyncId) {
      alert("权限不足：只有创建该题库的口令才能修改权限！");
      return;
    }
    privateBanks.splice(privIdx, 1);
    bank.visibility = "public";
    publicBanks.push(bank);
    savePrivateBanksLocal();
    savePublicBanksLocal();
    renderAll();
    renderCustomBanksManageList();
    await pushToCloud();
    await pushPublicBanksToGlobalHub();
  } else if (pubIdx !== -1) {
    const bank = publicBanks[pubIdx];
    if (normalizeSyncId(bank.ownerSyncId) !== curSyncId) {
      alert("权限不足：只有创建该题库的口令才能将其转为私人！");
      return;
    }
    publicBanks.splice(pubIdx, 1);
    bank.visibility = "private";
    privateBanks.push(bank);
    savePrivateBanksLocal();
    savePublicBanksLocal();
    renderAll();
    renderCustomBanksManageList();
    await pushPublicBanksToGlobalHub();
    await pushToCloud();
  }
}

async function deleteCustomBank(bankId) {
  const curSyncId = normalizeSyncId(appState.syncId);
  const bank = getVisibleCustomBanks().find((b) => b.id === bankId);
  if (!bank) return;
  if (normalizeSyncId(bank.ownerSyncId) !== curSyncId) {
    alert(`权限不足：仅创建者口令 [${bank.ownerSyncId}] 有权删除此题库！`);
    return;
  }

  privateBanks = privateBanks.filter((b) => b.id !== bankId);
  publicBanks = publicBanks.filter((b) => b.id !== bankId);
  savePrivateBanksLocal();
  savePublicBanksLocal();

  if (appState.activeSubject === bankId) {
    appState.activeSubject = "math2";
    appState.currentQId = "M2026_01";
  }

  rebuildQuestionBankPool();
  renderAll();
  renderCustomBanksManageList();

  if (bank.visibility === "private") {
    await pushToCloud();
  } else {
    await pushPublicBanksToGlobalHub();
  }
}

async function refreshCustomBanksFromCloud() {
  await pullFromCloud(true);
  renderCustomBanksManageList();
}

/* ==========================================================================
   多端双通道极速云同步引擎 (Single-Hop Fast Channel + Persistent Vault)
   ========================================================================== */
function getProgressSummaryCounts() {
  let answeredCount = 0;
  let totalPasses = 0;
  let wrongCount = 0;
  Object.values(appState.records || {}).forEach((r) => {
    if (!r) return;
    if (r.passes > 0 || r.wrongCount > 0 || r.lastOpt || r.revealed) {
      answeredCount++;
    }
    totalPasses += r.passes || 0;
    if (r.wrongCount > 0 && !r.resolved) wrongCount++;
  });
  return { answeredCount, totalPasses, wrongCount };
}

function renderCloudProgressSummary() {
  const bar = document.getElementById("cloud-progress-summary-bar");
  if (!bar) return;
  const sid = normalizeSyncId(appState.syncId);
  const { answeredCount, totalPasses, wrongCount } = getProgressSummaryCounts();
  if (!sid) {
    bar.innerHTML = `<span style="color:var(--danger);">⚠️ 当前未设置口令，进度仅暂存本机浏览器，请上方输入口令开启跨设备同步</span>`;
    return;
  }
  bar.innerHTML = `
    <div>
      🔑 当前口令：<strong style="color:var(--primary);">${escapeHtml(sid)}</strong>
      &nbsp;|&nbsp; 📊 已作答：<strong>${answeredCount} 题</strong>（累计 <strong>${totalPasses} 刷★</strong> · 待攻克错题 <strong>${wrongCount} 道</strong>）
    </div>
    <div style="color:var(--success);font-weight:700;">
      ${lastCloudSyncTimeStr ? `☁️ 最近同步：${escapeHtml(lastCloudSyncTimeStr)}` : "☁️ 自动实时同步已开启"}
    </div>
  `;
}

function showCloudToast(text, type = "ok", durationMs = 2200) {
  const toast = document.getElementById("cloud-sync-toast");
  if (!toast) return;
  if (toastHideTimer) clearTimeout(toastHideTimer);
  toast.textContent = text;
  toast.className = `cloud-sync-toast visible ${type === "syncing" ? "toast-syncing" : "toast-ok"}`;
  if (durationMs > 0) {
    toastHideTimer = setTimeout(() => {
      toast.classList.remove("visible");
    }, durationMs);
  }
}

function updateSyncStatusUI(state, msg, showToastPopup = false) {
  const dot = document.getElementById("sync-status-dot");
  const textEl = document.getElementById("sync-status-text");
  const btn = document.getElementById("cloud-sync-btn");
  const modalMsg = document.getElementById("cloud-modal-status");
  const sid = normalizeSyncId(appState.syncId);
  const { answeredCount } = getProgressSummaryCounts();

  if (dot) {
    dot.className = "sync-dot" + (!sid ? " error" : state === "syncing" ? " syncing" : state === "error" ? " error" : "");
  }
  // 顶栏按钮已设置固定 min-width: 172px，切换文字绝不引起顶栏换行或抖动
  if (textEl && btn) {
    if (pillResetTimer) clearTimeout(pillResetTimer);
    if (state === "syncing") {
      btn.classList.remove("just-saved");
      textEl.textContent = `🔄 正在同步云端...`;
    } else if (state === "ok" && showToastPopup) {
      btn.classList.add("just-saved");
      textEl.textContent = `✅ 云端已存 (${answeredCount}题)`;
      pillResetTimer = setTimeout(() => {
        btn.classList.remove("just-saved");
        textEl.textContent = sid ? `⚙️ 设置 (${sid.slice(0, 10)})` : `⚙️ 设置 / 口令`;
      }, 2200);
    } else {
      btn.classList.remove("just-saved");
      textEl.textContent = sid ? `⚙️ 设置 (${sid.slice(0, 10)})` : `⚙️ 设置 / 口令`;
    }
  }
  if (btn && msg) {
    btn.title = `${msg}（点击打开设置与题库中心）`;
  }
  if (modalMsg && msg) {
    modalMsg.textContent = msg;
  }
  renderCloudProgressSummary();
}

async function fetchGlobalHubData() {
  try {
    const res = await fetch(`https://api.restful-api.dev/objects/${GLOBAL_HUB_VAULT_ID}`, {
      cache: "no-store"
    });
    if (res.ok) {
      const obj = await res.json();
      return (obj && obj.data) || { userVaults: { ...DEFAULT_VAULT_MAP }, publicBanks: [] };
    }
  } catch (e) {
    console.warn("获取全局中心失败:", e);
  }
  return null;
}

async function pushPublicBanksToGlobalHub() {
  try {
    const hubData = (await fetchGlobalHubData()) || { userVaults: { ...DEFAULT_VAULT_MAP }, publicBanks: [] };
    hubData.publicBanks = publicBanks;
    hubData.updatedAt = Date.now();
    await fetch(`https://api.restful-api.dev/objects/${GLOBAL_HUB_VAULT_ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "kaoyan_global_hub_v2",
        data: hubData
      })
    });
  } catch (e) {
    console.warn("同步公开题库到全局中心失败:", e);
  }
}

async function resolveVaultId(syncId, preloadedHubData = null) {
  const cleanId = normalizeSyncId(syncId);
  if (!cleanId) return null;
  // 优先匹配默认映射表（解决之前大小写缓存不一致问题）
  if (DEFAULT_VAULT_MAP[cleanId]) return DEFAULT_VAULT_MAP[cleanId];

  const cacheKey = `kaoyan_vault_id_v3_${cleanId}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  const hubData = preloadedHubData || (await fetchGlobalHubData());
  if (hubData && hubData.userVaults) {
    const matchedVault = hubData.userVaults[cleanId] || hubData.userVaults[syncId];
    if (matchedVault) {
      localStorage.setItem(cacheKey, matchedVault);
      return matchedVault;
    }
  }

  // 为该新口令创建独立云端仓库并注册到全局中心
  try {
    const createRes = await fetch("https://api.restful-api.dev/objects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `kaoyan_sync_${cleanId}`,
        data: buildCompactCloudPayload()
      })
    });
    if (createRes.ok) {
      const created = await createRes.json();
      if (created && created.id) {
        localStorage.setItem(cacheKey, created.id);
        const latestHub = hubData || { userVaults: { ...DEFAULT_VAULT_MAP }, publicBanks: publicBanks };
        if (!latestHub.userVaults) latestHub.userVaults = {};
        latestHub.userVaults[cleanId] = created.id;
        fetch(`https://api.restful-api.dev/objects/${GLOBAL_HUB_VAULT_ID}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "kaoyan_global_hub_v2",
            data: latestHub
          })
        }).catch(() => {});
        return created.id;
      }
    }
  } catch (e) {
    console.warn("创建新口令专属云端仓库失败:", e);
  }
  return null;
}

function buildCompactCloudPayload(includePrivateBanks = true) {
  const compactRecords = {};
  Object.keys(appState.records || {}).forEach((qId) => {
    const r = appState.records[qId];
    if (
      r &&
      (r.passes > 0 ||
        r.wrongCount > 0 ||
        r.lastOpt ||
        r.revealed ||
        (r.wrongNote && r.wrongNote.trim()) ||
        (r.draft && r.draft.trim()) ||
        r.u > 0)
    ) {
      compactRecords[qId] = {
        p: r.passes || 0,
        w: r.wrongCount || 0,
        res: r.resolved ? 1 : 0,
        o: r.lastOpt || null,
        rev: r.revealed ? 1 : 0,
        n: r.wrongNote || "",
        d: r.draft || "",
        u: r.u || 0
      };
    }
  });
  const payload = {
    updatedAt: appState.updatedAt || Date.now(),
    syncId: normalizeSyncId(appState.syncId),
    activeSubject: appState.activeSubject,
    activeYear: appState.activeYear,
    activeChapter: appState.activeChapter,
    currentQId: appState.currentQId,
    records: compactRecords
  };
  if (includePrivateBanks) {
    payload.privateBanks = privateBanks;
  }
  return payload;
}

function mergeCloudPayloadIntoLocal(cloudData, forceJumpToCurrent = false) {
  if (!cloudData || typeof cloudData !== "object") return false;
  let hasLocalChangesToPush = false;
  let localWasUpdated = false;

  // 1. 合并该口令专属的私人题库
  if (Array.isArray(cloudData.privateBanks) && cloudData.privateBanks.length > 0) {
    const localIds = new Set(privateBanks.map((b) => b.id));
    cloudData.privateBanks.forEach((cb) => {
      if (cb && cb.id && !localIds.has(cb.id)) {
        privateBanks.push(cb);
        localWasUpdated = true;
      }
    });
    if (localWasUpdated) {
      savePrivateBanksLocal();
      rebuildQuestionBankPool();
    }
  }

  // 2. 合并每道题的刷题进度
  const cloudRecords = cloudData.records || {};
  Object.keys(cloudRecords).forEach((qId) => {
    const cr = cloudRecords[qId];
    const lr = getRecord(qId);
    const cloudU = cr.u || 0;
    const localU = lr.u || 0;

    if (cloudU > localU) {
      lr.passes = cr.p ?? lr.passes;
      lr.wrongCount = cr.w ?? lr.wrongCount;
      lr.resolved = Boolean(cr.res);
      lr.lastOpt = cr.o ?? null;
      lr.revealed = Boolean(cr.rev);
      if (cr.n !== undefined) lr.wrongNote = cr.n;
      if (cr.d !== undefined) lr.draft = cr.d;
      lr.u = cloudU;
      localWasUpdated = true;
    } else if (cloudU === localU) {
      if ((cr.p || 0) > lr.passes) {
        lr.passes = cr.p;
        localWasUpdated = true;
      }
      if ((cr.w || 0) > lr.wrongCount) {
        lr.wrongCount = cr.w;
        localWasUpdated = true;
      }
      if (cr.o && !lr.lastOpt) {
        lr.lastOpt = cr.o;
        lr.revealed = Boolean(cr.rev);
        localWasUpdated = true;
      }
    } else {
      hasLocalChangesToPush = true;
    }
  });

  Object.keys(appState.records || {}).forEach((qId) => {
    const lr = appState.records[qId];
    if ((lr.passes > 0 || lr.wrongCount > 0 || lr.lastOpt || lr.u > 0) && !cloudRecords[qId]) {
      hasLocalChangesToPush = true;
    }
  });

  const isFreshDevice = (appState.updatedAt || 0) === 0;
  if ((cloudData.updatedAt || 0) >= (appState.updatedAt || 0)) {
    appState.updatedAt = Math.max(appState.updatedAt || 0, cloudData.updatedAt || 0);
    if (isFreshDevice || forceJumpToCurrent) {
      if (cloudData.activeSubject && cloudData.activeSubject !== appState.activeSubject) {
        appState.activeSubject = cloudData.activeSubject;
        localWasUpdated = true;
      }
      if (cloudData.currentQId && cloudData.currentQId !== appState.currentQId) {
        appState.currentQId = cloudData.currentQId;
        localWasUpdated = true;
      }
    }
  }

  if (localWasUpdated || forceJumpToCurrent) {
    saveState(false);
    renderAll();
  }
  return hasLocalChangesToPush;
}

function getFastChannelTopic(sid) {
  const safe = normalizeSyncId(sid).replace(/[^a-z0-9_-]/g, "_");
  return `kaoyan_v3_sync_${safe}`;
}

async function pushToFastChannel(sid, compactPayload) {
  const topic = getFastChannelTopic(sid);
  const res = await fetch(`https://ntfy.sh/${topic}`, {
    method: "POST",
    body: JSON.stringify(compactPayload),
    cache: "no-store"
  });
  if (!res.ok) throw new Error("fast channel post failed");
  return true;
}

async function pullFromFastChannel(sid) {
  const topic = getFastChannelTopic(sid);
  const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1&_t=${Date.now()}`, {
    cache: "no-store"
  });
  if (!res.ok) return null;
  const text = await res.text();
  const lines = text.trim().split("\n").filter(Boolean);
  let latestPayload = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const msgObj = JSON.parse(lines[i]);
      if (msgObj && msgObj.event === "message" && msgObj.message) {
        const parsed = JSON.parse(msgObj.message);
        if (parsed && parsed.records) {
          latestPayload = parsed;
          break;
        }
      }
    } catch (e) {}
  }
  return latestPayload;
}

async function pushToVaultChannel(sid, fullPayload) {
  const vaultId = await resolveVaultId(sid);
  if (!vaultId) throw new Error("no vault id");
  const res = await fetch(`https://api.restful-api.dev/objects/${vaultId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `kaoyan_sync_${sid}`,
      data: fullPayload
    }),
    cache: "no-store"
  });
  if (!res.ok) throw new Error("vault put failed");
  return true;
}

async function pushToCloud() {
  const sid = normalizeSyncId(appState.syncId);
  if (!sid) return false;

  // 若已有上传在进行中，放入待传队列，绝不丢弃任何一次做题进度！
  if (isPushingNow) {
    pendingPushQueued = true;
    return true;
  }

  isPushingNow = true;
  const tStart = Date.now();
  const { answeredCount } = getProgressSummaryCounts();
  updateSyncStatusUI("syncing", `🔄 正在极速上传口令 [${sid}] 的进度 (${answeredCount}题)...`);
  showCloudToast(`☁️ 正在同步云端进度...`, "syncing", 0);

  const fullPayload = buildCompactCloudPayload(true);
  const fastPayload = buildCompactCloudPayload(false);
  let ok = false;

  try {
    // 双通道并发竞速：直连通道 (ntfy) 与持久化对象库 (restful-api) 同时发出，任一完成即立刻确认成功！
    await Promise.any([
      pushToFastChannel(sid, fastPayload),
      pushToVaultChannel(sid, fullPayload)
    ]);
    ok = true;
  } catch (e) {
    console.warn("云端双通道推送异常:", e);
  } finally {
    isPushingNow = false;
  }

  const costSec = ((Date.now() - tStart) / 1000).toFixed(1);
  if (ok) {
    const timeStr = new Date().toLocaleTimeString("zh-CN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    lastCloudSyncTimeStr = `${timeStr} (耗时 ${costSec}s)`;
    updateSyncStatusUI("ok", `✅ 口令 [${sid}] 云端已同步 · 共 ${answeredCount} 题 (${lastCloudSyncTimeStr})`, true);
    showCloudToast(`✅ 云端已保存 · 口令 [${sid}] (已刷 ${answeredCount} 题)`, "ok", 2200);
  } else {
    updateSyncStatusUI("error", `⚠️ 口令 [${sid}] 已保存在本机`);
    showCloudToast(`⚠️ 网络繁忙，进度已安全保存在本机`, "syncing", 2500);
  }

  // 如果在上传期间用户又做了新题，立即无缝接力上传最新状态
  if (pendingPushQueued) {
    pendingPushQueued = false;
    scheduleCloudPush(80);
  }
  return ok;
}

async function pullFromCloud(forceJumpToCurrent = false) {
  if (isPullingNow) return;
  isPullingNow = true;
  const sid = normalizeSyncId(appState.syncId);
  updateSyncStatusUI("syncing", `🔄 正在从云端同步最新题库与做题进度...`);

  try {
    if (sid) {
      // 双通道并行拉取：1. 快速直连通道 2. 全局中心+专属持久化仓库同时发起
      const fastPromise = pullFromFastChannel(sid).catch(() => null);
      const hubAndVaultPromise = (async () => {
        const knownVaultId = DEFAULT_VAULT_MAP[sid] || localStorage.getItem(`kaoyan_vault_id_v3_${sid}`);
        if (knownVaultId) {
          // 已知仓库 ID 时，直接并行拉取仓库与全局中心，节省一倍等待时间！
          const [vaultRes, hubData] = await Promise.all([
            fetch(`https://api.restful-api.dev/objects/${knownVaultId}`, { cache: "no-store" }).catch(() => null),
            fetchGlobalHubData()
          ]);
          if (hubData && Array.isArray(hubData.publicBanks)) {
            publicBanks = hubData.publicBanks;
            savePublicBanksLocal();
            rebuildQuestionBankPool();
          }
          if (vaultRes && vaultRes.ok) {
            const obj = await vaultRes.json();
            return (obj && obj.data) || null;
          }
          return null;
        } else {
          const hubData = await fetchGlobalHubData();
          if (hubData && Array.isArray(hubData.publicBanks)) {
            publicBanks = hubData.publicBanks;
            savePublicBanksLocal();
            rebuildQuestionBankPool();
          }
          const vaultId = await resolveVaultId(sid, hubData);
          if (vaultId) {
            const res = await fetch(`https://api.restful-api.dev/objects/${vaultId}`, { cache: "no-store" });
            if (res.ok) {
              const obj = await res.json();
              return (obj && obj.data) || null;
            }
          }
          return null;
        }
      })().catch(() => null);

      const [fastPayload, vaultPayload] = await Promise.all([fastPromise, hubAndVaultPromise]);

      let needPushBack = false;
      if (vaultPayload) {
        if (mergeCloudPayloadIntoLocal(vaultPayload, forceJumpToCurrent)) needPushBack = true;
      }
      if (fastPayload) {
        if (mergeCloudPayloadIntoLocal(fastPayload, forceJumpToCurrent)) needPushBack = true;
      }

      renderAll();
      const { answeredCount } = getProgressSummaryCounts();
      const timeStr = new Date().toLocaleTimeString("zh-CN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
      lastCloudSyncTimeStr = timeStr;
      updateSyncStatusUI("ok", `✅ 已同步口令 [${sid}] 云端进度 · 共 ${answeredCount} 题 (${timeStr})`, true);
      if (forceJumpToCurrent) {
        showCloudToast(`✅ 已从云端拉取最新进度 (共 ${answeredCount} 题)`, "ok", 2400);
      }
      if (needPushBack) {
        scheduleCloudPush(200);
      }
    } else {
      const hubData = await fetchGlobalHubData();
      if (hubData && Array.isArray(hubData.publicBanks)) {
        publicBanks = hubData.publicBanks;
        savePublicBanksLocal();
        rebuildQuestionBankPool();
        renderSubjectBar();
      }
      updateSyncStatusUI("error", "🔑 点击设置您的专属刷题口令");
    }
  } finally {
    isPullingNow = false;
  }
}

function scheduleCloudPush(delayMs = 120) {
  if (cloudPushTimer) clearTimeout(cloudPushTimer);
  cloudPushTimer = setTimeout(() => {
    pushToCloud();
  }, delayMs);
}

function renderRecentSyncIdsInModal() {
  const box = document.getElementById("recent-sync-ids-box");
  if (!box) return;
  const recents = getRecentSyncIds();
  if (recents.length === 0) {
    box.innerHTML = "";
    return;
  }
  box.innerHTML = `
    <div style="font-size:12px;color:var(--text-muted);margin-top:10px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
      <span>本机常用口令快切：</span>
      ${recents.map((id) => `
        <button
          class="btn ${id === normalizeSyncId(appState.syncId) ? "btn-primary" : "btn-outline"} btn-xs"
          onclick="quickSwitchSyncId('${escapeHtml(id)}')"
        >${escapeHtml(id)}</button>
      `).join("")}
    </div>
  `;
}

async function quickSwitchSyncId(targetId) {
  const input = document.getElementById("sync-id-input");
  if (input) input.value = normalizeSyncId(targetId);
  await saveAndSwitchSyncId();
}

async function saveAndSwitchSyncId() {
  const input = document.getElementById("sync-id-input");
  if (!input) return;
  const newId = normalizeSyncId(input.value);
  if (!newId) {
    alert("请输入您的专属同步口令（如姓名拼音、学号或昵称）！");
    return;
  }
  input.value = newId;

  if (cloudPushTimer) {
    clearTimeout(cloudPushTimer);
    cloudPushTimer = null;
  }

  localStorage.setItem(ACTIVE_SYNC_ID_KEY, newId);
  recordRecentSyncId(newId);
  loadState(newId);
  saveState(false);
  renderAll();
  renderRecentSyncIdsInModal();
  renderCloudProgressSummary();
  renderCustomBanksManageList();

  const ownerLabel = document.getElementById("current-owner-label");
  if (ownerLabel) ownerLabel.textContent = newId;

  showCloudToast(`🔄 正在切换至口令 [${newId}] 并拉取云端进度...`, "syncing", 0);
  await pullFromCloud(true);
  renderAll();
  renderCloudProgressSummary();
  renderCustomBanksManageList();
}

async function manualPushToCloud() {
  const btn = document.getElementById("btn-manual-push");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "⏳ 正在极速上传...";
  }
  const ok = await pushToCloud();
  const { answeredCount } = getProgressSummaryCounts();
  if (btn) {
    btn.disabled = false;
    btn.textContent = ok ? `✅ 已上传成功 (${answeredCount}题)` : "⚠️ 上传重试";
    setTimeout(() => {
      if (btn) btn.textContent = "⬆️ 立即上传进度到云端";
    }, 2500);
  }
}

async function manualPullFromCloud() {
  const btn = document.getElementById("btn-manual-pull");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "⏳ 正在拉取最新进度...";
  }
  await pullFromCloud(true);
  const { answeredCount } = getProgressSummaryCounts();
  if (btn) {
    btn.disabled = false;
    btn.textContent = `✅ 已同步最新 (${answeredCount}题)`;
    setTimeout(() => {
      if (btn) btn.textContent = "⬇️ 从云端拉取最新进度";
    }, 2500);
  }
}

function exportProgressJsonFile() {
  const dataStr = JSON.stringify(buildCompactCloudPayload(), null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kaoyan_progress_${appState.syncId || "backup"}_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importProgressJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      mergeCloudPayloadIntoLocal(parsed, true);
      pushToCloud();
      alert("🎉 进度文件导入成功，并已同步至云端！");
    } catch (err) {
      alert("❌ 进度文件解析失败：" + err.message);
    }
  };
  reader.readAsText(file);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

window.addEventListener("DOMContentLoaded", () => {
  loadState();
  renderAll();
  if (appState.syncId) {
    updateSyncStatusUI("ok", `☁️ 当前口令: ${appState.syncId}`);
    pullFromCloud(true);
  } else {
    updateSyncStatusUI("error", "🔑 请设置您的专属刷题口令");
    pullFromCloud(false); // 即使未登录口令也拉取公开共享题库
    openSettingsModal("account");
  }
});
