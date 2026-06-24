/**
 * Spotlight Highlight - Dims screen except for a circular area around cursor
 * Ported from SpotlightHighlight.swift
 */

class SpotlightHighlight {
  draw(ctx, x, y, size, dimOpacity, canvasWidth, canvasHeight) {
    const radius = size / 2;

    ctx.save();

    // Fill entire canvas with dim color
    ctx.fillStyle = `rgba(0, 0, 0, ${dimOpacity})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Cut out the spotlight circle using compositing
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Reset compositing mode
    ctx.globalCompositeOperation = "source-over";

    // Draw soft edge around the spotlight
    this.drawSoftEdge(ctx, x, y, radius, dimOpacity);

    ctx.restore();
  }

  drawSoftEdge(ctx, x, y, radius, dimOpacity) {
    const fadeWidth = radius * 0.2;
    const outerRadius = radius + fadeWidth;

    // Create gradient for soft edge transition
    const gradient = ctx.createRadialGradient(x, y, radius, x, y, outerRadius);
    gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${dimOpacity})`);

    // Draw the soft edge ring
    ctx.beginPath();
    ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
    ctx.arc(x, y, radius, 0, Math.PI * 2, true); // Counter-clockwise to create ring
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}
