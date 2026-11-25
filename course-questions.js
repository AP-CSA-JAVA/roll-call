/* ==========================================================================
   Course questions — loads Check for Understanding MCQs from the CSA course
   site into Roll Call (index.html) and Roll Call Teams: Race Day (teams.html).

   - Reads the quiz blocks (<script type="text/x-csa-question">) straight from
     the published course pages, so new CFU questions show up automatically.
   - Keeps only one-answer multiple choice with 2-4 choices. Fill-in, output,
     select-all and 5-6 choice questions are skipped.
   - Shuffles each question's choices (in the CFUs, A is right very often).

   If a unit page is renamed or added on the course site, update PAGES below.
   ========================================================================== */
(function () {
  "use strict";

  // Course pages, relative to the site address (ap-csa-java.github.io).
  var PAGES = [
    "/CSA_JAVA-Course/Chapter_1/Unit1.html",
    "/CSA_JAVA-Course/Chapter_1/Unit2.html",
    "/CSA_JAVA-Course/Chapter_1/Unit3.html",
    "/CSA_JAVA-Course/Chapter_2/Unit4.html",
    "/CSA_JAVA-Course/Chapter_2/Unit5_Inheritance.html"
  ];
  var LETTERS = "ABCDEFGHIJ";
  var LIST_KEYS = { choice: 1 };
  var cache = null; // Promise of { questions, sections }

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // Escape, then show `code` and **bold** the way the course site does.
  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, '<code class="cq-code">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  // Same reading rules as the course site's csa-quiz.js.
  function parseBlock(text) {
    var lines = text.replace(/\r/g, "").split("\n");
    var q = { choice: [] }, cur = null, buf = [];
    function flush() {
      if (!cur) return;
      while (buf.length && !buf[buf.length - 1].trim()) buf.pop();
      var ind = Infinity;
      buf.forEach(function (l) { if (l.trim()) ind = Math.min(ind, l.match(/^\s*/)[0].length); });
      if (ind === Infinity) ind = 0;
      var val = buf.map(function (l) { return l.slice(ind); }).join("\n");
      if (LIST_KEYS[cur]) q[cur].push(val); else q[cur] = val;
      cur = null; buf = [];
    }
    lines.forEach(function (line) {
      var m = line.match(/^([a-zA-Z]+):(?:\s(.*)|\s*)$/);
      if (m && !/^\s/.test(line)) {
        flush(); cur = m[1].toLowerCase();
        if (m[2] !== undefined && m[2].trim() !== "") buf.push(m[2]);
      } else if (cur) buf.push(line.replace(/\t/g, "    "));
    });
    flush();
    return q;
  }

  // "2.2" -> {unit:2,num:2,sfx:"",key:"2.02"}; "1.01a" -> key "1.01a"
  function sectionOf(id) {
    var m = String(id || "").split("-")[0].match(/^(\d+)\.(\d+)([a-z]*)$/i);
    if (!m) return null;
    var unit = +m[1], num = +m[2], sfx = m[3].toLowerCase();
    return { unit: unit, num: num, sfx: sfx, key: unit + "." + (num < 10 ? "0" : "") + num + sfx };
  }
  function cmpSec(a, b) { return a.unit - b.unit || a.num - b.num || (a.sfx < b.sfx ? -1 : a.sfx > b.sfx ? 1 : 0); }

  function toQuestion(raw) {
    if ((raw.type || "mcq").trim().toLowerCase() !== "mcq") return null;
    var ans = String(raw.answer || "").replace(/[\s,]/g, "").toUpperCase();
    if (!/^[A-J]$/.test(ans)) return null;                       // select-all: skip
    var n = raw.choice.length;
    if (n < 2 || n > 4) return null;                              // Roll Call shows A-D
    var ci = LETTERS.indexOf(ans);
    if (ci >= n) return null;
    var sec = sectionOf(raw.id);
    if (!sec) return null;
    var order = shuffle(raw.choice.map(function (_, i) { return i; }));
    return {
      id: String(raw.id).trim(),
      section: sec.key, sec: sec,
      title: (raw.title || "").trim(),
      prompt: (raw.prompt || "").trim(),
      code: raw.code ? raw.code.replace(/\s+$/, "") : "",
      choices: order.map(function (i) { return raw.choice[i]; }),
      correct: order.indexOf(ci)
    };
  }

  function loadAll() {
    if (cache) return cache;
    cache = Promise.all(PAGES.map(function (p) {
      return fetch(p, { cache: "no-cache" }).then(function (r) {
        if (!r.ok) throw new Error(p + " (" + r.status + ")");
        return r.text();
      });
    })).then(function (pages) {
      var qs = [], seen = {};
      pages.forEach(function (html) {
        var re = /<script type="text\/x-csa-question">([\s\S]*?)<\/script>/g, m;
        while ((m = re.exec(html))) {
          var q = toQuestion(parseBlock(m[1]));
          if (q && !seen[q.id]) { seen[q.id] = 1; qs.push(q); }
        }
      });
      var secMap = {};
      qs.forEach(function (q) {
        if (!secMap[q.section]) secMap[q.section] = { key: q.section, sec: q.sec, title: q.title, count: 0 };
        secMap[q.section].count++;
      });
      var sections = Object.keys(secMap).map(function (k) { return secMap[k]; }).sort(function (a, b) { return cmpSec(a.sec, b.sec); });
      return { questions: qs, sections: sections };
    }).catch(function (e) { cache = null; throw e; });
    return cache;
  }

  // "1.01-1.05, 2.03, 4, 2.04a" -> list of section keys
  function parseRange(text, sections) {
    var out = {}, bad = [];
    String(text || "").split(/[,;\s]+/).forEach(function (tok) {
      if (!tok) return;
      tok = tok.replace(/[–—]/g, "-");
      var r = tok.match(/^(\d+(?:\.\d+[a-z]*)?)-(\d+(?:\.\d+[a-z]*)?)$/i);
      var hit = 0;
      if (r) {
        var a = pos(r[1], false), b = pos(r[2], true);
        sections.forEach(function (s) { if (a && b && cmpSec(s.sec, a) >= 0 && cmpSec(s.sec, b) <= 0) { out[s.key] = 1; hit++; } });
      } else if (/^\d+$/.test(tok)) {
        sections.forEach(function (s) { if (s.sec.unit === +tok) { out[s.key] = 1; hit++; } });
      } else {
        var one = sectionOf(tok);
        sections.forEach(function (s) {
          if (one && s.sec.unit === one.unit && s.sec.num === one.num && (one.sfx ? s.sec.sfx === one.sfx : true)) { out[s.key] = 1; hit++; }
        });
      }
      if (!hit) bad.push(tok);
    });
    return { keys: Object.keys(out), bad: bad };
    // Range ends: "1" means the whole unit; "1.05" includes 1.05a, 1.05b...
    function pos(t, isEnd) {
      if (/^\d+$/.test(t)) return { unit: +t, num: isEnd ? 999 : 0, sfx: isEnd ? "~" : "" };
      var s = sectionOf(t); if (!s) return null;
      if (isEnd && !s.sfx) s.sfx = "~";
      return s;
    }
  }

  function autoLabel(keys) {
    if (!keys.length) return "";
    if (keys.length === 1) return "CFU " + keys[0];
    if (keys.length <= 3) return "CFU " + keys.join(", ");
    return "CFU " + keys[0] + "–" + keys[keys.length - 1];
  }

  /* ---------- picker window ---------- */
  var css = [
    ".cq-back{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1000;display:flex;align-items:center;justify-content:center;padding:18px;}",
    ".cq-box{background:var(--panel,#222);color:var(--chalk,var(--text,#eee));border:1.5px solid var(--rule,#555);border-radius:14px;width:100%;max-width:760px;max-height:90vh;display:flex;flex-direction:column;font-family:inherit;}",
    ".cq-head{padding:18px 20px 6px;} .cq-head h3{margin:0 0 4px;font-size:19px;color:var(--yellow,var(--sun,#fc3));}",
    ".cq-dim{color:var(--chalk-dim,var(--text-dim,#aaa));font-size:13px;line-height:1.45;}",
    ".cq-body{padding:6px 20px;overflow:auto;flex:1;}",
    ".cq-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:10px 0;}",
    ".cq-row input[type=text]{flex:1;min-width:180px;padding:9px 11px;border-radius:8px;border:1.5px solid var(--rule,#555);background:var(--bg,#111);color:inherit;font:inherit;font-size:14px;}",
    ".cq-btn{border:1.5px solid var(--rule,#555);background:transparent;color:inherit;border-radius:8px;padding:7px 12px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;}",
    ".cq-btn:hover{border-color:var(--yellow,var(--sun,#fc3));}",
    ".cq-btn.cq-main{background:var(--yellow,var(--sun,#fc3));color:var(--on-accent,var(--ink,#111));border-color:transparent;}",
    ".cq-btn:disabled{opacity:.4;cursor:not-allowed;}",
    ".cq-unit{margin:12px 0 4px;font-weight:700;font-size:13px;letter-spacing:.5px;}",
    ".cq-chips{display:flex;flex-wrap:wrap;gap:6px;}",
    ".cq-chip{border:1.5px solid var(--rule,#555);background:transparent;color:inherit;border-radius:100px;padding:4px 10px;font:inherit;font-size:12.5px;cursor:pointer;}",
    ".cq-chip[aria-pressed=true]{background:var(--yellow,var(--sun,#fc3));color:var(--on-accent,var(--ink,#111));border-color:transparent;font-weight:700;}",
    ".cq-foot{padding:12px 20px 16px;border-top:1px solid var(--rule,#555);display:flex;gap:10px;align-items:center;flex-wrap:wrap;}",
    ".cq-foot .cq-sum{flex:1;min-width:160px;}",
    ".cq-err{color:#ff8a80;font-size:13px;}",
    /* question display, used by both pages */
    ".cq-code{font-family:'IBM Plex Mono',ui-monospace,'SF Mono',Consolas,monospace;font-size:.92em;background:rgba(127,127,127,.18);padding:.05em .35em;border-radius:4px;}",
    ".cq-pre{font-family:'IBM Plex Mono',ui-monospace,'SF Mono',Consolas,monospace;font-size:.82em;line-height:1.4;white-space:pre;overflow-x:auto;text-align:left;background:rgba(0,0,0,.28);border:1px solid rgba(127,127,127,.35);border-radius:8px;padding:.7em .9em;margin:.5em 0 .2em;}"
  ].join("\n");
  function addCss() {
    if (document.getElementById("cq-style")) return;
    var st = document.createElement("style"); st.id = "cq-style"; st.textContent = css; document.head.appendChild(st);
  }

  // opts: { askName: true|false, onLoad: function(questions, label) }
  function open(opts) {
    opts = opts || {};
    addCss();
    var back = document.createElement("div");
    back.className = "cq-back";
    back.innerHTML =
      '<div class="cq-box" role="dialog" aria-modal="true" aria-label="Course questions">' +
      '<div class="cq-head"><h3>Course questions</h3>' +
      '<div class="cq-dim">Check for Understanding MCQs from the course site. Type sections or a range, or tap sections below. ' +
      'Only one-answer multiple choice is included; answer choices are shuffled.</div></div>' +
      '<div class="cq-body"><div class="cq-dim" data-r="status">Loading questions from the course site…</div>' +
      '<div data-r="main" hidden>' +
      '<div class="cq-row"><input type="text" data-r="range" placeholder="e.g. 1.01-1.05   or   2.03, 2.04   or   3">' +
      '<button class="cq-btn" data-r="apply" type="button">Select</button></div>' +
      '<div class="cq-err" data-r="err"></div>' +
      '<div class="cq-row" data-r="units"></div>' +
      '<div data-r="chips"></div></div></div>' +
      '<div class="cq-foot"><span class="cq-sum cq-dim" data-r="sum">No sections selected</span>' +
      (opts.askName !== false ? '<input type="text" data-r="name" placeholder="Topic name" style="padding:8px 10px;border-radius:8px;border:1.5px solid var(--rule,#555);background:var(--bg,#111);color:inherit;font:inherit;font-size:13px;width:180px;">' : '') +
      '<button class="cq-btn" data-r="cancel" type="button">Cancel</button>' +
      '<button class="cq-btn cq-main" data-r="load" type="button" disabled>Load questions</button></div></div>';
    document.body.appendChild(back);
    function $(r) { return back.querySelector('[data-r="' + r + '"]'); }
    var picked = {}, data = null, nameTouched = false;

    function close() { document.removeEventListener("keydown", onKey); back.remove(); }
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey);
    back.addEventListener("click", function (e) { if (e.target === back) close(); });
    $("cancel").addEventListener("click", close);
    if ($("name")) $("name").addEventListener("input", function () { nameTouched = true; });

    function keys() { return data.sections.filter(function (s) { return picked[s.key]; }).map(function (s) { return s.key; }); }
    function refresh() {
      var k = keys(), n = 0;
      data.sections.forEach(function (s) { if (picked[s.key]) n += s.count; });
      $("sum").textContent = k.length ? n + " question" + (n === 1 ? "" : "s") + " from " + k.length + " section" + (k.length === 1 ? "" : "s") : "No sections selected";
      $("load").disabled = !n;
      Array.prototype.forEach.call(back.querySelectorAll(".cq-chip"), function (c) { c.setAttribute("aria-pressed", String(!!picked[c.getAttribute("data-k")])); });
      if ($("name") && !nameTouched) $("name").value = autoLabel(k);
    }

    loadAll().then(function (d) {
      data = d;
      $("status").hidden = true; $("main").hidden = false;
      var units = {};
      d.sections.forEach(function (s) { (units[s.sec.unit] = units[s.sec.unit] || []).push(s); });
      var uRow = $("units"), chips = $("chips");
      Object.keys(units).sort(function (a, b) { return a - b; }).forEach(function (u) {
        var ub = document.createElement("button");
        ub.type = "button"; ub.className = "cq-btn"; ub.textContent = "All of Unit " + u;
        ub.addEventListener("click", function () {
          var all = units[u].every(function (s) { return picked[s.key]; });
          units[u].forEach(function (s) { if (all) delete picked[s.key]; else picked[s.key] = 1; });
          refresh();
        });
        uRow.appendChild(ub);
        var head = document.createElement("div"); head.className = "cq-unit"; head.textContent = "Unit " + u;
        var wrap = document.createElement("div"); wrap.className = "cq-chips";
        units[u].forEach(function (s) {
          var c = document.createElement("button");
          c.type = "button"; c.className = "cq-chip"; c.setAttribute("data-k", s.key);
          c.title = s.title; c.textContent = s.key + " (" + s.count + ")";
          c.addEventListener("click", function () { if (picked[s.key]) delete picked[s.key]; else picked[s.key] = 1; refresh(); });
          wrap.appendChild(c);
        });
        chips.appendChild(head); chips.appendChild(wrap);
      });
      var clr = document.createElement("button");
      clr.type = "button"; clr.className = "cq-btn"; clr.textContent = "Clear";
      clr.addEventListener("click", function () { picked = {}; refresh(); });
      uRow.appendChild(clr);
      function apply() {
        var r = parseRange($("range").value, d.sections);
        picked = {}; r.keys.forEach(function (k) { picked[k] = 1; });
        $("err").textContent = r.bad.length ? "No questions found for: " + r.bad.join(", ") : "";
        refresh();
      }
      $("apply").addEventListener("click", apply);
      $("range").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); apply(); } });
      $("range").focus();
      refresh();
    }).catch(function (e) {
      $("status").innerHTML = '<span class="cq-err">Couldn\'t load the course site (' + esc(e.message) +
        '). Check the internet connection and try again. This only works on the published page (ap-csa-java.github.io).</span>';
    });

    $("load").addEventListener("click", function () {
      var k = keys();
      var qs = data.questions.filter(function (q) { return picked[q.section]; });
      var label = $("name") ? ($("name").value.trim() || autoLabel(k)) : autoLabel(k);
      close();
      if (opts.onLoad) opts.onLoad(qs, label);
    });
  }

  // Question text as HTML: prompt (with `code`/**bold**) plus the code block, if any.
  function promptHtml(q) {
    return inline(q.prompt) + (q.code ? '<pre class="cq-pre">' + esc(q.code) + "</pre>" : "");
  }

  addCss();
  window.CourseQuestions = { open: open, inline: inline, promptHtml: promptHtml, _parseRange: parseRange, _load: loadAll };
})();
