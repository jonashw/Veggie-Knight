// Copied from jonashw/jons-house-party apps/web/public/toys/hp-hotkeys.js (main, 2a8f061). Change it there first, then copy it here.
// HPHotkeys: keyboard shortcuts people can see, learn and change. Made for Video Call FX; meant for any
// House Party page.
//
//   import { createHotkeys } from "./hp-hotkeys.js";
//   const keys = createHotkeys({
//     storageKey: "hp-vcfx-keys",
//     actions: [
//       { id: "settings", label: "Settings", what: "opens and closes the settings panel", key: "s", run: () => "Settings opened" },
//       { id: "mirror", label: "Mirror", what: "flips your picture left to right", key: null, run: () => "Mirror on" },
//     ],
//   });
//   keys.keyOf("settings")       // "S" (for a button's label), or "" when it has no key
//   keys.decorate(root)          // fills every <kbd data-key-for="id"> under root with its key; click one to change it
//   keys.onChange(() => ...)     // after any change of binding (relabel buttons)
//
// Every press shows a small note: what was pressed, what it did, and "Change key". Changing a key asks for
// the new one; if another action has it, it says what that action does (you may not know it exists) and
// offers: use the key here (the other loses it), swap the two keys, or keep things as they were.
// Bindings are saved in localStorage under storageKey; defaults come from the actions. Escape is never a
// hotkey (it cancels). Keys don't fire while typing in a field.

const CSS = `
.hk-toasts{position:fixed;right:16px;bottom:16px;z-index:50;display:grid;gap:8px;justify-items:end;pointer-events:none;font:14px/1.35 system-ui,sans-serif}
.hk-toast{pointer-events:auto;display:flex;align-items:center;gap:10px;max-width:440px;padding:9px 10px 9px 12px;border-radius:10px;background:rgba(20,20,26,.94);color:#eee;border:1px solid #2c2c36;box-shadow:0 6px 20px rgba(0,0,0,.4)}
.hk-toast kbd,.hk-chip{font:600 12px/1 ui-monospace,SFMono-Regular,Menlo,monospace;padding:4px 6px;border-radius:5px;border:1px solid #4a4a58;background:#1b1b22;color:#eee;white-space:nowrap}
.hk-chip{cursor:pointer;margin-left:6px}
.hk-chip.none{color:#9a9aa6;font-weight:500}
.hk-toast button{font:inherit;font-size:13px;padding:4px 8px;border-radius:6px;border:1px solid #4a4a58;background:#26262f;color:#eee;cursor:pointer}
.hk-toast button.go{background:#7fd1c7;color:#111;border-color:#7fd1c7}
.hk-ask{flex-direction:column;align-items:stretch}
.hk-ask .row{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
.hk-ask p{margin:0}
.hk-ask .quiet{color:#9a9aa6;font-size:13px}
`;

const MODS = ["shift", "alt", "ctrl", "meta"];
const pretty = (k) =>
  k
    ? k
        .split("+")
        .map(
          (p) =>
            ({ shift: "Shift", alt: "⌥", ctrl: "Ctrl", meta: "⌘", " ": "Space" })[p] ||
            (p.length === 1 ? p.toUpperCase() : p[0].toUpperCase() + p.slice(1)),
        )
        .join("+")
    : "";
// "shift+g" from a keyboard event (letters by their key, so layouts work; "?" stays "?")
function comboOf(e) {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
  if (MODS.includes(key) || key === "escape" || key === "dead") return null;
  const parts = [];
  if (e.ctrlKey) parts.push("ctrl");
  if (e.altKey) parts.push("alt");
  if (e.metaKey) parts.push("meta");
  // shift is part of the character for symbols ("?" is shift+/), so only count it for letters and named keys
  if (e.shiftKey && (/^[a-z0-9]$/.test(key) || key.length > 1)) parts.push("shift");
  parts.push(key);
  return parts.join("+");
}
const typing = (t) => t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName));

export function createHotkeys({ storageKey, actions, root = document.body }) {
  if (!document.getElementById("hk-style")) {
    const st = document.createElement("style");
    st.id = "hk-style";
    st.textContent = CSS;
    document.head.appendChild(st);
  }
  const byId = new Map(actions.map((a) => [a.id, a]));
  const defaults = Object.fromEntries(actions.map((a) => [a.id, a.key || null]));
  let bind = { ...defaults };
  try {
    Object.assign(bind, JSON.parse(localStorage.getItem(storageKey)) || {});
  } catch {
    // no storage: defaults, and changes last until the page closes
  }
  const listeners = [];
  const save = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(bind));
    } catch {
      // no storage: defaults, and changes last until the page closes
    }
    listeners.forEach((f) => f());
  };
  const idOfKey = (k) => Object.keys(bind).find((id) => bind[id] === k && byId.has(id));

  // the notes, bottom right, on this screen only
  const box = document.createElement("div");
  box.className = "hk-toasts";
  root.appendChild(box);
  function toast(build, ms = 3500) {
    const el = document.createElement("div");
    el.className = "hk-toast";
    build(el);
    box.appendChild(el);
    while (box.children.length > 3) box.firstChild.remove();
    let timer = ms ? setTimeout(() => el.remove(), ms) : 0;
    el.onmouseenter = () => clearTimeout(timer);
    el.onmouseleave = () => ms && (timer = setTimeout(() => el.remove(), 1500));
    return el;
  }
  const kbd = (k) => `<kbd>${pretty(k) || "no key"}</kbd>`;
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // Changing a key: wait for the next press, then settle any clash.
  let capturing = null;
  function change(id) {
    const a = byId.get(id);
    box.querySelectorAll(".hk-ask").forEach((x) => x.remove());
    const el = toast((t) => {
      t.classList.add("hk-ask");
      t.innerHTML = `<p>Press the new key for <b>${esc(a.label)}</b> (now ${kbd(bind[id])}).</p>
        <div class="row"><button data-x="none">No key</button><button data-x="cancel">Cancel</button></div>`;
    }, 0);
    capturing = (combo) => {
      capturing = null;
      el.remove();
      settle(id, combo);
    };
    el.querySelector('[data-x="cancel"]').onclick = () => {
      capturing = null;
      el.remove();
    };
    el.querySelector('[data-x="none"]').onclick = () => {
      capturing = null;
      el.remove();
      bind[id] = null;
      save();
      toast((t) => (t.innerHTML = `<span><b>${esc(a.label)}</b> has no key now.</span>`));
    };
  }
  function settle(id, combo) {
    const a = byId.get(id);
    const other = idOfKey(combo);
    if (!other || other === id) {
      bind[id] = combo;
      save();
      toast((t) => (t.innerHTML = `<span>${kbd(combo)} now does <b>${esc(a.label)}</b>.</span>`));
      return;
    }
    // the key is taken: say what the other one is, and let them choose
    const o = byId.get(other);
    const mine = bind[id];
    const el = toast((t) => {
      t.classList.add("hk-ask");
      t.innerHTML = `<p>${kbd(combo)} is already <b>${esc(o.label)}</b>: it ${esc(o.what || "has an action")}.</p>
        <p class="quiet">Use it for ${esc(a.label)} anyway?</p>
        <div class="row">
          <button data-x="take" class="go">Use ${pretty(combo)} here; ${esc(o.label)} gets no key</button>
          ${mine ? `<button data-x="swap">Swap: ${esc(o.label)} gets ${pretty(mine)}</button>` : ""}
          <button data-x="other">Pick another key</button>
          <button data-x="cancel">Keep as it was</button>
        </div>`;
    }, 0);
    const done = () => el.remove();
    el.querySelector('[data-x="take"]').onclick = () => {
      bind[other] = null;
      bind[id] = combo;
      save();
      done();
      toast((t) => (t.innerHTML = `<span>${kbd(combo)} now does <b>${esc(a.label)}</b>. <b>${esc(o.label)}</b> has no key.</span>`));
    };
    el.querySelector('[data-x="swap"]')?.addEventListener("click", () => {
      bind[other] = mine;
      bind[id] = combo;
      save();
      done();
      toast((t) => (t.innerHTML = `<span>Swapped: ${kbd(combo)} ${esc(a.label)}, ${kbd(mine)} ${esc(o.label)}.</span>`));
    });
    el.querySelector('[data-x="other"]').onclick = () => {
      done();
      change(id);
    };
    el.querySelector('[data-x="cancel"]').onclick = done;
  }

  addEventListener(
    "keydown",
    (e) => {
      if (capturing) {
        if (e.key === "Escape") {
          capturing = null;
          box.querySelectorAll(".hk-ask").forEach((x) => x.remove());
          e.preventDefault();
          return;
        }
        const combo = comboOf(e);
        if (!combo) return;
        e.preventDefault();
        e.stopPropagation();
        capturing(combo);
        return;
      }
      if (typing(e.target) || e.repeat) return;
      const combo = comboOf(e);
      const id = combo && idOfKey(combo);
      if (!id) return;
      e.preventDefault();
      const a = byId.get(id);
      const result = a.run?.() || a.label;
      toast((t) => {
        t.innerHTML = `${kbd(combo)}<span>${esc(result)}</span><button>Change key</button>`;
        t.querySelector("button").onclick = () => change(id);
      });
    },
    true,
  );

  return {
    keyOf: (id) => pretty(bind[id]),
    change,
    reset() {
      bind = { ...defaults };
      save();
    },
    onChange: (f) => listeners.push(f),
    // a key chip per <kbd data-key-for="id">: shows the key (or "set key"); click to change it
    decorate(rootEl) {
      const paint = () =>
        rootEl.querySelectorAll("kbd[data-key-for]").forEach((k) => {
          const id = k.dataset.keyFor;
          if (!byId.has(id)) return;
          k.classList.add("hk-chip");
          k.classList.toggle("none", !bind[id]);
          k.textContent = pretty(bind[id]) || "set key";
          k.title = `Keyboard shortcut for ${byId.get(id).label}: click to change`;
          k.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            change(id);
          };
        });
      paint();
      listeners.push(paint);
    },
    // every action and its key, for a help note
    list: () => actions.map((a) => ({ id: a.id, label: a.label, key: pretty(bind[a.id]) })),
    toast,
  };
}
