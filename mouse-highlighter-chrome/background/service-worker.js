/**
 * Background Service Worker
 * Handles extension lifecycle, settings sync, and tab communication
 */

// Default settings (same as in settings-sync.js)
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
  crosshairGap: 10,
  crosshairLength: 20,
  pulseSpeed: "medium",
  pulseIntensity: "moderate",
  clickEffectEnabled: true,
  clickEffectStyle: "ripple",
  clickEffectDuration: 300,
  clickEffectColor: { r: 255, g: 214, b: 10, a: 0.8 },
  idleThreshold: 100,
  maxIdleFrameSkip: 3,
};

// Initialize on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    // Set default settings on first install
    await chrome.storage.sync.set(DEFAULT_SETTINGS);
    console.log("Mouse Highlighter installed with default settings");
  } else if (details.reason === "update") {
    // Merge any new default settings on update
    const currentSettings = await chrome.storage.sync.get(null);
    const mergedSettings = { ...DEFAULT_SETTINGS, ...currentSettings };
    await chrome.storage.sync.set(mergedSettings);
    console.log("Mouse Highlighter updated, settings merged");
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Keep channel open for async response
});

async function handleMessage(message, sender, sendResponse) {
  switch (message.type) {
    case "GET_SETTINGS":
      const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
      sendResponse({ settings });
      break;

    case "SAVE_SETTINGS":
      await chrome.storage.sync.set(message.settings);
      // Notify all content scripts of the change
      broadcastToAllTabs({ type: "UPDATE_SETTINGS", settings: message.settings });
      sendResponse({ success: true });
      break;

    case "TOGGLE_ENABLED":
      await chrome.storage.sync.set({ enabled: message.enabled });
      broadcastToAllTabs({ type: "TOGGLE_ENABLED", enabled: message.enabled });
      sendResponse({ success: true });
      break;

    case "GET_STATUS":
      const status = await chrome.storage.sync.get(["enabled"]);
      sendResponse({ enabled: status.enabled ?? true });
      break;

    default:
      sendResponse({ error: "Unknown message type" });
  }
}

// Broadcast message to all tabs
async function broadcastToAllTabs(message) {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id && tab.url && !tab.url.startsWith("chrome://")) {
      try {
        await chrome.tabs.sendMessage(tab.id, message);
      } catch (e) {
        // Tab might not have content script loaded
      }
    }
  }
}

// Listen for settings changes from storage
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync") {
    const changedSettings = {};
    for (const key in changes) {
      changedSettings[key] = changes[key].newValue;
    }
    // Broadcast changes to all tabs
    broadcastToAllTabs({ type: "UPDATE_SETTINGS", settings: changedSettings });
  }
});

// Handle keyboard shortcuts (if configured in manifest)
chrome.commands?.onCommand?.addListener(async (command) => {
  if (command === "toggle-highlighter") {
    const { enabled } = await chrome.storage.sync.get(["enabled"]);
    const newEnabled = !enabled;
    await chrome.storage.sync.set({ enabled: newEnabled });
    broadcastToAllTabs({ type: "TOGGLE_ENABLED", enabled: newEnabled });
  }
});
