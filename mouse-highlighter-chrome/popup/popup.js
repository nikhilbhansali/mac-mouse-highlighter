/**
 * Popup Script - Quick settings UI for Mouse Highlighter
 */

document.addEventListener("DOMContentLoaded", async () => {
  // Get current settings
  const { settings } = await chrome.runtime.sendMessage({ type: "GET_SETTINGS" });

  // Initialize UI with current settings
  initializeUI(settings);

  // Set up event listeners
  setupEventListeners();
});

function initializeUI(settings) {
  // Enable toggle
  const enableToggle = document.getElementById("enableToggle");
  enableToggle.checked = settings.enabled;
  document.body.classList.toggle("disabled", !settings.enabled);

  // Highlight style
  document.querySelectorAll(".style-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.style === settings.highlightStyle);
  });

  // Size slider
  const sizeSlider = document.getElementById("sizeSlider");
  sizeSlider.value = settings.highlightSize;
  document.getElementById("sizeValue").textContent = `${settings.highlightSize}px`;

  // Color picker
  const colorPicker = document.getElementById("colorPicker");
  colorPicker.value = colorToHex(settings.highlightColor);

  // Opacity slider
  const opacitySlider = document.getElementById("opacitySlider");
  opacitySlider.value = settings.highlightOpacity * 100;
  document.getElementById("opacityValue").textContent = `${Math.round(settings.highlightOpacity * 100)}%`;

  // Click effects
  const clickEffectToggle = document.getElementById("clickEffectToggle");
  clickEffectToggle.checked = settings.clickEffectEnabled;
  updateEffectGridState(settings.clickEffectEnabled);

  document.querySelectorAll(".effect-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.effect === settings.clickEffectStyle);
  });
}

function setupEventListeners() {
  // Enable toggle
  document.getElementById("enableToggle").addEventListener("change", async (e) => {
    const enabled = e.target.checked;
    document.body.classList.toggle("disabled", !enabled);
    await chrome.runtime.sendMessage({ type: "TOGGLE_ENABLED", enabled });
  });

  // Style buttons
  document.querySelectorAll(".style-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      document.querySelectorAll(".style-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      await saveSettings({ highlightStyle: btn.dataset.style });
    });
  });

  // Size slider
  const sizeSlider = document.getElementById("sizeSlider");
  sizeSlider.addEventListener("input", (e) => {
    document.getElementById("sizeValue").textContent = `${e.target.value}px`;
  });
  sizeSlider.addEventListener("change", async (e) => {
    await saveSettings({ highlightSize: parseInt(e.target.value) });
  });

  // Color picker
  document.getElementById("colorPicker").addEventListener("change", async (e) => {
    const color = hexToColor(e.target.value, 0.6);
    await saveSettings({ highlightColor: color, clickEffectColor: { ...color, a: 0.8 } });
  });

  // Opacity slider
  const opacitySlider = document.getElementById("opacitySlider");
  opacitySlider.addEventListener("input", (e) => {
    document.getElementById("opacityValue").textContent = `${e.target.value}%`;
  });
  opacitySlider.addEventListener("change", async (e) => {
    await saveSettings({ highlightOpacity: parseInt(e.target.value) / 100 });
  });

  // Click effect toggle
  document.getElementById("clickEffectToggle").addEventListener("change", async (e) => {
    const enabled = e.target.checked;
    updateEffectGridState(enabled);
    await saveSettings({ clickEffectEnabled: enabled });
  });

  // Effect buttons
  document.querySelectorAll(".effect-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      document.querySelectorAll(".effect-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      await saveSettings({ clickEffectStyle: btn.dataset.effect });
    });
  });

  // Open options page
  document.getElementById("openOptions").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
}

function updateEffectGridState(enabled) {
  document.querySelectorAll(".effect-btn").forEach((btn) => {
    btn.disabled = !enabled;
  });
}

async function saveSettings(settings) {
  await chrome.runtime.sendMessage({ type: "SAVE_SETTINGS", settings });
}

// Helper functions
function colorToHex(colorObj) {
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(colorObj.r)}${toHex(colorObj.g)}${toHex(colorObj.b)}`;
}

function hexToColor(hex, alpha = 1) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: alpha,
    };
  }
  return { r: 255, g: 214, b: 10, a: alpha };
}
