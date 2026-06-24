/**
 * Options Page Script - Full settings UI for Mouse Highlighter
 */

const DEFAULT_SETTINGS = {
  enabled: true,
  highlightStyle: "circle",
  highlightSize: 40,
  highlightColor: { r: 255, g: 214, b: 10, a: 0.6 },
  highlightOpacity: 0.6,
  ringWidth: 3,
  ringGlowEnabled: true,
  ringGlowIntensity: 0.5,
  spotlightDimOpacity: 0.3,
  crosshairStyle: "plus",
  crosshairLineWidth: 2,
  crosshairLength: 20,
  pulseSpeed: "medium",
  pulseIntensity: "moderate",
  clickEffectEnabled: true,
  clickEffectStyle: "ripple",
  clickEffectDuration: 300,
  clickEffectColor: { r: 255, g: 214, b: 10, a: 0.8 },
  idleThreshold: 100,
};

let currentSettings = {};

document.addEventListener("DOMContentLoaded", async () => {
  const { settings } = await chrome.runtime.sendMessage({ type: "GET_SETTINGS" });
  currentSettings = { ...DEFAULT_SETTINGS, ...settings };

  initializeUI(currentSettings);
  setupEventListeners();
});

function initializeUI(settings) {
  // Enable toggle
  document.getElementById("enableToggle").checked = settings.enabled;

  // Highlight style
  document.querySelectorAll(".style-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.style === settings.highlightStyle);
    card.querySelector("input").checked = card.dataset.style === settings.highlightStyle;
  });
  updateStyleSpecificSections(settings.highlightStyle);

  // Appearance
  document.getElementById("sizeSlider").value = settings.highlightSize;
  document.getElementById("sizeValue").textContent = `${settings.highlightSize}px`;

  document.getElementById("colorPicker").value = colorToHex(settings.highlightColor);

  document.getElementById("opacitySlider").value = settings.highlightOpacity * 100;
  document.getElementById("opacityValue").textContent = `${Math.round(settings.highlightOpacity * 100)}%`;

  // Ring settings
  document.getElementById("ringWidthSlider").value = settings.ringWidth;
  document.getElementById("ringWidthValue").textContent = `${settings.ringWidth}px`;
  document.getElementById("ringGlowToggle").checked = settings.ringGlowEnabled;
  document.getElementById("glowIntensitySlider").value = settings.ringGlowIntensity * 100;
  document.getElementById("glowIntensityValue").textContent = `${Math.round(settings.ringGlowIntensity * 100)}%`;
  document.getElementById("glowIntensityRow").style.display = settings.ringGlowEnabled ? "flex" : "none";

  // Spotlight settings
  document.getElementById("dimOpacitySlider").value = settings.spotlightDimOpacity * 100;
  document.getElementById("dimOpacityValue").textContent = `${Math.round(settings.spotlightDimOpacity * 100)}%`;

  // Crosshair settings
  document.getElementById("crosshairStyleSelect").value = settings.crosshairStyle;
  document.getElementById("crosshairWidthSlider").value = settings.crosshairLineWidth;
  document.getElementById("crosshairWidthValue").textContent = `${settings.crosshairLineWidth}px`;
  document.getElementById("crosshairLengthSlider").value = settings.crosshairLength;
  document.getElementById("crosshairLengthValue").textContent = `${settings.crosshairLength}px`;

  // Pulse settings
  document.getElementById("pulseSpeedSelect").value = settings.pulseSpeed;
  document.getElementById("pulseIntensitySelect").value = settings.pulseIntensity;

  // Click effects
  document.getElementById("clickEffectToggle").checked = settings.clickEffectEnabled;
  document.getElementById("clickEffectStyleSelect").value = settings.clickEffectStyle;
  document.getElementById("clickDurationSlider").value = settings.clickEffectDuration;
  document.getElementById("clickDurationValue").textContent = `${settings.clickEffectDuration}ms`;
  updateClickEffectRows(settings.clickEffectEnabled);

  // Performance
  document.getElementById("idleThresholdSlider").value = settings.idleThreshold;
  document.getElementById("idleThresholdValue").textContent = `${settings.idleThreshold}ms`;
}

function setupEventListeners() {
  // Enable toggle
  document.getElementById("enableToggle").addEventListener("change", (e) => {
    saveSettings({ enabled: e.target.checked });
  });

  // Style cards
  document.querySelectorAll(".style-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".style-card").forEach((c) => {
        c.classList.remove("active");
        c.querySelector("input").checked = false;
      });
      card.classList.add("active");
      card.querySelector("input").checked = true;
      const style = card.dataset.style;
      updateStyleSpecificSections(style);
      saveSettings({ highlightStyle: style });
    });
  });

  // Appearance sliders
  setupSlider("sizeSlider", "sizeValue", "px", (val) => saveSettings({ highlightSize: val }));
  setupSlider("opacitySlider", "opacityValue", "%", (val) => saveSettings({ highlightOpacity: val / 100 }));

  document.getElementById("colorPicker").addEventListener("change", (e) => {
    const color = hexToColor(e.target.value, currentSettings.highlightOpacity);
    saveSettings({
      highlightColor: color,
      clickEffectColor: { ...color, a: 0.8 },
    });
  });

  // Ring settings
  setupSlider("ringWidthSlider", "ringWidthValue", "px", (val) => saveSettings({ ringWidth: val }));
  document.getElementById("ringGlowToggle").addEventListener("change", (e) => {
    document.getElementById("glowIntensityRow").style.display = e.target.checked ? "flex" : "none";
    saveSettings({ ringGlowEnabled: e.target.checked });
  });
  setupSlider("glowIntensitySlider", "glowIntensityValue", "%", (val) =>
    saveSettings({ ringGlowIntensity: val / 100 })
  );

  // Spotlight settings
  setupSlider("dimOpacitySlider", "dimOpacityValue", "%", (val) =>
    saveSettings({ spotlightDimOpacity: val / 100 })
  );

  // Crosshair settings
  document.getElementById("crosshairStyleSelect").addEventListener("change", (e) => {
    saveSettings({ crosshairStyle: e.target.value });
  });
  setupSlider("crosshairWidthSlider", "crosshairWidthValue", "px", (val) =>
    saveSettings({ crosshairLineWidth: val })
  );
  setupSlider("crosshairLengthSlider", "crosshairLengthValue", "px", (val) =>
    saveSettings({ crosshairLength: val })
  );

  // Pulse settings
  document.getElementById("pulseSpeedSelect").addEventListener("change", (e) => {
    saveSettings({ pulseSpeed: e.target.value });
  });
  document.getElementById("pulseIntensitySelect").addEventListener("change", (e) => {
    saveSettings({ pulseIntensity: e.target.value });
  });

  // Click effects
  document.getElementById("clickEffectToggle").addEventListener("change", (e) => {
    updateClickEffectRows(e.target.checked);
    saveSettings({ clickEffectEnabled: e.target.checked });
  });
  document.getElementById("clickEffectStyleSelect").addEventListener("change", (e) => {
    saveSettings({ clickEffectStyle: e.target.value });
  });
  setupSlider("clickDurationSlider", "clickDurationValue", "ms", (val) =>
    saveSettings({ clickEffectDuration: val })
  );

  // Performance
  setupSlider("idleThresholdSlider", "idleThresholdValue", "ms", (val) =>
    saveSettings({ idleThreshold: val })
  );

  // Reset button
  document.getElementById("resetBtn").addEventListener("click", async () => {
    if (confirm("Reset all settings to defaults?")) {
      await chrome.runtime.sendMessage({
        type: "SAVE_SETTINGS",
        settings: DEFAULT_SETTINGS,
      });
      currentSettings = { ...DEFAULT_SETTINGS };
      initializeUI(currentSettings);
    }
  });
}

function setupSlider(sliderId, valueId, suffix, onSave) {
  const slider = document.getElementById(sliderId);
  const valueLabel = document.getElementById(valueId);

  slider.addEventListener("input", (e) => {
    valueLabel.textContent = `${e.target.value}${suffix}`;
  });

  slider.addEventListener("change", (e) => {
    onSave(parseInt(e.target.value));
  });
}

function updateStyleSpecificSections(style) {
  // Hide all style-specific sections
  document.getElementById("ringSettings").style.display = "none";
  document.getElementById("spotlightSettings").style.display = "none";
  document.getElementById("crosshairSettings").style.display = "none";
  document.getElementById("pulseSettings").style.display = "none";

  // Show relevant section
  switch (style) {
    case "ring":
      document.getElementById("ringSettings").style.display = "block";
      break;
    case "spotlight":
      document.getElementById("spotlightSettings").style.display = "block";
      break;
    case "crosshair":
      document.getElementById("crosshairSettings").style.display = "block";
      break;
    case "pulse":
      document.getElementById("pulseSettings").style.display = "block";
      break;
  }
}

function updateClickEffectRows(enabled) {
  document.getElementById("clickEffectStyleRow").style.opacity = enabled ? "1" : "0.5";
  document.getElementById("clickDurationRow").style.opacity = enabled ? "1" : "0.5";
  document.getElementById("clickEffectStyleSelect").disabled = !enabled;
  document.getElementById("clickDurationSlider").disabled = !enabled;
}

async function saveSettings(settings) {
  currentSettings = { ...currentSettings, ...settings };
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
