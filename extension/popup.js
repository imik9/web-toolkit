const statusEl = document.querySelector("#status");
const speedRange = document.querySelector("#speedRange");
const speedValue = document.querySelector("#speedValue");
const zoomRange = document.querySelector("#zoomRange");
const zoomValue = document.querySelector("#zoomValue");

const stateEls = {
  magnifier: document.querySelector("#magnifierState"),
  reading: document.querySelector("#readingState"),
  contrast: document.querySelector("#contrastState"),
  night: document.querySelector("#nightState"),
  ruler: document.querySelector("#rulerState"),
  links: document.querySelector("#linksState"),
  hideImages: document.querySelector("#hideImagesState"),
  readingLine: document.querySelector("#readingLineState"),
};

function setStatus(text) {
  statusEl.textContent = text;
}

function formatSpeed(value) {
  return `${Number(value).toFixed(2)}x`;
}

function formatZoom(value) {
  return `${Number(value).toFixed(2)}x`;
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function send(message) {
  const tab = await getActiveTab();

  if (!tab?.id) {
    throw new Error("No active tab found");
  }

  return chrome.tabs.sendMessage(tab.id, {
    source: "web-toolkit",
    ...message,
  });
}

function render(state) {
  Object.entries(stateEls).forEach(([key, element]) => {
    element.textContent = state[key] ? "On" : "Off";
  });

  speedRange.value = String(state.speed);
  speedValue.textContent = formatSpeed(state.speed);
  zoomRange.value = String(state.zoom);
  zoomValue.textContent = formatZoom(state.zoom);

  if (state.color) {
    document.querySelector("#colorValue").textContent = state.color;
  }
}

async function sync() {
  try {
    const response = await send({ type: "get-state" });
    render(response.state);
    setStatus("Ready");
  } catch {
    setStatus("Refresh this tab, then open Web Toolkit again");
  }
}

document.querySelectorAll("[data-toggle]").forEach((button) => {
  button.addEventListener("click", async () => {
    const tool = button.dataset.toggle;
    const response = await send({ type: "toggle", tool });
    render(response.state);
    setStatus(`${button.querySelector("span").textContent} ${response.state[tool] ? "enabled" : "disabled"}`);
  });
});

document.querySelectorAll("[data-speed]").forEach((button) => {
  button.addEventListener("click", async () => {
    const response = await send({ type: "set-speed", value: button.dataset.speed });
    render(response.state);
    setStatus(`Video speed set to ${formatSpeed(response.state.speed)}`);
  });
});

speedRange.addEventListener("input", async () => {
  speedValue.textContent = formatSpeed(speedRange.value);
  const response = await send({ type: "set-speed", value: speedRange.value });
  render(response.state);
});

zoomRange.addEventListener("input", async () => {
  zoomValue.textContent = formatZoom(zoomRange.value);
  const response = await send({ type: "set-zoom", value: zoomRange.value });
  render(response.state);
});

document.querySelector("#pickColor").addEventListener("click", async () => {
  const response = await send({ type: "pick-color" });
  render(response.state);
  setStatus(response.ok ? `Picked ${response.color}` : response.error);
});

document.querySelector("#resetButton").addEventListener("click", async () => {
  const response = await send({ type: "reset" });
  render(response.state);
  setStatus("Current tab reset");
});

document.querySelector("#scrollTop").addEventListener("click", async () => {
  const response = await send({ type: "scroll-top" });
  render(response.state);
  setStatus("Scrolled to top");
});

sync();
