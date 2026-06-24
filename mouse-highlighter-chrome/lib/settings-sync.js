/**
 * Settings management for Mouse Highlighter Chrome Extension
 * Handles persistence via chrome.storage.sync and provides defaults
 */

const DEFAULT_SETTINGS = {
  // Global settings
  enabled: true,
  highlightStyle: "circle", // circle, ring, spotlight, crosshair, pulse

  // Highlight appearance
  highlightSize: 40,
  highlightColor: { r: 255, g: 214, b: 10, a: 0.6 }, // Yellow with 60% opacity
  highlightOpacity: 0.6,

  // Ring-specific settings
  ringWidth: 3,
  ringGlowEnabled: true,
  ringGlowIntensity: 0.5,

  // Spotlight-specific settings
  spotlightDimOpacity: 0.3,

  // Crosshair-specific settings
  crosshairStyle: "simple", // simple, full
  crosshairLineWidth: 2,
  crosshairGap: 10,
  crosshairLength: 20,

  // Pulse-specific settings
  pulseSpeed: 1.0,
  pulseMinScale: 0.8,
  pulseMaxScale: 1.2,

  // Click effects
  clickEffectEnabled: true,
  clickEffectStyle: "ripple", // ripple, colorFlash, shrinkBounce
  clickEffectDuration: 300, // ms
  clickEffectColor: { r: 255, g: 214, b: 10, a: 0.8 },

  // Performance settings
  idleThreshold: 100, // ms before reducing frame rate
  maxIdleFrameSkip: 3, // frames to skip when idle
};

class SettingsManager {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.listeners = [];
    this.loaded = false;
  }

  async load() {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.sync.get(DEFAULT_SETTINGS, (result) => {
          this.settings = { ...DEFAULT_SETTINGS, ...result };
          this.loaded = true;
          resolve(this.settings);
        });
      } else {
        // Fallback for non-extension context (testing)
        const stored = localStorage.getItem("mouseHighlighterSettings");
        if (stored) {
          try {
            this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
          } catch (e) {
            console.warn("Failed to parse stored settings:", e);
          }
        }
        this.loaded = true;
        resolve(this.settings);
      }
    });
  }

  async save(newSettings) {
    this.settings = { ...this.settings, ...newSettings };

    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.sync.set(this.settings, () => {
          this.notifyListeners();
          resolve();
        });
      } else {
        localStorage.setItem(
          "mouseHighlighterSettings",
          JSON.stringify(this.settings)
        );
        this.notifyListeners();
        resolve();
      }
    });
  }

  get(key) {
    return this.settings[key];
  }

  getAll() {
    return { ...this.settings };
  }

  onChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach((callback) => callback(this.settings));
  }

  // Helper to convert color object to CSS rgba string
  colorToRgba(colorObj, overrideAlpha = null) {
    const alpha = overrideAlpha !== null ? overrideAlpha : colorObj.a;
    return `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${alpha})`;
  }

  // Helper to convert color object to hex string (for input elements)
  colorToHex(colorObj) {
    const toHex = (n) => n.toString(16).padStart(2, "0");
    return `#${toHex(colorObj.r)}${toHex(colorObj.g)}${toHex(colorObj.b)}`;
  }

  // Helper to parse hex string to color object
  hexToColor(hex, alpha = 1) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: alpha,
      };
    }
    return DEFAULT_SETTINGS.highlightColor;
  }
}

// Global settings instance
const settingsManager = new SettingsManager();
