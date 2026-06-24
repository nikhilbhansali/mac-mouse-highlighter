/**
 * Shrink & Bounce Effect - Circle shrinks then bounces back with elastic easing
 * Ported from ShrinkBounceEffect.swift
 */

class ShrinkBounceEffect {
  static draw(ctx, effect) {
    const progress = effect.progress;

    let scale;
    let opacity;

    // Phase 1: Shrink (0-20%)
    if (progress < 0.2) {
      const shrinkProgress = progress / 0.2;
      scale = 1.0 - 0.3 * EasingFunctions.easeOutQuad(shrinkProgress);
      opacity = 0.7;
    }
    // Phase 2: Bounce back with elastic (20-60%)
    else if (progress < 0.6) {
      const bounceProgress = (progress - 0.2) / 0.4;
      scale = 0.7 + 0.5 * EasingFunctions.easeOutElastic(bounceProgress);
      opacity = 0.7 - 0.2 * bounceProgress;
    }
    // Phase 3: Settle and fade (60-100%)
    else {
      const fadeProgress = (progress - 0.6) / 0.4;
      scale = 1.2 - 0.2 * fadeProgress;
      opacity = 0.5 * (1 - EasingFunctions.easeOutQuad(fadeProgress));
    }

    if (opacity <= 0.01) return;

    ctx.save();

    const { x, y } = effect.position;
    const color = effect.color;
    const baseRadius = effect.size * 0.5;
    const currentRadius = baseRadius * scale;

    // Create 3-stop gradient
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, currentRadius);
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`);
    gradient.addColorStop(
      0.5,
      `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.6})`
    );
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

    ctx.beginPath();
    ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw ring outline during first 40%
    if (progress < 0.4) {
      ShrinkBounceEffect.drawRing(ctx, x, y, currentRadius, color, opacity);
    }

    ctx.restore();
  }

  static drawRing(ctx, x, y, radius, color, opacity) {
    const ringThickness = 2;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.8})`;
    ctx.lineWidth = ringThickness;
    ctx.stroke();
  }
}
