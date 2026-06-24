/**
 * Circle Highlight - Filled circle with radial gradient
 * Ported from CircleHighlight.swift
 */

class CircleHighlight {
  draw(ctx, x, y, size, color, opacity) {
    const radius = size / 2;

    ctx.save();

    // Create radial gradient: solid center fading to transparent edge
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

    const colorWithOpacity = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
    const transparentColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0)`;

    gradient.addColorStop(0, colorWithOpacity);
    gradient.addColorStop(0.5, colorWithOpacity);
    gradient.addColorStop(1, transparentColor);

    // Draw circle with gradient fill
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
  }

  drawSolid(ctx, x, y, size, color, opacity) {
    const radius = size / 2;

    ctx.save();

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
    ctx.fill();

    ctx.restore();
  }
}
