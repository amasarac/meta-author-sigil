
// RAEE Glyph Audio Engine (Tone.js-based)
import * as Tone from 'https://cdn.jsdelivr.net/npm/tone@next/+esm';

export const glyphMap = {
    "🜍": { freq: 216.35, effect: "lowpass" },
    "𓂀": { freq: 243.00, effect: "phaser" },
    "🜚": { freq: 272.11, effect: "tremolo" },
    "⟁": { freq: 305.42, effect: "echo" },
    "⚛": { freq: 342.88, effect: "chorus" },
    "🜂✨": { freq: 386.44, effect: "granular" }
};

export function triggerGlyphTone(glyph) {
    const { freq, effect } = glyphMap[glyph] || {};
    if (!freq) return;

    const synth = new Tone.Oscillator(freq, "sine").toDestination();

    switch(effect) {
        case "lowpass":
            synth.connect(new Tone.Filter(800, "lowpass").toDestination());
            break;
        case "phaser":
            synth.connect(new Tone.Phaser().toDestination());
            break;
        case "tremolo":
            const tremolo = new Tone.Tremolo(0.618, 0.5).toDestination().start();
            synth.connect(tremolo);
            break;
        case "echo":
            synth.connect(new Tone.FeedbackDelay("8n", 0.5).toDestination());
            break;
        case "chorus":
            synth.connect(new Tone.Chorus(4, 2.5, 0.5).toDestination().start());
            break;
        case "granular":
            const noise = new Tone.Noise("brown").start();
            noise.connect(new Tone.Filter(1000, "highpass").toDestination());
            break;
    }

    synth.start();
    setTimeout(() => synth.stop(), 2);
}
