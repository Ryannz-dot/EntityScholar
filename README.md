# EntityScholar Chrome Extension

<div align="center">

![EntityScholar Logo](icons/icon128.png)

**Extract key entities from web pages and search academic sources for scholarly context**

[![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](https://chrome.google.com/webstore)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

## 🎯 Overview

EntityScholar is a professional Chrome extension that uses Google Cloud Natural Language API to extract and analyze key entities (people, places, organizations, events) from web pages. It provides both manual and automatic scanning modes with seamless integration into your browsing experience.

## ✨ Features

### 🔍 Manual Scan Mode (Default)
- **One-Click Scanning**: Click the "Scan This Page" button to analyze the current webpage
- **Visual Feedback**: Real-time button states (scanning, success, error)
- **Keyboard Shortcut**: `Alt+Shift+S` to trigger scan without opening popup
- **Smart Text Extraction**: Automatically filters out navigation, ads, and boilerplate content
- **Top 5 Entities**: Shows the most relevant entities ranked by salience score

### ⚡ Auto-Scan Mode (Optional)
- **Automatic Analysis**: Scans pages automatically when loaded or when switching tabs
- **Smart Caching**: Avoids redundant scans within configurable time period (default: 5 minutes)
- **Badge Notifications**: Shows entity count on extension icon
- **Desktop Notifications**: Optional notifications when entities are found
- **Site Exclusions**: Skip specific domains (e.g., Gmail, YouTube)

### 📊 Entity Analysis
- **Confidence Scores**: Each entity includes a salience percentage
- **Entity Types**: Person, Location, Organization, Event, Work of Art, and more
- **Visual Salience Bars**: Quick visual representation of entity importance
- **Metadata**: Additional context from the NLP API

### 🎓 Academic Search Integration
- **Search .edu Sites**: One-click Google search limited to .edu domains
- **Wikipedia Integration**: Quick Wikipedia lookup for any entity
- **New Tab Opening**: Results open in new tabs for easy reference

### ⚙️ Customization
- **Auto-Scan Toggle**: Enable/disable automatic scanning
- **Cache Duration**: Configure how long to cache results (1-60 minutes)
- **Scan Delay**: Set delay after page load to avoid incomplete content
- **Excluded Sites**: Add domains to skip during auto-scan
- **Notifications**: Control desktop notifications and badge display

### 📈 Usage Statistics
- **Total Scans**: Track how many pages you've analyzed
- **Total Entities**: Count of all entities discovered
- **Average per Page**: Statistical insights into your browsing

## 🚀 Installation

### Prerequisites
1. **Google Cloud API Key** (required)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the "Cloud Natural Language API"
   - Create credentials (API Key)
   - Copy your API key

### Install Extension

#### Option 1: From Source (Development)
1. Clone this repository:
   ```bash
   git clone https://github.com/Ryannz-dot/EntityScholar.git
   cd EntityScholar
   ```

2. Generate icons (choose one method):

   **Method A: Using the HTML Generator**
   ```bash
   # Open icons/create-icons.html in your browser
   # Click "Generate Icons" and download each size
   # Save as icon16.png, icon48.png, icon128.png in /icons directory
   ```

   **Method B: Using Python (if Pillow installed)**
   ```bash
   pip install Pillow
   python3 scripts/generate-icons.py
   ```

   **Method C: Create manually**
   - Create PNG images in sizes: 16x16, 48x48, 128x128
   - Save as icon16.png, icon48.png, icon128.png in /icons directory

3. Load extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `EntityScholar` directory
   - The extension icon should appear in your toolbar

4. Configure API Key:
   - Click the EntityScholar icon in toolbar
   - Click "Configure API Key" or the settings icon
   - Paste your Google Cloud API key
   - Click "Test API Connection" to verify
   - Click "Save Settings"

#### Option 2: From Chrome Web Store
*Coming soon*

## 📖 Usage

### Manual Scanning

1. **Navigate to any webpage** you want to analyze

2. **Click the EntityScholar icon** in your toolbar

3. **Click "Scan This Page"** button
   - The button will show a spinner while scanning
   - After 1-3 seconds, entities will appear
   - Button briefly shows success state with entity count

4. **View entities**
   - Each entity card shows:
     - Entity name and type
     - Salience score (importance percentage)
     - Visual salience bar

5. **Search for context**
   - Click "Search .edu" to find academic sources
   - Click "Wikipedia" to find encyclopedia entries

### Keyboard Shortcut
Press `Alt+Shift+S` on any page to trigger a scan without opening the popup.

### Auto-Scan Mode

1. **Open Settings**
   - Click the settings icon (⚙️) in popup
   - Or right-click extension icon → "Options"

2. **Enable Auto-Scan**
   - Toggle "Enable automatic scanning on page load"
   - Configure cache duration and scan delay
   - Add sites to exclude (optional)
   - Enable/disable notifications

3. **Browsing with Auto-Scan**
   - Navigate to pages normally
   - Extension badge shows entity count automatically
   - Click extension icon to see detailed results
   - Cached results prevent redundant API calls

### Settings Configuration

#### API Configuration
- **API Key**: Your Google Cloud Natural Language API key (required)
- **Test Connection**: Verify your API key works

#### Auto-Scan Settings
- **Enable Auto-Scan**: Toggle automatic scanning
- **Cache Duration**: 1-60 minutes (default: 5)
- **Scan Delay**: 0-5000ms (default: 500ms)

#### Notifications
- **Desktop Notifications**: Show notification when entities found
- **Badge Display**: Show entity count on icon

#### Excluded Sites
Add one domain per line:
```
gmail.com
youtube.com
twitter.com
facebook.com
```

## 🏗️ Architecture

### Manifest V3 Structure
```
EntityScholar/
├── manifest.json              # Extension manifest (V3)
├── service-worker.js          # Background service worker
├── popup/
│   ├── popup.html            # Extension popup UI
│   ├── popup.css             # Popup styles
│   └── popup.js              # Popup logic
├── settings/
│   ├── settings.html         # Settings page
│   ├── settings.css          # Settings styles
│   └── settings.js           # Settings logic
├── icons/
│   ├── icon16.png           # 16x16 icon
│   ├── icon48.png           # 48x48 icon
│   ├── icon128.png          # 128x128 icon
│   └── create-icons.html    # Icon generator
└── scripts/
    └── generate-icons.py     # Python icon generator
```

### Message Passing Flow

```
┌─────────┐         ┌────────────────┐         ┌──────────────┐
│  Popup  │────────>│ Service Worker │────────>│Content Script│
└─────────┘         └────────────────┘         └──────────────┘
     ^                      │                          │
     │                      │                          │
     │                      v                          │
     │              ┌──────────────┐                  │
     └──────────────│   NLP API    │<─────────────────┘
                    └──────────────┘
```

1. **User clicks scan button** in popup
2. **Popup sends message** to service worker
3. **Service worker injects** content script
4. **Content script extracts** page text
5. **Service worker calls** Google NLP API
6. **API returns** entity analysis
7. **Service worker stores** results and updates UI
8. **Popup displays** entities

### Key Components

#### Service Worker (`service-worker.js`)
- Handles all message passing
- Manages tab listeners for auto-scan
- Makes API calls to Google Cloud
- Manages storage and caching
- Updates badge and notifications

#### Content Script (Injected)
- Extracts visible text from page
- Filters out unwanted elements
- Cleans and normalizes text
- Returns to service worker

#### Popup (`popup/popup.js`)
- Displays entities and UI
- Handles scan button interactions
- Shows loading/error states
- Manages entity card rendering

#### Settings (`settings/settings.js`)
- Saves user preferences
- Tests API connection
- Manages exclusion list
- Shows usage statistics

## 🔐 Privacy & Security

- **No data collection**: EntityScholar does not collect or store any user data
- **API calls only**: Text is sent only to Google Cloud NLP API
- **Local storage**: All settings and cache stored locally in Chrome
- **No tracking**: No analytics or tracking of any kind
- **Open source**: Full source code available for audit

## 🛠️ Development

### Prerequisites
- Chrome browser (version 88+)
- Google Cloud account with Natural Language API enabled
- Basic knowledge of JavaScript, HTML, CSS

### Setup for Development
```bash
# Clone repository
git clone https://github.com/Ryannz-dot/EntityScholar.git
cd EntityScholar

# Generate icons
python3 scripts/generate-icons.py

# Load in Chrome as unpacked extension
# chrome://extensions/ → Enable Developer Mode → Load Unpacked
```

### Testing
1. **Manual Testing**
   - Test on various websites (news, blogs, Wikipedia, etc.)
   - Test with and without auto-scan enabled
   - Test error scenarios (no internet, invalid API key)
   - Test excluded sites feature

2. **Edge Cases**
   - Pages with no text content
   - Very long pages (>10,000 characters)
   - Pages with dynamic content
   - Protected pages (chrome://, file://)

### API Rate Limits
- Google Cloud Natural Language API has rate limits
- Free tier: 5,000 requests/month
- Monitor usage in Google Cloud Console
- Extension caches results to minimize API calls

## 🐛 Troubleshooting

### "API Key Required" Error
- Ensure you've entered a valid Google Cloud API key
- Verify Natural Language API is enabled in your project
- Test API connection in settings

### "Scan Failed" Error
- Check internet connection
- Verify API key is correct
- Check API quota in Google Cloud Console
- Try refreshing the page

### No Entities Found
- Page may have minimal text content
- Content may be in images or iframes
- Try scanning a different page (e.g., Wikipedia article)

### Extension Not Loading
- Verify all required files are present
- Check console for errors: `chrome://extensions/` → Details → Inspect views
- Ensure icons are generated and in /icons directory
- Reload extension after making changes

### Auto-Scan Not Working
- Ensure "Enable automatic scanning" is toggled ON in settings
- Check if site is in excluded list
- Verify API key is configured
- Check badge/notifications settings

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Google Cloud Natural Language API for entity extraction
- Chrome Extension documentation and community
- Icons generated using HTML5 Canvas

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/Ryannz-dot/EntityScholar/issues)
- Email: support@entityscholar.com (coming soon)

## 🗺️ Roadmap

- [ ] Support for multiple languages
- [ ] Export entities to CSV/JSON
- [ ] Entity relationship visualization
- [ ] Integration with more academic databases
- [ ] Sentiment analysis for entities
- [ ] Chrome Web Store publication
- [ ] Firefox and Edge support

---

<div align="center">

**Made with ❤️ for scholars and researchers**

[Report Bug](https://github.com/Ryannz-dot/EntityScholar/issues) · [Request Feature](https://github.com/Ryannz-dot/EntityScholar/issues)

</div>
