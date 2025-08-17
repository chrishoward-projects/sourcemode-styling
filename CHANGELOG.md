# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [0.2.15] - 2025-07-20

## Fixed:
- Removed header from settings

## [0.2.14] - 2025-07-14

## Fixed:
- In code JS styling moved to CSS

## [0.2.13] - 2025-06-22

## Fixed:
- Order of font weights in settings dropdown
- Fix missed obsidian-mode-raw rename
- Fix casting to any as requested by Obsidian validator

## [0.2.12] - 2025-06-22

## Fixed:
- Renamed .source-mode-raw class to source-mode-raw to avoid submission validator fail

## [0.2.11] - 2025-06-22

## Fixed:
- Move inline styles to CSS for Obsidian compliance

## [0.2.10] - 2025-06-21

## Fixed
- Release script not including styles.css

## [0.2.9] - 2025-06-21

## Changed
- Add authorUrl to manifest

## [0.2.8] - 2025-06-21

### Changed
- Updated plugin description to better explain purpose of differentiating source mode from Live Preview

## [0.2.7] - 2025-06-21

### Fixed
- Critical fix for vault-specific class persistence issue
- Source mode detection now checks only the active view instead of all markdown views
- Resolved issue where background markdown views caused styling to persist incorrectly
- Class manipulation now properly responds to the currently active note's mode

## [0.2.6] - 2025-06-21

### Fixed
- Version update error

## [0.2.5] - 2025-06-21

### Fixed
- Critical fix for source mode detection when side panels are active
- Source mode styling now correctly persists during all UI interactions
- Resolved issue where clicking side panels would incorrectly disable styling

## [0.2.4] - 2025-05-21

### Added
- Font color setting with theme default and custom color picker
- Default custom font color set to #333333
- MutationObserver to maintain source mode styling when side panels interfere with body classes
- StylingManager class for better code organization

### Changed
- Streamlined essential font list to focus on most reliable detection
- Refactored styling logic from main.ts into dedicated StylingManager class
- Improved separation of concerns between plugin lifecycle and styling management

### Fixed
- Source mode styling now persists during side panel interactions
- Body class changes no longer remove source mode styling

## [0.2.3] - 2025-06-20

### Fixed
- Critical bug where dropdown settings would not persist selected values
- Font family and font weight settings now correctly remember user selections
- Fixed dropdown value assignment logic in BaseSetting class
- Enhanced font detection reliability for consistent option availability

## [0.2.2] - 2025-06-19

### Changed
- Updated README

## [0.2.1]

### Added
- Comprehensive development workflow with automated scripts
- Version management system with automatic building
- Deployment script for test vault
- Release management with GitHub integration
- ESLint configuration for code quality

### Changed
- Enhanced version-bump script with CHANGELOG support and automatic building
- Updated npm scripts to follow best practices

### Fixed
- Obsidian submission compliance issues
- Replaced innerHTML usage with DOM API methods for security
- Improved DOM element handling in font detection
- Enhanced CSS injection with proper element tracking

## [0.2.0] - 2025-06-17

### Added
- Modular settings architecture with individual setting components
- CSS generation and DOM manipulation separation
- Workspace event management system
- Font detection utility for available monospace fonts

### Changed
- Refactored settings system using BaseSetting abstract class
- Extracted CSS generation into separate CSSGenerator class
- Improved code organization with service-oriented architecture

### Fixed
- Code duplication elimination in settings components
- Better separation of concerns across components