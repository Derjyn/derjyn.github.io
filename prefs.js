// ]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]
//   derjyn.github.io: Saved Options
//   Loaded in the head, before the page draws, so a saved theme never flashes
//   the wrong one. Sets data-scheme, data-bg, data-fx and data-sound on <html>.
// ]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]

(() => {
    const KEY = "derjyn-options";
    const ALLOWED = {
        scheme: ["system", "light", "dark"],
        bg: ["lattice", "field", "off"],
        fx: ["on", "off"],
        sound: ["on", "off"],
    };
    const DEFAULTS = { scheme: "system", bg: "lattice", fx: "on", sound: "off" };
    const root = document.documentElement;
    const darkQuery = matchMedia("(prefers-color-scheme: dark)");

    function read() {
        let saved = {};
        try {
            saved = JSON.parse(localStorage.getItem(KEY)) || {};
        } catch (err) {
            console.warn("derjyn: saved options unreadable, using defaults", err);
        }
        const opts = { ...DEFAULTS };
        for (const name of Object.keys(ALLOWED)) {
            if (ALLOWED[name].includes(saved[name])) opts[name] = saved[name];
        }
        return opts;
    }

    function apply(opts) {
        if (opts.scheme === "system") delete root.dataset.scheme;
        else root.dataset.scheme = opts.scheme;
        root.dataset.bg = opts.bg;
        root.dataset.fx = opts.fx;
        root.dataset.sound = opts.sound;
    }

    function save(opts) {
        try {
            localStorage.setItem(KEY, JSON.stringify(opts));
        } catch (err) {
            console.warn("derjyn: options not saved", err);
        }
    }

    function isDark() {
        const scheme = root.dataset.scheme;
        return scheme ? scheme === "dark" : darkQuery.matches;
    }

    apply(read());
    window.derjynPrefs = { ALLOWED, read, apply, save, isDark, darkQuery };
})();

// ]-]-] EOF ]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]
