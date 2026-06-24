/**
 * Mouse Tracker - Tracks mouse position and click events
 * Uses passive event listeners for optimal performance
 */

class MouseTracker {
  constructor() {
    this.position = { x: 0, y: 0 };
    this.lastMoveTime = 0;
    this.isIdle = true;
    this.idleThreshold = 100; // ms

    this.moveListeners = [];
    this.clickListeners = [];

    this.bound = {
      onMouseMove: this.onMouseMove.bind(this),
      onMouseDown: this.onMouseDown.bind(this),
      onMouseUp: this.onMouseUp.bind(this),
    };
  }

  start() {
    // Use passive listeners for better scroll performance
    document.addEventListener("mousemove", this.bound.onMouseMove, {
      passive: true,
    });
    document.addEventListener("mousedown", this.bound.onMouseDown, {
      passive: true,
    });
    document.addEventListener("mouseup", this.bound.onMouseUp, { passive: true });
  }

  stop() {
    document.removeEventListener("mousemove", this.bound.onMouseMove);
    document.removeEventListener("mousedown", this.bound.onMouseDown);
    document.removeEventListener("mouseup", this.bound.onMouseUp);
  }

  onMouseMove(event) {
    this.position = {
      x: event.clientX,
      y: event.clientY,
    };
    this.lastMoveTime = performance.now();
    this.isIdle = false;

    // Notify listeners
    this.moveListeners.forEach((callback) => callback(this.position));
  }

  onMouseDown(event) {
    const button = this.getButtonName(event.button);
    const clickData = {
      position: { x: event.clientX, y: event.clientY },
      button: button,
      type: "down",
      timestamp: performance.now(),
    };

    this.clickListeners.forEach((callback) => callback(clickData));
  }

  onMouseUp(event) {
    const button = this.getButtonName(event.button);
    const clickData = {
      position: { x: event.clientX, y: event.clientY },
      button: button,
      type: "up",
      timestamp: performance.now(),
    };

    this.clickListeners.forEach((callback) => callback(clickData));
  }

  getButtonName(buttonCode) {
    switch (buttonCode) {
      case 0:
        return "left";
      case 1:
        return "middle";
      case 2:
        return "right";
      default:
        return "other";
    }
  }

  onMove(callback) {
    this.moveListeners.push(callback);
    return () => {
      this.moveListeners = this.moveListeners.filter((l) => l !== callback);
    };
  }

  onClick(callback) {
    this.clickListeners.push(callback);
    return () => {
      this.clickListeners = this.clickListeners.filter((l) => l !== callback);
    };
  }

  checkIdle() {
    const now = performance.now();
    if (now - this.lastMoveTime > this.idleThreshold) {
      this.isIdle = true;
    }
    return this.isIdle;
  }

  getPosition() {
    return { ...this.position };
  }
}
