# Changelog

All notable changes to Mac Cursor Highlighter Thingy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Click ripples no longer get stuck on screen. Animations are now driven by a main-run-loop timer instead of a display link, and 30fps mode no longer runs animations at half speed.

## [1.0.0] - 2024

### Added

- Initial release of Mac Cursor Highlighter Thingy
- **Highlight Styles**
  - Circle: Soft, filled circle with gradient effect
  - Spotlight: Screen dimming with spotlight around cursor
  - Ring: Glowing ring outline around cursor
- **Click Effects**
  - Ripple: Expanding circle that fades out
  - Color Flash: Brief flash of color at click point
  - Shrink & Bounce: Spring animation on click
- **Features**
  - Menu bar icon with quick access to settings
  - Multi-display support
  - Customizable colors, sizes, and opacity
  - Launch at login option
  - Show/hide dock icon option
  - Smooth 60fps animations
  - Low CPU usage
- **Compatibility**
  - Universal Binary (Intel + Apple Silicon)
  - macOS 12.0 (Monterey) and later
