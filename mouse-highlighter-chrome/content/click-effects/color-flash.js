/**
 * Color Flash Effect - Quick bright flash at click location
 * Ported from ColorFlashEffect.swift
 */

class ColorFlashEffect {
  static draw(ctx, effect) {
    const progress = effect.progress;

    let flashPhase;
    let opacity;

    // Flash in quickly (first 30%), then fade out
    if (progress < 0.3) {
      flashPhase = progress / 0.3;
      opacity = flashPhase * 0.8;
    } else {
      flashPhase = 1.0;
      opacity = 0.8 * (1 - (progress - 0.3) / 0.7);
    }

    if (opacity <= 0.01) return;

    ctx.save();

    const { x, y } = effect.position;
    const radius = effect.size * 0.6;

    // Different colors for different mouse buttons
    let flashColor = effect.color;
    if (effect.button === "right") {
      flashColor = { r: 255, g: 149, b: 0 }; // System orange
    } else if (effect.button === "middle") {
      flashColor = { r: 175, g: 82, b: 222 }; // System purple
    }

    // Brighten the color for the center
    const brightColor = {
      r: Math.min(255, Math.floor(flashColor.r + (255 - flashColor.r) * 0.3)),
      g: Math.min(255, Math.floor(flashColor.g + (255 - flashColor.g) * 0.3)),
      b: Math.min(255, Math.floor(flashColor.b + (255 - flashColor.b) * 0.3)),
    };

    // Create 3-stop gradient: bright center -> color -> transparent
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(
      0,
      `rgba(${brightColor.r}, ${brightColor.g}, ${brightColor.b}, ${opacity})`
    );
    gradient.addColorStop(
      0.6,
      `rgba(${flashColor.r}, ${flashColor.g}, ${flashColor.b}, ${opacity * 0.5})`
    );
    gradient.addColorStop(
      1,
      `rgba(${flashColor.r}, ${flashColor.g}, ${flashColor.b}, 0)`
    );

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
  }
}
