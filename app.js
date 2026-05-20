const state = {
  magnifier: false,
  reading: false,
  contrast: false,
  ruler: false,
  zoom: 2.25,
  speed: 1,
};

const elements = {
  magnifierToggle: document.querySelector("#magnifierToggle"),
  readingToggle: document.querySelector("#readingToggle"),
  contrastToggle: document.querySelector("#contrastToggle"),
  rulerToggle: document.querySelector("#rulerToggle"),
  zoomRange: document.querySelector("#zoomRange"),
  zoomValue: document.querySelector("#zoomValue"),
  speedRange: document.querySelector("#speedRange"),
  speedValue: document.querySelector("#speedValue"),
  speedMetric: document.querySelector("#speedMetric"),
  zoomMetric: document.querySelector("#zoomMetric"),
  activeTools: document.querySelector("#activeTools"),
  statusText: document.querySelector("#statusText"),
  sampleVideo: document.querySelector("#sampleVideo"),
  magnifier: document.querySelector("#magnifier"),
  ruler: document.querySelector("#ruler"),
  colorButton: document.querySelector("#colorButton"),
  colorSwatch: document.querySelector("#colorSwatch"),
  colorValue: document.querySelector("#colorValue"),
  resetButton: document.querySelector("#resetButton"),
};

function rebuildMagnifierContent() {
  const headerClone = document.querySelector(".app-header").cloneNode(true);
  const workspaceClone = document.querySelector(".workspace").cloneNode(true);
  const content = document.createElement("div");

  content.className = "magnifier-content";
  content.append(headerClone, workspaceClone);
  content.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
  content.querySelectorAll("[data-speed]").forEach((node) => node.removeAttribute("data-speed"));
  content.querySelectorAll("input, button, video").forEach((node) => {
    node.setAttribute("tabindex", "-1");
    node.setAttribute("aria-hidden", "true");
    node.setAttribute("disabled", "");
  });
  elements.magnifier.replaceChildren(content);
}

function formatSpeed(value) {
  return `${Number(value).toFixed(2)}x`;
}

function formatZoom(value) {
  return `${Number(value).toFixed(2)}x`;
}

function setStatus(message) {
  elements.statusText.textContent = message;
}

function countActiveTools() {
  return [state.magnifier, state.reading, state.contrast, state.ruler].filter(Boolean).length;
}

function updateMetrics() {
  elements.speedValue.textContent = formatSpeed(state.speed);
  elements.speedMetric.textContent = formatSpeed(state.speed);
  elements.zoomValue.textContent = formatZoom(state.zoom);
  elements.zoomMetric.textContent = formatZoom(state.zoom);
  elements.activeTools.textContent = String(countActiveTools());
}

function updateClasses() {
  document.body.classList.toggle("reading-mode", state.reading);
  document.body.classList.toggle("high-contrast", state.contrast);
  elements.ruler.classList.toggle("is-visible", state.ruler);
  elements.ruler.querySelector("span").textContent = `${window.innerWidth}px wide`;
}

function setSpeed(value) {
  state.speed = Number(value);
  elements.speedRange.value = String(state.speed);
  elements.sampleVideo.playbackRate = state.speed;
  updateMetrics();
  setStatus(`Video speed set to ${formatSpeed(state.speed)}`);
}

function setZoom(value) {
  state.zoom = Number(value);
  updateMetrics();
  setStatus(`Lens zoom set to ${formatZoom(state.zoom)}`);
}

function updateMagnifier(event) {
  if (!state.magnifier) {
    return;
  }

  const lens = elements.magnifier;
  const size = lens.offsetWidth;
  const radius = size / 2;
  const x = event.clientX;
  const y = event.clientY;
  const content = lens.querySelector(".magnifier-content");

  lens.style.left = `${x}px`;
  lens.style.top = `${y}px`;
  lens.style.transform = "translate(-50%, -50%)";
  lens.style.boxShadow = `0 16px 44px rgba(24, 32, 38, 0.34), inset 0 0 0 ${Math.max(12, size / 12)}px rgba(255,255,255,0.08)`;

  if (content) {
    content.style.transform = `translate(${radius - x * state.zoom}px, ${radius - y * state.zoom}px) scale(${state.zoom})`;
  }
}

function toggleMagnifier(enabled) {
  state.magnifier = enabled;
  if (enabled) {
    rebuildMagnifierContent();
  }
  elements.magnifier.classList.toggle("is-visible", enabled);
  updateMetrics();
  setStatus(enabled ? "Magnifier enabled" : "Magnifier disabled");
}

async function pickColor() {
  if (!("EyeDropper" in window)) {
    setStatus("Color picker is not supported in this browser");
    return;
  }

  try {
    const eyeDropper = new EyeDropper();
    const result = await eyeDropper.open();
    elements.colorSwatch.style.background = result.sRGBHex;
    elements.colorValue.textContent = result.sRGBHex;
    setStatus(`Picked ${result.sRGBHex}`);
  } catch {
    setStatus("Color picking cancelled");
  }
}

function resetTools() {
  Object.assign(state, {
    magnifier: false,
    reading: false,
    contrast: false,
    ruler: false,
    zoom: 2.25,
    speed: 1,
  });

  elements.magnifierToggle.checked = false;
  elements.readingToggle.checked = false;
  elements.contrastToggle.checked = false;
  elements.rulerToggle.checked = false;
  elements.zoomRange.value = "2.25";
  elements.speedRange.value = "1";
  elements.magnifier.classList.remove("is-visible");
  elements.magnifier.replaceChildren();
  setSpeed(1);
  updateClasses();
  updateMetrics();
  setStatus("Tools reset");
}

elements.magnifierToggle.addEventListener("change", (event) => toggleMagnifier(event.target.checked));
elements.readingToggle.addEventListener("change", (event) => {
  state.reading = event.target.checked;
  updateClasses();
  updateMetrics();
  setStatus(state.reading ? "Reading mode enabled" : "Reading mode disabled");
});
elements.contrastToggle.addEventListener("change", (event) => {
  state.contrast = event.target.checked;
  updateClasses();
  updateMetrics();
  setStatus(state.contrast ? "High contrast enabled" : "High contrast disabled");
});
elements.rulerToggle.addEventListener("change", (event) => {
  state.ruler = event.target.checked;
  updateClasses();
  updateMetrics();
  setStatus(state.ruler ? "Ruler enabled" : "Ruler disabled");
});
elements.zoomRange.addEventListener("input", (event) => setZoom(event.target.value));
elements.speedRange.addEventListener("input", (event) => setSpeed(event.target.value));
elements.colorButton.addEventListener("click", pickColor);
elements.resetButton.addEventListener("click", resetTools);
document.querySelectorAll("[data-speed]").forEach((button) => {
  button.addEventListener("click", () => setSpeed(button.dataset.speed));
});
window.addEventListener("mousemove", updateMagnifier);
window.addEventListener("resize", updateClasses);

updateClasses();
updateMetrics();
