// ]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]
//   derjyn.github.io: Live Background
//   A segment lattice or an LED dot field behind the page, answering the
//   cursor and click pings; ported from moodboard 07. Colors are Flesh's
//   roles, so it follows the skin and the theme. Reduced motion: one still
//   frame, no pointer tracking.
// ]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]

import { play } from "./sfx.js";

const canvas = document.querySelector(".field");
const ctx = canvas.getContext("2d");
const root = document.documentElement;
const prefs = window.derjynPrefs;
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

const DOT = 8;           // field dot pitch, CSS px
const CELL = 16;         // lattice cell size, CSS px
const REACH = 128;       // the field's cursor lens radius, CSS px
const CURSOR_R = 8;      // the lattice's lit circle under the cursor, CSS px
const HOT_R = 4;         // its signal-colored core: on a node, just that X's four arms
const PING_LIFE = 1.0;   // seconds
const PING_REACH = 176;  // how far a click ring grows in its life, CSS px
const SLAP_REACH = 224;  // how far a slap's front travels
const RING_W = 12;       // half a ring's thickness on the lattice
const FIELD_RING_W = 8;  // and on the field, where thinner reads better
const REFLECT = 0.60;    // a reflected ring's strength against the ring that made it
const EDGE_R = 32;       // how far a moving edge's wake reaches
const FADE_TRAIL = 1.5;  // how fast a lattice arm the cursor lit fades, per second
const FADE_WAVE = 3.0;   // and one a wave lit: a short tail behind a moving band, like the field's ripple
const LEVELS = [0, 0.53, 0.9, 1.35, 1.9]; // dot radius per quantized level

const ARM_LEN = CELL * 0.40;
const ARM_OFF = CELL * 0.25;

let w = 0, h = 0, dpr = 1;
let colors = {};
let segs = [];
// The lattice is pinned to the page, not the viewport: segs cover the viewport plus a row, and rowBase is the
// page row at the top, so lit arms keep their place in the page while it scrolls.
let cols = 0;
let rowBase = 0;
// The resting lattice never changes, so it is drawn once here and copied each frame.
const idle = document.createElement("canvas");
const ictx = idle.getContext("2d");
const pointer = { x: -9999, y: -9999, sx: -9999, sy: -9999 };
const pings = [];
// Moving page elements report their leading edges each frame; a wake lights the lattice along them.
let edges = [];
let edgesAt = 0;

// |>|>|>|>|>|>-- SETUP --------------------------------------------------------

// Flesh's roles are light-dark() pairs; a probe element resolves them to the color in use.
function readColors() {
    const probe = document.createElement("span");
    probe.hidden = true;
    document.body.append(probe);
    const get = (role) => {
        probe.style.color = `var(${role})`;
        return getComputedStyle(probe).color;
    };
    colors = { ink: get("--flesh-text"), rule: get("--flesh-line"), accent: get("--flesh-accent") };
    probe.remove();
}

function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth;
    h = innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    idle.width = canvas.width;
    idle.height = canvas.height + Math.ceil(2 * CELL * dpr);
    buildLattice();
}

function buildLattice() {
    segs = [];
    cols = Math.ceil((w + CELL) / CELL);
    rowBase = Math.floor(scrollY / CELL);
    for (let y = 0; y < h + 2 * CELL; y += CELL) {
        for (let i = 0; i < cols; i++) {
            const x = i * CELL;
            // Four arms per cell, pointing out from its center node along the diagonals.
            for (let k = 0; k < 4; k++) {
                const a = Math.PI / 4 + k * Math.PI / 2;
                const cos = Math.cos(a), sin = Math.sin(a);
                segs.push({ x, y, cos, sin, cx: x + cos * ARM_OFF, cy: y + sin * ARM_OFF, e: 0, hot: false, fade: FADE_TRAIL });
            }
        }
    }
}

// The resting lattice: every arm and node at idle strength, on the offscreen canvas.
function paintIdle() {
    ictx.setTransform(1, 0, 0, 1, 0, 0);
    ictx.clearRect(0, 0, idle.width, idle.height);
    ictx.strokeStyle = colors.rule;
    ictx.lineWidth = 1.25;
    ictx.globalAlpha = 0.11;
    for (const s of segs) arm(ictx, s);
    ictx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ictx.globalAlpha = 0.2;
    ictx.lineWidth = 1;
    ictx.beginPath();
    for (let i = 0; i < segs.length; i += 4) {
        ictx.moveTo(segs[i].x + 1.1, segs[i].y);
        ictx.arc(segs[i].x, segs[i].y, 1.1, 0, Math.PI * 2);
    }
    ictx.stroke();
    ictx.globalAlpha = 1;
}

const mode = () => root.dataset.bg || "lattice";

// |>|>|>|>|>|>-- SHARED -------------------------------------------------------

// Full strength for the first 75% of a span, then a smooth fade to nothing: t is 0 at the center, 1 at the edge.
function plateau(t) {
    if (t <= 0.75) return 1;
    if (t >= 1) return 0;
    const u = (t - 0.75) / 0.25;
    return 1 - u * u * (3 - 2 * u);
}

// |>-- Waves: rings that the page's boxes block and reflect, slaps, wakes

// Rings live in page coordinates so they hold together while the page scrolls; the canvas is the viewport.
const view = { x: 0, y: 0 };
// Half a ring's thickness in the mode being drawn.
let ringW = RING_W;

// The part of an element actually on screen: clipped by every scrolling or clipping box around it, so a
// poster scrolled out of the strip isn't an invisible wall. Null when none of it shows.
function visibleRect(el) {
    let { left, top, right, bottom } = el.getBoundingClientRect();
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const css = getComputedStyle(a);
        if (css.overflowX === "visible" && css.overflowY === "visible") continue;
        const c = a.getBoundingClientRect();
        left = Math.max(left, c.left); top = Math.max(top, c.top);
        right = Math.min(right, c.right); bottom = Math.min(bottom, c.bottom);
    }
    return right > left && bottom > top ? { left, top, right, bottom, width: right - left } : null;
}

// The content boxes near a point, in page coordinates: what a ring can't pass through.
function boxes(x, y, reach) {
    const out = [];
    for (const el of document.querySelectorAll(".tissue")) {
        const r = visibleRect(el);
        if (!r) continue;
        const box = { l: r.left + scrollX, t: r.top + scrollY, r: r.right + scrollX, b: r.bottom + scrollY };
        const near = box.r > x - reach && box.l < x + reach && box.b > y - reach && box.t < y + reach;
        if (r.width > 0 && near) out.push(box);
    }
    return out;
}

// Does the segment a-b cross the box? (Liang-Barsky clipping.)
function crosses(ax, ay, bx, by, box) {
    let t0 = 0, t1 = 1;
    const dx = bx - ax, dy = by - ay;
    for (const [p, q] of [[-dx, ax - box.l], [dx, box.r - ax], [-dy, ay - box.t], [dy, box.b - ay]]) {
        if (p === 0) { if (q < 0) return false; continue; }
        const t = q / p;
        if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
        else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
    return true;
}

// A click ring: the boxes around it block it, and each box face that sees the click mirrors it
// (an image source, as in room acoustics). A box the click landed in doesn't count.
function ring(x, y, strength) {
    const walls = boxes(x, y, PING_REACH + RING_W).filter((b) => !(x > b.l && x < b.r && y > b.t && y < b.b));
    const images = [];
    for (const b of walls) {
        if (x < b.l) images.push({ x: 2 * b.l - x, y, axis: "x", at: b.l, from: b.t, to: b.b, side: -1 });
        if (x > b.r) images.push({ x: 2 * b.r - x, y, axis: "x", at: b.r, from: b.t, to: b.b, side: 1 });
        if (y < b.t) images.push({ x, y: 2 * b.t - y, axis: "y", at: b.t, from: b.l, to: b.r, side: -1 });
        if (y > b.b) images.push({ x, y: 2 * b.b - y, axis: "y", at: b.b, from: b.l, to: b.r, side: 1 });
    }
    return { kind: "ring", x, y, age: 0, strength, walls, images };
}

// Is a point within a ring's band? Squared distances, so most points skip the square root.
function band2(d2, r) {
    const lo = Math.max(0, r - ringW), hi = r + ringW;
    return d2 >= lo * lo && d2 <= hi * hi;
}

function ringAt(p, X, Y, r, life) {
    let v = 0, hot = false;
    const d2 = (X - p.x) ** 2 + (Y - p.y) ** 2;
    if (band2(d2, r) && !p.walls.some((b) => crosses(p.x, p.y, X, Y, b))) {
        const off = Math.abs(Math.sqrt(d2) - r);
        v = plateau(off / ringW) * life * p.strength;
        hot = off < ringW * 0.35 && v > 0.6;
    }
    for (const im of p.images) {
        const i2 = (X - im.x) ** 2 + (Y - im.y) ** 2;
        if (!band2(i2, r)) continue;
        const [pa, pb, ia, ib] = im.axis === "x" ? [X, Y, im.x, im.y] : [Y, X, im.y, im.x];
        // Only on the click's side of the face, and only where the bounce point lies on the face itself.
        if ((pa - im.at) * im.side <= 0) continue;
        const hit = ib + (pb - ib) * (im.at - ia) / (pa - ia);
        if (hit < im.from || hit > im.to) continue;
        const s = plateau(Math.abs(Math.sqrt(i2) - r) / ringW) * life * p.strength * REFLECT;
        if (s > v) { v = s; hot = false; }
    }
    return { v, hot };
}

// A slap: a flat front as tall as what slapped, rounded at its ends, moving one way only.
function slapAt(p, X, Y, life) {
    if ((X - p.x) * p.dir < 0) return { v: 0, hot: false };
    const d = Math.hypot(X - p.x, Math.max(p.y0 - Y, 0, Y - p.y1));
    const off = Math.abs(d - (p.age / PING_LIFE) * SLAP_REACH);
    const v = plateau(off / ringW) * life * p.strength;
    return { v, hot: off < ringW * 0.35 && v > 0.6 };
}

// Rings, slaps, then moving edges' wakes, at a viewport point: { v: 0 to 1, hot: signal color }.
function waves(x, y) {
    let v = 0, hot = false;
    const X = x + view.x, Y = y + view.y;
    for (const p of pings) {
        const life = plateau(p.age / PING_LIFE);
        const w = p.kind === "slap" ? slapAt(p, X, Y, life) : ringAt(p, X, Y, (p.age / PING_LIFE) * PING_REACH, life);
        if (w.v > v) ({ v, hot } = w);
    }
    if (performance.now() - edgesAt < 120) {
        for (const e of edges) {
            const dy = Math.max(e.y0 - y, 0, y - e.y1);
            const s = plateau(Math.hypot(x - e.x, dy) / EDGE_R) * e.strength;
            if (s > v) { v = s; hot = s > 0.8; }
        }
    }
    return { v, hot };
}

// The field's lift: a wide quadratic lens around the smoothed pointer (its sway), plus the waves.
function lift(x, y) {
    const d = Math.hypot(x - pointer.sx, y - pointer.sy);
    return Math.max(d < REACH ? (1 - d / REACH) ** 2 : 0, waves(x, y).v);
}

// The lattice's lift: a small solid circle on the raw pointer, its edge fading, plus the waves.
function latticeLift(x, y) {
    const d = Math.hypot(x - pointer.x, y - pointer.y);
    const cursor = plateau(d / CURSOR_R);
    const w = waves(x, y);
    return cursor >= w.v ? { v: cursor, hot: d < HOT_R, wave: false } : { ...w, wave: true };
}

// Slow flowing bands from layered sines: cheap, smooth, no noise library.
function band(x, y, t) {
    const a = Math.sin(x * 0.0042 + t * 0.32);
    const b = Math.sin(y * 0.0061 - t * 0.21 + Math.sin(x * 0.0019 + t * 0.11) * 2.2);
    const c = Math.sin((x + y) * 0.0031 + t * 0.27);
    return (a + b + c + 3) / 6;
}

// |>|>|>|>|>|>-- FIELD --------------------------------------------------------

function dot(x, y, t, l, level, square) {
    // Dots near the cursor swing outward a little, like a lens.
    const dx = x - pointer.sx, dy = y - pointer.sy;
    const dist = Math.hypot(dx, dy) || 1;
    const px = x + (dx / dist) * l * 4;
    const py = y + (dy / dist) * l * 4;
    ctx.fillStyle = Math.sin(x * 0.003 - t * 0.15 + (y + view.y) * 0.002) > 0.2 ? colors.ink : colors.accent;
    ctx.globalAlpha = 0.18 + level * 0.1 + l * 0.2;
    const r = LEVELS[level];
    if (square) {
        ctx.fillRect(px - r, py - r, r * 2, r * 2);
    } else {
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawField(t) {
    // Glass draws square LCD cells, paper round dots, matching the wordmark.
    const square = prefs.isDark();
    // The dot grid and its bands are pinned to the page, so they scroll with it.
    for (let y = DOT / 2 - (view.y % DOT); y < h; y += DOT) {
        for (let x = DOT / 2; x < w; x += DOT) {
            const l = lift(x, y);
            // Only the crests light; quantizing to LEVELS keeps it a dot matrix, not a gradient.
            const base = Math.max(0, (band(x, y + view.y, t) - 0.55) / 0.45);
            const level = Math.min(4, Math.floor((base + l * 0.6) * 5));
            if (level > 0) {
                dot(x, y, t, l, level, square);
                continue;
            }
            ctx.fillStyle = colors.rule;
            ctx.globalAlpha = 0.35;
            ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
        }
    }
    ctx.globalAlpha = 1;
}

// |>|>|>|>|>|>-- LATTICE ------------------------------------------------------

// One arm: a stroked capsule along its diagonal. setTransform instead of save/rotate/restore,
// which is far cheaper when thousands are drawn.
function arm(c, s, oy = 0) {
    c.setTransform(dpr * s.cos, dpr * s.sin, -dpr * s.sin, dpr * s.cos, dpr * s.cx, dpr * (s.cy - oy));
    c.beginPath();
    c.roundRect(-ARM_LEN / 2, -1.5, ARM_LEN, 3, 1.5);
    c.stroke();
}

// The page scrolled across `rows` lattice rows: lit arms move with it, rows coming into view start dark.
function shiftRows(rows) {
    const step = rows * cols * 4;
    const order = step > 0 ? [...segs.keys()] : [...segs.keys()].reverse();
    for (const i of order) {
        const from = segs[i + step];
        const s = segs[i];
        s.e = from ? from.e : 0;
        s.hot = from ? from.hot : false;
        s.fade = from ? from.fade : FADE_TRAIL;
    }
}

function drawLattice(dt) {
    const oy = view.y % CELL;
    const top = Math.floor(view.y / CELL);
    if (top !== rowBase) {
        shiftRows(top - rowBase);
        rowBase = top;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(idle, 0, -Math.round(oy * dpr));
    ctx.lineWidth = 1.25;
    const waving = pings.length > 0 || performance.now() - edgesAt < 120;
    for (const s of segs) {
        const vy = s.cy - oy;
        // Only arms near the cursor, a ping or a moving edge need the distance math. An arm takes the
        // strongest light that reaches it and keeps it while it fades, so faint edges stay faint.
        if (waving || (Math.abs(s.cx - pointer.x) < CURSOR_R && Math.abs(vy - pointer.y) < CURSOR_R)) {
            const l = latticeLift(s.cx, vy);
            if (l.v > s.e) { s.e = l.v; s.hot = l.hot; s.fade = l.wave ? FADE_WAVE : FADE_TRAIL; }
        }
        // Autonomous flickers are rare and fade slowly, at the cursor trail's pace.
        if (!still && Math.random() < 0.00008) { s.e = 1; s.hot = Math.random() < 0.4; s.fade = FADE_TRAIL; }
        if (s.e <= 0) continue;
        s.e = Math.max(0, s.e - dt * s.fade);
        if (s.e > 0.02) {
            ctx.strokeStyle = s.hot ? colors.accent : colors.ink;
            ctx.globalAlpha = 0.06 + s.e * 0.3;
            arm(ctx, s, oy);
        }
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
}

// |>|>|>|>|>|>-- LOOP ---------------------------------------------------------

let last = performance.now();

function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    view.x = scrollX;
    view.y = scrollY;

    // The smoothed pointer trails the real one: that lag is the sway.
    pointer.sx += (pointer.x - pointer.sx) * 0.12;
    pointer.sy += (pointer.y - pointer.sy) * 0.12;

    for (const p of pings) p.age += dt;
    for (let i = pings.length - 1; i >= 0; i--) if (pings[i].age >= PING_LIFE) pings.splice(i, 1);

    ctx.clearRect(0, 0, w, h);
    const m = mode();
    ringW = m === "field" ? FIELD_RING_W : RING_W;
    if (m === "field") drawField(t);
    if (m === "lattice") drawLattice(dt);

    if (!still) requestAnimationFrame(frame);
}

// |>|>|>|>|>|>-- INPUT --------------------------------------------------------

function onMove(e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
}

function onDown(e) {
    if (e.target.closest("a, button, input, label, select, textarea, dialog, .options")) return;
    window.derjynField.impulse(e.clientX, e.clientY);
    if (active()) play(mode());
}

// An element with no text of its own is empty space: a gap, a margin, a module's padding.
function isEmptySpace(el) {
    for (const n of el.childNodes) {
        if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) return false;
    }
    return !el.closest("a, button, input, label, select, textarea, img, svg");
}

// Rapid clicks on empty space are play, not selection: a double or triple click there would
// select nearby text, so it is cancelled. Clicks on text, and drag-selecting, work as usual.
function onMouseDown(e) {
    if (e.detail < 2 || mode() === "off") return;
    if (isEmptySpace(e.target)) e.preventDefault();
}

// |>|>|>|>|>|>-- API ----------------------------------------------------------

// Other scripts make waves through this. Viewport coordinates, strength 0 to 1. Nothing happens with the
// background off or reduced motion set.
const active = () => !still && mode() !== "off";
const MAX_PINGS = 12;
const clamp01 = (n) => Math.min(1, Math.max(0, n));

function add(ping) {
    if (pings.length >= MAX_PINGS) pings.shift();
    pings.push(ping);
}

window.derjynField = {
    // A ring from a point, blocked and reflected by the page's boxes: a click.
    impulse(x, y, strength = 1) {
        if (active()) add(ring(x + scrollX, y + scrollY, clamp01(strength)));
    },
    // A one-way wave off a vertical edge at x, from y0 to y1; dir 1 travels right, -1 left.
    slap(x, y0, y1, dir, strength = 1) {
        if (!active()) return;
        add({ kind: "slap", x: x + scrollX, y0: y0 + scrollY, y1: y1 + scrollY, dir, age: 0, strength: clamp01(strength) });
    },
    // Leading edges of moving things as vertical lines { x, y0, y1, strength }; call every frame while moving.
    edges(list) {
        if (!active()) return;
        edges = list;
        edgesAt = performance.now();
    },
};

function repaint() {
    readColors();
    paintIdle();
    if (still) frame(performance.now());
}

resize();
readColors();
paintIdle();
addEventListener("resize", () => {
    resize();
    repaint();
});
document.addEventListener("derjyn:options", repaint);
prefs.darkQuery.addEventListener("change", repaint);

if (!still) {
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true });
    addEventListener("mousedown", onMouseDown);
}

requestAnimationFrame(frame);

// ]-]-] EOF ]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]
