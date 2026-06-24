/**
 * Content Script - Main entry point for Mouse Highlighter
 * Initializes and coordinates all components
 */

(function () {
  // Prevent multiple initializations (important for iframes)
  if (window.__mouseHighlighterInitialized) {
    return;
  }
  window.__mouseHighlighterInitialized = true;

  // Core components
  let mouseTracker = null;
  let highlightRenderer = null;
  let isEnabled = true;

  // Initialize the highlighter
  async function init() {
    // Load settings
    await settingsManager.load();

    // Create and initialize components
    mouseTracker = new MouseTracker();
    highlightRenderer = new HighlightRenderer();

    // Initialize renderer (creates canvas)
    highlightRenderer.init();

    // Connect mouse tracker to renderer
    mouseTracker.onMove((position) => {
      highlightRenderer.updateMousePosition(position);
    });

    mouseTracker.onClick((clickData) => {
      if (clickData.type === "down") {
        highlightRenderer.addClickEffect(clickData);
      }
    });

    // Listen for settings changes
    settingsManager.onChange((newSettings) => {
      highlightRenderer.updateSettings(newSettings);
      if (newSettings.enabled !== isEnabled) {
        isEnabled = newSettings.enabled;
        if (isEnabled) {
          mouseTracker.start();
          highlightRenderer.start(newSettings);
        } else {
          mouseTracker.stop();
          highlightRenderer.stop();
        }
      }
    });

    // Start if enabled
    const settings = settingsManager.getAll();
    isEnabled = settings.enabled;

    if (isEnabled) {
      mouseTracker.start();
      highlightRenderer.start(settings);
    }

    // Listen for messages from background/popup
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        handleMessage(message, sendResponse);
        return true; // Keep channel open for async response
      });
    }
  }

  // Handle messages from extension
  function handleMessage(message, sendResponse) {
    switch (message.type) {
      case "TOGGLE_ENABLED":
        isEnabled = message.enabled;
        settingsManager.save({ enabled: isEnabled });
        if (isEnabled) {
          mouseTracker.start();
          highlightRenderer.start(settingsManager.getAll());
        } else {
          mouseTracker.stop();
          highlightRenderer.stop();
        }
        sendResponse({ success: true, enabled: isEnabled });
        break;

      case "UPDATE_SETTINGS":
        settingsManager.save(message.settings);
        highlightRenderer.updateSettings(settingsManager.getAll());
        sendResponse({ success: true });
        break;

      case "GET_STATUS":
        sendResponse({
          enabled: isEnabled,
          settings: settingsManager.getAll(),
        });
        break;

      default:
        sendResponse({ error: "Unknown message type" });
    }
  }

  // Cleanup on page unload
  window.addEventListener("unload", () => {
    if (mouseTracker) mouseTracker.stop();
    if (highlightRenderer) highlightRenderer.destroy();
  });

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
