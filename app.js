// ============================================================================
// 《光电子器件》三刷通关系统 + 自动错题本 + 现实草稿纸计算工作台 核心逻辑 (app.js)
// ============================================================================

const STORAGE_KEY = "optoelectronics_3pass_state_v1";

const state = {
  activeTab: "practice", // 'practice' | 'calc-bench' | 'wrong-book' | 'notes-gallery'
  chapterFilter: "all",
  typeFilter: "all",     // 'all' | 'term' | 'short' | 'calc'
  passFilter: "all",     // 'all' | 'unfinished' | 'pass0' | 'pass1' | 'pass2' | 'pass3'
  currentQuestionId: "Q01",
  currentStage: 1,       // 1: 一刷(选择快筛), 2: 二刷(挖空填空), 3: 三刷(默写核对/草稿纸计算)
  showAnswer: false,
  selectedMcq: null,
  calcInstances: {},     // 缓存每道计算题当前生成的参数与步骤答案
  progress: {},          // { [qid]: { passes: 0..3, stagePassed: {1:false,2:false,3:false} } }
  wrongBook: {}          // { [qid]: { count, lastTime, lastStage, detail, note, resolved } }
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.progress) state.progress = saved.progress;
      if (saved.wrongBook) state.wrongBook = saved.wrongBook;
      if (saved.currentQuestionId) state.currentQuestionId = saved.currentQuestionId;
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
        currentQuestionId: state.currentQuestionId
      })
    );
  } catch (e) {
    console.warn("保存本地三刷进度失败:", e);
  }
}

function getFilteredQuestions() {
  return window.QUESTIONS.filter((q) => {
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

// 自动推荐当前知识点的下一刷阶段（0->1刷，1->2刷，2->3刷）
function syncRecommendedStage(qid) {
  const rec = state.progress[qid] || { passes: 0, stagePassed: {} };
  if (!rec.stagePassed[1]) state.currentStage = 1;
  else if (!rec.stagePassed[2]) state.currentStage = 2;
  else state.currentStage = 3;
  state.showAnswer = false;
  state.selectedMcq = null;
}

// 记录某一刷通过
function recordStageSuccess(qid, stageNum) {
  const rec = state.progress[qid] || { passes: 0, stagePassed: { 1: false, 2: false, 3: false } };
  rec.stagePassed[stageNum] = true;
  const count = (rec.stagePassed[1] ? 1 : 0) + (rec.stagePassed[2] ? 1 : 0) + (rec.stagePassed[3] ? 1 : 0);
  rec.passes = count;
  state.progress[qid] = rec;
  saveState();
  renderAll();
}

// 自动整理错题：记录某题答错
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

// 渲染顶部三刷统计与错题数
function renderHeaderStats() {
  const total = window.QUESTIONS.length;
  let p1 = 0, p2 = 0, p3 = 0;
  window.QUESTIONS.forEach((q) => {
    const rec = state.progress[q.id];
    if (rec) {
      if (rec.passes >= 1) p1++;
      if (rec.passes >= 2) p2++;
      if (rec.passes >= 3) p3++;
    }
  });

  document.getElementById("stat-pass1").textContent = `${p1}/${total}`;
  document.getElementById("stat-pass2").textContent = `${p2}/${total}`;
  document.getElementById("stat-pass3").textContent = `${p3}/${total}`;

  document.getElementById("bar-pass1").style.width = `${Math.round((p1 / total) * 100)}%`;
  document.getElementById("bar-pass2").style.width = `${Math.round((p2 / total) * 100)}%`;
  document.getElementById("bar-pass3").style.width = `${Math.round((p3 / total) * 100)}%`;

  document.getElementById("pct-pass1").textContent = `${p1}/${total}`;
  document.getElementById("pct-pass2").textContent = `${p2}/${total}`;
  document.getElementById("pct-pass3").textContent = `${p3}/${total}`;

  const activeWrongCount = Object.values(state.wrongBook).filter((w) => !w.resolved).length;
  document.getElementById("wrong-count-badge").textContent = activeWrongCount;
}

// 渲染左侧章节树与筛选器
function renderLeftSidebar() {
  const chapterContainer = document.getElementById("chapter-list");
  let html = `
    <div class="chapter-item ${state.chapterFilter === "all" ? "active" : ""}" onclick="setChapterFilter('all')">
      <span>📚 全部章节考点</span>
      <span class="chapter-meta">${window.QUESTIONS.length} 题</span>
    </div>
  `;

  window.CHAPTERS.forEach((ch) => {
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
  document.getElementById("filtered-count-label").textContent = `当前筛选共 ${list.length} 个必考知识点`;

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

// 渲染主题目卡片（支持一刷、二刷、三刷与草稿纸计算工作台）
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

  const list = getFilteredQuestions();
  if (list.length === 0) {
    stageEl.innerHTML = `
      <div class="question-card" style="text-align:center;padding:48px 20px;">
        <h3 style="margin-bottom:8px;">🎉 当前筛选条件下没有待刷题目！</h3>
        <p style="color:#64748b;margin-bottom:16px;">您可以切换为「全部章节」或「全部刷次」继续复习。</p>
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

  stageEl.innerHTML = `
    <div class="question-card">
      <div class="q-card-header">
        <div>
          <div class="q-tags">
            <span class="q-tag tag-chapter">${chObj ? chObj.name : ""}</span>
            <span class="q-tag ${typeClass}">${q.typeName}</span>
            <span class="q-tag tag-pdf" onclick="openPdfModal(${q.pdfPage})">📖 查看手写笔记原图 P.${q.pdfPage}</span>
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
          ${rec.stagePassed[1] ? "✅" : "①"} 一刷·概念快筛 (选择辨析)
        </button>
        <button class="stage-btn stage-2 ${state.currentStage === 2 ? "active" : ""}" onclick="setStage(2)">
          ${rec.stagePassed[2] ? "✅" : "②"} 二刷·关键词挖空 (精准填空)
        </button>
        <button class="stage-btn stage-3 ${state.currentStage === 3 ? "active" : ""}" onclick="setStage(3)">
          ${rec.stagePassed[3] ? "✅" : "③"} 三刷·${q.type === "calc" ? "现实草稿纸实战计算" : "闭卷默写与采分点通关"}
        </button>
      </div>

      <div class="q-prompt-box">${q.prompt}</div>

      ${bodyHtml}

      ${
        state.showAnswer
          ? `
        <div class="explanation-panel">
          <div class="explanation-title">
            <span>📌 笔记原版答案与核心采分点解析（对应 PDF 第 ${q.pdfPage} 页）</span>
            <button class="btn btn-outline btn-sm" onclick="openPdfModal(${q.pdfPage})">🔍 对照手写笔记 P.${q.pdfPage}</button>
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
            ${state.showAnswer ? "🙈 隐藏标准答案" : "👁️ 查看标准答案与笔记解析"}
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
      fb.innerHTML = "✅ 一刷回答正确！已点亮第 1 颗星，点击上方「二刷·关键词挖空」继续强化！";
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
        ✍️ 二刷要求：请在不看答案的情况下填入核心采分关键词（支持同义词包容匹配），全部填对点亮第 2 颗星！
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
        🏆 三刷终极通关：请在下方默写框或您的实体草稿纸上完整默写本题，然后逐项勾选下方【采分点自检清单】：
      </div>
      <textarea class="recall-textarea" placeholder="在此处默写要点，或直接在您的现实草稿纸上默写后核对下方采分点..."></textarea>

      <div class="rubric-checklist">
        <div style="font-weight:700;font-size:13.5px;margin-bottom:8px;color:#0f172a;">
          📋 考纲标准采分点核对清单（必须全部掌握方可点亮第 3 颗星）：
        </div>
        ${q.rubric
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
  recordMistake(qid, 3, "三刷闭卷默写自评：部分简答/名词采分点未背熟");
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
          <button class="btn btn-outline btn-sm" onclick="resetStandardCalcParams('${q.id}')">📌 恢复笔记原题参数</button>
          <button class="btn btn-primary btn-sm" onclick="randomizeCalcParams('${q.id}')">🎲 随机换一组数值在草稿纸重算</button>
        </div>
      </div>

      <!-- 已知条件抄写核对区 -->
      <div style="font-size:12.5px;font-weight:700;color:#475569;margin-bottom:6px;">
        ① 第一步：请在您的现实草稿纸上抄写以下已知参数（注意单位换算）：
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

      <!-- 草稿纸分步验算区 -->
      <div style="font-size:12.5px;font-weight:700;color:#475569;margin-bottom:8px;">
        ② 第二步：在现实草稿纸上分步列式推导，每算完一步可在下方输入数值单独验算（防连环算错）：
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
    fbEl.textContent = `❌ 本步偏差较大（标准值为 ${st.answer} ${st.unit}），请检查草稿纸上的公式或单位换算！`;
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
        <p style="color:#64748b;margin-bottom:16px;">您在三刷过程中答错的选择题、填空题、未背熟的简答题或算错的计算题步骤都会自动整理到这里。</p>
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
          <h2 style="font-size:18px;">📕 自动错题整理本（共收录 ${entries.length} 题）</h2>
          <p style="font-size:12.5px;color:#64748b;">答错或自评未掌握的考点会自动归集在此，支持针对性重刷与个人防错笔记。</p>
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
  state.activeTab = "practice";
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
// 原版9页手写笔记与教材图解画廊 (Notes Gallery)
// ============================================================================
function renderNotesGalleryView(container) {
  const pageDescs = [
    "P.1：光通信系统组成、光电子器件分类、LED与LD定义/原理/分类/特性参数/偏置选择与控制",
    "P.2：LED能带复合图、P-I曲线、温度光谱特性；LD的P-I阈值特性与温度特性曲线(Ith=I0·exp(T/T0))",
    "P.3：LD外微分量子效率公式；5种单模光纤(G.652~G.655/色散平坦)；光纤分类；单模参数V与衰减α；光纤非线性效应",
    "P.4：石英光纤预制棒制造4法(OVPD/VAD/MCVD/PCVD)；PIN PD与APD工作原理、截止波长λc与平均雪崩增益G",
    "P.5：APD的G-V曲线（与反向偏压、温度、波长的关系图解）及APD响应速度3大决定因素",
    "P.6：光接收机3种前置放大器；光纤激光器、EDFA、FRA、FBA、SOA原理及FRA/FBA算泵浦波长公式",
    "P.7：EDFA三能级跃迁与受激辐射原理图；影响EDFA增益的4大因素关系曲线（最佳光纤长度、饱和输出功率、35nm带宽）",
    "P.8：电光/声光/磁光效应、间接调制器；光调制器分类树；光纤活动/固定连接器、插入损耗5因素与光纤对准3法",
    "P.9：光耦合器的4维分类与4大技术参数公式（插入损耗I·L、附加损耗E·L、分光比C·R、方向性D·L）"
  ];

  container.innerHTML = `
    <div class="question-card">
      <h2 style="font-size:18px;margin-bottom:6px;">📖 《光电子器件(1).pdf》9页扫描笔记与教材图解全景对照</h2>
      <p style="font-size:13px;color:#64748b;margin-bottom:16px;">点击任意一页可放大高清查看，所有字迹与图表均已整理为左侧对应章节的三刷考题。</p>
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
// 右侧光电科学计算器与快捷换算工具
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
      out.textContent = `lg(${x}) = ${Math.log10(x).toFixed(4)}`;
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
  const modal = document.getElementById("pdf-modal");
  const img = document.getElementById("pdf-modal-img");
  const title = document.getElementById("pdf-modal-title");
  if (modal && img && title) {
    title.textContent = `《光电子器件(1).pdf》手写笔记与教材图解 - 第 ${pageNum} 页`;
    img.src = `assets/notes/page_${pageNum}.png`;
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
