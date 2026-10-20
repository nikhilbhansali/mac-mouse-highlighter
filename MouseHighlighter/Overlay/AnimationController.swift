import Cocoa
import QuartzCore

protocol AnimationControllerDelegate: AnyObject {
    func animationTick(deltaTime: TimeInterval)
}

final class AnimationController {
    weak var delegate: AnimationControllerDelegate?

    // A main-run-loop timer drives ticks. A CVDisplayLink fires on a background thread and
    // can silently stop delivering callbacks after display changes or stop/start cycles,
    // which left click effects frozen on screen.
    private var timer: Timer?
    private var lastTimestamp: TimeInterval = 0
    private var isRunning = false
    private var isPaused = false

    // Idle detection
    private var idleTime: TimeInterval = 0
    private let idleThreshold: TimeInterval = 0.5
    private var hasActiveAnimations = false

    private var frameInterval: TimeInterval {
        return SettingsManager.shared.targetFrameRate == 30 ? 1.0 / 30.0 : 1.0 / 60.0
    }

    func start() {
        guard !isRunning else { return }
        isRunning = true
        isPaused = false
        startTimer()
    }

    func stop() {
        timer?.invalidate()
        timer = nil
        isRunning = false
        isPaused = false
    }

    func pause() {
        guard isRunning, !isPaused else { return }
        timer?.invalidate()
        timer = nil
        isPaused = true
    }

    func resume() {
        guard isRunning, isPaused else { return }
        isPaused = false
        startTimer()
    }

    private func startTimer() {
        lastTimestamp = CACurrentMediaTime()
        let timer = Timer(timeInterval: frameInterval, repeats: true) { [weak self] _ in
            self?.tick()
        }
        // .common modes so effects keep animating during menu tracking.
        RunLoop.main.add(timer, forMode: .common)
        self.timer = timer
    }

    func notifyActivity() {
        idleTime = 0
        if isPaused {
            resume()
        }
    }

    func setHasActiveAnimations(_ active: Bool) {
        hasActiveAnimations = active
        if active && isPaused {
            resume()
        }
    }

    private func tick() {
        let currentTime = CACurrentMediaTime()
        let deltaTime = currentTime - lastTimestamp
        lastTimestamp = currentTime

        delegate?.animationTick(deltaTime: deltaTime)

        idleTime += deltaTime

        // Pause when there are no active animations and we've been idle for the threshold
        let settings = SettingsManager.shared
        let needsContinuousAnimation = settings.highlightStyle == .pulse && settings.isEnabled

        if !hasActiveAnimations && !needsContinuousAnimation && idleTime > idleThreshold {
            pause()
        }
    }

    deinit {
        stop()
    }
}

struct AnimatedValue {
    var current: CGFloat
    var target: CGFloat
    var velocity: CGFloat = 0
    let stiffness: CGFloat
    let damping: CGFloat

    init(initial: CGFloat, stiffness: CGFloat = 300, damping: CGFloat = 20) {
        self.current = initial
        self.target = initial
        self.stiffness = stiffness
        self.damping = damping
    }

    mutating func update(deltaTime: TimeInterval) {
        let dt = CGFloat(deltaTime)
        let displacement = current - target
        let springForce = -stiffness * displacement
        let dampingForce = -damping * velocity
        let acceleration = springForce + dampingForce

        velocity += acceleration * dt
        current += velocity * dt

        if abs(velocity) < 0.001 && abs(displacement) < 0.001 {
            current = target
            velocity = 0
        }
    }

    var isAnimating: Bool {
        return abs(current - target) > 0.001 || abs(velocity) > 0.001
    }
}

struct TimedAnimation {
    let duration: TimeInterval
    var elapsed: TimeInterval = 0
    let easingFunction: (CGFloat) -> CGFloat

    var progress: CGFloat {
        let t = CGFloat(min(elapsed / duration, 1.0))
        return easingFunction(t)
    }

    var isComplete: Bool {
        return elapsed >= duration
    }

    mutating func update(deltaTime: TimeInterval) {
        elapsed += deltaTime
    }

    static func easeOutQuad(_ t: CGFloat) -> CGFloat {
        return 1 - (1 - t) * (1 - t)
    }

    static func easeOutCubic(_ t: CGFloat) -> CGFloat {
        return 1 - pow(1 - t, 3)
    }

    static func easeOutElastic(_ t: CGFloat) -> CGFloat {
        if t == 0 { return 0 }
        if t == 1 { return 1 }
        let p: CGFloat = 0.3
        let s = p / 4
        return pow(2, -10 * t) * sin((t - s) * (2 * .pi) / p) + 1
    }

    static func easeOutBack(_ t: CGFloat) -> CGFloat {
        let c1: CGFloat = 1.70158
        let c3 = c1 + 1
        return 1 + c3 * pow(t - 1, 3) + c1 * pow(t - 1, 2)
    }
}
