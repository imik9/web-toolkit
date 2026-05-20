(() => {
  const state = {
    magnifier: false,
    reading: false,
    contrast: false,
    night: false,
    ruler: false,
    links: false,
    hideImages: false,
    readingLine: false,
    zoom: 2.25,
    speed: 1,
    color: null,
  };

  let magnifier;
  let ruler;
  let readingLine;

  function ensureOverlays() {
    if (!magnifier) {
      magnifier = document.createElement("div");
      magnifier.id = "web-toolkit-magnifier";
      magnifier.setAttribute("aria-hidden", "true");
      document.documentElement.append(magnifier);
    }

    if (!ruler) {
      ruler = document.createElement("div");
      ruler.id = "web-toolkit-ruler";
      ruler.setAttribute("aria-hidden", "true");
      document.documentElement.append(ruler);
    }

    if (!readingLine) {
      readingLine = document.createElement("div");
      readingLine.id = "web-toolkit-reading-line";
      readingLine.setAttribute("aria-hidden", "true");
      document.documentElement.append(readingLine);
    }
  }

  function setVideoSpeed(speed) {
    state.speed = Number(speed);
    document.querySelectorAll("video").forEach((video) => {
      video.playbackRate = state.speed;
    });
  }

  function updateClasses() {
    document.documentElement.classList.toggle("web-toolkit-reading", state.reading);
    document.documentElement.classList.toggle("web-toolkit-contrast", state.contrast);
    document.documentElement.classList.toggle("web-toolkit-night", state.night);
    document.documentElement.classList.toggle("web-toolkit-highlight-links", state.links);
    document.documentElement.classList.toggle("web-toolkit-hide-images", state.hideImages);
  }

  function updateOverlays() {
    ensureOverlays();
    magnifier.classList.toggle("web-toolkit-visible", state.magnifier);
    magnifier.dataset.zoom = `${state.zoom.toFixed(2)}x`;
    ruler.classList.toggle("web-toolkit-visible", state.ruler);
    ruler.dataset.width = `${window.innerWidth}px`;
    readingLine.classList.toggle("web-toolkit-visible", state.readingLine);
  }

  function moveMagnifier(event) {
    if (!state.magnifier) {
      return;
    }

    ensureOverlays();
    magnifier.style.left = `${event.clientX}px`;
    magnifier.style.top = `${event.clientY}px`;
    magnifier.style.width = `${Math.round(120 + state.zoom * 22)}px`;
    magnifier.style.height = `${Math.round(120 + state.zoom * 22)}px`;
  }

  async function pickColor() {
    if (!("EyeDropper" in window)) {
      return { ok: false, error: "Color picker is not supported on this page" };
    }

    try {
      const result = await new EyeDropper().open();
      state.color = result.sRGBHex;
      return { ok: true, color: result.sRGBHex };
    } catch {
      return { ok: false, error: "Color picking cancelled" };
    }
  }

  function snapshot() {
    return {
      ...state,
      videos: document.querySelectorAll("video").length,
    };
  }

  function reset() {
    state.magnifier = false;
    state.reading = false;
    state.contrast = false;
    state.night = false;
    state.ruler = false;
    state.links = false;
    state.hideImages = false;
    state.readingLine = false;
    state.zoom = 2.25;
    setVideoSpeed(1);
    updateClasses();
    updateOverlays();
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || message.source !== "web-toolkit") {
      return false;
    }

    if (message.type === "get-state") {
      sendResponse({ ok: true, state: snapshot() });
      return false;
    }

    if (message.type === "toggle") {
      state[message.tool] = !state[message.tool];
      updateClasses();
      updateOverlays();
      sendResponse({ ok: true, state: snapshot() });
      return false;
    }

    if (message.type === "set-speed") {
      setVideoSpeed(message.value);
      sendResponse({ ok: true, state: snapshot() });
      return false;
    }

    if (message.type === "set-zoom") {
      state.zoom = Number(message.value);
      updateOverlays();
      sendResponse({ ok: true, state: snapshot() });
      return false;
    }

    if (message.type === "pick-color") {
      pickColor().then((result) => sendResponse({ ...result, state: snapshot() }));
      return true;
    }

    if (message.type === "scroll-top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      sendResponse({ ok: true, state: snapshot() });
      return false;
    }

    if (message.type === "reset") {
      reset();
      sendResponse({ ok: true, state: snapshot() });
      return false;
    }

    sendResponse({ ok: false, error: "Unknown Web Toolkit command" });
    return false;
  });

  window.addEventListener("mousemove", moveMagnifier, { passive: true });
  window.addEventListener("resize", updateOverlays);
  document.addEventListener("play", () => setVideoSpeed(state.speed), true);
  ensureOverlays();
})();
