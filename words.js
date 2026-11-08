// ============================================================================
// 背单词页面逻辑：卡片模式 + 认识/不认识 + 生词本 + 发音 + 顺序/乱序 + 口令云同步
// 进度按「刷题口令」独立保存，云端仓库注册在全局中心 userVaults["words__口令"] 下
// ============================================================================
(function () {
  "use strict";

  const ACTIVE_SYNC_ID_KEY = "kaoyan_active_sync_id_v2"; // 与刷题主站共用的当前口令
  const GLOBAL_HUB_VAULT_ID = "ff808181a09d98f701a1ab80eeaf416b";
  const API = "https://api.restful-api.dev/objects";

  const WORDS = window.KAOYAN_WORDS || [];
  const TOTAL = WORDS.length;

  const sid = String(localStorage.getItem(ACTIVE_SYNC_ID_KEY) || "").trim().toLowerCase();
  const LOCAL_KEY = `kaoyan_words_v1_${sid || "guest"}`;
  const VAULT_CACHE_KEY = `kaoyan_words_vault_v1_${sid}`;
  const HUB_VAULT_KEY = `words__${sid}`;

  // 状态：m[word] = [status(0未学/1认识/2不认识), star(0/1), 更新时间戳]
  let state = {
    updatedAt: 0,
    m: {},
    filter: "all",
    order: "list",
    seed: Math.floor(Math.random() * 1e9),
    cur: {}, // 每个「范围+顺序」组合下的当前单词
    autoSpeak: false
  };

  let queue = [];
  let pos = 0;
  let revealed = false;

  // ---------------- 本地存储 ----------------
  function loadLocal() {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) state = Object.assign(state, JSON.parse(raw));
    } catch (e) {
      console.warn("读取本地单词进度失败", e);
    }
  }
  function saveLocal() {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  }

  function rec(word) {
    return state.m[word] || [0, 0, 0];
  }
  function setRec(word, status, star) {
    const now = Date.now();
    state.m[word] = [status, star, now];
    state.updatedAt = now;
    saveLocal();
    scheduleCloudPush();
  }

  // ---------------- 队列构建 ----------------
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

  function comboKey() {
    return `${state.filter}|${state.order}`;
  }

  function buildQueue() {
    let idx = [];
    for (let i = 0; i < TOTAL; i++) {
      const r = rec(WORDS[i][0]);
      const f = state.filter;
      if (
        f === "all" ||
        (f === "new" && r[0] === 0) ||
        (f === "known" && r[0] === 1) ||
        (f === "unknown" && r[0] === 2) ||
        (f === "star" && r[1] === 1)
      ) {
        idx.push(i);
      }
    }
    if (state.order === "alpha") {
      idx.sort((a, b) => WORDS[a][0].toLowerCase().localeCompare(WORDS[b][0].toLowerCase()));
    } else if (state.order === "shuffle") {
      seededShuffle(idx, state.seed);
    }
    queue = idx;
    const curWord = state.cur[comboKey()];
    const found = curWord ? queue.findIndex((i) => WORDS[i][0] === curWord) : -1;
    pos = found >= 0 ? found : 0;
    revealed = false;
  }

  // ---------------- 渲染 ----------------
  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function renderProgress() {
    let known = 0, unknown = 0, star = 0;
    Object.values(state.m).forEach((r) => {
      if (r[0] === 1) known++;
      else if (r[0] === 2) unknown++;
      if (r[1] === 1) star++;
    });
    document.getElementById("progress-left").textContent =
      `已认识 ${known} · 不认识 ${unknown} · 生词本 ${star}`;
    document.getElementById("progress-right").textContent =
      `总词量 ${TOTAL} · 掌握 ${TOTAL ? ((known / TOTAL) * 100).toFixed(1) : 0}%`;
    document.getElementById("progress-fill").style.width = `${TOTAL ? (known / TOTAL) * 100 : 0}%`;
  }

  function render() {
    renderProgress();
    const card = document.getElementById("card");
    if (!TOTAL) {
      card.innerHTML = `<div class="empty">词表加载失败，请刷新页面重试。</div>`;
      return;
    }
    if (!queue.length) {
      card.innerHTML = `<div class="empty">当前范围内没有单词 🎉<br/><br/>可以在右上角切换「学习范围」。</div>`;
      return;
    }
    if (pos >= queue.length) pos = queue.length - 1;
    if (pos < 0) pos = 0;

    const item = WORDS[queue[pos]];
    const [word, meaning, phrases] = item;
    const r = rec(word);
    state.cur[comboKey()] = word;
    saveLocal();

    const statusTag =
      r[0] === 1 ? `<span class="tag known">✓ 认识</span>` :
      r[0] === 2 ? `<span class="tag unknown">✗ 不认识</span>` :
      `<span class="tag">未学</span>`;

    const meaningHtml = String(meaning || "")
      .split("；")
      .filter(Boolean)
      .map((m) => `<div>${esc(m)}</div>`)
      .join("");
    const phrasesHtml = phrases
      ? `<div class="phrases">${phrases.split("｜").map(esc).join("<br/>")}</div>`
      : "";

    card.innerHTML = `
      <div class="card-top">
        <span>${pos + 1} / ${queue.length}　${statusTag}</span>
        <button class="star-btn ${r[1] ? "on" : ""}" id="star-btn" title="加入/移出生词本 (S)">${r[1] ? "★" : "☆"}</button>
      </div>
      <div class="word-area">
        <div class="word">${esc(word)}</div>
        <button class="speak-btn" id="speak-btn" title="朗读 (P)">🔊 发音</button>
      </div>
      <div class="reveal ${revealed ? "shown" : ""}" id="reveal-box">
        ${revealed ? `<div class="meaning">${meaningHtml || "（暂无释义）"}</div>${phrasesHtml}` : "👆 点击显示释义（空格键）"}
      </div>
      <div class="actions">
        <button class="btn-unknown" id="btn-unknown">✗ 不认识</button>
        <button class="btn-known" id="btn-known">✓ 认识</button>
      </div>
      <div class="nav-row">
        <button id="btn-prev">← 上一个</button>
        <span style="font-size:12.5px;color:var(--muted);">跳到第 <input type="number" id="jump-input" min="1" max="${queue.length}" value="${pos + 1}" /> 个</span>
        <button id="btn-next">下一个 →</button>
      </div>
      <div class="hint">快捷键：空格 显示释义 · 1 不认识 · 2 认识 · ←/→ 切换 · S 生词本 · P 发音</div>
    `;

    document.getElementById("reveal-box").onclick = () => { if (!revealed) { revealed = true; render(); } };
    document.getElementById("btn-unknown").onclick = () => mark(2);
    document.getElementById("btn-known").onclick = () => mark(1);
    document.getElementById("btn-prev").onclick = () => go(-1);
    document.getElementById("btn-next").onclick = () => go(1);
    document.getElementById("star-btn").onclick = toggleStar;
    document.getElementById("speak-btn").onclick = () => speak(word);
    const jump = document.getElementById("jump-input");
    jump.onchange = () => {
      const n = parseInt(jump.value, 10);
      if (n >= 1 && n <= queue.length) { pos = n - 1; revealed = false; render(); autoSpeakCurrent(); }
    };
  }

  // ---------------- 交互 ----------------
  function currentWord() {
    return queue.length ? WORDS[queue[pos]][0] : null;
  }

  function go(delta) {
    if (!queue.length) return;
    const next = pos + delta;
    if (next < 0 || next >= queue.length) {
      if (next >= queue.length) toast("已经是当前范围的最后一个单词");
      return;
    }
    pos = next;
    revealed = false;
    render();
    autoSpeakCurrent();
  }

  function mark(status) {
    const w = currentWord();
    if (!w) return;
    const r = rec(w);
    setRec(w, status, r[1]);
    // 不认识时自动加入生词本前先展示释义，便于记忆
    if (status === 2 && !revealed) {
      revealed = true;
      render();
      return;
    }
    if (pos < queue.length - 1) go(1);
    else { render(); toast("本轮已全部过完 🎉"); }
  }

  function toggleStar() {
    const w = currentWord();
    if (!w) return;
    const r = rec(w);
    setRec(w, r[0], r[1] ? 0 : 1);
    render();
  }

  let voiceCache = null;
  function pickVoice() {
    if (voiceCache) return voiceCache;
    const voices = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
    voiceCache = voices.find((v) => /en[-_]US/i.test(v.lang)) || voices.find((v) => /^en/i.test(v.lang)) || null;
    return voiceCache;
  }
  function speak(text) {
    if (!("speechSynthesis" in window)) { toast("当前浏览器不支持朗读"); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.9;
    const v = pickVoice();
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
  function autoSpeakCurrent() {
    if (state.autoSpeak) { const w = currentWord(); if (w) speak(w); }
  }

  let toastTimer = null;
  function toast(msg) {
    const el = document.getElementById("sync-status");
    const old = el.dataset.base || el.textContent;
    el.dataset.base = old;
    el.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.textContent = el.dataset.base; }, 1800);
  }
  function setSyncStatus(text) {
    const el = document.getElementById("sync-status");
    el.dataset.base = text;
    el.textContent = text;
  }

  // ---------------- 云同步 ----------------
  function buildPayload() {
    return { updatedAt: state.updatedAt, m: state.m };
  }

  function mergeCloud(data) {
    if (!data || typeof data.m !== "object") return { changed: false, needPush: false };
    let changed = false, needPush = false;
    const cm = data.m;
    Object.keys(cm).forEach((w) => {
      const c = cm[w], l = state.m[w];
      if (!l || (c[2] || 0) > (l[2] || 0)) { state.m[w] = c; changed = true; }
      else if ((l[2] || 0) > (c[2] || 0)) needPush = true;
    });
    Object.keys(state.m).forEach((w) => { if (!cm[w]) needPush = true; });
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
    if (found) { localStorage.setItem(VAULT_CACHE_KEY, found); return found; }
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
    // 重新拉取最新全局中心后再注册，尽量避免覆盖其它写入
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
      if (!vid) { setSyncStatus(`☁️ 口令 ${sid}`); if (Object.keys(state.m).length) scheduleCloudPush(500); return; }
      const res = await fetch(`${API}/${vid}`, { cache: "no-store" });
      if (!res.ok) throw new Error("vault fetch failed");
      const obj = await res.json();
      const { changed, needPush } = mergeCloud(obj && obj.data);
      if (changed) { const keepWord = currentWord(); buildQueue(); restoreWord(keepWord); render(); }
      setSyncStatus(`✅ 口令 ${sid} 已同步`);
      if (needPush) scheduleCloudPush(500);
    } catch (e) {
      console.warn("拉取单词云端进度失败", e);
      setSyncStatus(`⚠️ 口令 ${sid}（离线保存在本机）`);
    }
  }

  let pushTimer = null, pushing = false, pushAgain = false;
  function scheduleCloudPush(delay = 2500) {
    if (!sid) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(pushCloud, delay);
  }
  async function pushCloud() {
    if (!sid) return;
    if (pushing) { pushAgain = true; return; }
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
      console.warn("上传单词进度失败", e);
      setSyncStatus("⚠️ 已保存在本机");
    } finally {
      pushing = false;
      if (pushAgain) { pushAgain = false; scheduleCloudPush(300); }
    }
  }

  function restoreWord(word) {
    if (!word) return;
    const i = queue.findIndex((q) => WORDS[q][0] === word);
    if (i >= 0) pos = i;
  }

  // ---------------- 初始化 ----------------
  function init() {
    loadLocal();
    const fSel = document.getElementById("filter-select");
    const oSel = document.getElementById("order-select");
    const auto = document.getElementById("auto-speak");
    fSel.value = state.filter;
    oSel.value = state.order;
    auto.checked = !!state.autoSpeak;

    fSel.onchange = () => { state.filter = fSel.value; saveLocal(); buildQueue(); render(); };
    oSel.onchange = () => {
      state.order = oSel.value;
      if (state.order === "shuffle") { state.seed = Math.floor(Math.random() * 1e9); delete state.cur[comboKey()]; }
      saveLocal(); buildQueue(); render();
    };
    auto.onchange = () => { state.autoSpeak = auto.checked; saveLocal(); };

    document.addEventListener("keydown", (e) => {
      if (e.target && e.target.tagName === "INPUT" && e.target.type === "number") return;
      if (e.target && e.target.tagName === "SELECT") return;
      const k = e.key;
      if (k === " " || k === "Enter") { e.preventDefault(); if (!revealed) { revealed = true; render(); } }
      else if (k === "ArrowRight") go(1);
      else if (k === "ArrowLeft") go(-1);
      else if (k === "1") mark(2);
      else if (k === "2") mark(1);
      else if (k === "s" || k === "S") toggleStar();
      else if (k === "p" || k === "P") { const w = currentWord(); if (w) speak(w); }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && pushTimer) { clearTimeout(pushTimer); pushCloud(); }
    });
    if ("speechSynthesis" in window) speechSynthesis.onvoiceschanged = () => { voiceCache = null; };

    setSyncStatus(sid ? `☁️ 口令 ${sid}` : "本机模式（未设置刷题口令）");
    buildQueue();
    render();
    pullCloud();
  }

  init();
})();
