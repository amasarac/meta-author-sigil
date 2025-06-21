
// === Echo Resonance Audio Engine ===
let audioCtx, source, loopNode;

function initAudioLoop(url) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    fetch(url)
        .then(res => res.arrayBuffer())
        .then(buf => audioCtx.decodeAudioData(buf))
        .then(audioBuffer => {
            source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = true;

            const gain = audioCtx.createGain();
            gain.gain.value = 0.6;

            source.connect(gain);
            gain.connect(audioCtx.destination);
            source.start(0);
        });
}
