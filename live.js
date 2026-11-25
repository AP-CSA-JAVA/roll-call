/* ==========================================================================
   Live — connection to the quiz Sheet's Live.gs for live class questions.
   Used by Roll Call (index.html), Race Day (teams.html) and the student page
   (live.html). Load course-questions.js first (its window styles are reused).

   The endpoint is the quiz Sheet's web app (the same one the course site's
   Check for Understanding uses). Teacher actions need the Live passcode, set
   in the Sheet: Live → Set teacher passcode. It's typed once per computer.
   ========================================================================== */
(function () {
  "use strict";
  var CFG = {
    endpoint: "https://script.google.com/macros/s/AKfycbyp3GF_7LADnznit0wfSSOkByj5BhOKSnmR5cU8pPvUGanNHINhPK6Fp3zkryzI78s3FQ/exec",
    siteKey: "csa-2026",       // must match SITE_KEY in Code.gs
    teacherPollMs: 2500,       // how often the teacher's screen refreshes the answer count
    studentPollMs: 3000        // how often a student's screen checks for a new question
  };
  if (window.LIVE_CONFIG) for (var k in window.LIVE_CONFIG) CFG[k] = window.LIVE_CONFIG[k];

  var PASS_KEY = "live_pass";

  function post(action, data) {
    var body = { key: CFG.siteKey, live: action };
    for (var k in (data || {})) body[k] = data[k];
    return fetch(CFG.endpoint, {
      method: "POST", body: JSON.stringify(body),
      headers: { "Content-Type": "text/plain;charset=utf-8" }
    }).then(function (r) { return r.json(); });
  }

  /* ---------- teacher ---------- */
  function savedPass() { try { return localStorage.getItem(PASS_KEY) || ""; } catch (e) { return ""; } }
  function setPass(p) { try { if (p) localStorage.setItem(PASS_KEY, p); else localStorage.removeItem(PASS_KEY); } catch (e) {} }

  function askPass() {
    var p = window.prompt("Live teacher passcode\n(the one set in the quiz Sheet: Live → Set teacher passcode).\nIt's remembered on this computer.");
    if (!p) return Promise.reject(new Error("cancelled"));
    return post("check", { pass: p.trim() }).then(function (r) {
      if (!r.ok) { alert("That passcode didn't match."); throw new Error("passcode"); }
      setPass(p.trim());
      return p.trim();
    });
  }

  // Teacher request: adds the saved passcode, asks for it if missing or wrong.
  function teacher(action, data) {
    var p = savedPass();
    var go = p ? Promise.resolve(p) : askPass();
    return go.then(function (pass) {
      var d = {}; for (var k in (data || {})) d[k] = data[k]; d.pass = pass;
      return post(action, d).then(function (r) {
        if (r && r.error === "passcode") {
          setPass("");
          return askPass().then(function (p2) { d.pass = p2; return post(action, d); });
        }
        return r;
      });
    });
  }

  // Small window with one button per period from the Roster tab. Resolves to the period.
  function pickPeriod(title) {
    return teacher("periods").then(function (r) {
      if (!r.ok) throw new Error(r.error || "Could not read the roster.");
      if (!r.periods.length) throw new Error("The quiz Sheet's Roster tab has no periods yet.");
      return new Promise(function (resolve, reject) {
        var back = document.createElement("div");
        back.className = "cq-back";
        back.innerHTML = '<div class="cq-box" role="dialog" aria-modal="true" style="max-width:420px;">' +
          '<div class="cq-head"><h3>' + (title || "Which period?") + '</h3><div class="cq-dim">From the Roster tab in the quiz Sheet.</div></div>' +
          '<div class="cq-body"><div class="cq-row" data-r="list"></div></div>' +
          '<div class="cq-foot"><span class="cq-sum"></span><button class="cq-btn" data-r="cancel" type="button">Cancel</button></div></div>';
        document.body.appendChild(back);
        var list = back.querySelector('[data-r="list"]');
        function done(v) { back.remove(); if (v == null) reject(new Error("cancelled")); else resolve(v); }
        r.periods.forEach(function (p) {
          var b = document.createElement("button");
          b.type = "button"; b.className = "cq-btn cq-main"; b.textContent = "Period " + p;
          b.addEventListener("click", function () { done(p); });
          list.appendChild(b);
        });
        back.querySelector('[data-r="cancel"]').addEventListener("click", function () { done(null); });
        back.addEventListener("click", function (e) { if (e.target === back) done(null); });
      });
    });
  }

  function loadRoster(period) {
    return teacher("roster", { period: period }).then(function (r) {
      if (!r.ok) throw new Error(r.error || "Could not read the roster.");
      return r.students;   // [{id, name}]
    });
  }

  // Repeats status checks while a question is open. onUpdate(status) on each answer.
  function monitor(onUpdate) {
    var stopped = false, timer = null;
    function tick() {
      if (stopped) return;
      teacher("status").then(function (s) { if (!stopped) onUpdate(s); })
        .catch(function () {})
        .then(function () { if (!stopped) timer = setTimeout(tick, CFG.teacherPollMs); });
    }
    tick();
    return { stop: function () { stopped = true; clearTimeout(timer); } };
  }

  // A stable key for a question: course questions use their id, CSV questions a hash of the text.
  function keyFor(id, text) {
    if (id) return String(id);
    var h = 0, s = String(text || "");
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return "q" + (h >>> 0).toString(36);
  }

  // Teacher-side errors in plain words.
  function explain(e) {
    var m = String(e && e.message || e || "");
    if (m === "cancelled") return "";
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return "Couldn't reach the quiz Sheet. Check the internet connection.";
    return m;
  }

  window.Live = {
    config: CFG, post: post, teacher: teacher, pickPeriod: pickPeriod, loadRoster: loadRoster,
    monitor: monitor, keyFor: keyFor, explain: explain, forgetPasscode: function () { setPass(""); },
    studentUrl: "https://ap-csa-java.github.io/roll-call/live.html"
  };
})();
