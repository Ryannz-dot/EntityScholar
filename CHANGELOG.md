# Changelog

All notable changes to EntityScholar will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-11-23

### Added
- **Manual Scan Mode**
  - One-click "Scan This Page" button with visual feedback
  - Button states: default, scanning, success, error
  - Keyboard shortcut (Alt+Shift+S) for quick scanning
  - Smart text extraction filtering out navigation, ads, and boilerplate

- **Auto-Scan Mode**
  - Automatic page scanning on load or tab switch
  - Configurable cache duration (5 minutes default)
  - Smart caching to prevent redundant API calls
  - Excluded sites list to skip specific domains
  - Configurable scan delay after page load

- **Entity Display**
  - Top 5 entities ranked by salience score
  - Entity type badges (Person, Location, Organization, etc.)
  - Visual salience bars
  - Confidence percentages

- **Academic Search Integration**
  - One-click search .edu sites for any entity
  - Wikipedia integration for quick lookups
  - Results open in new tabs

- **Settings Page**
  - API key configuration with connection testing
  - Auto-scan toggle and configuration
  - Cache duration settings (1-60 minutes)
  - Scan delay settings (0-5000ms)
  - Desktop notifications toggle
  - Badge display toggle
  - Excluded sites management
  - Usage statistics display
  - Scan history clearing

- **Notifications**
  - Desktop notifications when entities found (optional)
  - Badge count on extension icon showing entity count
  - Color-coded badges: blue (success), red (error), gray (scanning)

- **Chrome Extension Features**
  - Manifest V3 architecture
  - Service worker for background processing
  - Message passing between popup and background
  - Local storage for caching and settings
  - Sync storage for settings across devices
  - Tab listeners for auto-scan functionality

- **Developer Features**
  - Icon generation script (Python)
  - HTML-based icon generator
  - SVG source icon
  - Comprehensive README with setup instructions
  - Professional code structure and comments

### Technical Details
- Built with Manifest V3
- Uses Google Cloud Natural Language API
- Implements proper message passing architecture
- Follows Chrome extension best practices
- Includes error handling and rate limiting
- Professional UI with animations and transitions

## [Unreleased]

### Planned Features
- Multi-language support
- Export entities to CSV/JSON
- Entity relationship visualization
- Integration with more academic databases
- Sentiment analysis for entities
- Firefox and Edge browser support
- Chrome Web Store publication

---

For full release notes and upgrade instructions, visit the [GitHub Releases](https://github.com/Ryannz-dot/EntityScholar/releases) page.
