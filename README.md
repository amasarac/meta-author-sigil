# Cognitive Glass — MFSA Package

This archive contains a small interactive suite for exploring **Lexeme Tone Mapping** using the Cognitive Glass + MFSA approach.

## Files
- `cognitive_glass_player.html` — Lexeme Tone Player (v1.1): binaural, isochronic, spatializer, sweep, eigen-mapper hooks.
- `lexeme_tone_mapper.html` — Resonance Map visualizer (log-frequency axis, unified lower + THz ladder).
- `eigen_map.json` — The unified resonance map (lower ladder + THz lattice) used by the mapper and player.
- `README.md` — This file.

## How to use
1. Unzip the package and open `lexeme_tone_mapper.html` and `cognitive_glass_player.html` in a modern browser (Chrome, Edge, Firefox).
2. In the player, use the **Import** control to load `eigen_map.json`. This will populate the lexeme mapper with the unified eigenfrequency nodes.
3. Use **Start Sweep** in the mapper to listen through the ladder. For very-high nodes (kHz–THz) the mapper plays audible heterodyne proxies so you can feel the relationship — these are subjective proxies, not literal THz audio.

## Microphone-based Automatic Peak Detection (optional)
The player includes a commented-in analyzer routine for microphone peak detection. To enable it:

1. Open `cognitive_glass_player.html` in a text editor.
2. Find the function `enableMicPeakDetection()` (search for the comment `// MIC PEAK DETECTION`).
3. Uncomment the body of that function and the call-site (there is a single `/* */` block noted with instructions).
4. Reload the page and allow microphone access when prompted.
5. The routine will create an `AnalyserNode`, compute an average spectral envelope, and attempt to detect peaks — when it detects a strong local peak you can choose to mark that Hz as a resonance in the Mapper.

**Notes & safety**: Microphone-based detection is noisy in uncontrolled environments. Use headphones and a quiet room for best results. The detection routine is conservative to avoid false marks; you can adjust thresholds in the function after testing.

## GitHub Pages
To host the package on GitHub Pages:
- Create a new repo, push these files to the `main` branch, and enable Pages from the repository settings (use `/` root directory).
- The files are static and will serve directly.

## Next steps I implemented for you
- Integrated a standalone `eigen_map.json` with canonical nodes spanning Hz → THz.
- The mapper supports manual marking (and a simple "Auto-Mark" flow where you press SPACE during a sweep to register resonance).
- The player includes binaural/isocronic/spatializer options and a sweep + eigen-map import.

If you want, I can now:
- Edit `cognitive_glass_player.html` to fully enable the microphone peak-detector code and tune thresholds for you, then repackage an updated ZIP.
- Add a small serverless `deploy.sh` script that initializes a GitHub Pages repo (you'd still need to run it locally with your credentials).
- Create a short README walkthrough video (I can produce an animated HTML walkthrough file).

Which would you prefer next?
