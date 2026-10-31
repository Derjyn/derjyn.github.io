// ]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]
//   derjyn.github.io: Sound Effects
//   One short sound per background mode, played when a click makes a ripple,
//   only with Sound switched on in Config (off by default).
//   Web Audio: each file is fetched once and decoded once, and every play is
//   its own source, so rapid clicks overlap instead of cutting each other off.
// ]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]

// Stars borrows the field's sound until it has its own.
const FILES = { lattice: "../sfx/lattice.wav", field: "../sfx/field.wav", stars: "../sfx/field.wav" };
const VOLUME = 1; // the files carry their own loudness; this scales them all

let audio = null;
const decoded = {};

// Fetched at load so the first click doesn't wait on the network. Decoding needs an AudioContext, which
// browsers only start on a user gesture, so that waits for the first click.
const raw = Object.fromEntries(Object.entries(FILES).map(([name, file]) => [name,
    fetch(new URL(file, import.meta.url))
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .catch((err) => { console.warn(`derjyn: sound ${file} not loaded`, err); return null; }),
]));

function buffer(name) {
    decoded[name] ??= raw[name]
        .then((data) => data && audio.decodeAudioData(data))
        .catch((err) => { console.warn(`derjyn: sound ${FILES[name]} not decoded`, err); return null; });
    return decoded[name];
}

// Plays the named sound; quietly does nothing with Sound off, or if it isn't known, didn't load, or audio
// isn't allowed yet.
export async function play(name) {
    if (document.documentElement.dataset.sound !== "on" || !(name in FILES)) return;
    audio ??= new AudioContext();
    if (audio.state === "suspended") await audio.resume().catch(() => {});
    const buf = await buffer(name);
    if (!buf || audio.state !== "running") return;
    const source = audio.createBufferSource();
    const gain = audio.createGain();
    source.buffer = buf;
    gain.gain.value = VOLUME;
    source.connect(gain).connect(audio.destination);
    source.start();
}

// ]-]-] EOF ]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]-]
