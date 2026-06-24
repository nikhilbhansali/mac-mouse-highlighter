/**
 * Ring Highlight - Stroke circle with optional glow effect
 * Ported from RingHighlight.swift
 */

class RingHighlight {
  draw(ctx, x, y, size, color, opacity, thickness, glowIntensity) {
    const radius = size / 2;

    ctx.save();

    // Draw glow layers if enabled
    if (glowIntensity > 0) {
      this.drawGlow(ctx, x, y, radius, color, opacity, thickness, glowIntensity);
    }

    // Draw main ring
    this.drawRing(ctx, x, y, radius, color, opacity, thickness);

    ctx.restore();
  }

  drawGlow(ctx, x, y, radius, color, opacity, thickness, intensity) {
    const glowLayers = 4;
    const maxGlowRadius = thickness * 3 * intensity;

    for (let i = 0; i < glowLayers; i++) {
      const progress = (i + 1) / glowLayers;
      const glowRadius = maxGlowRadius * progress;
      const glowOpacity = opacity * (1 - progress) * 0.3 * intensity;

      const ringRadius = radius + glowRadius / 2;
      const glowThickness = thickness + glowRadius;

      ctx.beginPath();
      ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${glowOpacity})`;
      ctx.lineWidth = glowThickness;
      ctx.stroke();
    }
  }

  drawRing(ctx, x, y, radius, color, opacity, thickness) {
    // Main ring
    ctx.beginPath();
    ctx.arc(x, y, radius - thickness / 2, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
    ctx.lineWidth = thickness;
    ctx.stroke();

    // Inner highlight (subtle white edge for depth)
    const innerHighlightThickness = thickness * 0.3;
    const innerRadius = radius - thickness / 2 - innerHighlightThickness / 2;

    ctx.beginPath();
    ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
    ctx.lineWidth = innerHighlightThickness;
    ctx.stroke();
  }
}
