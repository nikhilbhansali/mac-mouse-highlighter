/**
 * Crosshair Highlight - Plus or X shaped crosshair
 * Ported from CrosshairHighlight.swift
 */

class CrosshairHighlight {
  draw(ctx, x, y, length, thickness, color, opacity, style = "plus") {
    ctx.save();

    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";

    const halfLength = length / 2;

    ctx.beginPath();

    if (style === "plus") {
      // Horizontal line
      ctx.moveTo(x - halfLength, y);
      ctx.lineTo(x + halfLength, y);

      // Vertical line
      ctx.moveTo(x, y - halfLength);
      ctx.lineTo(x, y + halfLength);
    } else if (style === "x") {
      // Diagonal lines (X shape)
      const offset = halfLength / Math.sqrt(2);

      // Top-left to bottom-right
      ctx.moveTo(x - offset, y - offset);
      ctx.lineTo(x + offset, y + offset);

      // Top-right to bottom-left
      ctx.moveTo(x + offset, y - offset);
      ctx.lineTo(x - offset, y + offset);
    }

    ctx.stroke();
    ctx.restore();
  }

  drawWithGlow(
    ctx,
    x,
    y,
    length,
    thickness,
    color,
    opacity,
    style = "plus",
    glowIntensity = 0.5
  ) {
    ctx.save();

    // Draw glow layers
    if (glowIntensity > 0) {
      const glowLayers = 3;
      for (let i = 0; i < glowLayers; i++) {
        const progress = (i + 1) / glowLayers;
        const glowThickness = thickness + thickness * 2 * progress * glowIntensity;
        const glowOpacity = opacity * (1 - progress) * 0.3 * glowIntensity;

        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${glowOpacity})`;
        ctx.lineWidth = glowThickness;
        ctx.lineCap = "round";

        this.drawLines(ctx, x, y, length, style);
      }
    }

    // Draw main crosshair
    this.draw(ctx, x, y, length, thickness, color, opacity, style);

    ctx.restore();
  }

  drawLines(ctx, x, y, length, style) {
    const halfLength = length / 2;

    ctx.beginPath();

    if (style === "plus") {
      ctx.moveTo(x - halfLength, y);
      ctx.lineTo(x + halfLength, y);
      ctx.moveTo(x, y - halfLength);
      ctx.lineTo(x, y + halfLength);
    } else if (style === "x") {
      const offset = halfLength / Math.sqrt(2);
      ctx.moveTo(x - offset, y - offset);
      ctx.lineTo(x + offset, y + offset);
      ctx.moveTo(x + offset, y - offset);
      ctx.lineTo(x - offset, y + offset);
    }

    ctx.stroke();
  }
}
