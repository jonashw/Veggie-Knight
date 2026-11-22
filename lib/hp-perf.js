// Copied from jonashw/jons-house-party apps/web/public/toys/hp-perf.js (main, 2a8f061). Change it there first, then copy it here.
// Speed readout and speed run for toys. Modelled on the Sprinkle Cake toy's frame rate readout, as a shared
// piece so every toy shows and records the same thing.
//
//   const perf = createPerf({ toy: "bent-signal-path", on: () => S.fps, lines: () => ["extra readout lines"],
//                             where: () => "bottom", info: () => ({ gpu: "..." }) });
//   each frame:      perf.frame(msSinceLastFrame, msSpentDrawing)
//   at a transition: perf.mark("jolt")
//   a timed run:     perf.run({ seconds: 40, steps: [{ at: 4, mark: "jolt", run: () => doJolt() }] })
//
// Readout: shown when on() is true or the address has #fps. One thin bar per frame for the last 120 frames
// (taller is slower; the line marks 60 pictures a second), then the numbers. It sits on top of the page as
// ordinary elements, so a screenshot carries it.
//
// Speed run: plays the toy's own steps on a timer and logs one row per second (pictures a second, slowest
// frame, draw time, what happened). At the end it shows a report to copy or save. Nothing is sent anywhere:
// the person hands the report over themselves. An address with #perfrun starts a run when the toy calls
// perf.autorun(spec).
//
// For a toy that doesn't time its own frames, three more pieces make it one call:
//   perf.watchFrames()            times every animation frame the page draws (wraps requestAnimationFrame), so
//                                 the toy never calls perf.frame itself
//   perf.hotkey()                 the "Speed readout" action (F) for the toy's own createHotkeys list
//   perf.mountControls(sheet, { spec, keys, switchClass, buttonClass, before })
//                                 adds the Speed readout switch and the Record a speed run button to the toy's
//                                 knob sheet. spec() returns the run (steps and done). Without keys it makes its
//                                 own one-key hotkey list for F.
//   perf.bindSwitch(input), perf.bindRunButton(button, spec, say)
//                                 the same, for a toy that writes the switch and button in its own markup
//   perf.keepInputs(root)         remembers the knob sheet's inputs; call what it returns to put them back
// With no on() given, the readout's on/off is kept by this module (saved per toy).
import { createHotkeys } from "./hp-hotkeys.js";

export function createPerf({ toy = "toy", on = null, lines = () => [], where = () => "bottom", info = () => ({}) } = {}) {
  const forced = /#fps\b/.test(location.hash);
  const onKey = "hp-perf-on-" + toy;
  let ownOn = false;
  try {
    ownOn = localStorage.getItem(onKey) === "1";
  } catch {
    // no storage: off, and changes last until the page closes
  }
  const switches = [];
  function setOn(v) {
    ownOn = !!v;
    try {
      localStorage.setItem(onKey, ownOn ? "1" : "0");
    } catch {
      // no storage
    }
    switches.forEach((s) => (s.checked = ownOn));
    return ownOn;
  }
  if (!on) on = () => ownOn;
  const N = 120;
  const FT = [];
  let draw = 0;
  let el = null;
  let cv = null;
  let tx = null;
  let shown = false;
  let tick = 0;
  let rec = null;

  function build() {
    el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    el.style.cssText =
      "position:fixed;left:max(8px,env(safe-area-inset-left,0px));z-index:50;pointer-events:none;" +
      "background:rgba(0,0,0,0.66);color:#fff;font:11px/1.35 ui-monospace,Menlo,Consolas,monospace;padding:5px 7px;border-radius:7px;white-space:pre;max-width:96vw;overflow:hidden";
    cv = document.createElement("canvas");
    cv.width = N * 2;
    cv.height = 40;
    cv.style.cssText = "display:block;width:" + N * 2 + "px;height:40px;margin-bottom:3px";
    tx = document.createElement("div");
    el.append(cv, tx);
    document.body.appendChild(el);
  }

  function mark(label) {
    if (rec) rec.sec.marks.push(String(label));
  }

  function closeSecond() {
    const s = rec.sec;
    if (s.n)
      rec.rows.push([
        rec.rows.length + 1,
        Math.round((s.n * 1000) / s.sum),
        Math.round(s.max),
        +(s.draw / s.n).toFixed(1),
        s.marks.join(", "),
      ]);
    else rec.rows.push([rec.rows.length + 1, 0, 0, 0, s.marks.join(", ")]);
    rec.sec = { n: 0, sum: 0, max: 0, draw: 0, marks: [] };
  }

  function finish() {
    const r = rec;
    rec = null;
    if (r.done) r.done();
    const fps = r.rows.map((x) => x[1]).filter((x) => x > 0);
    const sorted = fps.slice().sort((a, b) => a - b);
    const all = r.all.slice().sort((a, b) => a - b);
    const report = {
      toy,
      when: new Date().toISOString(),
      seconds: r.rows.length,
      device: Object.assign(
        {
          agent: navigator.userAgent,
          screen: `${screen.width}x${screen.height}`,
          window: `${innerWidth}x${innerHeight}`,
          pixelRatio: devicePixelRatio,
          cores: navigator.hardwareConcurrency || null,
          memoryGB: navigator.deviceMemory || null,
        },
        info(),
      ),
      summary: {
        fpsMedian: sorted[Math.floor(sorted.length / 2)] || 0,
        fpsLowestSecond: sorted[0] || 0,
        frames: all.length,
        frameMsMedian: +(all[Math.floor(all.length / 2)] || 0).toFixed(1),
        frameMs95: +(all[Math.floor(all.length * 0.95)] || 0).toFixed(1),
        frameMsSlowest: Math.round(all[all.length - 1] || 0),
        framesOver34ms: all.filter((x) => x > 34).length,
      },
      columns: ["second", "fps", "slowestMs", "drawMs", "what happened"],
      rows: r.rows,
    };
    showReport(report);
    return report;
  }

  function showReport(report) {
    const text = JSON.stringify(report);
    const box = document.createElement("div");
    box.style.cssText =
      "position:fixed;inset:0;z-index:60;display:grid;place-items:center;padding:16px;background:rgba(0,0,0,0.55);font:14px/1.4 system-ui,sans-serif;color:#fff";
    const card = document.createElement("div");
    card.style.cssText =
      "background:#16131c;border:1px solid rgba(255,255,255,0.2);border-radius:14px;padding:14px;width:min(100%,520px);max-height:86vh;overflow:auto;display:grid;gap:10px";
    const s = report.summary;
    const h = document.createElement("div");
    h.style.cssText = "font-weight:700;font-size:16px";
    h.textContent = `Speed run: ${s.fpsMedian} pictures a second`;
    const p = document.createElement("div");
    p.style.cssText = "color:#c9bfd6";
    p.textContent = `${report.seconds} seconds. Slowest second ${s.fpsLowestSecond}. Slowest frame ${s.frameMsSlowest} ms. ${s.framesOver34ms} of ${s.frames} frames were slow.`;
    // one thin bar per second: taller is faster, up to 60
    const g = document.createElement("canvas");
    g.width = Math.max(120, report.rows.length * 6);
    g.height = 60;
    g.style.cssText = "width:100%;height:60px;background:#0b0a0f;border-radius:6px";
    const c = g.getContext("2d");
    report.rows.forEach((row, i) => {
      const v = Math.min(60, row[1]);
      c.fillStyle = v < 28 ? "#ff6b6b" : v < 48 ? "#ffd166" : "#7be495";
      c.fillRect(i * 6, 60 - v, 4, v);
      if (row[4]) {
        c.fillStyle = "#fff";
        c.fillRect(i * 6, 0, 1, 6);
      }
    });
    const ta = document.createElement("textarea");
    ta.readOnly = true;
    ta.value = text;
    ta.setAttribute("aria-label", "The speed run report");
    ta.style.cssText =
      "width:100%;height:110px;background:#0b0a0f;color:#c9bfd6;border:1px solid rgba(255,255,255,0.2);border-radius:8px;font:11px ui-monospace,Menlo,monospace;padding:6px";
    const said = document.createElement("div");
    said.style.cssText = "color:#c9bfd6;min-height:1.4em";
    said.setAttribute("role", "status");
    const row = document.createElement("div");
    row.style.cssText = "display:flex;gap:8px;flex-wrap:wrap";
    const btn = (label, fn) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.style.cssText =
        "font:700 14px system-ui,sans-serif;color:#fff;background:#2a2433;border:1px solid rgba(255,255,255,0.25);border-radius:10px;padding:0 14px;min-height:44px;cursor:pointer";
      b.addEventListener("click", fn);
      row.appendChild(b);
      return b;
    };
    btn("Copy report", async () => {
      try {
        await navigator.clipboard.writeText(text);
        said.textContent = "Copied. Paste it into a thread.";
      } catch {
        ta.focus();
        ta.select();
        said.textContent = "Select the text above and copy it.";
      }
    });
    btn("Save report", () => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
      a.download = `speed-run-${toy}-${report.when.slice(0, 19).replace(/[:T]/g, "-")}.json`;
      a.click();
      said.textContent = "Saved to this device's downloads.";
    });
    btn("Close", () => box.remove());
    card.append(h, p, g, ta, row, said);
    box.appendChild(card);
    document.body.appendChild(box);
  }

  // steps: [{ at: seconds, mark: "what happened", run: () => {} }], done: () => {} puts the toy back as it was
  function run({ seconds = 30, steps = [], done = null } = {}) {
    if (rec) return false;
    rec = {
      t: 0,
      seconds,
      steps: steps.slice().sort((a, b) => a.at - b.at),
      next: 0,
      rows: [],
      all: [],
      sec: { n: 0, sum: 0, max: 0, draw: 0, marks: ["start"] },
      secT: 0,
      done,
    };
    return true;
  }
  function autorun(spec) {
    if (/#perfrun\b/.test(location.hash)) setTimeout(() => run(spec), 1500);
  }

  function frame(rawMs, drawMs) {
    FT.push(rawMs);
    if (FT.length > N) FT.shift();
    if (drawMs != null) draw += (drawMs - draw) * 0.1;
    if (rec) {
      rec.t += rawMs / 1000;
      while (rec.next < rec.steps.length && rec.steps[rec.next].at <= rec.t) {
        const st = rec.steps[rec.next++];
        if (st.mark) rec.sec.marks.push(st.mark);
        try {
          if (st.run) st.run();
        } catch {
          rec.sec.marks.push("step failed");
        }
      }
      const s = rec.sec;
      s.n++;
      s.sum += rawMs;
      s.max = Math.max(s.max, rawMs);
      s.draw += drawMs || 0;
      rec.all.push(rawMs);
      rec.secT += rawMs;
      // a frame longer than a second still closes only one row, so a stall shows as one very slow second
      if (rec.secT >= 1000) {
        rec.secT = rec.secT >= 2000 ? 0 : rec.secT - 1000;
        closeSecond();
      }
      if (rec.t >= rec.seconds) finish();
    }
    const want = forced || on() || !!rec;
    if (want !== shown) {
      shown = want;
      if (want && !el) build();
      if (el) el.style.display = want ? "block" : "none";
    }
    if (!want) return;
    // bottom corner, or under the top bar when a toy's knob sheet is using the bottom
    const top = where() === "top";
    el.style.top = top ? "calc(60px + env(safe-area-inset-top,0px))" : "auto";
    el.style.bottom = top ? "auto" : "calc(8px + env(safe-area-inset-bottom,0px))";
    const g = cv.getContext("2d");
    g.clearRect(0, 0, cv.width, cv.height);
    // 40 px tall = 50 ms
    for (let i = 0; i < FT.length; i++) {
      const h = Math.min(40, FT[i] * 0.8);
      g.fillStyle = FT[i] > 34 ? "#ff6b6b" : FT[i] > 20 ? "#ffd166" : "#7be495";
      g.fillRect(i * 2, 40 - h, 1, h);
    }
    g.fillStyle = "rgba(255,255,255,0.5)";
    g.fillRect(0, 40 - 16.7 * 0.8, cv.width, 1);
    if (tick++ % 10) return; // the numbers change six times a second, so they can be read
    const avg = FT.reduce((a, b) => a + b, 0) / FT.length;
    const worst = Math.max(...FT);
    const out = [`${(1000 / avg).toFixed(0)} fps · ${avg.toFixed(1)} ms · slowest ${worst.toFixed(0)} ms`];
    if (drawMs != null) out.push(`draw ${draw.toFixed(1)} ms`);
    if (rec) out.push(`speed run: ${Math.max(0, Math.ceil(rec.seconds - rec.t))} s left`);
    tx.textContent = out.concat(lines()).join("\n");
  }
  // Times the page's own frames: one row per screen tick, the gap between ticks as the frame time and the time
  // spent inside the page's frame callbacks as the draw time. Our own loop runs on the untouched
  // requestAnimationFrame, so it keeps the readout moving even while a toy pauses its drawing.
  let watching = false;
  function watchFrames() {
    if (watching) return;
    watching = true;
    const raf = window.requestAnimationFrame.bind(window);
    let spent = 0;
    window.requestAnimationFrame = (cb) =>
      raf((t) => {
        const t0 = performance.now();
        try {
          cb(t);
        } finally {
          spent += performance.now() - t0;
        }
      });
    let lastT = null;
    const tickLoop = (t) => {
      raf(tickLoop);
      if (lastT != null) frame(t - lastT, spent);
      lastT = t;
      spent = 0;
    };
    raf(tickLoop);
  }

  const toggle = () => {
    setOn(!on());
    return on() ? "Speed readout on" : "Speed readout off";
  };
  // F unless the toy already uses F for something else
  const hotkey = (key = "f") => ({
    id: "fps",
    label: "Speed readout",
    what: "shows how smoothly this device is drawing",
    key,
    run: toggle,
  });

  // For a toy that writes its own markup: tie its switch and button to this module.
  function bindSwitch(sw) {
    sw.checked = on();
    sw.addEventListener("change", () => setOn(sw.checked));
    switches.push(sw);
    return sw;
  }
  function startRun(spec, say) {
    const s = typeof spec === "function" ? spec() : spec;
    const ok = run(s);
    const said = ok ? `Speed run: ${Math.round(s.seconds || 30)} seconds, hands off` : "A speed run is already going";
    if (say) say(said);
    return ok;
  }
  function bindRunButton(b, spec, say = null) {
    b.addEventListener("click", () => startRun(spec, say));
    return b;
  }

  // Speed readout switch and Record a speed run button, added to the toy's knob sheet.
  function mountControls(
    sheet,
    { spec, keys = null, key = "f", switchClass = "", buttonClass = "", before = null, rowClass = "", say = null } = {},
  ) {
    const row = document.createElement("div");
    row.className = "hp-perf-row " + rowClass;
    row.style.cssText = "display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center";
    const lab = document.createElement("label");
    lab.className = switchClass;
    lab.style.cssText = "display:inline-flex;gap:6px;align-items:center;cursor:pointer";
    const sw = document.createElement("input");
    sw.type = "checkbox";
    sw.setAttribute("role", "switch");
    bindSwitch(sw);
    const k = document.createElement("kbd");
    k.dataset.keyFor = "fps";
    lab.append(sw, "Speed readout ", k);
    const b = document.createElement("button");
    b.type = "button";
    b.className = buttonClass;
    b.textContent = "Record a speed run";
    b.title = "Plays through everything this toy does for 40 seconds and makes a report of how fast it drew";
    bindRunButton(b, spec, say || ((said) => keys && keys.toast && keys.toast((t) => (t.textContent = said))));
    row.append(lab, b);
    if (before) sheet.insertBefore(row, before);
    else sheet.appendChild(row);
    if (!keys) keys = createHotkeys({ storageKey: "hp-perf-keys-" + toy, actions: [hotkey(key)] });
    keys.decorate(row);
    return row;
  }

  // For a toy whose settings live in its knob sheet's own inputs: remembers every input under root and gives
  // back a function that puts each changed one back, firing its input and change events as a person would.
  function keepInputs(root) {
    const els = [...root.querySelectorAll("input, select")].filter((x) => x.type !== "file" && x.type !== "button");
    const was = els.map((x) => (x.type === "checkbox" || x.type === "radio" ? x.checked : x.value));
    return () =>
      els.forEach((x, i) => {
        const box = x.type === "checkbox" || x.type === "radio";
        if ((box ? x.checked : x.value) === was[i]) return;
        if (box) x.checked = was[i];
        else x.value = was[i];
        if (x.type === "radio" && !x.checked) return;
        x.dispatchEvent(new Event("input", { bubbles: true }));
        x.dispatchEvent(new Event("change", { bubbles: true }));
      });
  }

  return {
    frame,
    mark,
    run,
    autorun,
    keepInputs,
    running: () => !!rec,
    watchFrames,
    hotkey,
    mountControls,
    bindSwitch,
    bindRunButton,
    startRun,
    setOn,
    isOn: () => on(),
  };
}
