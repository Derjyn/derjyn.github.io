// ]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]
//   derjyn.github.io: Site Behavior
//   The options flyout, the article panel, the poster strips and dialogs,
//   and the lit nav key. Everything here is an enhancement: without it, every link still
//   goes somewhere real.
// ]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]

const prefs = window.derjynPrefs;

// |>|>|>|>|>|>-- OPTIONS ------------------------------------------------------

// A disclosure button and panel; the controls only work with JavaScript, so both start hidden.
function initOptions() {
    const toggle = document.querySelector(".options-toggle");
    const panel = document.getElementById("options");
    if (!toggle || !panel) return;

    const opts = prefs.read();
    for (const [name, value] of Object.entries(opts)) {
        const input = panel.querySelector(`[name="${name}"][value="${value}"]`);
        if (input) input.checked = true;
    }
    for (const box of panel.querySelectorAll('[type="checkbox"]')) box.checked = opts[box.name] === "on";

    panel.addEventListener("change", (e) => {
        const { name, value, checked, type } = e.target;
        opts[name] = type === "checkbox" ? (checked ? "on" : "off") : value;
        prefs.apply(opts);
        prefs.save(opts);
        document.dispatchEvent(new CustomEvent("derjyn:options"));
    });

    const setOpen = (open) => {
        toggle.setAttribute("aria-expanded", String(open));
        panel.hidden = !open;
    };
    toggle.addEventListener("click", () => setOpen(panel.hidden));
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !panel.hidden) {
            setOpen(false);
            toggle.focus();
        }
    });
    document.addEventListener("click", (e) => {
        if (!panel.hidden && !panel.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    toggle.hidden = false;
}

// |>|>|>|>|>|>-- ARTICLE PANEL ------------------------------------------------

// Article files are whole pages with h1 titles; inside the panel they sit under the section's h2.
function demoteHeadings(article, by) {
    for (const old of article.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
        const level = Math.min(6, Number(old.tagName[1]) + by);
        const heading = document.createElement(`h${level}`);
        heading.append(...old.childNodes);
        for (const attr of old.attributes) heading.setAttribute(attr.name, attr.value);
        old.replaceWith(heading);
    }
}

// Relative links and images inside an article are relative to its file, not to the home page.
function rebaseUrls(article, base) {
    for (const el of article.querySelectorAll("[src], [href]")) {
        const attr = el.hasAttribute("src") ? "src" : "href";
        const value = el.getAttribute(attr);
        if (!value.startsWith("#")) el.setAttribute(attr, new URL(value, base).href);
    }
}

async function fetchArticle(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const doc = new DOMParser().parseFromString(await response.text(), "text/html");
    const article = doc.querySelector("main article");
    if (!article) throw new Error("no <article> in the file");
    return document.importNode(article, true);
}

function initArticles() {
    const reader = document.getElementById("reader");
    const links = [...document.querySelectorAll(".article-list a[data-slug]")];
    if (!reader || links.length === 0) return;
    const bySlug = new Map(links.map((a) => [a.dataset.slug, a]));

    async function show(link, { focus }) {
        for (const a of links) a.removeAttribute("aria-current");
        link.setAttribute("aria-current", "true");
        reader.setAttribute("aria-busy", "true");
        try {
            const article = await fetchArticle(link.href);
            demoteHeadings(article, 2);
            rebaseUrls(article, link.href);
            reader.replaceChildren(article);
            const title = article.querySelector("h3");
            if (title && focus) {
                title.tabIndex = -1;
                title.focus();
            }
        } catch (err) {
            console.error(`derjyn: could not load ${link.href}`, err);
            const p = document.createElement("p");
            p.append("This article didn't load here. ");
            const a = Object.assign(document.createElement("a"), { href: link.href, textContent: "Open it on its own page." });
            p.append(a);
            reader.replaceChildren(p);
        } finally {
            reader.removeAttribute("aria-busy");
        }
    }

    const fromHash = () => bySlug.get(decodeURIComponent(location.hash.slice(1)));

    for (const link of links) {
        link.addEventListener("click", (e) => {
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            history.pushState(null, "", `#${link.dataset.slug}`);
            show(link, { focus: true });
        });
    }
    // Back and forward between articles swap the panel; a section jump (#projects) leaves it alone.
    addEventListener("popstate", () => {
        const link = fromHash() || (location.hash ? null : links[0]);
        if (link && link.getAttribute("aria-current") !== "true") show(link, { focus: false });
    });

    const deepLink = fromHash();
    show(deepLink || links[0], { focus: false });
    if (deepLink) reader.closest("section").scrollIntoView();
}

// |>|>|>|>|>|>-- POSTER DIALOGS -----------------------------------------------

// A poster links to its project or its download; with JavaScript it opens its dialog instead.
function initProjects() {
    for (const opener of document.querySelectorAll("[data-dialog]")) {
        const dialog = document.getElementById(opener.dataset.dialog);
        if (!dialog) continue;
        opener.addEventListener("click", (e) => {
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            dialog.showModal();
        });
    }
    // A click on the backdrop lands on the dialog itself, outside its padding box: close it.
    for (const dialog of document.querySelectorAll("dialog")) {
        dialog.addEventListener("click", (e) => {
            if (e.target !== dialog) return;
            const box = dialog.getBoundingClientRect();
            const inside = e.clientX >= box.left && e.clientX <= box.right && e.clientY >= box.top && e.clientY <= box.bottom;
            if (!inside) dialog.close();
        });
    }
}

// |>|>|>|>|>|>-- POSTER STRIPS ------------------------------------------------

// The strip's motion makes waves in the background: while it slides, each poster's leading edge drags a
// wake through the gaps; when it settles, the strip's edge slaps one wave out the way it was going, as strong
// as the move was fast.
const WAKE_SPEED = 3000;   // px per second that counts as full strength
const SETTLE_MS = 140;     // no scrolling for this long means it stopped (scrollend isn't widely available)
// Forward (Next) moves the posters left, so the slap goes left: the wave follows the posters.
const SLAP_WITH_VIEW = -1;

function stripWake(strip, items) {
    let lastLeft = strip.scrollLeft;
    let lastTime = performance.now();
    let peak = 0;
    let heading = 0;
    let timer = 0;
    const rects = () => items.map((li) => li.getBoundingClientRect());

    function settle() {
        const strength = Math.min(1, peak / WAKE_SPEED) * 0.8;
        peak = 0;
        const field = window.derjynField;
        if (!field || strength < 0.08 || heading === 0) return;
        const box = strip.getBoundingClientRect();
        const poster = rects()[0];
        const dir = heading * SLAP_WITH_VIEW;
        field.slap(dir > 0 ? box.right : box.left, poster.top, poster.bottom, dir, strength);
    }

    return function wake() {
        const now = performance.now();
        const speed = (strip.scrollLeft - lastLeft) / (Math.max(1, now - lastTime) / 1000);
        lastLeft = strip.scrollLeft;
        lastTime = now;
        peak = Math.max(peak, Math.abs(speed));
        if (Math.abs(speed) > 20) heading = Math.sign(speed);
        clearTimeout(timer);
        timer = setTimeout(settle, SETTLE_MS);
        const field = window.derjynField;
        if (!field || Math.abs(speed) < 20) return;
        // Scrolling forward moves the posters left, so their left edges lead.
        const box = strip.getBoundingClientRect();
        const strength = Math.min(1, Math.abs(speed) / WAKE_SPEED);
        const lead = rects().map((r) => ({ x: speed > 0 ? r.left : r.right, y0: r.top, y1: r.bottom, strength }));
        field.edges(lead.filter((e) => e.x > box.left && e.x < box.right));
    };
}

// Keys and a lamp per poster replace the native scrollbar; swipes, Shift+wheel and Tab still scroll it.
function initStrip(ctl) {
    const strip = document.getElementById(ctl.querySelector("[aria-controls]").getAttribute("aria-controls"));
    if (!strip) return;
    const items = [...strip.children];
    const track = ctl.querySelector(".strip-track");
    const count = ctl.querySelector(".strip-count");
    const prev = ctl.querySelector(".strip-prev");
    const next = ctl.querySelector(".strip-next");
    const lamps = items.map(() => track.appendChild(document.createElement("i")));
    const pad = (n) => String(n).padStart(2, "0");
    const smooth = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

    function update() {
        const left = strip.scrollLeft;
        const right = left + strip.clientWidth;
        const shown = items.map((li) => li.offsetLeft + li.offsetWidth / 2 >= left && li.offsetLeft + li.offsetWidth / 2 <= right);
        shown.forEach((on, i) => lamps[i].classList.toggle("on", on));
        const first = shown.indexOf(true) + 1;
        const last = shown.lastIndexOf(true) + 1;
        count.textContent = `${pad(first)}–${pad(last)} / ${pad(items.length)}`;
        prev.disabled = left <= 1;
        next.disabled = right >= strip.scrollWidth - 1;
        ctl.hidden = strip.scrollWidth <= strip.clientWidth + 1;
    }

    // One page is every poster in view plus the gap after the last: the posters exactly fill the box.
    function step(dir) {
        const css = getComputedStyle(strip);
        const padding = parseFloat(css.paddingInlineStart) + parseFloat(css.paddingInlineEnd);
        const page = strip.clientWidth - padding + parseFloat(css.columnGap);
        strip.scrollBy({ left: dir * page, behavior: smooth });
    }
    prev.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step(1));
    const wake = stripWake(strip, items);
    let queued = false;
    strip.addEventListener("scroll", () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => { queued = false; update(); wake(); });
    }, { passive: true });
    new ResizeObserver(update).observe(strip);
    strip.parentElement.classList.add("strip-enhanced");
    update();
}

// |>|>|>|>|>|>-- NAV KEYS -----------------------------------------------------

// The key of the section in view lights up, and the system path names it.
function initNavKeys() {
    const keys = [...document.querySelectorAll(".topbar nav a[href^='#']")];
    const path = document.querySelector(".topbar .path");
    const sections = keys.map((a) => document.querySelector(a.hash)).filter(Boolean);
    if (sections.length === 0) return;

    const light = (id) => {
        for (const a of keys) {
            if (a.hash === `#${id}`) a.setAttribute("aria-current", "location");
            else a.removeAttribute("aria-current");
        }
        if (path) path.textContent = id ? `derjyn // ${id}` : "derjyn // index";
    };
    const observer = new IntersectionObserver((entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (seen.length) light(seen[0].target.id);
        else if (scrollY < sections[0].offsetTop / 2) light("");
    }, { rootMargin: "-30% 0px -60% 0px" });
    for (const s of sections) observer.observe(s);
}

initOptions();
initArticles();
initProjects();
for (const ctl of document.querySelectorAll(".strip-ctl")) initStrip(ctl);
initNavKeys();

// ]-]-] EOF ]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]
