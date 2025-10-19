
// === Echo Resonance Audio Engine ===
(function (global) {
    let audioCtx = null;
    let gainNode = null;
    let currentSource = null;
    let currentUrl = null;
    let currentBuffer = null;
    let gainValue = 0.6;
    let statusElement = null;

    function resolveElement(target) {
        if (!target && statusElement && statusElement.isConnected) {
            return statusElement;
        }

        if (typeof HTMLElement !== "undefined" && target instanceof HTMLElement) {
            statusElement = target;
            return statusElement;
        }

        if (typeof target === "string") {
            const elementById = document.getElementById(target);
            if (elementById) {
                statusElement = elementById;
                return statusElement;
            }
        }

        const existing = document.getElementById("audioStatus");
        if (existing) {
            statusElement = existing;
            return statusElement;
        }

        const activateButton = document.getElementById("startAudio");
        if (activateButton && activateButton.parentNode) {
            const statusNode = document.createElement("div");
            statusNode.id = "audioStatus";
            statusNode.style.marginTop = "6px";
            statusNode.style.fontSize = "12px";
            statusNode.style.fontFamily = "monospace";
            statusNode.style.color = "#8ae9ff";
            activateButton.parentNode.insertBefore(statusNode, activateButton.nextSibling);
            statusElement = statusNode;
            return statusElement;
        }

        return null;
    }

    function updateStatus(message, isError = false, target) {
        const element = resolveElement(target);
        if (!element) return;
        element.textContent = message;
        element.style.color = isError ? "#ff6b6b" : "#8ae9ff";
    }

    function disposeSource() {
        if (!currentSource) return;
        try {
            currentSource.stop(0);
        } catch (err) {
            // Safari throws if stop() is called on an already stopped node.
        }
        try {
            currentSource.disconnect();
        } catch (err) {
            // Ignore disconnect errors.
        }
        currentSource = null;
    }

    async function initAudioLoop(url, { statusTarget } = {}) {
        if (!audioCtx) {
            const error = new Error("Audio context is not initialized. Call start() in response to a user gesture.");
            updateStatus(error.message, true, statusTarget);
            throw error;
        }

        if (!url) {
            const error = new Error("A loop URL must be provided.");
            updateStatus(error.message, true, statusTarget);
            throw error;
        }

        if (!gainNode) {
            gainNode = audioCtx.createGain();
            gainNode.gain.value = gainValue;
            gainNode.connect(audioCtx.destination);
        }

        disposeSource();
        updateStatus("Loading harmonic resonance…", false, statusTarget);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Network error (${response.status})`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = true;
            source.connect(gainNode);
            source.start(0);

            currentSource = source;
            currentUrl = url;
            currentBuffer = audioBuffer;
            updateStatus("Harmonic engine active.", false, statusTarget);

            return audioBuffer;
        } catch (error) {
            disposeSource();
            updateStatus(`Audio error: ${error.message || error}`, true, statusTarget);
            console.error("AudioResonanceEngine failed to initialize the loop", error);
            throw error;
        }
    }

    async function start(options = {}) {
        if (typeof options === "string") {
            options = { url: options };
        }

        const { url = currentUrl, gain, statusTarget } = options;
        if (!url) {
            const error = new Error("No audio URL specified for start().");
            updateStatus(error.message, true, statusTarget);
            throw error;
        }

        updateStatus("Activating harmonic engine…", false, statusTarget);

        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === "suspended") {
                await audioCtx.resume();
            }
        } catch (error) {
            updateStatus(`Audio context error: ${error.message || error}`, true, statusTarget);
            throw error;
        }

        if (!gainNode) {
            gainNode = audioCtx.createGain();
            gainNode.connect(audioCtx.destination);
        }

        if (typeof gain === "number" && !Number.isNaN(gain)) {
            setGain(gain);
        } else {
            gainNode.gain.value = gainValue;
        }

        return initAudioLoop(url, { statusTarget });
    }

    async function stop({ suspend = true, statusTarget } = {}) {
        disposeSource();
        updateStatus("Harmonic engine paused.", false, statusTarget);

        if (audioCtx && suspend && typeof audioCtx.suspend === "function") {
            try {
                await audioCtx.suspend();
            } catch (error) {
                console.warn("AudioResonanceEngine was unable to suspend the audio context", error);
            }
        }
    }

    function setGain(value) {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
            throw new Error("Gain must be a finite number.");
        }

        gainValue = numericValue;

        if (gainNode) {
            gainNode.gain.value = gainValue;
        }

        return gainValue;
    }

    function setStatusTarget(target) {
        resolveElement(target);
    }

    function getState() {
        return {
            context: audioCtx,
            gainNode,
            currentSource,
            currentUrl,
            currentBuffer,
            gainValue,
        };
    }

    const engine = {
        initAudioLoop,
        start,
        stop,
        setGain,
        setStatusTarget,
        getState,
    };

    global.AudioResonanceEngine = engine;
})(window);
