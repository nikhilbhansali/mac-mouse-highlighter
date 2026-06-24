/**
 * Ripple Effect - Expanding ring with fading fill
 * Ported from RippleEffect.swift
 */

class RippleEffect {
  static draw(ctx, effect) {
    const progress = effect.progress;
    const easedProgress = EasingFunctions.easeOutCubic(progress);

    const maxRadius = effect.size * 2;
    const currentRadius =
      effect.size * 0.5 + (maxRadius - effect.size * 0.5) * easedProgress;

    const opacity = (1 - easedProgress) * 0.6;

    if (opacity <= 0.01) return;

    ctx.save();

    const { x, y } = effect.position;
    const color = effect.color;

    // Draw expanding ring
    const ringThickness = 3 * (1 - easedProgress * 0.5);
    ctx.beginPath();
    ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
    ctx.lineWidth = ringThickness;
    ctx.stroke();

    // Draw inner fill (fades out faster)
    if (easedProgress < 0.5) {
      const fillOpacity = opacity * 0.3 * (1 - easedProgress * 2);
      const fillRadius = currentRadius * 0.8;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, fillRadius);
      gradient.addColorStop(
        0,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${fillOpacity})`
      );
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

      ctx.beginPath();
      ctx.arc(x, y, fillRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    ctx.restore();
  }
}
