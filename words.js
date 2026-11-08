// ============================================================================
// 考研英语大纲词汇（5047词）· 极简纯净版「10词一组 · 三次判断」
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

  const sid = String(localStorage.getItem(ACTIVE_SYNC_ID_KEY) || "").trim().toLowerCase();
  const LOCAL_KEY = `kaoyan_words_v2_${sid || "guest"}`;
  const LEGACY_LOCAL_KEY = `kaoyan_words_v1_${sid || "guest"}`;
  const VAULT_CACHE_KEY = `kaoyan_words_vault_v1_${sid}`;
  const HUB_VAULT_KEY = `words__${sid}`;

  const detailChunks = {};
  const chunkPromises = {};

  // m[word] = [status, star, updatedAt, hits, wrongCount]
  // status: 0=未学, 1=学习中, 2=已掌握(满3次), 3=熟词
  let state = {
    updatedAt: 0,
    m: {},
    filter: "todo",
    order: "list",
    seed: Math.floor(Math.random() * 1e9),
    autoSpeak: false,
    groups: {}
  };

  let phase = "question"; // "question" | "detail" | "summary"
  let lastJudge = null;   // "known" | "vague" | "unknown" | "familiar"
  let activeExtTab = "rel"; // "rel" | "syno" | "phrase" | "rem"

  // ---------------- 详情分块按需加载 ----------------
  function getChunkId(idx) {
    return Math.floor(idx / CHUNK_SIZE);
  }

  function ensureDetailChunk(idx) {
    const cid = getChunkId(idx);
    if (detailChunks[cid]) return Promise.resolve(detailChunks[cid]);
    if (chunkPromises[cid]) return chunkPromises[cid];
    const file = `words_detail/${String(cid).padStart(2, "0")}.json?v=20261108_w3`;
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
        if (!alreadyPending) renderCard();
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

  // ---------------- 词库筛选与 10 词成组 ----------------
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
    return true;
  }

  function getCandidatePool() {
    const pool = [];
    for (let i = 0; i < TOTAL; i++) {
      if (matchFilter(rec(WORDS[i][0]), state.filter)) pool.push(i);
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

  // ---------------- 判断与推进逻辑 ----------------
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
    if (phase === "question" && grp.queue[0] === idx) {
      handleJudge("familiar");
      return;
    }
    const word = WORDS[idx][0];
    const r = rec(word);
    if (r[0] === 3) {
      grp.hits[idx] = 0;
      saveRec(word, [1, r[1], Date.now(), 0, r[4]]);
    } else {
      grp.hits[idx] = TARGET_HITS;
      saveRec(word, [3, r[1], Date.now(), TARGET_HITS, r[4]]);
      lastJudge = "familiar";
    }
    renderAll();
  }

  // ---------------- 界面渲染 ----------------
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

  function updateFilterCounts() {
    let counts = { todo: 0, star: 0, unknown: 0, learned: 0, familiar: 0 };
    for (let i = 0; i < TOTAL; i++) {
      const r = rec(WORDS[i][0]);
      if (r[0] === 0 || r[0] === 1) counts.todo++;
      if (r[1] === 1) counts.star++;
      if ((r[4] || 0) > 0) counts.unknown++;
      if (r[0] === 2) counts.learned++;
      if (r[0] === 3) counts.familiar++;
    }
    const sel = document.getElementById("filter-select");
    const labels = {
      todo: `待背 (${counts.todo})`,
      star: `⭐ 生词本 (${counts.star})`,
      unknown: `错词本 (${counts.unknown})`,
      learned: `已掌握 (${counts.learned})`,
      familiar: `熟词本 (${counts.familiar})`
    };
    Array.from(sel.options).forEach((opt) => {
      if (labels[opt.value]) opt.textContent = labels[opt.value];
    });
  }

  function renderCard() {
    const card = document.getElementById("card");
    if (!TOTAL) return;

    const grp = getActiveGroup();
    if (!grp.items.length) {
      card.innerHTML = `
        <div class="question-body" style="color:var(--muted);">
          当前范围内没有单词
        </div>
      `;
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
    // 核心释义
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

    // 第一条双语例句
    const sent = detail && detail.s && detail.s[0] ? detail.s[0] : null;
    const sentHtml = sent
      ? `
        <div class="sent-block" data-speak="${esc(sent[0])}" title="点击朗读例句">
          <div>${highlightWord(sent[0], word)}</div>
          <div class="cn">${esc(sent[1])}</div>
        </div>
      `
      : "";

    // 扩展标签页（仅展示有数据的标签：派生 / 近义 / 短语 / 巧记）
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

  function renderAll() {
    updateFilterCounts();
    renderCard();
  }

  // ---------------- 本组词表弹窗 ----------------
  function openGroupModal() {
    const grp = getActiveGroup();
    const modal = document.getElementById("group-modal");
    const body = document.getElementById("modal-body");

    body.innerHTML = grp.items
      .map((idx) => {
        const [w, , short] = WORDS[idx];
        const r = rec(w);
        const h = Math.min(TARGET_HITS, grp.hits[idx] || 0);
        return `
          <div class="sum-item">
            <span class="sum-w" data-speak="${esc(w)}">${esc(w)} <small style="color:var(--muted);font-weight:400;">${h}/3</small></span>
            <span class="sum-m">${esc(short)}</span>
            <button class="action-tag ${r[1] ? "star-on" : ""}" data-m-star="${idx}">${r[1] ? "★" : "☆"}</button>
            <button class="action-tag ${r[0] === 3 ? "fam-on" : ""}" data-m-fam="${idx}">熟词</button>
          </div>
        `;
      })
      .join("");

    body.querySelectorAll("[data-speak]").forEach((el) => {
      el.onclick = () => speak(el.getAttribute("data-speak"));
    });
    body.querySelectorAll("[data-m-star]").forEach((el) => {
      el.onclick = () => {
        toggleStarByIndex(parseInt(el.getAttribute("data-m-star"), 10));
        openGroupModal();
      };
    });
    body.querySelectorAll("[data-m-fam]").forEach((el) => {
      el.onclick = () => {
        markFamiliarByIndex(parseInt(el.getAttribute("data-m-fam"), 10));
        openGroupModal();
      };
    });

    modal.classList.add("open");
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

  function setSyncStatus(text) {
    const el = document.getElementById("sync-status");
    if (el) el.textContent = text;
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
      setSyncStatus(`口令 ${sid} 已同步`);
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
      setSyncStatus(`口令 ${sid} 已同步`);
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
    const auto = document.getElementById("auto-speak");

    if (!["todo", "star", "unknown", "learned", "familiar"].includes(state.filter)) {
      state.filter = "todo";
    }
    fSel.value = state.filter;
    oSel.value = state.order;
    auto.checked = !!state.autoSpeak;

    fSel.onchange = () => {
      state.filter = fSel.value;
      phase = "question";
      saveLocal();
      getActiveGroup(false);
      renderAll();
      autoSpeakCurrent();
    };
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

    setSyncStatus(sid ? `口令 ${sid}` : "本机模式");
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
