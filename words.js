// ============================================================================
// 考研英语大纲词汇（5047词）·「不背单词 + 墨墨艾宾浩斯」新学与智能复习系统
// 核心机制：
// 1. 新学模式（10词一组 · 三次认识过关）：满 3 次认识后进入艾宾浩斯记忆曲线 Lv.1；
// 2. 复习模式（艾宾浩斯 7 阶间隔重复 SRS）：
//    - 自动汇集已到期的待复习词（以及新学中未满3次的易错词）；
//    - 复习时首次即点「认识」一击即过，记忆等级升阶（Lv.1 → Lv.7：12小时 → 1天 → 2天 → 4天 → 7天 → 15天 → 30天）；
//    - 点「模糊」则需在本组内再巩固 2 次，记忆等级退 1 阶；
//    - 点「不认识」则重置为需在本组内认识 3 次，记忆等级退回 Lv.1（当日强化重现）。
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

  // 艾宾浩斯 7 阶复习间隔（毫秒）与可读标签
  const HOUR = 3600 * 1000;
  const DAY = 24 * HOUR;
  const SRS_STEPS = [
    { lv: 1, ms: 12 * HOUR, label: "12小时后" },
    { lv: 2, ms: 1 * DAY,   label: "1天后" },
    { lv: 3, ms: 2 * DAY,   label: "2天后" },
    { lv: 4, ms: 4 * DAY,   label: "4天后" },
    { lv: 5, ms: 7 * DAY,   label: "7天后" },
    { lv: 6, ms: 15 * DAY,  label: "15天后" },
    { lv: 7, ms: 30 * DAY,  label: "30天后" }
  ];

  const sid = String(localStorage.getItem(ACTIVE_SYNC_ID_KEY) || "").trim().toLowerCase();
  const LOCAL_KEY = `kaoyan_words_v2_${sid || "guest"}`;
  const LEGACY_LOCAL_KEY = `kaoyan_words_v1_${sid || "guest"}`;
  const VAULT_CACHE_KEY = `kaoyan_words_vault_v1_${sid}`;
  const HUB_VAULT_KEY = `words__${sid}`;

  const detailChunks = {};
  const chunkPromises = {};

  // m[word] = [status, star, updatedAt, hits, wrongCount, srsStage, nextDue]
  // status: 0=未背, 1=新学巩固中, 2=已入艾宾浩斯复习轨(Lv.1~Lv.7), 3=熟词(已斩/满阶毕业)
  // srsStage: 0=未入轨, 1..7=艾宾浩斯记忆等级 Lv.1~Lv.7
  // nextDue: 下次到期复习时间戳 (ms)
  let state = {
    updatedAt: 0,
    m: {},
    order: "list",
    seed: Math.floor(Math.random() * 1e9),
    autoSpeak: false,
    groups: {} // "learn|list" or "review" -> { items, queue, hits, targets }
  };

  let activeView = "learn"; // "learn" | "review" | "list"
  let phase = "question";   // "question" | "detail" | "summary"
  let lastJudge = null;     // "known" | "vague" | "unknown" | "familiar"
  let lastSrsNote = "";     // 释义页右上角显示的下次复习时间提示
  let prevSnapshot = null;  // 用于点「记错了」完整回滚状态
  let activeExtTab = "rel"; // "rel" | "syno" | "phrase" | "rem"

  // 单词表状态
  let wlTab = "due";        // "due" | "srs" | "learned" | "star" | "familiar" | "unlearned" | "all"
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
    const file = `words_detail/${String(cid).padStart(2, "0")}.json?v=20261108_w5`;
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
        if (!alreadyPending && activeView !== "list") renderCard();
      });
    });
  }

  // ---------------- 本地存储与兼容升级 ----------------
  function normalizeRecord(r) {
    if (!Array.isArray(r)) return [0, 0, 0, 0, 0, 0, 0];
    if (r.length === 3) {
      const s = r[0] || 0;
      const star = r[1] ? 1 : 0;
      const ts = r[2] || Date.now();
      if (s === 1) return [2, star, ts, 3, 0, 1, ts + 12 * HOUR];
      if (s === 2) return [1, star, ts, 0, 1, 1, ts];
      return [0, star, ts, 0, 0, 0, 0];
    }
    const status = r[0] || 0;
    const star = r[1] ? 1 : 0;
    const ts = r[2] || 0;
    const hits = typeof r[3] === "number" ? r[3] : 0;
    const wrong = r[4] || 0;
    let stage = r[5] || 0;
    let nextDue = r[6] || 0;

    if (status === 2 && stage === 0) {
      stage = 1;
      nextDue = (ts || Date.now()) + 12 * HOUR;
    } else if (status === 1 && nextDue === 0 && (wrong > 0 || hits > 0)) {
      stage = 1;
      nextDue = ts || Date.now();
    }
    return [status, star, ts, hits, wrong, stage, nextDue];
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

  // ---------------- 艾宾浩斯到期计算与格式化 ----------------
  function isDueForReview(r, now = Date.now()) {
    const [status, , , , wrongCount, stage, nextDue] = r;
    if (status === 0 || status === 3) return false;
    // 新学中曾点过不认识/模糊的词，或已入轨且到达复习时间的词
    if (status === 1 && (wrongCount > 0 || (nextDue > 0 && nextDue <= now))) return true;
    if (status === 2 && (nextDue <= now || stage === 0)) return true;
    return false;
  }

  function isInSrsCurve(r) {
    const [status] = r;
    return status === 1 || status === 2;
  }

  function formatDueRemaining(nextDue, now = Date.now()) {
    if (!nextDue || nextDue <= now) return "今日到期";
    const diff = nextDue - now;
    const mins = Math.ceil(diff / 60000);
    if (mins < 60) return `${mins}分钟后`;
    const hours = Math.round(diff / HOUR);
    if (hours < 24) return `${hours}小时后`;
    const days = Math.round(diff / DAY);
    return `${days}天后`;
  }

  function getNextStageInfo(curStage, judgeType) {
    if (judgeType === "unknown") {
      return { nextStage: 1, waitMs: 30 * 60 * 1000, label: "30分钟后" };
    }
    if (judgeType === "vague") {
      const st = Math.max(1, curStage);
      return { nextStage: st, waitMs: 12 * HOUR, label: "12小时后" };
    }
    // known: 升一阶
    const nextLv = Math.min(7, (curStage || 1) + 1);
    const stepObj = SRS_STEPS[nextLv - 1] || SRS_STEPS[SRS_STEPS.length - 1];
    return { nextStage: nextLv, waitMs: stepObj.ms, label: stepObj.label };
  }

  // ---------------- 候选词池与分组管理 ----------------
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

  // 获取「新学」候选词池
  function getLearnPool() {
    const pool = [];
    for (let i = 0; i < TOTAL; i++) {
      const r = rec(WORDS[i][0]);
      if (r[0] === 0 || (r[0] === 1 && r[3] < TARGET_HITS)) {
        pool.push(i);
      }
    }
    if (state.order === "alpha") {
      pool.sort((a, b) => WORDS[a][0].toLowerCase().localeCompare(WORDS[b][0].toLowerCase()));
    } else if (state.order === "shuffle") {
      seededShuffle(pool, state.seed);
    } else {
      pool.sort((a, b) => {
        const sa = rec(WORDS[a][0])[0] === 1 ? 0 : 1;
        const sb = rec(WORDS[b][0])[0] === 1 ? 0 : 1;
        return sa !== sb ? sa - sb : a - b;
      });
    }
    return pool;
  }

  // 获取「复习」候选词池（优先今日到期，若 advanceEarly=true 则纳入未到期的规划复习词）
  function getReviewPool(advanceEarly = false) {
    const now = Date.now();
    const dueList = [];
    const earlyList = [];

    for (let i = 0; i < TOTAL; i++) {
      const r = rec(WORDS[i][0]);
      if (isDueForReview(r, now)) {
        dueList.push(i);
      } else if (advanceEarly && isInSrsCurve(r)) {
        earlyList.push(i);
      }
    }

    // 到期词按：错误次数多的优先 -> 逾期最久的优先
    dueList.sort((a, b) => {
      const ra = rec(WORDS[a][0]);
      const rb = rec(WORDS[b][0]);
      if ((rb[4] || 0) !== (ra[4] || 0)) return (rb[4] || 0) - (ra[4] || 0);
      return (ra[6] || 0) - (rb[6] || 0);
    });

    if (dueList.length >= GROUP_SIZE || !advanceEarly) return dueList;

    // 提前复习按最快到期的排前面
    earlyList.sort((a, b) => (rec(WORDS[a][0])[6] || 0) - (rec(WORDS[b][0])[6] || 0));
    return dueList.concat(earlyList);
  }

  function groupKey() {
    return activeView === "review" ? "review_grp" : `learn|${state.order}`;
  }

  function getActiveGroup(forceNew = false, advanceEarly = false) {
    const key = groupKey();
    let grp = state.groups[key];

    if (!forceNew && grp && Array.isArray(grp.items) && grp.items.length > 0) {
      grp.items = grp.items.filter((i) => i >= 0 && i < TOTAL);
      grp.queue = (grp.queue || []).filter((i) => i >= 0 && i < TOTAL);
      if (!grp.hits) grp.hits = {};
      if (!grp.targets) grp.targets = {};
      if (grp.items.length > 0) {
        preloadGroupDetails(grp.items);
        return grp;
      }
    }

    const pool = activeView === "review" ? getReviewPool(advanceEarly) : getLearnPool();
    const items = pool.slice(0, GROUP_SIZE);
    const hits = {};
    const targets = {};

    items.forEach((idx) => {
      const r = rec(WORDS[idx][0]);
      if (activeView === "review") {
        // 复习模式下：首次认识即可一击过关 (target = 1)；若原本是未背完的新词(status===1且hits<3)则需补满
        hits[idx] = 0;
        targets[idx] = r[0] === 2 ? 1 : 2;
      } else {
        hits[idx] = r[0] === 1 && r[3] > 0 && r[3] < TARGET_HITS ? r[3] : 0;
        targets[idx] = TARGET_HITS;
      }
    });

    grp = { items, queue: items.slice(), hits, targets };
    state.groups[key] = grp;
    phase = "question";
    lastJudge = null;
    lastSrsNote = "";
    prevSnapshot = null;
    saveLocal();
    preloadGroupDetails(items);
    return grp;
  }

  // 以指定单词下标数组直接开启一组专项练习
  function startCustomGroup(indices, mode = "review") {
    const items = indices.slice(0, GROUP_SIZE);
    const hits = {};
    const targets = {};
    items.forEach((idx) => {
      const r = rec(WORDS[idx][0]);
      hits[idx] = 0;
      targets[idx] = mode === "review" && r[0] === 2 ? 1 : TARGET_HITS;
    });
    activeView = mode;
    state.groups[groupKey()] = { items, queue: items.slice(), hits, targets };
    phase = "question";
    lastJudge = null;
    lastSrsNote = "";
    prevSnapshot = null;
    saveLocal();
    preloadGroupDetails(items);
    syncTopNavUI();
    renderAll();
  }

  function currentWordIndex() {
    const grp = getActiveGroup();
    return grp.queue.length ? grp.queue[0] : -1;
  }

  // ---------------- 新学 & 复习 判断核心逻辑 ----------------
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
    const curTarget = (grp.targets && grp.targets[idx]) || (activeView === "review" ? 1 : TARGET_HITS);

    prevSnapshot = {
      idx,
      word,
      rec: r.slice(),
      hits: curHits,
      target: curTarget
    };

    const now = Date.now();
    let [status, star, , , wrongCount, srsStage, nextDue] = r;
    let nextHits = curHits;
    let nextTarget = curTarget;

    if (type === "familiar") {
      nextHits = nextTarget;
      status = 3;
      wrongCount = 0;
      srsStage = 7;
      nextDue = 0;
      lastSrsNote = "已标熟词 · 不再安排复习";
    } else if (activeView === "review") {
      // ======= 复习模式（参考不背单词/墨墨艾宾浩斯机制） =======
      if (type === "known") {
        nextHits = curHits + 1;
        if (nextHits >= nextTarget) {
          // 复习过关：升阶并计算下次艾宾浩斯复习时间
          const info = getNextStageInfo(srsStage || 1, "known");
          srsStage = info.nextStage;
          nextDue = now + info.waitMs;
          status = 2;
          wrongCount = 0;
          lastSrsNote = `Lv.${srsStage} · ${info.label}复习`;
        } else {
          lastSrsNote = `本组还需认识 ${nextTarget - nextHits} 次`;
        }
      } else if (type === "vague") {
        // 模糊：需在本组认识 2 次，记忆阶段保持或微降，12小时后复习
        nextHits = 0;
        nextTarget = 2;
        status = 2;
        wrongCount = (wrongCount || 0) + 1;
        const info = getNextStageInfo(srsStage || 1, "vague");
        srsStage = info.nextStage;
        nextDue = now + info.waitMs;
        lastSrsNote = `模糊巩固 · ${info.label}复习`;
      } else {
        // 不认识：重置需在本组认识 3 次，记忆等级退回 Lv.1，30分钟后重现
        nextHits = 0;
        nextTarget = 3;
        status = 1;
        wrongCount = (wrongCount || 0) + 1;
        const info = getNextStageInfo(srsStage || 1, "unknown");
        srsStage = info.nextStage;
        nextDue = now + info.waitMs;
        lastSrsNote = `已重置为 Lv.1 · ${info.label}复习`;
      }
    } else {
      // ======= 新学模式（10词一组，三次认识入轨） =======
      if (type === "known") {
        nextHits = Math.min(TARGET_HITS, curHits + 1);
        if (nextHits >= TARGET_HITS) {
          status = 2;
          srsStage = 1;
          // 新学期间若曾点过不认识，安排 30 分钟后当日短期复习；若一遍顺畅过关，安排 12 小时后复习
          const wait = wrongCount > 0 ? 30 * 60 * 1000 : 12 * HOUR;
          nextDue = now + wait;
          lastSrsNote = `已入轨 Lv.1 · ${wrongCount > 0 ? "30分钟后" : "12小时后"}首次复习`;
        } else {
          status = 1;
          lastSrsNote = `新学进度 ${nextHits}/${TARGET_HITS}`;
        }
      } else if (type === "vague") {
        nextHits = curHits >= 2 ? 1 : curHits;
        status = 1;
        wrongCount = (wrongCount || 0) + 1;
        nextDue = now + 30 * 60 * 1000;
        lastSrsNote = `本组稍后重现`;
      } else {
        nextHits = 0;
        status = 1;
        wrongCount = (wrongCount || 0) + 1;
        nextDue = now + 30 * 60 * 1000;
        lastSrsNote = `进度归零 · 本组强化重现`;
      }
    }

    grp.hits[idx] = nextHits;
    if (!grp.targets) grp.targets = {};
    grp.targets[idx] = nextTarget;

    saveRec(word, [status, star, now, nextHits, wrongCount, srsStage, nextDue]);

    lastJudge = type;
    activeExtTab = pickDefaultExtTab(getDetailSync(idx));
    phase = "detail";
    renderAll();
  }

  // 在释义卡片点「记错了」：回滚刚才的加分并直接改判为「不认识」
  function revertToUnknown() {
    const grp = getActiveGroup();
    if (!grp.queue.length) return;
    const idx = grp.queue[0];
    const word = WORDS[idx][0];
    const now = Date.now();
    const baseRec = prevSnapshot && prevSnapshot.idx === idx ? prevSnapshot.rec : rec(word);

    const nextTarget = 3;
    grp.hits[idx] = 0;
    if (!grp.targets) grp.targets = {};
    grp.targets[idx] = nextTarget;

    saveRec(word, [
      1,
      rec(word)[1],
      now,
      0,
      (baseRec[4] || 0) + 1,
      1,
      now + 30 * 60 * 1000
    ]);
    lastJudge = "unknown";
    lastSrsNote = "已改为不认识 · 退回 Lv.1（本组需再认识 3 次）";
    renderAll();
  }

  function advanceToNextWord() {
    const grp = getActiveGroup();
    if (!grp.queue.length) return;
    const idx = grp.queue.shift();
    const hits = grp.hits[idx] || 0;
    const target = (grp.targets && grp.targets[idx]) || (activeView === "review" ? 1 : TARGET_HITS);
    const r = rec(WORDS[idx][0]);

    if (hits < target && r[0] !== 3) {
      let insertPos = grp.queue.length;
      if (lastJudge === "unknown") {
        insertPos = Math.min(grp.queue.length, 2 + Math.floor(Math.random() * 2));
      } else if (lastJudge === "vague") {
        insertPos = Math.min(grp.queue.length, 3 + Math.floor(Math.random() * 2));
      }
      grp.queue.splice(insertPos, 0, idx);
    }

    lastJudge = null;
    prevSnapshot = null;
    phase = grp.queue.length === 0 ? "summary" : "question";
    saveLocal();
    renderAll();
    if (phase === "question") autoSpeakCurrent();
  }

  function toggleStarByIndex(idx) {
    if (idx < 0 || idx >= TOTAL) return;
    const word = WORDS[idx][0];
    const r = rec(word);
    saveRec(word, [r[0], r[1] ? 0 : 1, Date.now(), r[3], r[4], r[5], r[6]]);
    renderAll();
  }

  function markFamiliarByIndex(idx) {
    if (idx < 0 || idx >= TOTAL) return;
    const grp = getActiveGroup();
    if (activeView !== "list" && phase === "question" && grp.queue[0] === idx) {
      handleJudge("familiar");
      return;
    }
    const word = WORDS[idx][0];
    const r = rec(word);
    if (r[0] === 3) {
      if (grp.hits && grp.hits[idx] !== undefined) grp.hits[idx] = 0;
      saveRec(word, [2, r[1], Date.now(), 0, r[4], 1, Date.now()]);
    } else {
      const t = (grp.targets && grp.targets[idx]) || TARGET_HITS;
      if (grp.hits && grp.hits[idx] !== undefined) grp.hits[idx] = t;
      saveRec(word, [3, r[1], Date.now(), TARGET_HITS, 0, 7, 0]);
      lastJudge = "familiar";
    }
    renderAll();
  }

  function scheduleImmediateReviewByIndex(idx) {
    if (idx < 0 || idx >= TOTAL) return;
    const word = WORDS[idx][0];
    const r = rec(word);
    saveRec(word, [2, r[1], Date.now(), 0, (r[4] || 0) + 1, Math.max(1, r[5] || 1), Date.now() - 1000]);
    // 清空旧复习组缓存以便立即纳入该词
    delete state.groups["review_grp"];
    renderAll();
  }

  // ---------------- 统计计数与顶栏同步 ----------------
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
    const now = Date.now();
    const counts = {
      due: 0,
      srs: 0,
      learned: 0,
      star: 0,
      familiar: 0,
      unlearned: 0,
      all: TOTAL
    };
    for (let i = 0; i < TOTAL; i++) {
      const r = rec(WORDS[i][0]);
      if (isDueForReview(r, now)) counts.due++;
      if (isInSrsCurve(r)) counts.srs++;
      if (r[0] === 1 || r[0] === 2 || r[0] === 3) counts.learned++;
      if (r[1] === 1) counts.star++;
      if (r[0] === 3) counts.familiar++;
      if (r[0] === 0) counts.unlearned++;
    }
    return counts;
  }

  function syncTopNavUI() {
    const counts = getCounts();
    const pill = document.getElementById("due-count-pill");
    if (counts.due > 0) {
      pill.style.display = "inline-block";
      pill.textContent = counts.due;
    } else {
      pill.style.display = "none";
    }

    document.getElementById("tab-view-learn").classList.toggle("active", activeView === "learn");
    document.getElementById("tab-view-review").classList.toggle("active", activeView === "review");
    document.getElementById("tab-view-list").classList.toggle("active", activeView === "list");

    const isCard = activeView === "learn" || activeView === "review";
    document.getElementById("card-top-controls").style.display = isCard ? "flex" : "none";
    document.getElementById("order-select").style.display = activeView === "learn" ? "inline-block" : "none";
    document.getElementById("card").style.display = isCard ? "flex" : "none";
    document.getElementById("wordlist-view").style.display = activeView === "list" ? "flex" : "none";
    document.getElementById("main-stage").classList.toggle("list-mode", activeView === "list");
  }

  function switchView(view) {
    activeView = view;
    phase = "question";
    lastJudge = null;
    prevSnapshot = null;
    if (view === "review") {
      // 如果复习组为空而当前有到期词，自动拉取最新到期词
      const grp = state.groups["review_grp"];
      if (!grp || !grp.items || !grp.items.length || !grp.queue || !grp.queue.length) {
        getActiveGroup(true, false);
      }
    }
    syncTopNavUI();
    renderAll();
  }

  // ---------------- 卡片渲染（新学 & 复习共用纯净卡片） ----------------
  function renderCard() {
    const card = document.getElementById("card");
    if (!TOTAL) return;

    const grp = getActiveGroup(false, false);

    // 复习模式下若今日到期词为 0
    if (!grp.items.length) {
      const counts = getCounts();
      if (activeView === "review") {
        card.innerHTML = `
          <div class="question-body">
            <div style="font-size:22px;font-weight:700;margin-bottom:8px;">今日到期复习已完成</div>
            <div style="font-size:14px;color:var(--muted);margin-bottom:24px;">
              当前共有 ${counts.srs} 个单词正处于艾宾浩斯记忆曲线中
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
              ${
                counts.srs > 0
                  ? `<button class="ghost-btn" id="btn-advance-review" style="padding:10px 18px;font-size:14px;font-weight:600;color:var(--primary);border-color:#bfdbfe;background:#eff6ff;">提前复习 10 词</button>`
                  : ""
              }
              <button class="ghost-btn" id="btn-go-learn" style="padding:10px 18px;font-size:14px;">去新学单词</button>
            </div>
          </div>
        `;
        const advBtn = document.getElementById("btn-advance-review");
        if (advBtn) {
          advBtn.onclick = () => {
            getActiveGroup(true, true);
            renderAll();
          };
        }
        document.getElementById("btn-go-learn").onclick = () => switchView("learn");
      } else {
        card.innerHTML = `
          <div class="question-body" style="color:var(--muted);">
            全部考纲词汇已学完
          </div>
        `;
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
    const curStage = r[5] || 0;
    const target = (grp.targets && grp.targets[idx]) || (activeView === "review" ? 1 : TARGET_HITS);
    const hits = Math.min(target, grp.hits[idx] || 0);
    const orderInGroup = grp.items.indexOf(idx) + 1;
    const phone = (detail && (detail.us || detail.uk)) || basePhone || "";

    const stepsHtml = Array.from({ length: target })
      .map((_, i) => `<span class="step-bar ${i < hits ? "on" : ""}"></span>`)
      .join("");

    const lvBadgeHtml =
      curStage > 0
        ? `<span class="lv-tag" title="当前艾宾浩斯记忆等级">Lv.${curStage}</span>`
        : "";

    const topHtml = `
      <div class="card-top">
        <div class="group-meta">
          <span>${orderInGroup} / ${grp.items.length}</span>
          <span class="steps" title="本组需认识 ${target} 次 (${hits}/${target})">${stepsHtml}</span>
          ${lvBadgeHtml}
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
      // 复习模式下在按钮上轻量提示艾宾浩斯下次复习间隔
      const isRev = activeView === "review";
      const nextKnownInfo = getNextStageInfo(curStage || 1, "known");

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
          <button class="j-btn unknown" id="j-unknown">
            <span>不认识</span>
            ${isRev ? `<span class="j-hint">30分钟后</span>` : ""}
          </button>
          <button class="j-btn vague" id="j-vague">
            <span>模糊</span>
            ${isRev ? `<span class="j-hint">12小时后</span>` : ""}
          </button>
          <button class="j-btn known" id="j-known">
            <span>认识</span>
            ${isRev ? `<span class="j-hint">${nextKnownInfo.label}</span>` : ""}
          </button>
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
          ${lastSrsNote ? `<span class="srs-next-tip">${esc(lastSrsNote)}</span>` : ""}
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
    const now = Date.now();
    const rows = grp.items
      .map((idx) => {
        const [w, , short] = WORDS[idx];
        const r = rec(w);
        const lv = r[5] || 1;
        const dueText = r[0] === 3 ? "熟词" : `Lv.${lv} · ${formatDueRemaining(r[6], now)}`;
        return `
          <div class="sum-item">
            <span class="sum-w" data-speak="${esc(w)}">${esc(w)}</span>
            <span class="sum-m">${esc(short)}</span>
            <span style="font-size:12px;color:var(--muted);">${dueText}</span>
            <button class="action-tag ${r[1] ? "star-on" : ""}" data-star="${idx}">${r[1] ? "★" : "☆"}</button>
          </div>
        `;
      })
      .join("");

    const isRev = activeView === "review";
    card.innerHTML = `
      <div>
        <div style="font-size:20px;font-weight:700;">
          ${isRev ? `本组 ${grp.items.length} 词复习完成` : `本组 ${grp.items.length} 词新学完成`}
        </div>
        <div style="font-size:13px;color:var(--muted);margin-top:4px;">
          已按艾宾浩斯记忆曲线自动排入下次复习时间
        </div>
        <div class="sum-list">${rows}</div>
      </div>
      <div class="next-bar">
        <button class="btn-next" id="btn-next-group">
          ${isRev ? "继续复习下一组" : "开始新学下一组"}
        </button>
      </div>
    `;

    card.querySelectorAll("[data-speak]").forEach((el) => {
      el.onclick = () => speak(el.getAttribute("data-speak"));
    });
    card.querySelectorAll("[data-star]").forEach((el) => {
      el.onclick = () => toggleStarByIndex(parseInt(el.getAttribute("data-star"), 10));
    });
    document.getElementById("btn-next-group").onclick = () => {
      getActiveGroup(true, false);
      renderAll();
      autoSpeakCurrent();
    };
  }

  // ---------------- 视图 3：单词表界面（今日待复习 / 规划复习中 / 已背 / 生词本 / 熟词 / 未背） ----------------
  function getWordListFilteredIndices() {
    const now = Date.now();
    const q = wlSearch.trim().toLowerCase();
    const list = [];

    for (let i = 0; i < TOTAL; i++) {
      const [w, , short] = WORDS[i];
      const r = rec(w);
      let ok = false;
      if (wlTab === "due") ok = isDueForReview(r, now);
      else if (wlTab === "srs") ok = isInSrsCurve(r);
      else if (wlTab === "learned") ok = r[0] === 1 || r[0] === 2 || r[0] === 3;
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

    if (wlTab === "due" || wlTab === "srs") {
      // 按下次复习时间由近到远排序（已到期的排最前）
      list.sort((a, b) => (rec(WORDS[a][0])[6] || 0) - (rec(WORDS[b][0])[6] || 0));
    } else if (wlTab === "learned") {
      list.sort((a, b) => (rec(WORDS[b][0])[2] || 0) - (rec(WORDS[a][0])[2] || 0));
    }

    return list;
  }

  function renderWordListView() {
    const counts = getCounts();
    const now = Date.now();

    const tabs = [
      { id: "due", label: "今日待复习", cnt: counts.due },
      { id: "srs", label: "规划复习中", cnt: counts.srs },
      { id: "learned", label: "已背", cnt: counts.learned },
      { id: "star", label: "⭐ 生词本", cnt: counts.star },
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

    const list = getWordListFilteredIndices();
    const practiceBtn = document.getElementById("btn-practice-current-list");
    if (wlTab === "unlearned" || wlTab === "all") {
      practiceBtn.textContent = "抽 10 词去新学";
    } else {
      practiceBtn.textContent = "抽 10 词开始复习";
    }
    practiceBtn.style.display = list.length > 0 ? "inline-block" : "none";

    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (wlPage > totalPages) wlPage = totalPages;
    if (wlPage < 1) wlPage = 1;

    const pageItems = list.slice((wlPage - 1) * PAGE_SIZE, wlPage * PAGE_SIZE);
    const rowsEl = document.getElementById("wl-rows");

    if (!pageItems.length) {
      const emptyTips = {
        due: "今日到期的复习单词已全部完成 🎉（可在「规划复习中」查看未来几天待复习的单词）",
        srs: "暂无处于艾宾浩斯记忆曲线中的单词，去「新学」背完一组词后会自动排入复习计划",
        learned: "暂无已背单词，去「新学」完成第一组吧",
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
          const [status, star, , hits, wrongCount, srsStage, nextDue] = r;
          const isExp = expandedIdx === idx;
          const detail = isExp ? getDetailSync(idx) : null;

          let statusBadge = "";
          if (status === 3) {
            statusBadge = `<span class="wl-badge fam">熟词</span>`;
          } else if (status === 2 || status === 1) {
            const dueNow = isDueForReview(r, now);
            const lvText = srsStage > 0 ? `Lv.${srsStage}` : `${hits}/3`;
            const timeText = dueNow ? "今日到期" : formatDueRemaining(nextDue, now);
            statusBadge = `<span class="wl-badge ${dueNow ? "due" : "scheduled"}">${lvText} · ${timeText}</span>`;
          }
          if ((wrongCount || 0) > 0 && status !== 3) {
            statusBadge += ` <span class="wl-badge wrong">错 ${wrongCount}</span>`;
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
                  ${detail.m ? `<div class="wl-ext-group"><span class="wl-ext-label">巧记</span><span>${esc(detail.m)}</span></div>` : ""}
                  ${rels ? `<div class="wl-ext-group"><span class="wl-ext-label">派生词</span><div class="chip-list" style="margin:0;">${rels}</div></div>` : ""}
                  ${synos ? `<div class="wl-ext-group"><span class="wl-ext-label">近义词</span><div class="chip-list" style="margin:0;">${synos}</div></div>` : ""}
                  ${sent ? `<div class="wl-ext-group"><span class="wl-ext-label">例句</span><span>${esc(sent[0])} <span style="color:var(--muted);">${esc(sent[1])}</span></span></div>` : ""}
                </div>
              `;
            }
          }

          const showImmediateRevBtn = (status === 2 || status === 3) && !isDueForReview(r, now);

          return `
            <div class="wl-item ${isExp ? "revealed" : ""}">
              <div class="wl-row-main" data-toggle-idx="${idx}">
                <div class="wl-left">
                  <span class="wl-word">${esc(w)}</span>
                  <span class="wl-phone">${ph ? `/${esc(ph)}/` : ""}</span>
                </div>
                <div class="wl-mid ${wlMaskMeaning ? "masked" : ""}">${esc(short)}</div>
                <div class="wl-right" onclick="event.stopPropagation();">
                  ${statusBadge}
                  ${
                    showImmediateRevBtn
                      ? `<button class="action-tag" data-review-idx="${idx}" title="立即排入今日待复习">加入复习</button>`
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
            if (getDetailSync(idx)) {
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
        btn.onclick = () => scheduleImmediateReviewByIndex(parseInt(btn.getAttribute("data-review-idx"), 10));
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
      <span>共 ${list.length} 词 · 第 ${wlPage} / ${totalPages} 页（点击单词行可发音并展开派生/近义词）</span>
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
    syncTopNavUI();
    if (activeView === "list") {
      renderWordListView();
    } else {
      renderCard();
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
    const oSel = document.getElementById("order-select");
    oSel.value = state.order;

    document.getElementById("tab-view-learn").onclick = () => switchView("learn");
    document.getElementById("tab-view-review").onclick = () => switchView("review");
    document.getElementById("tab-view-list").onclick = () => switchView("list");

    oSel.onchange = () => {
      state.order = oSel.value;
      if (state.order === "shuffle") state.seed = Math.floor(Math.random() * 1e9);
      phase = "question";
      saveLocal();
      getActiveGroup(true, false);
      renderAll();
    };

    document.getElementById("btn-ChangeGroup").onclick = () => {
      if (state.order === "shuffle") state.seed = Math.floor(Math.random() * 1e9);
      getActiveGroup(true, activeView === "review");
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
      const indices = getWordListFilteredIndices();
      if (!indices.length) return;
      const mode = wlTab === "unlearned" || wlTab === "all" ? "learn" : "review";
      startCustomGroup(indices, mode);
    };

    document.addEventListener("keydown", (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "SELECT")) return;
      if (activeView === "list") return;

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
          getActiveGroup(true, false);
          renderAll();
        }
      }
    });

    if (location.search.includes("preview=review")) {
      const now = Date.now();
      state.m["act"] = [2, 1, now - DAY, 3, 1, 2, now - 1000];
      state.m["action"] = [2, 0, now - DAY, 3, 0, 3, now - 2000];
      state.m["active"] = [2, 0, now - HOUR, 3, 0, 4, now + 4 * DAY];
      state.m["actual"] = [2, 1, now - HOUR, 3, 0, 5, now + 7 * DAY];
      if (location.search.includes("view=list")) {
        wlTab = "srs";
        expandedIdx = 0;
        ensureDetailChunk(0).then(() => renderWordListView());
        switchView("list");
      } else {
        switchView("review");
      }
    } else {
      getActiveGroup(false, false);
      renderAll();
    }
    pullCloud();
  }

  init();
})();
