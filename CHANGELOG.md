# Changelog

All notable changes to **OTPeer Authenticator** (desktop) are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/).
Desktop releases are tagged `desktop-v*`.

## [0.1.4] - 2026-09-09

### Fixed

- Restore the previous clipboard when quitting if an OTP is still on it
  (same 45-second window; does not overwrite if the user copied something else).

## [0.1.3] - 2026-07-20

### Added

- Screen capture for scanning a QR code shown on this display.

### Fixed

- Friendlier, user-facing error messages for vault, sync, and camera failures.

## [0.1.2] - 2026-07-17

### Changed

- Platform-specific auto-update: macOS is notify-only (unsigned Phase 1,
  redirects to otpeer.com); Windows and Linux keep native background download
  and install-on-quit.

### Fixed

- Settings no longer loses update-check state when the Set Password dialog opens.
- Add a back/close button to the Settings header.
- Fix popup-blocked update redirect on the website for Windows and Linux.

## [0.1.1] - 2026-07-17

### Added

- Camera QR scan for account setup and peer sync.

### Fixed

- Faster, more accurate desktop camera QR scanning.

## [0.1.0] - 2026-07-16

### Added

- First desktop release for macOS, Windows, and Linux with local vault,
  TOTP codes, and peer-to-peer sync.
