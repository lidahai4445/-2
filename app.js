// ============================================================================
// 《考研全科三刷通关系统》（光电子器件 + 考研数学二 + 考研英语二）核心交互逻辑 (app.js)
// ============================================================================

const STORAGE_KEY = "optoelectronics_3pass_state_v1";
const CUSTOM_Q_KEY = "kaoyan_custom_ai_questions_v1";

const state = {
  activeTab: "practice", // 'practice' | 'calc-bench' | 'wrong-book' | 'ai-hub' | 'notes-gallery'
  subjectFilter: "all",  // 'all' | 'opto' | 'math2' | 'eng2'
  chapterFilter: "all",
  typeFilter: "all",     // 'all' | 'term' | 'short' | 'calc'
  passFilter: "all",     // 'all' | 'unfinished' | 'pass0' | 'pass1' | 'pass2' | 'pass3'
  currentQuestionId: "Q01",
  currentStage: 1,       // 1: 一刷(选择快筛), 2: 二刷(挖空填空), 3: 三刷(默写核对/草稿纸计算)
  showAnswer: false,
  selectedMcq: null,
  calcInstances: {},     // 缓存每道计算题当前生成的参数与步骤答案
  progress: {},          // { [qid]: { passes: 0..3, stagePassed: {1:false,2:false,3:false} } }
  wrongBook: {},         // { [qid]: { count, lastTime, lastStage, detail, note, resolved } }
  customQuestions: []    // 用户通过 AI 提示词生成并导入的扩展题库
};

function loadState() {
  try {
    const customRaw = localStorage.getItem(CUSTOM_Q_KEY);
    if (customRaw) {
      const parsed = JSON.parse(customRaw);
      if (Array.isArray(parsed)) {
        state.customQuestions = parsed;
        parsed.forEach((cq) => {
          if (!window.QUESTIONS.some((q) => q.id === cq.id)) {
            window.QUESTIONS.push(cq);
          }
        });
      }
    }
  } catch (e) {
    console.warn("读取自定义AI导入题库失败:", e);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.progress) state.progress = saved.progress;
      if (saved.wrongBook) state.wrongBook = saved.wrongBook;
      if (saved.currentQuestionId) state.currentQuestionId = saved.currentQuestionId;
      if (saved.subjectFilter) state.subjectFilter = saved.subjectFilter;
    }
  } catch (e) {
    console.warn("读取本地三刷进度失败:", e);
  }

  window.QUESTIONS.forEach((q) => {
    if (!state.progress[q.id]) {
      state.progress[q.id] = { passes: 0, stagePassed: { 1: false, 2: false, 3: false } };
    }
  });
}

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        progress: state.progress,
        wrongBook: state.wrongBook,
        currentQuestionId: state.currentQuestionId,
        subjectFilter: state.subjectFilter
      })
    );
  } catch (e) {
    console.warn("保存本地三刷进度失败:", e);
  }
}

function getFilteredQuestions() {
  return window.QUESTIONS.filter((q) => {
    if (state.subjectFilter !== "all" && q.subject !== state.subjectFilter) return false;
    if (state.activeTab === "calc-bench" && q.type !== "calc") return false;
    if (state.chapterFilter !== "all" && q.chapter !== state.chapterFilter) return false;
    if (state.typeFilter !== "all" && q.type !== state.typeFilter) return false;
    const p = (state.progress[q.id] && state.progress[q.id].passes) || 0;
    if (state.passFilter === "unfinished" && p >= 3) return false;
    if (state.passFilter === "pass0" && p !== 0) return false;
    if (state.passFilter === "pass1" && p !== 1) return false;
    if (state.passFilter === "pass2" && p !== 2) return false;
    if (state.passFilter === "pass3" && p !== 3) return false;
    return true;
  });
}

function getCurrentQuestion() {
  const list = getFilteredQuestions();
  let q = list.find((item) => item.id === state.currentQuestionId);
  if (!q && list.length > 0) {
    q = list[0];
    state.currentQuestionId = q.id;
  }
  return q || window.QUESTIONS[0];
}

function syncRecommendedStage(qid) {
  const rec = state.progress[qid] || { passes: 0, stagePassed: {} };
  if (!rec.stagePassed[1]) state.currentStage = 1;
  else if (!rec.stagePassed[2]) state.currentStage = 2;
  else state.currentStage = 3;
  state.showAnswer = false;
  state.selectedMcq = null;
}

function recordStageSuccess(qid, stageNum) {
  const rec = state.progress[qid] || { passes: 0, stagePassed: { 1: false, 2: false, 3: false } };
  rec.stagePassed[stageNum] = true;
  const count = (rec.stagePassed[1] ? 1 : 0) + (rec.stagePassed[2] ? 1 : 0) + (rec.stagePassed[3] ? 1 : 0);
  rec.passes = count;
  state.progress[qid] = rec;
  saveState();
  renderAll();
}

function recordMistake(qid, stageNum, detailText) {
  const now = new Date().toLocaleString("zh-CN", { hour12: false });
  const existing = state.wrongBook[qid] || {
    count: 0,
    lastTime: now,
    lastStage: stageNum,
    detail: "",
    note: "",
    resolved: false
  };
  existing.count += 1;
  existing.lastTime = now;
  existing.lastStage = stageNum;
  existing.detail = detailText;
  existing.resolved = false;
  state.wrongBook[qid] = existing;
  saveState();
  renderHeaderStats();
  renderQuestionStrip();
}

// 渲染顶部学科切换栏与三刷统计
function renderHeaderStats() {
  const scopeQs = window.QUESTIONS.filter(
    (q) => state.subjectFilter === "all" || q.subject === state.subjectFilter
  );
  const total = scopeQs.length || 1;
  let p1 = 0, p2 = 0, p3 = 0;
  scopeQs.forEach((q) => {
    const rec = state.progress[q.id];
    if (rec) {
      if (rec.passes >= 1) p1++;
      if (rec.passes >= 2) p2++;
      if (rec.passes >= 3) p3++;
    }
  });

  document.getElementById("stat-pass1").textContent = `${p1}/${scopeQs.length}`;
  document.getElementById("stat-pass2").textContent = `${p2}/${scopeQs.length}`;
  document.getElementById("stat-pass3").textContent = `${p3}/${scopeQs.length}`;

  document.getElementById("bar-pass1").style.width = `${Math.round((p1 / total) * 100)}%`;
  document.getElementById("bar-pass2").style.width = `${Math.round((p2 / total) * 100)}%`;
  document.getElementById("bar-pass3").style.width = `${Math.round((p3 / total) * 100)}%`;

  document.getElementById("pct-pass1").textContent = `${p1}/${scopeQs.length}`;
  document.getElementById("pct-pass2").textContent = `${p2}/${scopeQs.length}`;
  document.getElementById("pct-pass3").textContent = `${p3}/${scopeQs.length}`;

  const activeWrongCount = Object.values(state.wrongBook).filter((w) => !w.resolved).length;
  document.getElementById("wrong-count-badge").textContent = activeWrongCount;

  // 渲染学科胶囊切换栏
  const subBar = document.getElementById("subject-pills-container");
  if (subBar && window.SUBJECTS) {
    const allCount = window.QUESTIONS.length;
    let html = `
      <button class="subject-pill ${state.subjectFilter === "all" ? "active" : ""}" onclick="setSubjectFilter('all')">
        <span>🌐 全部考研科目合集</span>
        <span class="sub-badge">${allCount}题</span>
      </button>
    `;
    window.SUBJECTS.forEach((s) => {
      const cnt = window.QUESTIONS.filter((q) => q.subject === s.id).length;
      html += `
        <button class="subject-pill ${state.subjectFilter === s.id ? "active" : ""}" onclick="setSubjectFilter('${s.id}')">
          <span>${s.name}</span>
          <span class="sub-badge">${cnt}题</span>
        </button>
      `;
    });
    subBar.innerHTML = html;
  }
}

// 渲染左侧章节树与筛选器
function renderLeftSidebar() {
  const chapterContainer = document.getElementById("chapter-list");
  const visibleChapters = window.CHAPTERS.filter(
    (ch) => state.subjectFilter === "all" || ch.subject === state.subjectFilter
  );
  const scopeTotal = window.QUESTIONS.filter(
    (q) => state.subjectFilter === "all" || q.subject === state.subjectFilter
  ).length;

  let html = `
    <div class="chapter-item ${state.chapterFilter === "all" ? "active" : ""}" onclick="setChapterFilter('all')">
      <span>📚 当前科目全部章节/专题</span>
      <span class="chapter-meta">${scopeTotal} 题</span>
    </div>
  `;

  visibleChapters.forEach((ch) => {
    const qs = window.QUESTIONS.filter((q) => q.chapter === ch.id);
    const done3 = qs.filter((q) => (state.progress[q.id]?.passes || 0) >= 3).length;
    html += `
      <div class="chapter-item ${state.chapterFilter === ch.id ? "active" : ""}" onclick="setChapterFilter('${ch.id}')">
        <span>${ch.name}</span>
        <span class="chapter-meta">${done3}/${qs.length}★</span>
      </div>
    `;
  });
  chapterContainer.innerHTML = html;

  document.querySelectorAll("[data-type-filter]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-type-filter") === state.typeFilter);
  });
  document.querySelectorAll("[data-pass-filter]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-pass-filter") === state.passFilter);
  });
}

// 渲染题号导航条
function renderQuestionStrip() {
  const list = getFilteredQuestions();
  const grid = document.getElementById("question-dots-grid");
  document.getElementById("filtered-count-label").textContent = `当前筛选共 ${list.length} 道必刷考点/真题`;

  if (list.length === 0) {
    grid.innerHTML = `<div style="font-size:13px;color:#64748b;padding:6px;">当前筛选条件下暂无题目，请切换左侧筛选条件。</div>`;
    return;
  }

  grid.innerHTML = list
    .map((q) => {
      const p = state.progress[q.id]?.passes || 0;
      const hasWrong = state.wrongBook[q.id] && !state.wrongBook[q.id].resolved;
      const stars = "★".repeat(p) + "☆".repeat(3 - p);
      return `
        <div class="q-dot pass-${p} ${q.id === state.currentQuestionId ? "current" : ""} ${hasWrong ? "has-wrong" : ""}"
             onclick="selectQuestion('${q.id}')" title="${q.title}">
          <span>${q.id}</span>
          <span class="q-dot-stars">${stars}</span>
        </div>
      `;
    })
    .join("");
}

// 渲染主舞台区域
function renderMainStage() {
  const stageEl = document.getElementById("main-view-content");

  if (state.activeTab === "wrong-book") {
    renderWrongBookView(stageEl);
    return;
  }
  if (state.activeTab === "notes-gallery") {
    renderNotesGalleryView(stageEl);
    return;
  }
  if (state.activeTab === "ai-hub") {
    renderAiHubView(stageEl);
    return;
  }

  const list = getFilteredQuestions();
  if (list.length === 0) {
    stageEl.innerHTML = `
      <div class="question-card" style="text-align:center;padding:48px 20px;">
        <h3 style="margin-bottom:8px;">🎉 当前筛选条件下没有待刷题目！</h3>
        <p style="color:#64748b;margin-bottom:16px;">您可以切换为「全部科目」或「全部刷次」继续复习。</p>
        <button class="btn btn-primary" onclick="resetFilters()">显示全部考点</button>
      </div>
    `;
    return;
  }

  const q = getCurrentQuestion();
  const rec = state.progress[q.id] || { passes: 0, stagePassed: {} };
  const chObj = window.CHAPTERS.find((c) => c.id === q.chapter);
  const typeClass = q.type === "term" ? "tag-type-term" : q.type === "calc" ? "tag-type-calc" : "tag-type-short";

  let bodyHtml = "";
  if (q.type === "calc" && state.currentStage === 3) {
    bodyHtml = renderCalcWorkbenchHtml(q);
  } else if (state.currentStage === 1) {
    bodyHtml = renderStage1McqHtml(q);
  } else if (state.currentStage === 2) {
    bodyHtml = renderStage2ClozeHtml(q);
  } else {
    bodyHtml = renderStage3RecallHtml(q);
  }

  // 原卷/笔记对照按钮
  let previewBtnHtml = "";
  if (q.kaoyanImg) {
    previewBtnHtml = `<span class="q-tag tag-pdf" onclick="openImageModal('${q.kaoyanImg}', '${q.title} - 真题原卷预览')">📄 查看真题原卷扫描图</span>`;
  } else if (q.subject === "opto" && q.pdfPage) {
    previewBtnHtml = `<span class="q-tag tag-pdf" onclick="openPdfModal(${q.pdfPage})">📖 查看手写笔记原图 P.${q.pdfPage}</span>`;
  }

  // 做题技巧与关联知识点面板
  const tipsHtml =
    q.tips || (q.knowledgePoints && q.knowledgePoints.length > 0)
      ? `
      <div class="tips-kp-panel">
        <div class="tips-box">
          <strong>🎯 考场做题技巧 & 秒杀口诀：</strong><br>
          ${q.tips || "结合题干关键词定位核心公式与同义替换。"}
        </div>
        <div class="kp-box">
          <strong>📚 本题关联高频知识点（需反复强化）：</strong>
          <ul>
            ${(q.knowledgePoints || []).map((kp) => `<li>${kp}</li>`).join("")}
          </ul>
        </div>
      </div>
    `
      : "";

  stageEl.innerHTML = `
    <div class="question-card">
      <div class="q-card-header">
        <div>
          <div class="q-tags">
            <span class="q-tag tag-chapter">${chObj ? chObj.name : ""}</span>
            <span class="q-tag ${typeClass}">${q.typeName}</span>
            ${q.year ? `<span class="q-tag" style="background:#e0e7ff;color:#3730a3;">${q.year}真题</span>` : ""}
            ${previewBtnHtml}
          </div>
          <h2 class="q-title">${q.id}. ${q.title}</h2>
        </div>
        <div class="pass-controller">
          <div class="pass-stars-badge">
            <span>三刷进度：</span>
            <span class="star-icon ${rec.stagePassed[1] ? "filled-1" : ""}">★</span>
            <span class="star-icon ${rec.stagePassed[2] ? "filled-2" : ""}">★</span>
            <span class="star-icon ${rec.stagePassed[3] ? "filled-3" : ""}">★</span>
            <span>(${rec.passes}/3)</span>
          </div>
        </div>
      </div>

      <!-- 一刷 / 二刷 / 三刷 切换栏 -->
      <div class="stage-switcher">
        <button class="stage-btn stage-1 ${state.currentStage === 1 ? "active" : ""}" onclick="setStage(1)">
          ${rec.stagePassed[1] ? "✅" : "①"} 一刷·概念与真题快筛 (选择辨析)
        </button>
        <button class="stage-btn stage-2 ${state.currentStage === 2 ? "active" : ""}" onclick="setStage(2)">
          ${rec.stagePassed[2] ? "✅" : "②"} 二刷·核心公式/同义词挖空 (填空)
        </button>
        <button class="stage-btn stage-3 ${state.currentStage === 3 ? "active" : ""}" onclick="setStage(3)">
          ${rec.stagePassed[3] ? "✅" : "③"} 三刷·${q.type === "calc" ? "现实草稿纸分步实战计算" : "闭卷默写与采分点通关"}
        </button>
      </div>

      <div class="q-prompt-box">${q.prompt}</div>

      ${tipsHtml}

      ${bodyHtml}

      ${
        state.showAnswer
          ? `
        <div class="explanation-panel">
          <div class="explanation-title">
            <span>📌 标准答案与详细步骤精析</span>
          </div>
          <div class="explanation-body">${q.answerHtml}</div>
        </div>
      `
          : ""
      }

      <div class="btn-row" style="border-top:1px solid #e2e8f0;padding-top:16px;margin-top:20px;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-outline" onclick="prevQuestion()">⬅ 上一题</button>
          <button class="btn btn-outline" onclick="nextQuestion()">下一题 ➡</button>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-outline" onclick="toggleAnswer()">
            ${state.showAnswer ? "🙈 隐藏标准答案" : "👁️ 查看标准答案与详细解析"}
          </button>
          ${
            q.type === "calc" && state.currentStage !== 3
              ? `<button class="btn btn-primary" onclick="setStage(3)">📝 进入草稿纸分步计算台</button>`
              : ""
          }
        </div>
      </div>
    </div>
  `;
}

// 一刷：选择题视图
function renderStage1McqHtml(q) {
  const letters = ["A", "B", "C", "D"];
  return `
    <div>
      <div style="font-weight:700;margin-bottom:10px;color:#1d4ed8;">${q.mcq.question}</div>
      <div class="mcq-options">
        ${q.mcq.options
          .map((opt, idx) => {
            let cls = "";
            if (state.selectedMcq !== null) {
              if (idx === q.mcq.answer) cls = "correct";
              else if (idx === state.selectedMcq) cls = "wrong";
            }
            return `
            <button class="mcq-option ${cls}" onclick="submitMcqAnswer('${q.id}', ${idx})">
              <span class="option-letter">${letters[idx]}</span>
              <span>${opt}</span>
            </button>
          `;
          })
          .join("")}
      </div>
      <div id="mcq-feedback-msg" style="font-size:13.5px;font-weight:600;"></div>
    </div>
  `;
}

function submitMcqAnswer(qid, optionIdx) {
  const q = window.QUESTIONS.find((item) => item.id === qid);
  state.selectedMcq = optionIdx;
  state.showAnswer = true;
  if (optionIdx === q.mcq.answer) {
    recordStageSuccess(qid, 1);
    const fb = document.getElementById("mcq-feedback-msg");
    if (fb) {
      fb.style.color = "#059669";
      fb.innerHTML = "✅ 一刷回答正确！已点亮第 1 颗星，点击上方「二刷·核心词挖空」继续强化！";
    }
  } else {
    recordMistake(qid, 1, `一刷选择题误选了选项 ${["A", "B", "C", "D"][optionIdx]}`);
    renderMainStage();
    const fb = document.getElementById("mcq-feedback-msg");
    if (fb) {
      fb.style.color = "#dc2626";
      fb.innerHTML = "❌ 回答错误！已自动加入【错题本】，请认真阅读下方标准答案解析。";
    }
  }
}

// 二刷：关键词挖空填空视图
function renderStage2ClozeHtml(q) {
  const htmlText = q.cloze.text.replace(/\{\{(\d+)\}\}/g, (_, idxStr) => {
    const idx = parseInt(idxStr, 10);
    return `<input type="text" class="cloze-input" id="cloze-in-${idx}" placeholder="填空 ${idx + 1}" autocomplete="off" />`;
  });

  return `
    <div>
      <div style="font-size:13px;color:#6d28d9;font-weight:600;margin-bottom:8px;">
        ✍️ 二刷要求：请在不看答案的情况下填入核心公式/同义词/采分关键词，全部填对点亮第 2 颗星！
      </div>
      <div class="cloze-box">${htmlText}</div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="checkClozeAnswers('${q.id}')">✔️ 提交二刷填空批改</button>
        <button class="btn btn-outline" onclick="fillClozeHints('${q.id}')">💡 填入参考答案对照背诵</button>
        <button class="btn btn-success" onclick="manualPassStage2('${q.id}')">✅ 我已在纸上/口头背出全部空缺（计入二刷）</button>
      </div>
      <div id="cloze-feedback" style="margin-top:10px;font-size:13.5px;font-weight:600;"></div>
    </div>
  `;
}

function normalizeStr(s) {
  return (s || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[（）()·.，,、]/g, "");
}

function checkClozeAnswers(qid) {
  const q = window.QUESTIONS.find((item) => item.id === qid);
  let allCorrect = true;
  const wrongList = [];

  q.cloze.answers.forEach((ans, idx) => {
    const inputEl = document.getElementById(`cloze-in-${idx}`);
    if (!inputEl) return;
    const userVal = normalizeStr(inputEl.value);
    const stdVal = normalizeStr(ans);
    if (userVal && (userVal === stdVal || stdVal.includes(userVal) || userVal.includes(stdVal))) {
      inputEl.classList.remove("wrong");
      inputEl.classList.add("correct");
    } else {
      allCorrect = false;
      inputEl.classList.remove("correct");
      inputEl.classList.add("wrong");
      wrongList.push(`空${idx + 1}(标准:${ans})`);
    }
  });

  const fb = document.getElementById("cloze-feedback");
  state.showAnswer = true;
  if (allCorrect) {
    recordStageSuccess(qid, 2);
    if (fb) {
      fb.style.color = "#059669";
      fb.innerHTML = "🎉 太棒了！二刷所有核心关键词全部正确，已点亮第 2 颗星！";
    }
  } else {
    recordMistake(qid, 2, `二刷关键词填空未全对：${wrongList.join("、")}`);
    if (fb) {
      fb.style.color = "#dc2626";
      fb.innerHTML = `⚠️ 存在未填对的关键词（${wrongList.join("；")}），已自动收录进【错题本】！`;
    }
  }
}

function fillClozeHints(qid) {
  const q = window.QUESTIONS.find((item) => item.id === qid);
  q.cloze.answers.forEach((ans, idx) => {
    const inputEl = document.getElementById(`cloze-in-${idx}`);
    if (inputEl) {
      inputEl.value = ans;
      inputEl.classList.remove("wrong");
      inputEl.classList.add("correct");
    }
  });
  state.showAnswer = true;
}

function manualPassStage2(qid) {
  recordStageSuccess(qid, 2);
}

// 三刷：闭卷默写与采分点核对视图
function renderStage3RecallHtml(q) {
  return `
    <div class="recall-area">
      <div style="font-size:13px;color:#047857;font-weight:600;margin-bottom:8px;">
        🏆 三刷终极通关：请在下方默写框或您的实体草稿纸上完整默写/推演本题，然后逐项勾选下方【采分点自检清单】：
      </div>
      <textarea class="recall-textarea" placeholder="在此处默写要点/译文/范文，或直接在您的现实草稿纸上推演后核对下方采分点..."></textarea>

      <div class="rubric-checklist">
        <div style="font-weight:700;font-size:13.5px;margin-bottom:8px;color:#0f172a;">
          📋 标准采分点核对清单（必须全部掌握方可点亮第 3 颗星）：
        </div>
        ${(q.rubric || [])
          .map(
            (r, idx) => `
          <label class="rubric-item">
            <input type="checkbox" class="rubric-chk" data-idx="${idx}" />
            <span>${r}</span>
          </label>
        `
          )
          .join("")}
      </div>

      <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;">
        <button class="btn btn-success" onclick="submitStage3Rubric('${q.id}')">
          🌟 确认采分点已全部掌握（完成三刷通关！）
        </button>
        <button class="btn btn-danger" onclick="failStage3Rubric('${q.id}')">
          ❌ 还有采分点没背熟（记入错题本重点复习）
        </button>
      </div>
      <div id="stage3-feedback" style="margin-top:10px;font-size:13.5px;font-weight:600;"></div>
    </div>
  `;
}

function submitStage3Rubric(qid) {
  const chks = Array.from(document.querySelectorAll(".rubric-chk"));
  const allChecked = chks.length > 0 && chks.every((c) => c.checked);
  state.showAnswer = true;
  if (!allChecked) {
    chks.forEach((c) => (c.checked = true));
  }
  recordStageSuccess(qid, 3);
  const fb = document.getElementById("stage3-feedback");
  if (fb) {
    fb.style.color = "#059669";
    fb.innerHTML = "🏆 恭喜！该知识点已完成【三刷通关 (3/3★)】！";
  }
}

function failStage3Rubric(qid) {
  state.showAnswer = true;
  recordMistake(qid, 3, "三刷闭卷默写自评：部分核心采分点未背熟");
  renderMainStage();
}

// ============================================================================
// 现实草稿纸辅助计算工作台渲染与分步验算
// ============================================================================
function getOrInitCalcInstance(q, forceRandom = false) {
  if (!state.calcInstances[q.id] || forceRandom) {
    const gen = window.CALC_GENERATORS[q.calcType];
    state.calcInstances[q.id] = gen ? gen(forceRandom) : null;
  }
  return state.calcInstances[q.id];
}

function randomizeCalcParams(qid) {
  const q = window.QUESTIONS.find((item) => item.id === qid);
  if (!q) return;
  getOrInitCalcInstance(q, true);
  state.showAnswer = false;
  renderMainStage();
}

function resetStandardCalcParams(qid) {
  const q = window.QUESTIONS.find((item) => item.id === qid);
  if (!q) return;
  delete state.calcInstances[qid];
  getOrInitCalcInstance(q, false);
  state.showAnswer = false;
  renderMainStage();
}

function renderCalcWorkbenchHtml(q) {
  const inst = getOrInitCalcInstance(q, false);
  if (!inst) return renderStage3RecallHtml(q);

  return `
    <div class="scratchpad-workbench">
      <div class="scratchpad-banner">
        <div>
          <span class="scratchpad-code">📝 草稿纸题头定位：${inst.code}</span>
          <div style="font-size:12.5px;margin-top:4px;">${inst.noteTip}</div>
        </div>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-outline btn-sm" onclick="resetStandardCalcParams('${q.id}')">📌 恢复原题参数</button>
          <button class="btn btn-primary btn-sm" onclick="randomizeCalcParams('${q.id}')">🎲 随机变参在草稿纸重算</button>
        </div>
      </div>

      <div style="font-size:12.5px;font-weight:700;color:#475569;margin-bottom:6px;">
        ① 第一步：请在您的现实草稿纸上抄写以下已知条件：
      </div>
      <div class="given-params-grid">
        ${inst.params
          .map(
            (p) => `
          <div class="param-box">
            <span class="param-name">${p.name}</span>
            <span class="param-val">${p.val}</span>
          </div>
        `
          )
          .join("")}
      </div>

      <div style="font-size:12.5px;font-weight:700;color:#475569;margin-bottom:8px;">
        ② 第二步：在现实草稿纸上分步列式推导，每算完一步可在下方输入数值单独验算：
      </div>
      <div class="calc-steps-list">
        ${inst.steps
          .map(
            (st, idx) => `
          <div class="calc-step-card" id="calc-step-card-${idx}">
            <div class="step-header">
              <div class="step-title">
                <span class="step-badge">草稿第 ${idx + 1} 步</span>
                <span>${st.label}</span>
              </div>
              <button class="step-hint-btn" onclick="toggleStepFormula(${idx})">💡 查看本步公式提示</button>
            </div>
            <div class="step-formula-hint" id="step-formula-${idx}" style="display:none;">
              <strong>草稿列式提示：</strong> <span class="math-inline">${st.formula}</span>
            </div>
            <div class="step-input-row">
              <input type="number" step="any" class="step-num-input" id="step-input-${idx}" placeholder="输入草稿计算结果" />
              <span class="step-unit">${st.unit}</span>
              <button class="btn btn-outline btn-sm" onclick="verifySingleCalcStep('${q.id}', ${idx})">🔍 单独验算本步</button>
            </div>
            <div class="step-feedback" id="step-fb-${idx}"></div>
          </div>
        `
          )
          .join("")}
      </div>

      <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;">
        <button class="btn btn-success" onclick="verifyAllCalcSteps('${q.id}')">
          ✅ 提交全部草稿步骤并完成三刷评判
        </button>
        <button class="btn btn-outline" onclick="fillAllCalcAnswers('${q.id}')">
          📖 显示各步标准数值对照草稿纸
        </button>
      </div>
      <div id="calc-overall-fb" style="margin-top:10px;font-size:14px;font-weight:700;"></div>
    </div>
  `;
}

function toggleStepFormula(idx) {
  const el = document.getElementById(`step-formula-${idx}`);
  if (el) el.style.display = el.style.display === "none" ? "block" : "none";
}

function verifySingleCalcStep(qid, idx) {
  const q = window.QUESTIONS.find((item) => item.id === qid);
  const inst = getOrInitCalcInstance(q, false);
  const st = inst.steps[idx];
  const inputEl = document.getElementById(`step-input-${idx}`);
  const cardEl = document.getElementById(`calc-step-card-${idx}`);
  const fbEl = document.getElementById(`step-fb-${idx}`);
  if (!inputEl || !st) return false;

  const val = parseFloat(inputEl.value);
  if (isNaN(val)) {
    cardEl.classList.remove("step-correct");
    cardEl.classList.add("step-wrong");
    fbEl.style.color = "#dc2626";
    fbEl.textContent = "⚠️ 请先输入您在草稿纸上算出的数值！";
    return false;
  }

  const diff = Math.abs(val - st.answer);
  const ok = diff <= st.tolerance || diff / Math.max(Math.abs(st.answer), 1e-6) <= 0.025;

  if (ok) {
    cardEl.classList.remove("step-wrong");
    cardEl.classList.add("step-correct");
    fbEl.style.color = "#059669";
    fbEl.textContent = `✅ 本步正确！（标准值：${st.answer} ${st.unit}，您的草稿计算非常精准）`;
    return true;
  } else {
    cardEl.classList.remove("step-correct");
    cardEl.classList.add("step-wrong");
    fbEl.style.color = "#dc2626";
    fbEl.textContent = `❌ 本步偏差较大（标准值为 ${st.answer} ${st.unit}），请检查草稿纸上的公式或正负号！`;
    return false;
  }
}

function verifyAllCalcSteps(qid) {
  const q = window.QUESTIONS.find((item) => item.id === qid);
  const inst = getOrInitCalcInstance(q, false);
  let allOk = true;
  const wrongSteps = [];

  inst.steps.forEach((st, idx) => {
    const ok = verifySingleCalcStep(qid, idx);
    if (!ok) {
      allOk = false;
      wrongSteps.push(`第${idx + 1}步(${st.label})`);
    }
  });

  const overallFb = document.getElementById("calc-overall-fb");
  state.showAnswer = true;
  if (allOk) {
    recordStageSuccess(qid, 1);
    recordStageSuccess(qid, 2);
    recordStageSuccess(qid, 3);
    if (overallFb) {
      overallFb.style.color = "#059669";
      overallFb.innerHTML = "🎉 全部草稿步骤验算通过！本题已直接点亮三刷三星通关 (★★★)！";
    }
  } else {
    recordMistake(qid, 3, `草稿纸计算题步骤出错：${wrongSteps.join("、")}`);
    if (overallFb) {
      overallFb.style.color = "#dc2626";
      overallFb.innerHTML = `⚠️ 计算存在错误步骤（${wrongSteps.join("、")}），已自动记入【错题本】！`;
    }
  }
}

function fillAllCalcAnswers(qid) {
  const q = window.QUESTIONS.find((item) => item.id === qid);
  const inst = getOrInitCalcInstance(q, false);
  inst.steps.forEach((st, idx) => {
    const inputEl = document.getElementById(`step-input-${idx}`);
    const formulaEl = document.getElementById(`step-formula-${idx}`);
    if (inputEl) inputEl.value = st.answer;
    if (formulaEl) formulaEl.style.display = "block";
    verifySingleCalcStep(qid, idx);
  });
}

// ============================================================================
// 自动错题本视图 (Wrong Question Book)
// ============================================================================
function renderWrongBookView(container) {
  const entries = Object.entries(state.wrongBook);
  if (entries.length === 0) {
    container.innerHTML = `
      <div class="question-card" style="text-align:center;padding:48px 20px;">
        <h2 style="margin-bottom:8px;">✨ 错题本目前为空！</h2>
        <p style="color:#64748b;margin-bottom:16px;">您在光电子器件、数学二、英语二三刷过程中答错或未掌握的题目都会自动整理到这里。</p>
        <button class="btn btn-primary" onclick="switchTab('practice')">返回三刷题库开始刷题</button>
      </div>
    `;
    return;
  }

  const cardsHtml = entries
    .sort((a, b) => (a[1].resolved === b[1].resolved ? b[1].count - a[1].count : a[1].resolved ? 1 : -1))
    .map(([qid, info]) => {
      const q = window.QUESTIONS.find((item) => item.id === qid);
      if (!q) return "";
      return `
        <div class="wrong-item-card ${info.resolved ? "resolved" : ""}">
          <div class="wrong-meta-bar">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span class="badge-pill badge-danger">累计错 ${info.count} 次</span>
              <span class="q-tag tag-chapter">${q.id} · ${q.typeName}</span>
              <span style="font-size:12px;color:#64748b;">最近出错：${info.lastTime}（第 ${info.lastStage} 刷）</span>
            </div>
            <div style="display:flex;gap:6px;">
              <button class="btn btn-primary btn-sm" onclick="jumpToWrongQuestion('${q.id}', ${info.lastStage})">
                🎯 立即重刷此题
              </button>
              <button class="btn btn-outline btn-sm" onclick="toggleResolveWrong('${q.id}')">
                ${info.resolved ? "🔄 标为未攻克" : "✅ 标为已攻克"}
              </button>
            </div>
          </div>
          <h3 style="font-size:16px;margin-bottom:6px;">${q.title}</h3>
          <div style="font-size:13px;color:#b91c1c;background:#fef2f2;padding:6px 10px;border-radius:6px;margin-bottom:8px;">
            <strong>出错原因记录：</strong> ${info.detail}
          </div>
          <div style="font-size:13.5px;color:#334155;background:#f8fafc;padding:10px 12px;border-radius:6px;">
            ${q.answerHtml}
          </div>
          <input type="text" class="wrong-note-input" placeholder="✏️ 添加个人防错总结/易错点备注（自动保存）..."
                 value="${(info.note || "").replace(/"/g, "&quot;")}"
                 onchange="saveWrongNote('${q.id}', this.value)" />
        </div>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="question-card" style="margin-bottom:14px;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
        <div>
          <h2 style="font-size:18px;">📕 全科自动错题整理本（共收录 ${entries.length} 题）</h2>
          <p style="font-size:12.5px;color:#64748b;">涵盖光电子器件、考研数学二、考研英语二全部错题记录。</p>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-outline btn-sm" onclick="window.print()">🖨️ 打印/导出错题清单</button>
        </div>
      </div>
    </div>
    <div class="wrong-book-container">${cardsHtml}</div>
  `;
}

function jumpToWrongQuestion(qid, stageNum) {
  const q = window.QUESTIONS.find((item) => item.id === qid);
  state.activeTab = "practice";
  if (q && q.subject) state.subjectFilter = q.subject;
  state.chapterFilter = "all";
  state.typeFilter = "all";
  state.passFilter = "all";
  state.currentQuestionId = qid;
  state.currentStage = stageNum || 1;
  state.showAnswer = false;
  renderAll();
}

function toggleResolveWrong(qid) {
  if (state.wrongBook[qid]) {
    state.wrongBook[qid].resolved = !state.wrongBook[qid].resolved;
    saveState();
    renderAll();
  }
}

function saveWrongNote(qid, val) {
  if (state.wrongBook[qid]) {
    state.wrongBook[qid].note = val;
    saveState();
  }
}

// ============================================================================
// 🤖 高频需大量重复记忆手册 & 外部 AI 题库提示词与一键导入中心 (AI Hub)
// ============================================================================
function renderAiHubView(container) {
  const mathPrompt = window.AI_PROMPTS ? window.AI_PROMPTS.math2 : "";
  const engPrompt = window.AI_PROMPTS ? window.AI_PROMPTS.eng2 : "";

  container.innerHTML = `
    <div class="question-card" style="margin-bottom:16px;">
      <h2 style="font-size:19px;margin-bottom:6px;">🤖 AI 批量生成题库提示词 (Prompts) & 一键导入中心</h2>
      <p style="font-size:13.5px;color:#475569;margin-bottom:14px;">
        您可以点击下方按钮一键复制标准化提示词（Prompt），连同任意年份的数学二/英语二/专业课资料发给其他 AI（如 DeepSeek、ChatGPT、Claude、Kimi、豆包等）。将其他 AI 生成的 JSON 数组粘贴到下方输入框，即可<strong>一键并入本网页进行三刷与错题管理</strong>！
      </p>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;">
        <div style="border:1px solid #cbd5e1;border-radius:10px;padding:14px;background:#f8fafc;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <strong style="color:#1d4ed8;">📐 提示词模板 A：让别的 AI 生成【数学二】真题 JSON</strong>
            <button class="btn btn-primary btn-sm" onclick="copyPromptText('math2')">📋 一键复制数二提示词</button>
          </div>
          <div class="prompt-code-box" id="prompt-box-math2">${mathPrompt.replace(/</g, "&lt;")}</div>
        </div>

        <div style="border:1px solid #cbd5e1;border-radius:10px;padding:14px;background:#f8fafc;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <strong style="color:#047857;">🇬🇧 提示词模板 B：让别的 AI 生成【英语二】真题 JSON</strong>
            <button class="btn btn-success btn-sm" onclick="copyPromptText('eng2')">📋 一键复制英二提示词</button>
          </div>
          <div class="prompt-code-box" id="prompt-box-eng2">${engPrompt.replace(/</g, "&lt;")}</div>
        </div>
      </div>

      <div style="border-top:1px dashed #cbd5e1;padding-top:16px;">
        <h3 style="font-size:16px;margin-bottom:6px;">📥 粘贴其他 AI 生成的 JSON 题库（一键接入三刷系统）</h3>
        <textarea id="custom-json-input" class="json-import-textarea" placeholder='请将其他 AI 输出的 JSON 数组 [ { "id": "...", "subject": "math2", ... } ] 粘贴在此处...'></textarea>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <div style="display:flex;gap:10px;">
            <button class="btn btn-primary" onclick="importCustomJsonQuestions()">🚀 立即校验并接入网页题库</button>
            <button class="btn btn-danger btn-sm" onclick="clearCustomJsonQuestions()">🗑️ 清空已导入的自定义题目 (当前已导入 ${state.customQuestions.length} 题)</button>
          </div>
          <span id="json-import-msg" style="font-size:13.5px;font-weight:700;"></span>
        </div>
      </div>
    </div>

    <!-- 需大量重复记忆的高频知识点速记总表 -->
    <div class="question-card">
      <h2 style="font-size:19px;margin-bottom:10px;">🔥 需大量重复记忆的高频必背知识点精粹（每日早晚默写一遍）</h2>

      <div class="formula-card">
        <strong>一、【考研数学二】八大三阶泰勒展开式（<i>x</i> → 0 时见到加减法消首项必用！）</strong><br>
        1. sin <i>x</i> = <i>x</i> − <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>6</span></span><i>x</i><sup>3</sup> + <i>o</i>(<i>x</i><sup>3</sup>) &nbsp;|&nbsp;
        2. arcsin <i>x</i> = <i>x</i> + <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>6</span></span><i>x</i><sup>3</sup> + <i>o</i>(<i>x</i><sup>3</sup>)<br>
        3. tan <i>x</i> = <i>x</i> + <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>3</span></span><i>x</i><sup>3</sup> + <i>o</i>(<i>x</i><sup>3</sup>) &nbsp;|&nbsp;
        4. arctan <i>x</i> = <i>x</i> − <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>3</span></span><i>x</i><sup>3</sup> + <i>o</i>(<i>x</i><sup>3</sup>)<br>
        5. 1 − cos <i>x</i> ~ <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span><i>x</i><sup>2</sup> ，1 − cos<sup><i>α</i></sup><i>x</i> ~ <span class='frac'><span class='frac-num'><i>α</i></span><span class='frac-den'>2</span></span><i>x</i><sup>2</sup><br>
        6. ln(1 + <i>x</i>) = <i>x</i> − <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>2</span></span><i>x</i><sup>2</sup> + <span class='frac'><span class='frac-num'>1</span><span class='frac-den'>3</span></span><i>x</i><sup>3</sup> + <i>o</i>(<i>x</i><sup>3</sup>) &nbsp;|&nbsp;
        7. (1 + <i>x</i>)<sup><i>α</i></sup> − 1 ~ <i>αx</i> + <span class='frac'><span class='frac-num'><i>α</i>(<i>α</i>−1)</span><span class='frac-den'>2</span></span><i>x</i><sup>2</sup>
      </div>

      <div class="formula-card">
        <strong>二、【考研数学二】微积分与线代高频秒杀二级结论</strong><br>
        • <strong>反函数导数</strong>：若 <i>y</i><sub>0</sub> = <i>f</i>(<i>x</i><sub>0</sub>)，则 <i>g'</i>(<i>y</i><sub>0</sub>) = <span class='frac'><span class='frac-num'>1</span><span class='frac-den'><i>f'</i>(<i>x</i><sub>0</sub>)</span></span> &nbsp;|&nbsp;
        <strong>曲率半径</strong>：<i>R</i> = <span class='frac'><span class='frac-num'>(1 + <i>y'</i><sup>2</sup>)<sup>3/2</sup></span><span class='frac-den'>|<i>y''</i>|</span></span><br>
        • <strong>非齐次线性微分方程特解组合</strong>：<i>k</i><sub>1</sub><i>y</i><sub>1</sub> + <i>k</i><sub>2</sub><i>y</i><sub>2</sub> 为非齐次解 ⇔ <i>k</i><sub>1</sub> + <i>k</i><sub>2</sub> = 1；为齐次解 ⇔ <i>k</i><sub>1</sub> + <i>k</i><sub>2</sub> = 0。<br>
        • <strong>二元极值充分条件</strong>：驻点处 <i>AC − B</i><sup>2</sup> &gt; 0 有极值（<i>A</i> &lt; 0 极大，<i>A</i> &gt; 0 极小）；<i>AC − B</i><sup>2</sup> &lt; 0 无极值。<br>
        • <strong>秩 1 / 秩 2 矩阵求高次幂</strong>：若 <i>A = GH</i>，则 <i>A<sup>n</sup></i> = <i>G</i>(<i>HG</i>)<sup><i>n</i>−1</sup><i>H</i>。
      </div>

      <div class="formula-card">
        <strong>三、【考研英语二】阅读态度词 & 大小作文必背功能句（需默写10遍）</strong><br>
        • <strong>态度题必排陪跑词</strong>：<code>indifferent</code>（漠不关心）、<code>unconcerned</code>、<code>prejudiced/biased</code>（偏见）、<code>puzzled/confused</code>（困惑）、<code>indulgent</code>（纵容）。<br>
        • <strong>小作文开头万能句</strong>：<code>I am writing this email to warmly invite you to take part in... / share my suggestions on...</code><br>
        • <strong>大作文第一段描图句</strong>：<code>As is vividly illustrated in the chart above, the proportion of... surged dramatically from X% to Y%, whereas that of... witnessed a slight decline.</code><br>
        • <strong>大作文第二段析因句</strong>：<code>Several key factors account for this remarkable phenomenon. First and foremost, people attach increasing importance to...</code>
      </div>
    </div>
  `;
}

function copyPromptText(key) {
  const txt = window.AI_PROMPTS && window.AI_PROMPTS[key];
  if (!txt) return;
  navigator.clipboard.writeText(txt).then(() => {
    const msg = document.getElementById("json-import-msg");
    if (msg) {
      msg.style.color = "#059669";
      msg.textContent = `✅ 已成功复制【${key === "math2" ? "考研数学二" : "考研英语二"}】AI 生成提示词到剪贴板！`;
    }
  });
}

function importCustomJsonQuestions() {
  const input = document.getElementById("custom-json-input");
  const msg = document.getElementById("json-import-msg");
  if (!input || !msg) return;

  try {
    let raw = input.value.trim();
    raw = raw.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
    const arr = JSON.parse(raw);
    const items = Array.isArray(arr) ? arr : [arr];
    let added = 0;

    items.forEach((item) => {
      if (item && item.id && item.title && item.mcq && item.cloze) {
        item.subject = item.subject || "math2";
        item.chapter = item.chapter || (item.subject === "eng2" ? "e_ch2" : "m_ch1");
        item.type = item.type || "short";
        item.typeName = item.typeName || "AI导入真题";
        item.rubric = item.rubric || ["准确掌握本题核心公式与采分点"];
        item.answerHtml = item.answerHtml || "请参考题干与解析掌握核心要点。";

        const existIdx = window.QUESTIONS.findIndex((q) => q.id === item.id);
        if (existIdx >= 0) {
          window.QUESTIONS[existIdx] = item;
        } else {
          window.QUESTIONS.push(item);
        }
        if (!state.progress[item.id]) {
          state.progress[item.id] = { passes: 0, stagePassed: { 1: false, 2: false, 3: false } };
        }
        state.customQuestions.push(item);
        added++;
      }
    });

    localStorage.setItem(CUSTOM_Q_KEY, JSON.stringify(state.customQuestions));
    saveState();
    renderHeaderStats();
    renderLeftSidebar();
    renderQuestionStrip();
    msg.style.color = "#059669";
    msg.textContent = `🎉 成功导入并接入 ${added} 道新题目！您现在可以切换到对应学科开始三刷了！`;
    input.value = "";
  } catch (e) {
    msg.style.color = "#dc2626";
    msg.textContent = "❌ JSON 解析失败，请检查粘贴的内容是否为合法的 JSON 数组格式 [...]";
  }
}

function clearCustomJsonQuestions() {
  localStorage.removeItem(CUSTOM_Q_KEY);
  state.customQuestions = [];
  location.reload();
}

// ============================================================================
// 原版手写笔记与真题原卷画廊 (Notes Gallery)
// ============================================================================
function renderNotesGalleryView(container) {
  const pageDescs = [
    "光电子笔记 P.1：光通信系统组成、光电子器件分类、LED与LD定义/原理/分类/特性参数/偏置选择与控制",
    "光电子笔记 P.2：LED能带复合图、P-I曲线、温度光谱特性；LD的P-I阈值特性与温度特性曲线(Ith=I0·exp(T/T0))",
    "光电子笔记 P.3：LD外微分量子效率公式；5种单模光纤(G.652~G.655/色散平坦)；光纤分类；单模参数V与衰减α；光纤非线性效应",
    "光电子笔记 P.4：石英光纤预制棒制造4法(OVPD/VAD/MCVD/PCVD)；PIN PD与APD工作原理、截止波长λc与平均雪崩增益G",
    "光电子笔记 P.5：APD的G-V曲线（与反向偏压、温度、波长的关系图解）及APD响应速度3大决定因素",
    "光电子笔记 P.6：光接收机3种前置放大器；光纤激光器、EDFA、FRA、FBA、SOA原理及FRA/FBA算泵浦波长公式",
    "光电子笔记 P.7：EDFA三能级跃迁与受激辐射原理图；影响EDFA增益的4大因素关系曲线（最佳光纤长度、饱和输出功率、35nm带宽）",
    "光电子笔记 P.8：电光/声光/磁光效应、间接调制器；光调制器分类树；光纤活动/固定连接器、插入损耗5因素与光纤对准3法",
    "光电子笔记 P.9：光耦合器的4维分类与4大技术参数公式（插入损耗I·L、附加损耗E·L、分光比C·R、方向性D·L）"
  ];

  const kaoyanYears = [2022, 2023, 2024, 2025, 2026];

  container.innerHTML = `
    <div class="question-card" style="margin-bottom:16px;">
      <h2 style="font-size:18px;margin-bottom:6px;">📐 2022—2026 考研数学二真题原卷扫描预览</h2>
      <p style="font-size:13px;color:#64748b;margin-bottom:14px;">点击可放大查看近五年考研数学二真题原卷首页扫描图。</p>
      <div class="kp-grid">
        ${kaoyanYears
          .map(
            (yr) => `
          <div class="kp-summary-card">
            <div style="font-weight:700;font-size:13.5px;color:#1d4ed8;">${yr}年考研数学二真题原卷 (P.1)</div>
            <img src="assets/kaoyan/math2_${yr}_p1.png" alt="${yr}数二真题"
                 style="width:100%;height:200px;object-fit:cover;object-position:top;border-radius:6px;border:1px solid #cbd5e1;cursor:pointer;"
                 onclick="openImageModal('assets/kaoyan/math2_${yr}_p1.png', '${yr}年考研数学二真题原卷 P.1')" />
            <button class="btn btn-outline btn-sm" style="width:100%;justify-content:center;"
                    onclick="openImageModal('assets/kaoyan/math2_${yr}_p1.png', '${yr}年考研数学二真题原卷 P.1')">
              🔍 放大查看 ${yr} 年真题原卷
            </button>
          </div>
        `
          )
          .join("")}
      </div>
    </div>

    <div class="question-card">
      <h2 style="font-size:18px;margin-bottom:6px;">📖 《光电子器件(1).pdf》9页扫描笔记与教材图解全景对照</h2>
      <div class="kp-grid">
        ${pageDescs
          .map(
            (desc, i) => `
          <div class="kp-summary-card">
            <div>
              <div style="font-weight:700;font-size:13.5px;margin-bottom:6px;color:#1d4ed8;">第 ${i + 1} 页原版扫描件</div>
              <p style="font-size:12.5px;color:#334155;margin-bottom:10px;">${desc}</p>
            </div>
            <img src="assets/notes/page_${i + 1}.png" alt="第${i + 1}页笔记"
                 style="width:100%;height:220px;object-fit:cover;object-position:top;border-radius:6px;border:1px solid #cbd5e1;cursor:pointer;"
                 onclick="openPdfModal(${i + 1})" />
            <button class="btn btn-outline btn-sm" style="width:100%;justify-content:center;" onclick="openPdfModal(${i + 1})">
              🔍 放大查看第 ${i + 1} 页高清大图
            </button>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

// ============================================================================
// 右侧光电/高数科学计算器与快捷换算工具
// ============================================================================
function evalSciCalc(mode) {
  const input = document.getElementById("sci-calc-input");
  const out = document.getElementById("sci-calc-output");
  if (!input || !out) return;
  const raw = input.value.trim();
  const x = parseFloat(raw);

  try {
    if (mode === "eval") {
      const safe = raw.replace(/\^/g, "**");
      const res = Function(`"use strict"; return (${safe});`)();
      out.textContent = `= ${Number(res).toPrecision(6)}`;
    } else if (mode === "lg") {
      out.textContent = `lg(${x}) = ${Math.log10(x).toFixed(4)} | ln(${x}) = ${Math.log(x).toFixed(4)}`;
    } else if (mode === "neg10lg") {
      out.textContent = `-10·lg(${x}) = ${(-10 * Math.log10(x)).toFixed(3)} dB`;
    } else if (mode === "10lg") {
      out.textContent = `10·lg(${x}) = ${(10 * Math.log10(x)).toFixed(3)} dB`;
    } else if (mode === "mw2dbm") {
      out.textContent = `${x} mW = ${(10 * Math.log10(x)).toFixed(2)} dBm`;
    } else if (mode === "dbm2mw") {
      out.textContent = `${x} dBm = ${Math.pow(10, x / 10).toFixed(4)} mW`;
    } else if (mode === "eg2lam") {
      out.textContent = `λp = 1.2396/${x} = ${(1.2396 / x).toFixed(3)} μm`;
    } else if (mode === "nm2thz") {
      out.textContent = `f = 300000/${x} = ${(300000 / x).toFixed(2)} THz`;
    } else if (mode === "clear") {
      input.value = "";
      out.textContent = "等待输入...";
    }
  } catch (e) {
    out.textContent = "表达式格式有误";
  }
}

function appendCalcChar(ch) {
  const input = document.getElementById("sci-calc-input");
  if (input) {
    input.value += ch;
    input.focus();
  }
}

// ============================================================================
// 交互导航与弹窗事件
// ============================================================================
function setSubjectFilter(sub) {
  state.subjectFilter = sub;
  state.chapterFilter = "all";
  state.typeFilter = "all";
  if (state.activeTab === "ai-hub" || state.activeTab === "notes-gallery") {
    state.activeTab = "practice";
    document.querySelectorAll(".nav-tab").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-tab") === "practice");
    });
  }
  const list = getFilteredQuestions();
  if (list.length > 0) {
    state.currentQuestionId = list[0].id;
    syncRecommendedStage(state.currentQuestionId);
  }
  saveState();
  renderAll();
}

function switchTab(tab) {
  state.activeTab = tab;
  if (tab === "calc-bench") {
    state.typeFilter = "calc";
    const calcQs = getFilteredQuestions();
    if (calcQs.length > 0) {
      state.currentQuestionId = calcQs[0].id;
      state.currentStage = 3;
    }
  } else if (tab === "practice" && state.typeFilter === "calc") {
    state.typeFilter = "all";
  }
  document.querySelectorAll(".nav-tab").forEach((el) => {
    el.classList.toggle("active", el.getAttribute("data-tab") === tab);
  });
  renderAll();
}

function setChapterFilter(ch) {
  state.chapterFilter = ch;
  const list = getFilteredQuestions();
  if (list.length > 0) {
    state.currentQuestionId = list[0].id;
    syncRecommendedStage(state.currentQuestionId);
  }
  renderAll();
}

function setTypeFilter(t) {
  state.typeFilter = t;
  const list = getFilteredQuestions();
  if (list.length > 0) {
    state.currentQuestionId = list[0].id;
    syncRecommendedStage(state.currentQuestionId);
  }
  renderAll();
}

function setPassFilter(pf) {
  state.passFilter = pf;
  const list = getFilteredQuestions();
  if (list.length > 0) {
    state.currentQuestionId = list[0].id;
    syncRecommendedStage(state.currentQuestionId);
  }
  renderAll();
}

function resetFilters() {
  state.subjectFilter = "all";
  state.chapterFilter = "all";
  state.typeFilter = "all";
  state.passFilter = "all";
  renderAll();
}

function selectQuestion(qid) {
  state.currentQuestionId = qid;
  if (state.activeTab === "calc-bench") {
    state.currentStage = 3;
  } else {
    syncRecommendedStage(qid);
  }
  saveState();
  renderAll();
}

function setStage(st) {
  state.currentStage = st;
  state.showAnswer = false;
  renderMainStage();
}

function toggleAnswer() {
  state.showAnswer = !state.showAnswer;
  renderMainStage();
}

function prevQuestion() {
  const list = getFilteredQuestions();
  const idx = list.findIndex((q) => q.id === state.currentQuestionId);
  if (idx > 0) {
    selectQuestion(list[idx - 1].id);
  }
}

function nextQuestion() {
  const list = getFilteredQuestions();
  const idx = list.findIndex((q) => q.id === state.currentQuestionId);
  if (idx >= 0 && idx < list.length - 1) {
    selectQuestion(list[idx + 1].id);
  }
}

function openPdfModal(pageNum) {
  openImageModal(`assets/notes/page_${pageNum}.png`, `《光电子器件(1).pdf》手写笔记与教材图解 - 第 ${pageNum} 页`);
}

function openImageModal(imgSrc, titleText) {
  const modal = document.getElementById("pdf-modal");
  const img = document.getElementById("pdf-modal-img");
  const title = document.getElementById("pdf-modal-title");
  if (modal && img && title) {
    title.textContent = titleText || "高清原图预览";
    img.src = imgSrc;
    modal.classList.add("open");
  }
}

function closePdfModal() {
  const modal = document.getElementById("pdf-modal");
  if (modal) modal.classList.remove("open");
}

function renderAll() {
  renderHeaderStats();
  renderLeftSidebar();
  renderQuestionStrip();
  renderMainStage();
}

window.addEventListener("DOMContentLoaded", () => {
  loadState();
  syncRecommendedStage(state.currentQuestionId);
  renderAll();
});
