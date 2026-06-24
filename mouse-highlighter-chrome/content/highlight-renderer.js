/**
 * Highlight Renderer - Main rendering engine using Canvas 2D
 * Handles animation loop with idle detection for performance
 */

class HighlightRenderer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isRunning = false;
    this.animationFrameId = null;

    // Mouse state
    this.mousePosition = { x: 0, y: 0 };
    this.lastMouseMoveTime = 0;
    this.isMouseIdle = true;
    this.idleFrameSkip = 0;
    this.maxIdleFrameSkip = 3;

    // Click effects queue
    this.activeClickEffects = [];

    // Highlight style instances
    this.highlightStyles = {
      circle: new CircleHighlight(),
      ring: new RingHighlight(),
      spotlight: new SpotlightHighlight(),
      crosshair: new CrosshairHighlight(),
      pulse: new PulseHighlight(),
    };

    // Current settings (will be updated from settingsManager)
    this.settings = null;
  }

  init() {
    // Create canvas element
    this.canvas = document.createElement("canvas");
    this.canvas.id = "mouse-highlighter-canvas";
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 2147483647;
      isolation: isolate;
    `;

    // Get 2D context
    this.ctx = this.canvas.getContext("2d", { alpha: true });

    // Handle high-DPI displays
    this.updateCanvasSize();

    // Insert canvas into document
    if (document.body) {
      document.body.appendChild(this.canvas);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        document.body.appendChild(this.canvas);
      });
    }

    // Handle window resize
    window.addEventListener("resize", () => this.updateCanvasSize());

    // Handle fullscreen changes
    document.addEventListener("fullscreenchange", () => this.handleFullscreenChange());
    document.addEventListener("webkitfullscreenchange", () =>
      this.handleFullscreenChange()
    );
  }

  updateCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Set display size
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";

    // Set actual size in memory (accounting for DPI)
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;

    // Scale context to match DPI
    this.ctx.scale(dpr, dpr);
  }

  handleFullscreenChange() {
    // Reattach canvas when fullscreen changes
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      const fullscreenEl =
        document.fullscreenElement || document.webkitFullscreenElement;
      if (fullscreenEl !== this.canvas.parentElement) {
        fullscreenEl.appendChild(this.canvas);
      }
    } else {
      if (this.canvas.parentElement !== document.body) {
        document.body.appendChild(this.canvas);
      }
    }
    this.updateCanvasSize();
  }

  start(settings) {
    this.settings = settings;
    this.isRunning = true;
    this.render();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.clear();
  }

  updateSettings(settings) {
    this.settings = settings;
  }

  updateMousePosition(position) {
    this.mousePosition = position;
    this.lastMouseMoveTime = performance.now();
    this.isMouseIdle = false;
    this.idleFrameSkip = 0;
  }

  addClickEffect(clickData) {
    if (!this.settings || !this.settings.clickEffectEnabled) return;

    const effect = {
      position: { ...clickData.position },
      button: clickData.button,
      startTime: performance.now(),
      duration: this.settings.clickEffectDuration || 300,
      size: this.settings.highlightSize || 40,
      color: this.settings.clickEffectColor || this.settings.highlightColor,
      progress: 0,
    };

    this.activeClickEffects.push(effect);
  }

  render() {
    if (!this.isRunning || !this.settings || !this.settings.enabled) {
      this.animationFrameId = requestAnimationFrame(() => this.render());
      return;
    }

    // Check if mouse is idle for frame skipping
    const now = performance.now();
    const idleThreshold = this.settings.idleThreshold || 100;

    if (now - this.lastMouseMoveTime > idleThreshold) {
      this.isMouseIdle = true;
    }

    // Skip frames when idle (unless there are active click effects)
    if (this.isMouseIdle && this.activeClickEffects.length === 0) {
      this.idleFrameSkip++;
      if (this.idleFrameSkip < this.maxIdleFrameSkip) {
        this.animationFrameId = requestAnimationFrame(() => this.render());
        return;
      }
      this.idleFrameSkip = 0;
    }

    // Clear canvas
    this.clear();

    // Draw highlight
    this.drawHighlight();

    // Draw and update click effects
    this.drawClickEffects();

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(() => this.render());
  }

  clear() {
    const dpr = window.devicePixelRatio || 1;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.scale(dpr, dpr);
  }

  drawHighlight() {
    const { x, y } = this.mousePosition;
    const style = this.settings.highlightStyle || "circle";
    const size = this.settings.highlightSize || 40;
    const color = this.settings.highlightColor || { r: 255, g: 214, b: 10, a: 0.6 };
    const opacity = this.settings.highlightOpacity || 0.6;

    switch (style) {
      case "circle":
        this.highlightStyles.circle.draw(this.ctx, x, y, size, color, opacity);
        break;

      case "ring":
        this.highlightStyles.ring.draw(
          this.ctx,
          x,
          y,
          size,
          color,
          opacity,
          this.settings.ringWidth || 3,
          this.settings.ringGlowEnabled ? this.settings.ringGlowIntensity || 0.5 : 0
        );
        break;

      case "spotlight":
        this.highlightStyles.spotlight.draw(
          this.ctx,
          x,
          y,
          size,
          this.settings.spotlightDimOpacity || 0.3,
          window.innerWidth,
          window.innerHeight
        );
        break;

      case "crosshair":
        const crosshairStyle = this.settings.crosshairStyle || "plus";
        this.highlightStyles.crosshair.drawWithGlow(
          this.ctx,
          x,
          y,
          this.settings.crosshairLength || size,
          this.settings.crosshairLineWidth || 2,
          color,
          opacity,
          crosshairStyle
        );
        break;

      case "pulse":
        this.highlightStyles.pulse.draw(
          this.ctx,
          x,
          y,
          size,
          color,
          opacity,
          this.settings.pulseSpeed || "medium",
          this.settings.pulseIntensity || "moderate"
        );
        break;
    }
  }

  drawClickEffects() {
    const now = performance.now();
    const effectStyle = this.settings.clickEffectStyle || "ripple";

    // Update and draw each active effect
    this.activeClickEffects = this.activeClickEffects.filter((effect) => {
      const elapsed = now - effect.startTime;
      effect.progress = Math.min(elapsed / effect.duration, 1);

      // Draw based on style
      switch (effectStyle) {
        case "ripple":
          RippleEffect.draw(this.ctx, effect);
          break;
        case "colorFlash":
          ColorFlashEffect.draw(this.ctx, effect);
          break;
        case "shrinkBounce":
          ShrinkBounceEffect.draw(this.ctx, effect);
          break;
      }

      // Keep effect if not complete
      return effect.progress < 1;
    });
  }

  destroy() {
    this.stop();
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }
}
