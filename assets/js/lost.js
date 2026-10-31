// ]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]
//   derjyn.github.io: Signal Lost
//   Fills the 404 page's readout with the requested address and, for a path
//   from D3 Labs (the site from 2016 to 2026), links its new home in Legacy.
// ]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]

// D3 Labs served these from the root; they moved whole into /legacy/d3-labs/.
const D3_LABS = /^\/(works\/.+|humans\.txt|assets\/(?:d3\.css|d3\.js|joystix\.otf|jquery\.idTabs\.min\.js|jquery\.min\.js|starfield\.js))$/;

function decoded(raw) {
    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
}

const path = decoded(location.pathname);
document.querySelector("[data-requested]").textContent = path;

const old = path.match(D3_LABS);
if (old) {
    const moved = document.querySelector("[data-moved]");
    const link = moved.querySelector("a");
    link.href = `/legacy/d3-labs/${old[1]}`;
    link.textContent = link.pathname;
    moved.hidden = false;
}

// ]-]-] EOF ]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]
