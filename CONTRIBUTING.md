# Contributing to EntityScholar

Thank you for your interest in contributing to EntityScholar! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Use the bug report template** when creating a new issue
3. **Include details:**
   - Chrome version
   - Extension version
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors (if any)
   - Screenshots (if applicable)

### Suggesting Features

1. **Check existing feature requests** first
2. **Open a new issue** with tag "enhancement"
3. **Describe the feature:**
   - What problem does it solve?
   - How should it work?
   - Any UI/UX mockups?
   - Potential implementation approach

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following our coding standards
4. **Test thoroughly** (see Testing section below)
5. **Commit with clear messages:**
   ```bash
   git commit -m "Add: feature description"
   ```
6. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request** with detailed description

## 💻 Development Setup

### Prerequisites
```bash
# Required
- Chrome browser (v88+)
- Git
- Text editor (VS Code recommended)
- Google Cloud account with Natural Language API

# Optional
- Python 3.x (for icon generation)
- Node.js (for potential future build tools)
```

### Local Setup
```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/EntityScholar.git
cd EntityScholar

# Generate icons
python3 scripts/generate-icons.py

# Load extension in Chrome
# 1. Navigate to chrome://extensions/
# 2. Enable Developer Mode
# 3. Click "Load unpacked"
# 4. Select the EntityScholar directory
```

### Project Structure
```
EntityScholar/
├── manifest.json           # Extension configuration
├── service-worker.js       # Background service worker
├── popup/                  # Extension popup
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── settings/               # Settings page
│   ├── settings.html
│   ├── settings.css
│   └── settings.js
├── icons/                  # Extension icons
├── scripts/                # Utility scripts
└── docs/                   # Documentation
```

## 📝 Coding Standards

### JavaScript

```javascript
// Use ES6+ features
const functionName = async () => {
  // Code here
};

// Clear variable names
const entityList = [];
const apiKey = '';

// JSDoc comments for functions
/**
 * Analyze entities in text using Google NLP API
 * @param {string} text - Text to analyze
 * @returns {Promise<Array>} Array of entities
 */
async function analyzeEntities(text) {
  // Implementation
}

// Error handling
try {
  const result = await someAsyncOperation();
} catch (error) {
  console.error('Operation failed:', error);
  // Handle error appropriately
}
```

### CSS

```css
/* Use CSS variables for colors */
:root {
  --primary-blue: #1a73e8;
}

/* BEM-style naming for classes */
.entity-card { }
.entity-card__header { }
.entity-card__title { }
.entity-card--highlighted { }

/* Mobile-first approach */
.container {
  /* Mobile styles */
}

@media (min-width: 768px) {
  .container {
    /* Desktop styles */
  }
}
```

### HTML

```html
<!-- Semantic HTML -->
<article>
  <header>
    <h1>Title</h1>
  </header>
  <section>
    <p>Content</p>
  </section>
</article>

<!-- Accessibility -->
<button aria-label="Scan page">
  <span class="icon">🔍</span>
  <span class="text">Scan</span>
</button>

<!-- No inline styles -->
<div class="card"> <!-- Good -->
<div style="color: red;"> <!-- Avoid -->
```

## 🧪 Testing

### Manual Testing Checklist

#### Basic Functionality
- [ ] Extension loads without errors
- [ ] Icons display correctly
- [ ] Popup opens and closes properly
- [ ] Settings page is accessible

#### Manual Scan
- [ ] Scan button responds to clicks
- [ ] Loading state displays during scan
- [ ] Success state shows correct entity count
- [ ] Error state displays on failure
- [ ] Entities display correctly with salience bars
- [ ] Search .edu button opens correct URL
- [ ] Wikipedia button opens correct URL

#### Auto-Scan
- [ ] Auto-scan toggle works in settings
- [ ] Scans trigger on page load
- [ ] Scans trigger on tab switch
- [ ] Cache prevents redundant scans
- [ ] Excluded sites are skipped
- [ ] Badge displays entity count
- [ ] Notifications appear (if enabled)

#### Settings
- [ ] API key saves correctly
- [ ] API connection test works
- [ ] All toggles function properly
- [ ] Statistics display correctly
- [ ] Clear history works
- [ ] Settings persist after browser restart

#### Edge Cases
- [ ] Works on pages with no text
- [ ] Works on very long pages
- [ ] Handles invalid API key gracefully
- [ ] Handles network errors
- [ ] Works on protected pages (chrome://) - should show error
- [ ] Works with special characters in text

### Test Pages

Use these pages for testing:

1. **Rich content:** [Wikipedia - Climate Change](https://en.wikipedia.org/wiki/Climate_change)
2. **News article:** Any news website
3. **Academic:** Any .edu domain
4. **Simple:** `test-page.html` included in repo
5. **Minimal text:** [Google](https://google.com)
6. **Protected:** `chrome://extensions/` (should fail gracefully)

### Browser DevTools

```javascript
// Check extension logs
// chrome://extensions/ → Details → Inspect views → Service Worker

// Check popup logs
// Right-click extension icon → Inspect popup

// Check storage
chrome.storage.local.get(null, console.log);
chrome.storage.sync.get(null, console.log);

// Clear storage (for testing)
chrome.storage.local.clear();
chrome.storage.sync.clear();
```

## 🎨 UI/UX Guidelines

### Design Principles
1. **Simplicity:** Keep UI clean and uncluttered
2. **Feedback:** Provide clear visual feedback for all actions
3. **Accessibility:** Support keyboard navigation and screen readers
4. **Consistency:** Follow Chrome extension design patterns
5. **Performance:** Minimize animations, optimize for speed

### Color Palette
```css
Primary Blue:   #1a73e8
Success Green:  #1e8e3e
Error Red:      #d93025
Gray Scale:     #202124, #5f6368, #9aa0a6, #dadce0, #f1f3f4
```

### Typography
- Font: System font stack (Roboto, SF Pro, Segoe UI)
- Sizes: 11px (small), 13px (body), 14px (default), 16px (h3), 18px (h2), 24px (h1)
- Weights: 400 (normal), 500 (medium), 600 (semibold)

## 📚 Documentation

### Code Comments
- Add JSDoc for all functions
- Explain "why" not "what" in comments
- Update comments when changing code
- Remove commented-out code before committing

### README Updates
- Update README.md for new features
- Add screenshots if UI changed
- Update installation steps if needed
- Keep feature list current

## 🔄 Pull Request Process

### Before Submitting
1. **Test thoroughly** on multiple pages
2. **Check console** for errors
3. **Verify no API key** committed to repo
4. **Update CHANGELOG.md** if applicable
5. **Update documentation** if needed

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on Chrome [version]
- [ ] Tested manual scan
- [ ] Tested auto-scan
- [ ] Tested on various pages
- [ ] No console errors

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows project style
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No API keys or secrets committed
```

### Review Process
1. Maintainer reviews code
2. Automated checks run (if configured)
3. Feedback provided via comments
4. Revisions made if requested
5. PR approved and merged

## 🚀 Release Process

### Version Numbers
Follow [Semantic Versioning](https://semver.org/):
- **MAJOR:** Breaking changes
- **MINOR:** New features (backward compatible)
- **PATCH:** Bug fixes

### Release Checklist
1. Update version in `manifest.json`
2. Update CHANGELOG.md
3. Create git tag: `git tag v1.0.1`
4. Push tag: `git push origin v1.0.1`
5. Create GitHub release with notes
6. Submit to Chrome Web Store (if applicable)

## 📧 Contact

- **Issues:** [GitHub Issues](https://github.com/Ryannz-dot/EntityScholar/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Ryannz-dot/EntityScholar/discussions)
- **Security:** Report security issues privately via email

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- CHANGELOG.md

Thank you for making EntityScholar better! 🎉
