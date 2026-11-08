// ============================================================================
// 考研英语大纲词汇（5047词）· 极简纯净版「背单词卡片 + 单词表（已背/待复习）」
// ============================================================================
(function () {
  "use strict";

  const ACTIVE_SYNC_ID_KEY = "kaoyan_active_sync_id_v2";
  const GLOBAL_HUB_VAULT_ID = "ff808181a09d98f701a1ab80eeaf416b";
  const API = "https://api.restful-api.dev/objects";

  const WORDS = window.KAOYAN_WORDS || [];
  const CHUNK_SIZE = window.KAOYAN_WORDS_CHUNK || 250;
  const TOTAL = WORDS.length;
  const GROUP_SIZE = 10;
  const TARGET_HITS = 3;
  const PAGE_SIZE = 40;

  const sid = String(localStorage.getItem(ACTIVE_SYNC_ID_KEY) || "").trim().toLowerCase();
  const LOCAL_KEY = `kaoyan_words_v2_${sid || "guest"}`;
  const LEGACY_LOCAL_KEY = `kaoyan_words_v1_${sid || "guest"}`;
  const VAULT_CACHE_KEY = `kaoyan_words_vault_v1_${sid}`;
  const HUB_VAULT_KEY = `words__${sid}`;

  const detailChunks = {};
  const chunkPromises = {};

  // m[word] = [status, star, updatedAt, hits, wrongCount]
  // status: 0=未背, 1=学习巩固中(待复习), 2=已掌握(满3次), 3=熟词
  let state = {
    updatedAt: 0,
    m: {},
    filter: "todo",
    order: "list",
    seed: Math.floor(Math.random() * 1e9),
    autoSpeak: false,
    groups: {}
  };

  // 视图与卡片状态
  let activeView = "card";   // "card" | "list"
  let phase = "question";    // "question" | "detail" | "summary"
  let lastJudge = null;      // "known" | "vague" | "unknown" | "familiar"
  let activeExtTab = "rel";  // "rel" | "syno" | "phrase" | "rem"

  // 单词表视图状态
  let wlTab = "review";      // "review" | "learned" | "star" | "group" | "familiar" | "unlearned" | "all"
  let wlSearch = "";
  let wlPage = 1;
  let wlMaskMeaning = false;
  let expandedIdx = -1;

  // ---------------- 详情分块按需加载 ----------------
  function getChunkId(idx) {
    return Math.floor(idx / CHUNK_SIZE);
  }

  function ensureDetailChunk(idx) {
    const cid = getChunkId(idx);
    if (detailChunks[cid]) return Promise.resolve(detailChunks[cid]);
    if (chunkPromises[cid]) return chunkPromises[cid];
    const file = `words_detail/${String(cid).padStart(2, "0")}.json?v=20261108_w4`;
    chunkPromises[cid] = fetch(file)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => {
        detailChunks[cid] = data || {};
        return detailChunks[cid];
      })
      .catch(() => {
        detailChunks[cid] = {};
        return {};
      });
    return chunkPromises[cid];
  }

  function getDetailSync(idx) {
    const chunk = detailChunks[getChunkId(idx)];
    return chunk ? chunk[String(idx)] || null : null;
  }

  function preloadGroupDetails(indices) {
    const uniqueChunks = new Set(indices.map(getChunkId));
    uniqueChunks.forEach((cid) => {
      if (detailChunks[cid]) return;
      const alreadyPending = Boolean(chunkPromises[cid]);
      ensureDetailChunk(cid * CHUNK_SIZE).then(() => {
        if (!alreadyPending && activeView === "card") renderCard();
      });
    });
  }

  // ---------------- 本地存储 ----------------
  function normalizeRecord(r) {
    if (!Array.isArray(r)) return [0, 0, 0, 0, 0];
    if (r.length === 3) {
      const s = r[0] || 0;
      const star = r[1] ? 1 : 0;
      const ts = r[2] || 0;
      if (s === 1) return [2, star, ts, 3, 0];
      if (s === 2) return [1, star, ts, 0, 1];
      return [0, star, ts, 0, 0];
    }
    return [r[0] || 0, r[1] ? 1 : 0, r[2] || 0, typeof r[3] === "number" ? r[3] : 0, r[4] || 0];
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        state = Object.assign(state, JSON.parse(raw));
      } else {
        const legacy = localStorage.getItem(LEGACY_LOCAL_KEY);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          if (parsed && parsed.m) {
            Object.keys(parsed.m).forEach((w) => {
              state.m[w] = normalizeRecord(parsed.m[w]);
            });
          }
        }
      }
      Object.keys(state.m || {}).forEach((w) => {
        state.m[w] = normalizeRecord(state.m[w]);
      });
      if (!state.groups || typeof state.groups !== "object") state.groups = {};
    } catch (e) {}
  }

  function saveLocal() {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function rec(word) {
    return normalizeRecord(state.m[word]);
  }

  function saveRec(word, nextRec) {
    const now = Date.now();
    nextRec[2] = now;
    state.m[word] = nextRec;
    state.updatedAt = now;
    saveLocal();
    scheduleCloudPush();
  }

  // ---------------- 词库分类判定（含「已背」与「待复习」） ----------------
  // 待复习：正在背但未满3次(status===1)、曾答错/模糊(wrongCount>0 且未标熟词)、或生词本中尚未标熟词的词
  function isNeedReview(r) {
    const [status, star, , hits, wrongCount] = r;
    if (status === 3) return false;
    return status === 1 || (wrongCount || 0) > 0 || (star === 1 && status !== 2) || (status === 2 && ( hits < TARGET_HITS));
  }

  // 已背：已满3次过关(status===2)、已标熟词(status===3)、或已开始学习有记录(status===1)
  function isLearnedWord(r) {
    const [status] = r;
    return status === 1 || status === 2 || status === 3;
  }

  function matchCardFilter(r, f) {
    const [status, star] = r;
    if (f === "todo") return status === 0 || status === 1;
    if (f === "review") return isNeedReview(r);
    if (f === "learned") return isLearnedWord(r);
    if (f === "star") return star === 1;
    return true;
  }

  function seededShuffle(arr, seed) {
    let s = seed >>> 0 || 1;
    const rand = () => {
      s ^= s << 13; s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function getCandidatePool() {
    const pool = [];
    for (let i = 0; i < TOTAL; i++) {
      if (matchCardFilter(rec(WORDS[i][0]), state.filter)) pool.push(i);
    }
    if (state.order === "alpha") {
      pool.sort((a, b) => WORDS[a][0].toLowerCase().localeCompare(WORDS[b][0].toLowerCase()));
    } else if (state.order === "shuffle") {
      seededShuffle(pool, state.seed);
    } else if (state.filter === "todo") {
      pool.sort((a, b) => {
        const sa = rec(WORDS[a][0])[0] === 1 ? 0 : 1;
        const sb = rec(WORDS[b][0])[0] === 1 ? 0 : 1;
        return sa !== sb ? sa - sb : a - b;
      });
    } else if (state.filter === "review") {
      // 待复习优先按错误次数与未满3次排序
      pool.sort((a, b) => {
        const ra = rec(WORDS[a][0]);
        const rb = rec(WORDS[b][0]);
        if ((rb[4] || 0) !== (ra[4] || 0)) return (rb[4] || 0) - (ra[4] || 0);
        return (rb[2] || 0) - (ra[2] || 0);
      });
    }
    return pool;
  }

  function comboKey() {
    return `${state.filter}|${state.order}`;
  }

  function getActiveGroup(forceNew = false) {
    const key = comboKey();
    let grp = state.groups[key];

    if (!forceNew && grp && Array.isArray(grp.items) && grp.items.length > 0) {
      grp.items = grp.items.filter((i) => i >= 0 && i < TOTAL);
      grp.queue = (grp.queue || []).filter((i) => i >= 0 && i < TOTAL);
      if (!grp.hits) grp.hits = {};
      if (grp.items.length > 0) {
        preloadGroupDetails(grp.items);
        return grp;
      }
    }

    const pool = getCandidatePool();
    const items = pool.slice(0, GROUP_SIZE);
    const hits = {};
    items.forEach((idx) => {
      const r = rec(WORDS[idx][0]);
      hits[idx] = state.filter === "todo" && r[3] > 0 && r[3] < TARGET_HITS ? r[3] : 0;
    });

    grp = { items, queue: items.slice(), hits };
    state.groups[key] = grp;
    phase = "question";
    lastJudge = null;
    saveLocal();
    preloadGroupDetails(items);
    return grp;
  }

  function currentWordIndex() {
    const grp = getActiveGroup();
    return grp.queue.length ? grp.queue[0] : -1;
  }

  // ---------------- 背词判断与推进逻辑 ----------------
  function pickDefaultExtTab(detail) {
    if (!detail) return "rel";
    if (detail.r && detail.r.length) return "rel";
    if ((detail.sy && detail.sy.length) || (detail.a && detail.a.length)) return "syno";
    if (detail.p && detail.p.length) return "phrase";
    if (detail.m) return "rem";
    return "rel";
  }

  function handleJudge(type) {
    const grp = getActiveGroup();
    if (!grp.queue.length) return;
    const idx = grp.queue[0];
    const word = WORDS[idx][0];
    const r = rec(word);
    const curHits = grp.hits[idx] || 0;

    let nextHits = curHits;
    let nextStatus = r[0];
    let nextWrong = r[4] || 0;

    if (type === "known") {
      nextHits = Math.min(TARGET_HITS, curHits + 1);
      nextStatus = nextHits >= TARGET_HITS ? 2 : 1;
      // 若全部3次认识完成，清除待复习错误计数或保留历史但标记为已掌握
      if (nextHits >= TARGET_HITS) nextWrong = 0;
    } else if (type === "vague") {
      nextHits = curHits >= 2 ? 1 : curHits;
      nextStatus = 1;
      nextWrong += 1;
    } else if (type === "unknown") {
      nextHits = 0;
      nextStatus = 1;
      nextWrong += 1;
    } else if (type === "familiar") {
      nextHits = TARGET_HITS;
      nextStatus = 3;
      nextWrong = 0;
    }

    grp.hits[idx] = nextHits;
    saveRec(word, [nextStatus, r[1], Date.now(), nextHits, nextWrong]);

    lastJudge = type;
    activeExtTab = pickDefaultExtTab(getDetailSync(idx));
    phase = "detail";
    renderAll();
  }

  function revertToUnknown() {
    const grp = getActiveGroup();
    if (!grp.queue.length) return;
    const idx = grp.queue[0];
    const word = WORDS[idx][0];
    const r = rec(word);
    grp.hits[idx] = 0;
    saveRec(word, [1, r[1], Date.now(), 0, (r[4] || 0) + 1]);
    lastJudge = "unknown";
    renderAll();
  }

  function advanceToNextWord() {
    const grp = getActiveGroup();
    if (!grp.queue.length) return;
    const idx = grp.queue.shift();
    const hits = grp.hits[idx] || 0;
    const r = rec(WORDS[idx][0]);

    if (hits < TARGET_HITS && r[0] !== 3) {
      let insertPos = grp.queue.length;
      if (lastJudge === "unknown") {
        insertPos = Math.min(grp.queue.length, 2 + Math.floor(Math.random() * 2));
      } else if (lastJudge === "vague") {
        insertPos = Math.min(grp.queue.length, 3 + Math.floor(Math.random() * 2));
      }
      grp.queue.splice(insertPos, 0, idx);
    }

    lastJudge = null;
    phase = grp.queue.length === 0 ? "summary" : "question";
    saveLocal();
    renderAll();
    if (phase === "question") autoSpeakCurrent();
  }

  function toggleStarByIndex(idx) {
    if (idx < 0 || idx >= TOTAL) return;
    const word = WORDS[idx][0];
    const r = rec(word);
    saveRec(word, [r[0], r[1] ? 0 : 1, Date.now(), r[3], r[4]]);
    renderAll();
  }

  function markFamiliarByIndex(idx) {
    if (idx < 0 || idx >= TOTAL) return;
    const grp = getActiveGroup();
    if (activeView === "card" && phase === "question" && grp.queue[0] === idx) {
      handleJudge("familiar");
      return;
    }
    const word = WORDS[idx][0];
    const r = rec(word);
    if (r[0] === 3) {
      if (grp.hits && grp.hits[idx] !== undefined) grp.hits[idx] = 0;
      saveRec(word, [1, r[1], Date.now(), 0, r[4]]);
    } else {
      if (grp.hits && grp.hits[idx] !== undefined) grp.hits[idx] = TARGET_HITS;
      saveRec(word, [3, r[1], Date.now(), TARGET_HITS, 0]);
      lastJudge = "familiar";
    }
    renderAll();
  }

  function markNeedReviewByIndex(idx) {
    if (idx < 0 || idx >= TOTAL) return;
    const word = WORDS[idx][0];
    const r = rec(word);
    saveRec(word, [1, r[1], Date.now(), 0, Math.max(1, r[4] || 0)]);
    renderAll();
  }

  // ---------------- 统计计数与渲染 ----------------
  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function highlightWord(sentence, targetWord) {
    const safe = esc(sentence);
    if (!targetWord) return safe;
    const stem = targetWord.replace(/[^a-zA-Z]/g, "");
    if (stem.length < 2) return safe;
    const reg = new RegExp(`\\b(${stem}[a-zA-Z]{0,4})\\b`, "gi");
    return safe.replace(reg, `<span class="hl">$1</span>`);
  }

  function getCounts() {
    const counts = {
      todo: 0,
      review: 0,
      learned: 0,
      star: 0,
      familiar: 0,
      unlearned: 0,
      all: TOTAL
    };
    for (let i = 0; i < TOTAL; i++) {
      const r = rec(WORDS[i][0]);
      if (r[0] === 0 || r[0] === 1) counts.todo++;
      if (isNeedReview(r)) counts.review++;
      if (isLearnedWord(r)) counts.learned++;
      if (r[1] === 1) counts.star++;
      if (r[0] === 3) counts.familiar++;
      if (r[0] === 0) counts.unlearned++;
    }
    return counts;
  }

  function updateFilterCounts() {
    const counts = getCounts();
    const sel = document.getElementById("filter-select");
    const labels = {
      todo: `新词待背 (${counts.todo})`,
      review: `待复习 (${counts.review})`,
      learned: `已背 (${counts.learned})`,
      star: `⭐ 生词本 (${counts.star})`
    };
    Array.from(sel.options).forEach((opt) => {
      if (labels[opt.value]) opt.textContent = labels[opt.value];
    });
  }

  // ---------------- 视图切换（背单词卡片 vs 单词表） ----------------
  function switchView(view) {
    activeView = view;
    document.getElementById("tab-view-card").classList.toggle("active", view === "card");
    document.getElementById("tab-view-list").classList.toggle("active", view === "list");
    document.getElementById("card-top-controls").style.display = view === "card" ? "flex" : "none";
    document.getElementById("card").style.display = view === "card" ? "flex" : "none";
    document.getElementById("wordlist-view").style.display = view === "list" ? "flex" : "none";
    document.getElementById("main-stage").classList.toggle("list-mode", view === "list");
    renderAll();
  }

  // ---------------- 视图 1：背单词卡片渲染 ----------------
  function renderCard() {
    const card = document.getElementById("card");
    if (!TOTAL) return;

    const grp = getActiveGroup();
    if (!grp.items.length) {
      card.innerHTML = `
        <div class="question-body" style="color:var(--muted);">
          <div style="font-size:15px;margin-bottom:14px;">当前分类下暂无单词</div>
          <button class="ghost-btn" id="btn-empty-go-todo">切换到新词待背</button>
        </div>
      `;
      const b = document.getElementById("btn-empty-go-todo");
      if (b) {
        b.onclick = () => {
          state.filter = "todo";
          document.getElementById("filter-select").value = "todo";
          getActiveGroup(true);
          renderAll();
        };
      }
      return;
    }

    if (phase === "summary" || grp.queue.length === 0) {
      renderSummary(card, grp);
      return;
    }

    const idx = grp.queue[0];
    const [word, basePhone, baseShort] = WORDS[idx];
    const detail = getDetailSync(idx);
    if (!detail) ensureDetailChunk(idx);

    const r = rec(word);
    const isStar = r[1] === 1;
    const isFamiliar = r[0] === 3;
    const hits = Math.min(TARGET_HITS, grp.hits[idx] || 0);
    const orderInGroup = grp.items.indexOf(idx) + 1;
    const phone = (detail && (detail.us || detail.uk)) || basePhone || "";

    const stepsHtml = [0, 1, 2]
      .map((i) => `<span class="step-bar ${i < hits ? "on" : ""}"></span>`)
      .join("");

    const topHtml = `
      <div class="card-top">
        <div class="group-meta">
          <span>${orderInGroup} / ${grp.items.length}</span>
          <span class="steps" title="本组需认识 3 次 (${hits}/3)">${stepsHtml}</span>
        </div>
        <div class="top-actions">
          <button class="action-tag ${isStar ? "star-on" : ""}" id="btn-star">
            ${isStar ? "★ 生词本" : "☆ 生词本"}
          </button>
          <button class="action-tag ${isFamiliar ? "fam-on" : ""}" id="btn-fam">
            ${isFamiliar ? "✓ 熟词" : "熟词"}
          </button>
        </div>
      </div>
    `;

    if (phase === "question") {
      const firstSent = detail && detail.s && detail.s[0] ? detail.s[0][0] : "";
      card.innerHTML = `
        ${topHtml}
        <div class="question-body">
          <div class="word-main">${esc(word)}</div>
          <div class="phonetic" id="btn-speak">
            ${phone ? `/${esc(phone)}/` : "发音"} <span>🔊</span>
          </div>
          ${firstSent ? `<div class="context-sent">${highlightWord(firstSent, word)}</div>` : ""}
        </div>
        <div class="judge-bar">
          <button class="j-btn unknown" id="j-unknown">不认识</button>
          <button class="j-btn vague" id="j-vague">模糊</button>
          <button class="j-btn known" id="j-known">认识</button>
        </div>
      `;

      document.getElementById("btn-star").onclick = () => toggleStarByIndex(idx);
      document.getElementById("btn-fam").onclick = () => markFamiliarByIndex(idx);
      document.getElementById("btn-speak").onclick = () => speak(word);
      document.getElementById("j-unknown").onclick = () => handleJudge("unknown");
      document.getElementById("j-vague").onclick = () => handleJudge("vague");
      document.getElementById("j-known").onclick = () => handleJudge("known");
    } else {
      card.innerHTML = `
        ${topHtml}
        ${buildCleanDetailHtml(word, phone, baseShort, detail)}
      `;
      document.getElementById("btn-star").onclick = () => toggleStarByIndex(idx);
      document.getElementById("btn-fam").onclick = () => markFamiliarByIndex(idx);
      document.getElementById("btn-speak").onclick = () => speak(word);
      document.getElementById("btn-next").onclick = advanceToNextWord;

      const fixBtn = document.getElementById("btn-fix");
      if (fixBtn) fixBtn.onclick = revertToUnknown;

      card.querySelectorAll("[data-ext-tab]").forEach((tab) => {
        tab.onclick = () => {
          activeExtTab = tab.getAttribute("data-ext-tab");
          renderCard();
        };
      });

      card.querySelectorAll("[data-speak]").forEach((el) => {
        el.onclick = () => speak(el.getAttribute("data-speak"));
      });
    }
  }

  function buildCleanDetailHtml(word, phone, baseShort, detail) {
    const transList =
      detail && Array.isArray(detail.t) && detail.t.length
        ? detail.t
        : baseShort
            .split("；")
            .filter(Boolean)
            .map((line) => {
              const m = line.match(/^([a-z]+\.)\s*(.*)$/i);
              return m ? [m[1].replace(/\.$/, ""), m[2]] : ["", line];
            });

    const meaningsHtml = transList
      .map(
        ([pos, cn]) => `
        <div class="meaning-row">
          ${pos ? `<span class="pos">${esc(pos)}.</span>` : ""}
          <span>${esc(cn)}</span>
        </div>
      `
      )
      .join("");

    const sent = detail && detail.s && detail.s[0] ? detail.s[0] : null;
    const sentHtml = sent
      ? `
        <div class="sent-block" data-speak="${esc(sent[0])}" title="点击朗读例句">
          <div>${highlightWord(sent[0], word)}</div>
          <div class="cn">${esc(sent[1])}</div>
        </div>
      `
      : "";

    const rels = (detail && detail.r) || [];
    const synos = (detail && detail.sy) || [];
    const antos = (detail && detail.a) || [];
    const phrases = (detail && detail.p) || [];
    const rem = detail && detail.m;

    const tabs = [];
    if (rels.length) tabs.push({ id: "rel", label: `派生词 (${rels.length})` });
    if (synos.length || antos.length) tabs.push({ id: "syno", label: "近反义" });
    if (phrases.length) tabs.push({ id: "phrase", label: "词组短语" });
    if (rem) tabs.push({ id: "rem", label: "巧记" });

    if (tabs.length && !tabs.some((t) => t.id === activeExtTab)) {
      activeExtTab = tabs[0].id;
    }

    let extContentHtml = "";
    if (activeExtTab === "rel" && rels.length) {
      extContentHtml = rels
        .map(
          ([pos, hwd, tran]) => `
          <div class="ext-row">
            ${pos ? `<span class="pos">${esc(pos)}.</span>` : ""}
            <span class="ext-w" data-speak="${esc(hwd)}">${esc(hwd)}</span>
            <span>${esc(tran)}</span>
          </div>
        `
        )
        .join("");
    } else if (activeExtTab === "syno" && (synos.length || antos.length)) {
      extContentHtml =
        synos
          .map(
            ([pos, tran, words]) => `
            <div style="margin-bottom:8px;">
              <div style="font-size:12.5px;color:var(--muted);">${pos ? `${esc(pos)}. ` : ""}${esc(tran)}</div>
              <div class="chip-list">
                ${words.map((w) => `<span class="w-chip" data-speak="${esc(w)}">${esc(w)}</span>`).join("")}
              </div>
            </div>
          `
          )
          .join("") +
        (antos.length
          ? `
            <div>
              <div style="font-size:12.5px;color:var(--muted);">反义词</div>
              <div class="chip-list">
                ${antos.map((w) => `<span class="w-chip" data-speak="${esc(w)}">${esc(w)}</span>`).join("")}
              </div>
            </div>
          `
          : "");
    } else if (activeExtTab === "phrase" && phrases.length) {
      extContentHtml = phrases
        .map(
          ([en, cn]) => `
          <div class="ext-row" style="justify-content:space-between;">
            <span class="ext-w" data-speak="${esc(en)}">${esc(en)}</span>
            <span style="color:var(--muted);">${esc(cn)}</span>
          </div>
        `
        )
        .join("");
    } else if (activeExtTab === "rem" && rem) {
      extContentHtml = `<div style="padding:4px 0;">${esc(rem)}</div>`;
    }

    const extBlockHtml = tabs.length
      ? `
        <div class="ext-tabs">
          ${tabs
            .map(
              (t) =>
                `<button class="ext-tab ${activeExtTab === t.id ? "active" : ""}" data-ext-tab="${t.id}">${t.label}</button>`
            )
            .join("")}
        </div>
        <div class="ext-panel">${extContentHtml}</div>
      `
      : "";

    const showFixBtn = lastJudge === "known" || lastJudge === "vague" || lastJudge === "familiar";

    return `
      <div class="detail-body">
        <div class="detail-head">
          <span class="detail-word">${esc(word)}</span>
          <span class="phonetic" id="btn-speak" style="margin:0;">
            ${phone ? `/${esc(phone)}/` : "发音"} <span>🔊</span>
          </span>
        </div>
        <div class="meanings">${meaningsHtml}</div>
        ${sentHtml}
        ${extBlockHtml}
      </div>
      <div class="next-bar">
        ${showFixBtn ? `<button class="btn-fix" id="btn-fix">记错了</button>` : ""}
        <button class="btn-next" id="btn-next">下一词</button>
      </div>
    `;
  }

  function renderSummary(card, grp) {
    const rows = grp.items
      .map((idx) => {
        const [w, , short] = WORDS[idx];
        const r = rec(w);
        return `
          <div class="sum-item">
            <span class="sum-w" data-speak="${esc(w)}">${esc(w)}</span>
            <span class="sum-m">${esc(short)}</span>
            <button class="action-tag ${r[1] ? "star-on" : ""}" data-star="${idx}">${r[1] ? "★" : "☆"}</button>
          </div>
        `;
      })
      .join("");

    card.innerHTML = `
      <div>
        <div style="font-size:20px;font-weight:700;">本组 10 词已完成</div>
        <div class="sum-list">${rows}</div>
      </div>
      <div class="next-bar">
        <button class="btn-next" id="btn-next-group">开始下一组</button>
      </div>
    `;

    card.querySelectorAll("[data-speak]").forEach((el) => {
      el.onclick = () => speak(el.getAttribute("data-speak"));
    });
    card.querySelectorAll("[data-star]").forEach((el) => {
      el.onclick = () => toggleStarByIndex(parseInt(el.getAttribute("data-star"), 10));
    });
    document.getElementById("btn-next-group").onclick = () => {
      getActiveGroup(true);
      renderAll();
      autoSpeakCurrent();
    };
  }

  // ---------------- 视图 2：单词表界面（已背 / 待复习 / 生词本 / 本组 / 熟词 / 未背 / 全部） ----------------
  function getWordListFilteredIndices() {
    const grp = getActiveGroup();
    const q = wlSearch.trim().toLowerCase();
    let list = [];

    if (wlTab === "group") {
      list = grp.items.slice();
    } else {
      for (let i = 0; i < TOTAL; i++) {
        const [w, , short] = WORDS[i];
        const r = rec(w);
        let ok = false;
        if (wlTab === "review") ok = isNeedReview(r);
        else if (wlTab === "learned") ok = isLearnedWord(r);
        else if (wlTab === "star") ok = r[1] === 1;
        else if (wlTab === "familiar") ok = r[0] === 3;
        else if (wlTab === "unlearned") ok = r[0] === 0;
        else ok = true; // "all"
        if (!ok) continue;
        if (q && !w.toLowerCase().includes(q) && !String(short || "").toLowerCase().includes(q)) {
          continue;
        }
        list.push(i);
      }
    }

    if (wlTab === "group" && q) {
      list = list.filter((i) => {
        const [w, , short] = WORDS[i];
        return w.toLowerCase().includes(q) || String(short || "").toLowerCase().includes(q);
      });
    }

    // 在「待复习」或「已背」下按学习时间或错误次数排序，让最近背过/最需复习的词排在最前
    if (wlTab === "review") {
      list.sort((a, b) => {
        const ra = rec(WORDS[a][0]);
        const rb = rec(WORDS[b][0]);
        if ((rb[4] || 0) !== (ra[4] || 0)) return (rb[4] || 0) - (ra[4] || 0);
        return (rb[2] || 0) - (ra[2] || 0);
      });
    } else if (wlTab === "learned") {
      list.sort((a, b) => (rec(WORDS[b][0])[2] || 0) - (rec(WORDS[a][0])[2] || 0));
    }

    return list;
  }

  function renderWordListView() {
    const counts = getCounts();
    const grp = getActiveGroup();

    const tabs = [
      { id: "review", label: "待复习", cnt: counts.review },
      { id: "learned", label: "已背", cnt: counts.learned },
      { id: "star", label: "⭐ 生词本", cnt: counts.star },
      { id: "group", label: "本组 10 词", cnt: grp.items.length },
      { id: "familiar", label: "熟词本", cnt: counts.familiar },
      { id: "unlearned", label: "未背", cnt: counts.unlearned },
      { id: "all", label: "全部", cnt: counts.all }
    ];

    const tabsEl = document.getElementById("wl-tabs");
    tabsEl.innerHTML = tabs
      .map(
        (t) => `
        <button class="wl-tab ${wlTab === t.id ? "active" : ""}" data-wltab="${t.id}">
          <span>${t.label}</span>
          <span class="cnt">${t.cnt}</span>
        </button>
      `
      )
      .join("");

    tabsEl.querySelectorAll("[data-wltab]").forEach((btn) => {
      btn.onclick = () => {
        wlTab = btn.getAttribute("data-wltab");
        wlPage = 1;
        expandedIdx = -1;
        renderWordListView();
      };
    });

    const maskBtn = document.getElementById("btn-mask-toggle");
    maskBtn.textContent = wlMaskMeaning ? "👀 显示释义" : "🙈 遮住释义自测";

    const practiceBtn = document.getElementById("btn-practice-current-list");
    if (wlTab === "review") practiceBtn.textContent = "抽 10 词复习待复习";
    else if (wlTab === "learned") practiceBtn.textContent = "抽 10 词抽查已背";
    else if (wlTab === "star") practiceBtn.textContent = "抽 10 词背生词本";
    else practiceBtn.textContent = "抽 10 词开始背";

    const list = getWordListFilteredIndices();
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (wlPage > totalPages) wlPage = totalPages;
    if (wlPage < 1) wlPage = 1;

    const pageItems = list.slice((wlPage - 1) * PAGE_SIZE, wlPage * PAGE_SIZE);
    const rowsEl = document.getElementById("wl-rows");

    if (!pageItems.length) {
      const emptyTips = {
        review: "暂无待复习单词（背词时点过「不认识/模糊」或未满 3 次的词会自动进入这里）",
        learned: "暂无已背单词，去「背单词」完成第一组吧",
        star: "生词本为空，背词时点击「☆ 生词本」即可收藏重点词",
        familiar: "熟词本为空，背词时点击「熟词」可将已彻底掌握的词归入此处"
      };
      rowsEl.innerHTML = `
        <div style="text-align:center;color:var(--muted);padding:48px 12px;font-size:14px;">
          ${emptyTips[wlTab] || "没有匹配的单词"}
        </div>
      `;
    } else {
      rowsEl.innerHTML = pageItems
        .map((idx) => {
          const [w, ph, short] = WORDS[idx];
          const r = rec(w);
          const [status, star, , hits, wrongCount] = r;
          const isExp = expandedIdx === idx;
          const detail = isExp ? getDetailSync(idx) : null;

          let statusBadge = "";
          if (status === 3) {
            statusBadge = `<span class="wl-badge fam">熟词</span>`;
          } else if (status === 2) {
            statusBadge = `<span class="wl-badge learned">已掌握 3/3</span>`;
          } else if (status === 1) {
            statusBadge = `<span class="wl-badge review">学习中 ${hits}/3</span>`;
          }
          if ((wrongCount || 0) > 0 && status !== 3) {
            statusBadge += ` <span class="wl-badge wrong">错 ${wrongCount} 次</span>`;
          }

          let expandHtml = "";
          if (isExp) {
            if (!detail) {
              expandHtml = `<div class="wl-expand">详情加载中...</div>`;
            } else {
              const rels = (detail.r || [])
                .slice(0, 6)
                .map(([pos, hwd, tran]) => `<span class="w-chip" data-speak="${esc(hwd)}">${pos ? `${esc(pos)}. ` : ""}${esc(hwd)} ${esc(tran)}</span>`)
                .join("");
              const synos = (detail.sy || [])
                .flatMap(([, , ws]) => ws || [])
                .slice(0, 6)
                .map((sw) => `<span class="w-chip" data-speak="${esc(sw)}">${esc(sw)}</span>`)
                .join("");
              const sent = detail.s && detail.s[0] ? detail.s[0] : null;

              expandHtml = `
                <div class="wl-expand">
                  ${ detail.m ? `<div class="wl-ext-group"><span class="wl-ext-label">巧记</span><span>${esc(detail.m)}</span></div>` : "" }
                  ${ rels ? `<div class="wl-ext-group"><span class="wl-ext-label">派生词</span><div class="chip-list" style="margin:0;">${rels}</div></div>` : "" }
                  ${ synos ? `<div class="wl-ext-group"><span class="wl-ext-label">近义词</span><div class="chip-list" style="margin:0;">${synos}</div></div>` : "" }
                  ${ sent ? `<div class="wl-ext-group"><span class="wl-ext-label">例句</span><span>${esc(sent[0])} <span style="color:var(--muted);">${esc(sent[1])}</span></span></div>` : "" }
                </div>
              `;
            }
          }

          return `
            <div class="wl-item ${isExp ? "revealed" : ""}" data-row-idx="${idx}">
              <div class="wl-row-main" data-toggle-idx="${idx}">
                <div class="wl-left">
                  <span class="wl-word">${esc(w)}</span>
                  <span class="wl-phone">${ph ? `/${esc(ph)}/` : ""}</span>
                </div>
                <div class="wl-mid ${wlMaskMeaning ? "masked" : ""}">${esc(short)}</div>
                <div class="wl-right" onclick="event.stopPropagation();">
                  ${statusBadge}
                  ${
                    status === 2 || status === 3
                      ? `<button class="action-tag" data-review-idx="${idx}" title="加入待复习">再复习</button>`
                      : ""
                  }
                  <button class="action-tag ${star ? "star-on" : ""}" data-star-idx="${idx}" title="生词本">
                    ${star ? "★" : "☆"}
                  </button>
                  <button class="action-tag ${status === 3 ? "fam-on" : ""}" data-fam-idx="${idx}">
                    熟词
                  </button>
                </div>
              </div>
              ${expandHtml}
            </div>
          `;
        })
        .join("");

      rowsEl.querySelectorAll("[data-toggle-idx]").forEach((row) => {
        row.onclick = () => {
          const idx = parseInt(row.getAttribute("data-toggle-idx"), 10);
          speak(WORDS[idx][0]);
          if (expandedIdx === idx) {
            expandedIdx = -1;
            renderWordListView();
          } else {
            expandedIdx = idx;
            if ( getDetailSync(idx) ) {
              renderWordListView();
            } else {
              renderWordListView();
              ensureDetailChunk(idx).then(() => renderWordListView());
            }
          }
        };
      });

      rowsEl.querySelectorAll("[data-star-idx]").forEach((btn) => {
        btn.onclick = () => toggleStarByIndex(parseInt(btn.getAttribute("data-star-idx"), 10));
      });
      rowsEl.querySelectorAll("[data-fam-idx]").forEach((btn) => {
        btn.onclick = () => markFamiliarByIndex(parseInt(btn.getAttribute("data-fam-idx"), 10));
      });
      rowsEl.querySelectorAll("[data-review-idx]").forEach((btn) => {
        btn.onclick = () => markNeedReviewByIndex(parseInt(btn.getAttribute("data-review-idx"), 10));
      });
      rowsEl.querySelectorAll("[data-speak]").forEach((el) => {
        el.onclick = (e) => {
          e.stopPropagation();
          speak(el.getAttribute("data-speak"));
        };
      });
    }

    const pagerEl = document.getElementById("wl-pager");
    pagerEl.innerHTML = `
      <span>共 ${list.length} 词 · 第 ${wlPage} / ${totalPages} 页（点击任意行可发音并展开派生/近义词）</span>
      <div class="wl-pager-btns">
        <button class="ghost-btn" id="wl-prev" ${wlPage <= 1 ? "disabled" : ""}>上一页</button>
        <button class="ghost-btn" id="wl-next" ${wlPage >= totalPages ? "disabled" : ""}>下一页</button>
      </div>
    `;
    const prevBtn = document.getElementById("wl-prev");
    const nextBtn = document.getElementById("wl-next");
    if (prevBtn) prevBtn.onclick = () => { if (wlPage > 1) { wlPage--; renderWordListView(); } };
    if (nextBtn) nextBtn.onclick = () => { if (wlPage < totalPages) { wlPage++; renderWordListView(); } };
  }

  function renderAll() {
    updateFilterCounts();
    if (activeView === "card") {
      renderCard();
    } else {
      renderWordListView();
    }
  }

  // ---------------- 语音与云同步 ----------------
  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.92;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  function autoSpeakCurrent() {
    if (!state.autoSpeak) return;
    const idx = currentWordIndex();
    if (idx >= 0) speak(WORDS[idx][0]);
  }

  function buildPayload() {
    return { updatedAt: state.updatedAt, m: state.m };
  }

  function mergeCloud(data) {
    if (!data || typeof data.m !== "object") return { changed: false, needPush: false };
    let changed = false;
    let needPush = false;
    const cm = data.m;
    Object.keys(cm).forEach((w) => {
      const c = normalizeRecord(cm[w]);
      const l = state.m[w] ? normalizeRecord(state.m[w]) : null;
      if (!l || (c[2] || 0) > (l[2] || 0)) {
        state.m[w] = c;
        changed = true;
      } else if ((l[2] || 0) > (c[2] || 0)) {
        needPush = true;
      }
    });
    Object.keys(state.m).forEach((w) => {
      if (!cm[w]) needPush = true;
    });
    state.updatedAt = Math.max(state.updatedAt || 0, data.updatedAt || 0);
    if (changed) saveLocal();
    return { changed, needPush };
  }

  async function fetchHub() {
    const res = await fetch(`${API}/${GLOBAL_HUB_VAULT_ID}`, { cache: "no-store" });
    if (!res.ok) throw new Error("hub error");
    const obj = await res.json();
    return (obj && obj.data) || {};
  }

  async function resolveVault(createIfMissing) {
    const cached = localStorage.getItem(VAULT_CACHE_KEY);
    if (cached) return cached;
    const hub = await fetchHub();
    const found = hub.userVaults && hub.userVaults[HUB_VAULT_KEY];
    if (found) {
      localStorage.setItem(VAULT_CACHE_KEY, found);
      return found;
    }
    if (!createIfMissing) return null;
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `kaoyan_words_${sid}`, data: buildPayload() })
    });
    if (!res.ok) throw new Error("create error");
    const created = await res.json();
    localStorage.setItem(VAULT_CACHE_KEY, created.id);
    const latest = await fetchHub().catch(() => hub);
    latest.userVaults = latest.userVaults || {};
    latest.userVaults[HUB_VAULT_KEY] = created.id;
    await fetch(`${API}/${GLOBAL_HUB_VAULT_ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "kaoyan_global_hub_v2", data: latest })
    }).catch(() => {});
    return created.id;
  }

  async function pullCloud() {
    if (!sid) return;
    try {
      const vid = await resolveVault(false);
      if (!vid) return;
      const res = await fetch(`${API}/${vid}`, { cache: "no-store" });
      if (!res.ok) return;
      const obj = await res.json();
      const { changed, needPush } = mergeCloud(obj && obj.data);
      if (changed) renderAll();
      if (needPush) scheduleCloudPush(500);
    } catch (e) {}
  }

  let pushTimer = null;
  let pushing = false;
  let pushAgain = false;

  function scheduleCloudPush(delay = 2200) {
    if (!sid) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(pushCloud, delay);
  }

  async function pushCloud() {
    if (!sid) return;
    if (pushing) {
      pushAgain = true;
      return;
    }
    pushing = true;
    try {
      const vid = await resolveVault(true);
      await fetch(`${API}/${vid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `kaoyan_words_${sid}`, data: buildPayload() }),
        keepalive: true
      });
    } catch (e) {
    } finally {
      pushing = false;
      if (pushAgain) {
        pushAgain = false;
        scheduleCloudPush(400);
      }
    }
  }

  // ---------------- 初始化 ----------------
  function init() {
    loadLocal();
    const fSel = document.getElementById("filter-select");
    const oSel = document.getElementById("order-select");

    if (!["todo", "review", "learned", "star"].includes(state.filter)) {
      state.filter = "todo";
    }
    fSel.value = state.filter;
    oSel.value = state.order;

    document.getElementById("tab-view-card").onclick = () => switchView("card");
    document.getElementById("tab-view-list").onclick = () => switchView("list");

    fSel.onchange = () => {
      state.filter = fSel.value;
      phase = "question";
      saveLocal();
      getActiveGroup(false);
      renderAll();
    };
    oSel.onchange = () => {
      state.order = oSel.value;
      if (state.order === "shuffle") state.seed = Math.floor(Math.random() * 1e9);
      phase = "question";
      saveLocal();
      getActiveGroup(true);
      renderAll();
    };
    document.getElementById("btn-ChangeGroup").onclick = () => {
      if (state.order === "shuffle") state.seed = Math.floor(Math.random() * 1e9);
      getActiveGroup(true);
      renderAll();
    };

    const searchInput = document.getElementById("wl-search-input");
    searchInput.oninput = () => {
      wlSearch = searchInput.value;
      wlPage = 1;
      renderWordListView();
    };

    document.getElementById("btn-mask-toggle").onclick = () => {
      wlMaskMeaning = !wlMaskMeaning;
      renderWordListView();
    };

    document.getElementById("btn-practice-current-list").onclick = () => {
      const targetFilter =
        wlTab === "review" ? "review" :
        wlTab === "learned" ? "learned" :
        wlTab === "star" ? "star" : "todo";
      state.filter = targetFilter;
      fSel.value = targetFilter;
      getActiveGroup(true);
      switchView("card");
    };

    document.addEventListener("keydown", (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "SELECT")) return;
      if (activeView !== "card") return;

      const k = e.key;
      const idx = currentWordIndex();
      if (phase === "question") {
        if (k === "1") { e.preventDefault(); handleJudge("unknown"); }
        else if (k === "2") { e.preventDefault(); handleJudge("vague"); }
        else if (k === "3" || k === " ") { e.preventDefault(); handleJudge("known"); }
        else if (k === "s" || k === "S") { e.preventDefault(); toggleStarByIndex(idx); }
        else if (k === "f" || k === "F") { e.preventDefault(); markFamiliarByIndex(idx); }
        else if (k === "p" || k === "P") { e.preventDefault(); if (idx >= 0) speak(WORDS[idx][0]); }
      } else if (phase === "detail") {
        if (k === " " || k === "Enter" || k === "ArrowRight") {
          e.preventDefault();
          advanceToNextWord();
        } else if (k === "r" || k === "R" || k === "1") {
          e.preventDefault();
          revertToUnknown();
        } else if (k === "s" || k === "S") {
          e.preventDefault();
          toggleStarByIndex(idx);
        } else if (k === "f" || k === "F") {
          e.preventDefault();
          markFamiliarByIndex(idx);
        } else if (k === "p" || k === "P") {
          e.preventDefault();
          if (idx >= 0) speak(WORDS[idx][0]);
        }
      } else if (phase === "summary") {
        if (k === " " || k === "Enter") {
          e.preventDefault();
          getActiveGroup(true);
          renderAll();
        }
      }
    });

    getActiveGroup(false);
    if (location.search.includes("preview=list")) {
      // 预置几条演示状态用于预览单词表效果（不写回 localStorage）
      state.m["act"] = [1, 1, Date.now() - 1000, 1, 2];
      state.m["action"] = [1, 0, Date.now() - 2000, 2, 1];
      state.m["active"] = [2, 0, Date.now() - 3000, 3, 0];
      state.m["actual"] = [2, 1, Date.now() - 4000, 3, 0];
      wlTab = location.search.includes("tab=learned") ? "learned" : "review";
      expandedIdx = 0;
      ensureDetailChunk(0).then(() => renderWordListView());
      switchView("list");
    } else if (location.search.includes("preview=detail")) {
      handleJudge("known");
    } else {
      renderAll();
    }
    pullCloud();
  }

  init();
})();
