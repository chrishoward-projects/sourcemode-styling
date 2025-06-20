# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


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