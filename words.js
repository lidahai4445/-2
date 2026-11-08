// ============================================================================
// 考研英语大纲词汇（5047词）·「不背单词」式 10词一组、三次判断过关引擎
// 核心特性：
// 1. 10个单词为一组，组内每个单词需累计「认识 3 次」(● ● ●) 方可过关；
// 2. 两步式卡片交互：
//    - 第一步（判断阶段）：展示单词、英美音标与英文语境例句（隐藏中文），用户点击「不认识 / 模糊 / 认识」；
//    - 第二步（释义详情卡片）：不论点击认识还是不认识，均立即展开完整释义卡片（含核心词义、词根巧记、
//      同根派生词、近义词/反义词、高频短语、双语例句），确认记忆后再点击「下一个词 →」进入下一词！
//    - 若点「认识」后看释义发现背错了，可一键点击「↩ 记错了，改为不认识」立即修正；
// 3. 随时可点「⭐ 加入生词本」与「🗑️ 标为熟词（斩）」，进度随刷题口令实时云同步。
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

  //构建单词拼写到下标的快速索引（支持点击派生词/近义词跳转查看详情）
  const WORD_INDEX_MAP = new Map();
  for (let i = 0; i < TOTAL; i++) {
    WORD_INDEX_MAP.set(WORDS[i][0].toLowerCase(), i);
  }

  const sid = String(localStorage.getItem(ACTIVE_SYNC_ID_KEY) || "").trim().toLowerCase();
  const LOCAL_KEY = `kaoyan_words_v2_${sid || "guest"}`;
  const LEGACY_LOCAL_KEY = `kaoyan_words_v1_${sid || "guest"}`;
  const VAULT_CACHE_KEY = `kaoyan_words_vault_v1_${sid}`;
  const HUB_VAULT_KEY = `words__${sid}`;

  // 详情分块缓存：chunkIndex -> { "idx": detailObj }
  const detailChunks = {};
  const chunkPromises = {};

  // m[word] = [status, star, updatedAt, hits, wrongCount]
  // status: 0=未学, 1=学习/巩固中(不认识/模糊或未满3次), 2=已掌握(满3次), 3=熟词(已斩)
  // star: 0/1 (生词本)
  let state = {
    updatedAt: 0,
    m: {},
    filter: "todo",
    order: "list",
    seed: Math.floor(Math.random() * 1e9),
    autoSpeak: false,
    groups: {} // comboKey -> { items: [idx...], queue: [idx...], hits: { idx: 0..3 } }
  };

  // 当前卡片运行时状态
  let phase = "question"; // "question" | "detail" | "summary"
  let lastJudge = null;   // "known" | "vague" | "unknown" | "familiar"
  let prevRecordSnapshot = null; // 用于「记错了，改为不认识 / 撤销熟词」回滚

  // ---------------- 详情分块懒加载 ----------------
  function getChunkId(idx) {
    return Math.floor(idx / CHUNK_SIZE);
  }

  function ensureDetailChunk(idx) {
    const cid = getChunkId(idx);
    if (detailChunks[cid]) return Promise.resolve(detailChunks[cid]);
    if (chunkPromises[cid]) return chunkPromises[cid];
    const file = `words_detail/${String(cid).padStart(2, "0")}.json?v=20261108_w2`;
    chunkPromises[cid] = fetch(file)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => {
        detailChunks[cid] = data || {};
        return detailChunks[cid];
      })
      .catch((e) => {
        console.warn("加载单词详情分块失败", file, e);
        detailChunks[cid] = {};
        return {};
      });
    return chunkPromises[cid];
  }

  function getDetailSync(idx) {
    const cid = getChunkId(idx);
    const chunk = detailChunks[cid];
    return chunk ? chunk[String(idx)] || null : null;
  }

  function preloadGroupDetails(indices) {
    const uniqueChunks = new Set(indices.map(getChunkId));
    uniqueChunks.forEach((cid) => {
      if (detailChunks[cid]) return;
      const alreadyPending = Boolean(chunkPromises[cid]);
      ensureDetailChunk(cid * CHUNK_SIZE).then(() => {
        if (!alreadyPending) renderCardOnly();
      });
    });
  }

  // ---------------- 本地存储与旧版迁移 ----------------
  function normalizeRecord(r) {
    if (!Array.isArray(r)) return [0, 0, 0, 0, 0];
    // 兼容 v1 格式 [status(0未学/1认识/2不认识), star, ts]
    if (r.length === 3) {
      const oldStatus = r[0] || 0;
      const star = r[1] ? 1 : 0;
      const ts = r[2] || 0;
      if (oldStatus === 1) return [2, star, ts, 3, 0]; // 原已认识 -> 已掌握(3/3)
      if (oldStatus === 2) return [1, star, ts, 0, 1]; // 原不认识 -> 巩固中(0/3)
      return [0, star, ts, 0, 0];
    }
    return [
      r[0] || 0,
      r[1] ? 1 : 0,
      r[2] || 0,
      typeof r[3] === "number" ? r[3] : 0,
      r[4] || 0
    ];
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(state, parsed);
      } else {
        const legacy = localStorage.getItem(LEGACY_LOCAL_KEY);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          if (parsed && parsed.m) {
            Object.keys(parsed.m).forEach((w) => {
              state.m[w] = normalizeRecord(parsed.m[w]);
            });
            state.updatedAt = parsed.updatedAt || Date.now();
          }
        }
      }
      Object.keys(state.m || {}).forEach((w) => {
        state.m[w] = normalizeRecord(state.m[w]);
      });
      if (!state.groups || typeof state.groups !== "object") state.groups = {};
    } catch (e) {
      console.warn("读取本地单词进度失败", e);
    }
  }

  function saveLocal() {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("保存本地单词进度失败", e);
    }
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

  // ---------------- 词库筛选与 10词成组引擎 ----------------
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

  function matchFilter(r, f) {
    const [status, star, , , wrongCount] = r;
    if (f === "todo") return status === 0 || status === 1;
    if (f === "star") return star === 1;
    if (f === "unknown") return (wrongCount || 0) > 0;
    if (f === "learned") return status === 2;
    if (f === "familiar") return status === 3;
    return true; // "all"
  }

  function getCandidatePool() {
    const pool = [];
    for (let i = 0; i < TOTAL; i++) {
      const r = rec(WORDS[i][0]);
      if (matchFilter(r, state.filter)) {
        pool.push(i);
      }
    }
    if (state.order === "alpha") {
      pool.sort((a, b) => WORDS[a][0].toLowerCase().localeCompare(WORDS[b][0].toLowerCase()));
    } else if (state.order === "shuffle") {
      seededShuffle(pool, state.seed);
    } else {
      // 词表正序下，优先把「学习中未满3次」的词排在前面继续巩固
      if (state.filter === "todo") {
        pool.sort((a, b) => {
          const sa = rec(WORDS[a][0])[0] === 1 ? 0 : 1;
          const sb = rec(WORDS[b][0])[0] === 1 ? 0 : 1;
          return sa !== sb ? sa - sb : a - b;
        });
      }
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
      // 过滤掉不合法的下标
      grp.items = grp.items.filter((i) => i >= 0 && i < TOTAL);
      grp.queue = (grp.queue || []).filter((i) => i >= 0 && i < TOTAL);
      if (!grp.hits) grp.hits = {};
      if (grp.items.length > 0) {
        preloadGroupDetails(grp.items);
        return grp;
      }
    }

    // 新抽取一组 10 个单词
    const pool = getCandidatePool();
    const items = pool.slice(0, GROUP_SIZE);
    const hits = {};
    items.forEach((idx) => {
      const r = rec(WORDS[idx][0]);
      // 若在待背模式下且该词之前已有 1~2 次进度，保留其进度；若在复习模式下则从 0 开始重新过三遍
      hits[idx] = state.filter === "todo" && r[3] > 0 && r[3] < TARGET_HITS ? r[3] : 0;
    });

    grp = {
      items,
      queue: items.slice(),
      hits
    };
    state.groups[key] = grp;
    phase = "question";
    lastJudge = null;
    prevRecordSnapshot = null;
    saveLocal();
    preloadGroupDetails(items);
    return grp;
  }

  function currentWordIndex() {
    const grp = getActiveGroup();
    if (!grp.queue.length) return -1;
    return grp.queue[0];
  }

  // ---------------- 核心判断逻辑（点击后先展示释义卡片，再点下一词） ----------------
  function handleJudge(type) {
    const grp = getActiveGroup();
    if (!grp.queue.length) return;
    const idx = grp.queue[0];
    const word = WORDS[idx][0];
    const r = rec(word);
    const curHits = grp.hits[idx] || 0;

    // 保存快照以便用户在释义卡片点「记错了，改为不认识」
    prevRecordSnapshot = {
      idx,
      word,
      rec: r.slice(),
      hits: curHits
    };

    let nextHits = curHits;
    let nextStatus = r[0];
    let nextWrong = r[4] || 0;

    if (type === "known") {
      nextHits = Math.min(TARGET_HITS, curHits + 1);
      nextStatus = nextHits >= TARGET_HITS ? 2 : 1;
    } else if (type === "vague") {
      // 模糊：掌握次数不加（若原本 2 次则退回 1 次以多巩固一遍）
      nextHits = curHits >= 2 ? 1 : curHits;
      nextStatus = 1;
      nextWrong += 1;
    } else if (type === "unknown") {
      // 不认识：本组掌握次数归零，需要重新认识 3 次
      nextHits = 0;
      nextStatus = 1;
      nextWrong += 1;
    } else if (type === "familiar") {
      // 标为熟词（斩）：直接满 3 次并标记 status = 3
      nextHits = TARGET_HITS;
      nextStatus = 3;
    }

    grp.hits[idx] = nextHits;
    saveRec(word, [nextStatus, r[1], Date.now(), nextHits, nextWrong]);

    lastJudge = type;
    phase = "detail";
    renderAll();
  }

  // 在释义卡片发现自己记错了，一键改为「不认识」
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
    toast("已修正为「不认识」，稍后将在本组内强化重现");
  }

  // 在释义卡片撤销「熟词」标记
  function revertFamiliar() {
    if (!prevRecordSnapshot) return;
    const grp = getActiveGroup();
    const { idx, word, rec: oldRec, hits: oldHits } = prevRecordSnapshot;
    grp.hits[idx] = oldHits;
    saveRec(word, [oldRec[0] === 3 ? 1 : oldRec[0], rec(word)[1], Date.now(), oldHits, oldRec[4] || 0]);
    lastJudge = "vague";
    renderAll();
    toast("已撤销熟词标记");
  }

  // 在释义卡片点击「下一个词 →」时，才真正推进队列！
  function advanceToNextWord() {
    const grp = getActiveGroup();
    if (!grp.queue.length) return;
    const idx = grp.queue.shift();
    const hits = grp.hits[idx] || 0;
    const r = rec(WORDS[idx][0]);

    // 若尚未满 3 次且未被标为熟词，则按判断结果插回组内队列不同位置（间隔重现）
    if (hits < TARGET_HITS && r[0] !== 3) {
      let insertPos = grp.queue.length; // 默认排到队尾（认识但未满3次）
      if (lastJudge === "unknown") {
        // 不认识：隔 2~3 个词后立即重现
        insertPos = Math.min(grp.queue.length, 2 + Math.floor(Math.random() * 2));
      } else if (lastJudge === "vague") {
        // 模糊：隔 3~4 个词后重现
        insertPos = Math.min(grp.queue.length, 3 + Math.floor(Math.random() * 2));
      }
      grp.queue.splice(insertPos, 0, idx);
    }

    prevRecordSnapshot = null;
    lastJudge = null;

    if (grp.queue.length === 0) {
      phase = "summary";
    } else {
      phase = "question";
    }
    saveLocal();
    renderAll();
    if (phase === "question") {
      autoSpeakCurrent();
    }
  }

  function toggleStarByIndex(idx) {
    if (idx < 0 || idx >= TOTAL) return;
    const word = WORDS[idx][0];
    const r = rec(word);
    const nextStar = r[1] ? 0 : 1;
    saveRec(word, [r[0], nextStar, Date.now(), r[3], r[4]]);
    renderAll();
    toast(nextStar ? `⭐ 已加入生词本：${word}` : `已从生词本移出：${word}`);
  }

  function markFamiliarByIndex(idx) {
    if (idx < 0 || idx >= TOTAL) return;
    const grp = getActiveGroup();
    if (phase === "question" && grp.queue[0] === idx) {
      // 如果在判断阶段点「标为熟词」，先展示释义卡片（允许反悔或看一眼释义再点下一词）
      handleJudge("familiar");
      toast(`🗑️ 已标为熟词：${WORDS[idx][0]}`);
      return;
    }
    const word = WORDS[idx][0];
    const r = rec(word);
    const isAlreadyFamiliar = r[0] === 3;
    if (isAlreadyFamiliar) {
      grp.hits[idx] = 0;
      saveRec(word, [1, r[1], Date.now(), 0, r[4]]);
      toast(`已移出熟词本：${word}`);
    } else {
      grp.hits[idx] = TARGET_HITS;
      saveRec(word, [3, r[1], Date.now(), TARGET_HITS, r[4]]);
      lastJudge = "familiar";
      toast(`🗑️ 已标为熟词：${word}`);
    }
    renderAll();
  }

  // ---------------- 渲染辅助与高亮 ----------------
  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function highlightWordInSentence(sentence, targetWord) {
    const safe = esc(sentence);
    if (!targetWord) return safe;
    const stem = targetWord.replace(/[^a-zA-Z]/g, "");
    if (stem.length < 2) return safe;
    const reg = new RegExp(`\\b(${stem}[a-zA-Z]{0,4})\\b`, "gi");
    return safe.replace(reg, `<span class="hl">$1</span>`);
  }

  function renderTopStats() {
    let todoCount = 0;
    let starCount = 0;
    let unknownCount = 0;
    let learnedCount = 0;
    let familiarCount = 0;

    for (let i = 0; i < TOTAL; i++) {
      const r = rec(WORDS[i][0]);
      if (r[0] === 0 || r[0] === 1) todoCount++;
      if (r[1] === 1) starCount++;
      if ((r[4] || 0) > 0) unknownCount++;
      if (r[0] === 2) learnedCount++;
      if (r[0] === 3) familiarCount++;
    }

    const pills = [
      { id: "todo", label: `📖 待背 ${todoCount}` },
      { id: "star", label: `⭐ 生词本 ${starCount}` },
      { id: "unknown", label: `🔄 难词 ${unknownCount}` },
      { id: "learned", label: `✅ 已掌握 ${learnedCount}` },
      { id: "familiar", label: `🗑️ 熟词 ${familiarCount}` }
    ];

    const pillsEl = document.getElementById("quick-filter-pills");
    pillsEl.innerHTML = pills
      .map(
        (p) =>
          `<button class="stat-pill ${state.filter === p.id ? "active" : ""}" data-filter="${p.id}">${p.label}</button>`
      )
      .join("");
    pillsEl.querySelectorAll(".stat-pill").forEach((btn) => {
      btn.onclick = () => {
        const f = btn.getAttribute("data-filter");
        document.getElementById("filter-select").value = f;
        switchFilter(f);
      };
    });

    // 计算当前 10 词小组的总进度（每个词 3 点进度，10 词共 30 点）
    const grp = getActiveGroup();
    const totalItems = grp.items.length;
    let sumHits = 0;
    let masteredInGroup = 0;
    grp.items.forEach((idx) => {
      const h = Math.min(TARGET_HITS, grp.hits[idx] || 0);
      sumHits += h;
      if (h >= TARGET_HITS || rec(WORDS[idx][0])[0] === 3) masteredInGroup++;
    });
    const maxPoints = Math.max(1, totalItems * TARGET_HITS);
    const pct = totalItems ? Math.min(100, Math.round((sumHits / maxPoints) * 100)) : 0;

    document.getElementById("group-progress-text").textContent =
      `本组过关 ${masteredInGroup} / ${totalItems} 词（三次判断总进度 ${pct}%）`;
    document.getElementById("group-progress-fill").style.width = `${pct}%`;
  }

  function renderCardOnly() {
    const card = document.getElementById("card");
    if (!TOTAL) {
      card.innerHTML = `<div class="empty">词表数据未加载，请刷新页面重试。</div>`;
      return;
    }

    const grp = getActiveGroup();
    if (!grp.items.length) {
      card.innerHTML = `
        <div class="empty">
          🎉 当前「${document.getElementById("filter-select").selectedOptions[0].text}」范围内没有待背单词！<br/><br/>
          <button class="chip-btn" id="btn-EmptySwitchTodo" style="padding:8px 16px;font-size:14px;">📖 切换到待背词库</button>
        </div>
      `;
      const b = document.getElementById("btn-EmptySwitchTodo");
      if (b) b.onclick = () => switchFilter("todo");
      return;
    }

    if (phase === "summary" || grp.queue.length === 0) {
      renderGroupSummary(card, grp);
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

    // 顶部栏：本组位置 + 三刷圆点 + 加入生词本 + 标为熟词
    const dotsHtml = [0, 1, 2]
      .map((i) => `<span class="hit-dot ${i < hits ? "on" : ""}"></span>`)
      .join("");

    const ukPhone = (detail && detail.uk) || basePhone || "";
    const usPhone = (detail && detail.us) || basePhone || "";

    const headerHtml = `
      <div class="card-header">
        <div class="card-header-left">
          <span class="group-badge">本组第 ${orderInGroup} / ${grp.items.length} 词</span>
          <span class="hit-dots" title="每个单词需在本组累计认识 3 次方可过关">
            ${dotsHtml}
            <span style="margin-left:3px;">认识 ${hits}/${TARGET_HITS} 次</span>
          </span>
        </div>
        <div class="card-header-actions">
          <button class="chip-btn ${isStar ? "star-on" : ""}" id="btn-toggle-star" title="快捷键 S：加入或移出生词本">
            ${isStar ? "★ 已在生词本" : "☆ 加入生词本"}
          </button>
          <button class="chip-btn ${isFamiliar ? "familiar-on" : ""}" id="btn-toggle-familiar" title="快捷键 F：标为熟词（斩），后续不再出现">
            ${isFamiliar ? "✓ 已标熟词" : "🗑️ 标为熟词"}
          </button>
        </div>
      </div>
    `;

    // 单词与音标主视觉
    const heroHtml = `
      <div class="word-hero">
        <div class="word-title">${esc(word)}</div>
        <div class="phonetic-row">
          ${
            ukPhone
              ? `<button class="phonetic-badge" id="btn-speak-uk" title="点击朗读英音 (快捷键 P)">🇬🇧 /${esc(ukPhone)}/ 🔊</button>`
              : ""
          }
          ${
            usPhone && usPhone !== ukPhone
              ? `<button class="phonetic-badge" id="btn-speak-us" title="点击朗读美音 (快捷键 P)">🇺🇸 /${esc(usPhone)}/ 🔊</button>`
              : !ukPhone
              ? `<button class="phonetic-badge" id="btn-speak-us">🔊 朗读发音</button>`
              : ""
          }
        </div>
      </div>
    `;

    if (phase === "question") {
      // 第一阶段：只显示单词 + 英文例句语境（不显示中文翻译），让用户点击「不认识 / 模糊 / 认识」
      const firstSent = detail && detail.s && detail.s[0] ? detail.s[0][0] : "";
      const contextHtml = firstSent
        ? `
          <div class="context-preview">
            <div>“ ${highlightWordInSentence(firstSent, word)} ”</div>
            <div class="context-hint">💡 请根据单词或例句语境回忆词义，点击下方按钮后将展开完整释义、派生词与近义词</div>
          </div>
        `
        : `
          <div class="context-preview">
            <div class="context-hint">💡 请回忆该词含义，点击下方「认识 / 模糊 / 不认识」后显示完整释义与派生近义词</div>
          </div>
        `;

      card.innerHTML = `
        ${headerHtml}
        ${heroHtml}
        ${contextHtml}
        <div class="judge-stage">
          <div class="judge-prompt">请选择您对该单词的掌握程度（点击后将展示单词释义卡片）：</div>
          <div class="judge-grid">
            <button class="judge-btn judge-unknown" id="btn-judge-unknown">
              <span>✗ 不认识</span>
              <span class="sub">进度归零 · 强化重现 (按 1)</span>
            </button>
            <button class="judge-btn judge-vague" id="btn-judge-vague">
              <span>🤔 模糊</span>
              <span class="sub">看释义巩固 · 稍后重现 (按 2)</span>
            </button>
            <button class="judge-btn judge-known" id="btn-judge-known">
              <span>✓ 认识</span>
              <span class="sub">掌握度 +1 → ${Math.min(TARGET_HITS, hits + 1)}/3 (按 3)</span>
            </button>
          </div>
        </div>
        <div class="kbd-hint">快捷键：1 不认识 · 2 模糊 · 3 认识 · P 发音 · S 加入生词本 · F 标为熟词</div>
      `;

      bindHeaderButtons(idx, word);
      document.getElementById("btn-judge-unknown").onclick = () => handleJudge("unknown");
      document.getElementById("btn-judge-vague").onclick = () => handleJudge("vague");
      document.getElementById("btn-judge-known").onclick = () => handleJudge("known");
    } else {
      // 第二阶段：展示完整单词释义详情卡片（核心释义 + 巧记 + 派生词 + 近义/反义词 + 短语 + 双语例句）+「下一个词 →」按钮
      card.innerHTML = `
        ${headerHtml}
        ${heroHtml}
        ${buildDetailCardHtml(idx, word, baseShort, detail, hits)}
      `;
      bindHeaderButtons(idx, word);
      bindDetailCardEvents(word);
    }
  }

  function buildDetailCardHtml(idx, word, baseShort, detail, hits) {
    // 1. 顶部判断结果横幅
    let bannerClass = "known";
    let bannerText = "";
    let bannerActionHtml = "";

    if (lastJudge === "known") {
      bannerClass = "known";
      bannerText =
        hits >= TARGET_HITS
          ? `🎉 已选「认识」· 本词已满 ${TARGET_HITS}/${TARGET_HITS} 次，本组过关！`
          : `✓ 已选「认识」· 本组掌握度升至 ${hits}/${TARGET_HITS} 次`;
      bannerActionHtml = `<button class="verdict-fix-btn" id="btn-revert-unknown">↩ 记错了，改为不认识</button>`;
    } else if (lastJudge === "vague") {
      bannerClass = "vague";
      bannerText = `🤔 已选「模糊」· 请对照下方释义与派生词加深印象，稍后将再次出现`;
      bannerActionHtml = `<button class="verdict-fix-btn" id="btn-revert-unknown">改为不认识</button>`;
    } else if (lastJudge === "familiar") {
      bannerClass = "familiar";
      bannerText = `🗑️ 已标为「熟词」· 该词已斩，后续不再出现`;
      bannerActionHtml = `<button class="verdict-fix-btn" id="btn-revert-familiar">↩ 撤销熟词</button>`;
    } else {
      bannerClass = "unknown";
      bannerText = `✗ 已选「不认识」· 掌握度重置为 0/${TARGET_HITS}，本组稍后将重点重现`;
    }

    // 2. 核心释义
    const transList = detail && Array.isArray(detail.t) && detail.t.length
      ? detail.t
      : baseShort.split("；").filter(Boolean).map((line) => {
          const m = line.match(/^([a-z]+\.)\s*(.*)$/i);
          return m ? [m[1].replace(/\.$/, ""), m[2]] : ["", line];
        });

    const transHtml = transList
      .map(
        ([pos, cn]) => `
        <div class="trans-item">
          ${pos ? `<span class="pos-tag">${esc(pos)}.</span>` : ""}
          <span>${esc(cn)}</span>
        </div>
      `
      )
      .join("");

    // 3. 词根巧记 / 助记
    const remHtml =
      detail && detail.m
        ? `
        <div class="detail-box rem-box">
          <div class="detail-box-title" style="color:#b45309;">💡 词根巧记 / 助记</div>
          <div>${esc(detail.m)}</div>
        </div>
      `
        : "";

    // 4. 同根派生词 (relWord)
    const rels = (detail && detail.r) || [];
    const relBoxHtml = rels.length
      ? `
        <div class="detail-box">
          <div class="detail-box-title">🌱 派生词 / 同根词 (${rels.length})</div>
          <div class="rel-list">
            ${rels
              .map(
                ([pos, hwd, tran]) => `
                <div class="rel-item">
                  ${pos ? `<span class="pos-tag">${esc(pos)}.</span>` : ""}
                  <span class="rel-word" data-speak="${esc(hwd)}" title="点击发音">${esc(hwd)} 🔊</span>
                  <span style="color:var(--text-sec);">${esc(tran)}</span>
                </div>
              `
              )
              .join("")}
          </div>
        </div>
      `
      : "";

    // 5. 近义词 (syno) 与 反义词 (antos)
    const synos = (detail && detail.sy) || [];
    const antos = (detail && detail.a) || [];
    const hasSynoOrAnto = synos.length > 0 || antos.length > 0;
    const synoBoxHtml = hasSynoOrAnto
      ? `
        <div class="detail-box">
          <div class="detail-box-title">🔗 近义词${antos.length ? " / 反义词" : ""}</div>
          <div class="syno-list">
            ${synos
              .map(
                ([pos, tran, words]) => `
                <div class="syno-group">
                  <div style="font-size:12.5px;color:var(--muted);">
                    ${pos ? `<strong>${esc(pos)}.</strong> ` : ""}${esc(tran)}
                  </div>
                  <div class="syno-chips">
                    ${words
                      .map(
                        (w) =>
                          `<span class="word-chip" data-speak="${esc(w)}" title="点击发音">${esc(w)}</span>`
                      )
                      .join("")}
                  </div>
                </div>
              `
              )
              .join("")}
            ${
              antos.length
                ? `
                <div class="syno-group">
                  <div style="font-size:12.5px;color:#b91c1c;font-weight:600;">↔ 反义词</div>
                  <div class="syno-chips">
                    ${antos
                      .map(
                        (w) =>
                          `<span class="word-chip anto" data-speak="${esc(w)}" title="点击发音">${esc(w)}</span>`
                      )
                      .join("")}
                  </div>
                </div>
              `
                : ""
            }
          </div>
        </div>
      `
      : "";

    // 派生词与近义词并排或自适应展示
    const midGridHtml =
      relBoxHtml && synoBoxHtml
        ? `<div class="detail-grid-2">${relBoxHtml}${synoBoxHtml}</div>`
        : `${relBoxHtml}${synoBoxHtml}`;

    // 6. 高频短语搭配
    const phrases = (detail && detail.p) || [];
    const phraseBoxHtml = phrases.length
      ? `
        <div class="detail-box">
          <div class="detail-box-title">📌 常用短语词组</div>
          <div class="phrase-list">
            ${phrases
              .map(
                ([en, cn]) => `
                <div class="phrase-item">
                  <span class="phrase-en" data-speak="${esc(en)}" style="cursor:pointer;" title="点击朗读短语">${esc(en)}</span>
                  <span class="phrase-cn">${esc(cn)}</span>
                </div>
              `
              )
              .join("")}
          </div>
        </div>
      `
      : "";

    // 7. 双语真题/常用例句
    const sents = (detail && detail.s) || [];
    const sentBoxHtml = sents.length
      ? `
        <div class="detail-box">
          <div class="detail-box-title">📖 双语语境例句</div>
          <div class="sent-list">
            ${sents
              .map(
                ([en, cn]) => `
                <div class="sent-item">
                  <div class="sent-en">
                    ${highlightWordInSentence(en, word)}
                    <button class="chip-btn" style="padding:1px 7px;font-size:11.5px;margin-left:6px;" data-speak="${esc(en)}">🔊</button>
                  </div>
                  <div class="sent-cn">${esc(cn)}</div>
                </div>
              `
              )
              .join("")}
          </div>
        </div>
      `
      : "";

    return `
      <div class="detail-stage">
        <div class="verdict-banner ${bannerClass}">
          <span>${bannerText}</span>
          ${bannerActionHtml}
        </div>

        <div class="detail-box" style="background:#ffffff;border-width:1.5px;">
          <div class="detail-box-title">📕 核心考纲释义</div>
          <div class="trans-list">${transHtml}</div>
        </div>

        ${remHtml}
        ${midGridHtml}
        ${phraseBoxHtml}
        ${sentBoxHtml}

        <div class="next-stage-bar">
          ${
            lastJudge === "known" || lastJudge === "vague"
              ? `<button class="btn-secondary-action" id="btn-bottom-revert">✗ 记错了，改为不认识</button>`
              : ""
          }
          <button class="btn-next-word" id="btn-next-word">
            下一个词 → （空格 / Enter）
          </button>
        </div>
      </div>
      <div class="kbd-hint">快捷键：空格 / Enter / → 下一个词 · R 记错了改为不认识 · S 加入生词本 · F 标为熟词 · P 发音</div>
    `;
  }

  function renderGroupSummary(card, grp) {
    const rowsHtml = grp.items
      .map((idx, i) => {
        const [w, ph, short] = WORDS[idx];
        const r = rec(w);
        const isStar = r[1] === 1;
        const isFamiliar = r[0] === 3;
        return `
          <div class="summary-row">
            <span class="summary-word" data-speak="${esc(w)}" title="点击发音">
              ${i + 1}. ${esc(w)} <small style="color:var(--muted);font-weight:400;">${ph ? `/${esc(ph)}/` : ""}</small>
            </span>
            <span class="summary-meaning">${esc(short)}</span>
            <div style="display:flex;gap:6px;">
              <button class="chip-btn ${isStar ? "star-on" : ""}" data-star-idx="${idx}">
                ${isStar ? "★ 生词" : "☆ 生词"}
              </button>
              <button class="chip-btn ${isFamiliar ? "familiar-on" : ""}" data-fam-idx="${idx}">
                ${isFamiliar ? "✓ 熟词" : "🗑️ 熟词"}
              </button>
            </div>
          </div>
        `;
      })
      .join("");

    card.innerHTML = `
      <div style="text-align:center;padding:12px 0 6px;">
        <div style="font-size:26px;font-weight:800;color:var(--success);">🎉 本组 ${grp.items.length} 个单词已全部三次过关！</div>
        <div style="font-size:13.5px;color:var(--muted);margin-top:6px;">
          快速回顾本组单词，可随时勾选加入「生词本」或「熟词」，准备好后开启下一组：
        </div>
      </div>
      <div class="summary-table">${rowsHtml}</div>
      <div class="next-stage-bar">
        <button class="btn-next-word" id="btn-start-next-group">
          🚀 开始下一组 (${GROUP_SIZE}词) → （空格 / Enter）
        </button>
      </div>
    `;

    card.querySelectorAll("[data-speak]").forEach((el) => {
      el.onclick = () => speak(el.getAttribute("data-speak"), "en-US");
    });
    card.querySelectorAll("[data-star-idx]").forEach((el) => {
      el.onclick = () => toggleStarByIndex(parseInt(el.getAttribute("data-star-idx"), 10));
    });
    card.querySelectorAll("[data-fam-idx]").forEach((el) => {
      el.onclick = () => markFamiliarByIndex(parseInt(el.getAttribute("data-fam-idx"), 10));
    });
    document.getElementById("btn-start-next-group").onclick = () => {
      getActiveGroup(true);
      renderAll();
      autoSpeakCurrent();
    };
  }

  function bindHeaderButtons(idx, word) {
    const starBtn = document.getElementById("btn-toggle-star");
    if (starBtn) starBtn.onclick = () => toggleStarByIndex(idx);
    const famBtn = document.getElementById("btn-toggle-familiar");
    if (famBtn) famBtn.onclick = () => markFamiliarByIndex(idx);

    const ukBtn = document.getElementById("btn-speak-uk");
    if (ukBtn) ukBtn.onclick = () => speak(word, "en-GB");
    const usBtn = document.getElementById("btn-speak-us");
    if (usBtn) usBtn.onclick = () => speak(word, "en-US");
  }

  function bindDetailCardEvents(word) {
    const nextBtn = document.getElementById("btn-next-word");
    if (nextBtn) nextBtn.onclick = advanceToNextWord;

    const revBtn = document.getElementById("btn-revert-unknown");
    if (revBtn) revBtn.onclick = revertToUnknown;

    const botRevBtn = document.getElementById("btn-bottom-revert");
    if (botRevBtn) botRevBtn.onclick = revertToUnknown;

    const revFamBtn = document.getElementById("btn-revert-familiar");
    if (revFamBtn) revFamBtn.onclick = revertFamiliar;

    document.querySelectorAll("#card [data-speak]").forEach((el) => {
      el.onclick = () => speak(el.getAttribute("data-speak"), "en-US");
    });
  }

  function renderAll() {
    renderTopStats();
    renderCardOnly();
  }

  // ---------------- 本组词表弹窗 ----------------
  function openGroupModal() {
    const grp = getActiveGroup();
    const modal = document.getElementById("group-modal");
    const body = document.getElementById("modal-body");
    document.getElementById("modal-title").textContent = `📋 当前小组词表（共 ${grp.items.length} 词）`;

    body.innerHTML = grp.items
      .map((idx, i) => {
        const [w, ph, short] = WORDS[idx];
        const r = rec(w);
        const h = Math.min(TARGET_HITS, grp.hits[idx] || 0);
        return `
          <div class="summary-row" style="margin-bottom:8px;">
            <span class="summary-word" data-speak="${esc(w)}">
              ${i + 1}. ${esc(w)} <small style="color:var(--muted);font-weight:400;">(${h}/${TARGET_HITS})</small>
            </span>
            <span class="summary-meaning">${esc(short)}</span>
            <div style="display:flex;gap:6px;">
              <button class="chip-btn ${r[1] ? "star-on" : ""}" data-modal-star="${idx}">${r[1] ? "★" : "☆"}</button>
              <button class="chip-btn ${r[0] === 3 ? "familiar-on" : ""}" data-modal-fam="${idx}">熟词</button>
            </div>
          </div>
        `;
      })
      .join("");

    body.querySelectorAll("[data-speak]").forEach((el) => {
      el.onclick = () => speak(el.getAttribute("data-speak"), "en-US");
    });
    body.querySelectorAll("[data-modal-star]").forEach((el) => {
      el.onclick = () => {
        toggleStarByIndex(parseInt(el.getAttribute("data-modal-star"), 10));
        openGroupModal();
      };
    });
    body.querySelectorAll("[data-modal-fam]").forEach((el) => {
      el.onclick = () => {
        markFamiliarByIndex(parseInt(el.getAttribute("data-modal-fam"), 10));
        openGroupModal();
      };
    });

    modal.classList.add("open");
  }

  // ---------------- 语音朗读 ----------------
  function speak(text, lang = "en-US") {
    if (!("speechSynthesis" in window)) {
      toast("当前浏览器不支持语音朗读");
      return;
    }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 0.92;
      const voices = speechSynthesis.getVoices() || [];
      const v =
        voices.find((x) => x.lang && x.lang.toLowerCase() === lang.toLowerCase()) ||
        voices.find((x) => /^en/i.test(x.lang));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  function autoSpeakCurrent() {
    if (!state.autoSpeak) return;
    const idx = currentWordIndex();
    if (idx >= 0) speak(WORDS[idx][0], "en-US");
  }

  // ---------------- 提示与云同步 ----------------
  let toastTimer = null;
  function toast(msg) {
    const el = document.getElementById("sync-status");
    const base = el.dataset.base || el.textContent;
    el.dataset.base = base;
    el.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.textContent = el.dataset.base;
    }, 2000);
  }

  function setSyncStatus(text) {
    const el = document.getElementById("sync-status");
    el.dataset.base = text;
    el.textContent = text;
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
    if (!res.ok) throw new Error("hub fetch failed");
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
    if (!res.ok) throw new Error("create vault failed");
    const created = await res.json();
    if (!created || !created.id) throw new Error("create vault no id");
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
    setSyncStatus("☁️ 同步中...");
    try {
      const vid = await resolveVault(false);
      if (!vid) {
        setSyncStatus(`☁️ 口令 ${sid}`);
        if (Object.keys(state.m).length) scheduleCloudPush(500);
        return;
      }
      const res = await fetch(`${API}/${vid}`, { cache: "no-store" });
      if (!res.ok) throw new Error("vault fetch failed");
      const obj = await res.json();
      const { changed, needPush } = mergeCloud(obj && obj.data);
      if (changed) renderAll();
      setSyncStatus(`✅ 口令 ${sid} 已同步`);
      if (needPush) scheduleCloudPush(500);
    } catch (e) {
      setSyncStatus(`⚠️ 口令 ${sid}（本机保存）`);
    }
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
      const res = await fetch(`${API}/${vid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `kaoyan_words_${sid}`, data: buildPayload() }),
        keepalive: true
      });
      if (!res.ok) throw new Error("vault put failed");
      const t = new Date().toLocaleTimeString("zh-CN", { hour12: false });
      setSyncStatus(`✅ 已同步 ${t}`);
    } catch (e) {
      setSyncStatus("⚠️ 已保存在本机");
    } finally {
      pushing = false;
      if (pushAgain) {
        pushAgain = false;
        scheduleCloudPush(400);
      }
    }
  }

  // ---------------- 切换范围/顺序与快捷键 ----------------
  function switchFilter(nextFilter) {
    state.filter = nextFilter;
    phase = "question";
    lastJudge = null;
    prevRecordSnapshot = null;
    saveLocal();
    getActiveGroup(false);
    renderAll();
    autoSpeakCurrent();
  }

  function init() {
    loadLocal();
    const fSel = document.getElementById("filter-select");
    const oSel = document.getElementById("order-select");
    const auto = document.getElementById("auto-speak");

    if (!["todo", "star", "unknown", "learned", "familiar", "all"].includes(state.filter)) {
      state.filter = "todo";
    }
    fSel.value = state.filter;
    oSel.value = state.order;
    auto.checked = !!state.autoSpeak;

    fSel.onchange = () => switchFilter(fSel.value);
    oSel.onchange = () => {
      state.order = oSel.value;
      if (state.order === "shuffle") state.seed = Math.floor(Math.random() * 1e9);
      phase = "question";
      saveLocal();
      getActiveGroup(true);
      renderAll();
      autoSpeakCurrent();
    };
    auto.onchange = () => {
      state.autoSpeak = auto.checked;
      saveLocal();
    };

    document.getElementById("btn-group-list").onclick = openGroupModal;
    document.getElementById("btn-close-modal").onclick = () => {
      document.getElementById("group-modal").classList.remove("open");
    };
    document.getElementById("group-modal").onclick = (e) => {
      if (e.target.id === "group-modal") e.target.classList.remove("open");
    };
    document.getElementById("btn-rebuild-group").onclick = () => {
      if (state.order === "shuffle") state.seed = Math.floor(Math.random() * 1e9);
      getActiveGroup(true);
      document.getElementById("group-modal").classList.remove("open");
      renderAll();
      toast("🔄 已为您抽取新一组 10 个单词");
    };

    document.addEventListener("keydown", (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "SELECT")) return;
      if (document.getElementById("group-modal").classList.contains("open")) {
        if (e.key === "Escape") document.getElementById("group-modal").classList.remove("open");
        return;
      }

      const k = e.key;
      const idx = currentWordIndex();

      if (phase === "question") {
        if (k === "1") { e.preventDefault(); handleJudge("unknown"); }
        else if (k === "2") { e.preventDefault(); handleJudge("vague"); }
        else if (k === "3" || k === " ") { e.preventDefault(); handleJudge("known"); }
        else if (k === "s" || k === "S") { e.preventDefault(); toggleStarByIndex(idx); }
        else if (k === "f" || k === "F") { e.preventDefault(); markFamiliarByIndex(idx); }
        else if (k === "p" || k === "P") { e.preventDefault(); if (idx >= 0) speak(WORDS[idx][0], "en-US"); }
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
          if (idx >= 0) speak(WORDS[idx][0], "en-US");
        }
      } else if (phase === "summary") {
        if (k === " " || k === "Enter") {
          e.preventDefault();
          getActiveGroup(true);
          renderAll();
          autoSpeakCurrent();
        }
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && pushTimer) {
        clearTimeout(pushTimer);
        pushCloud();
      }
    });

    setSyncStatus(sid ? `☁️ 口令 ${sid}` : "本机模式（未设口令）");
    getActiveGroup(false);
    if (location.search.includes("preview=detail")) {
      handleJudge("known");
    } else {
      renderAll();
    }
    pullCloud();
  }

  init();
})();
