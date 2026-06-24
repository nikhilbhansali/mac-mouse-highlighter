/**
 * Pulse Highlight - Continuously pulsing circle with size/opacity animation
 * Ported from PulseHighlight.swift
 */

class PulseHighlight {
  constructor() {
    this.pulsePhase = 0;
    this.lastUpdateTime = performance.now();
  }

  // Speed frequency mapping (matches Swift PulseSpeed enum)
  static SPEED = {
    slow: 0.5,
    medium: 1.0,
    fast: 2.0,
  };

  // Intensity size variation mapping (matches Swift PulseIntensity enum)
  static INTENSITY = {
    subtle: 0.15,
    moderate: 0.3,
    strong: 0.5,
  };

  draw(ctx, x, y, baseSize, color, opacity, speed = "medium", intensity = "moderate") {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
    this.lastUpdateTime = currentTime;

    // Get frequency and size variation from speed/intensity
    const frequency = PulseHighlight.SPEED[speed] || PulseHighlight.SPEED.medium;
    const sizeVariation =
      PulseHighlight.INTENSITY[intensity] || PulseHighlight.INTENSITY.moderate;

    // Update pulse phase
    this.pulsePhase += deltaTime * frequency * 2 * Math.PI;
    if (this.pulsePhase > 2 * Math.PI) {
      this.pulsePhase -= 2 * Math.PI;
    }

    // Calculate pulsing size using sine wave
    const sizeMultiplier = 1.0 + Math.sin(this.pulsePhase) * sizeVariation;
    const currentSize = baseSize * sizeMultiplier;

    // Draw the pulsing circle
    this.drawPulsingCircle(ctx, x, y, currentSize, color, opacity, sizeVariation);
  }

  drawPulsingCircle(ctx, x, y, size, color, opacity, sizeVariation) {
    const radius = size / 2;

    ctx.save();

    // Modulate opacity slightly with pulse for breathing effect
    const opacityVariation = sizeVariation * 0.3;
    const currentOpacity =
      opacity * (1.0 - opacityVariation + Math.sin(this.pulsePhase) * opacityVariation);

    // Create radial gradient
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

    const colorWithOpacity = `rgba(${color.r}, ${color.g}, ${color.b}, ${currentOpacity})`;
    const transparentColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0)`;

    gradient.addColorStop(0, colorWithOpacity);
    gradient.addColorStop(0.4, colorWithOpacity);
    gradient.addColorStop(1, transparentColor);

    // Draw circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
  }

  reset() {
    this.pulsePhase = 0;
    this.lastUpdateTime = performance.now();
  }
}
