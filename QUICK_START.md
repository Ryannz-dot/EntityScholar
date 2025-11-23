# EntityScholar - Quick Start Guide

Get EntityScholar up and running in 5 minutes!

## Step 1: Get Your API Key (2 minutes)

1. Go to [TextRazor Signup](https://www.textrazor.com/signup)
2. Create a free account
3. Verify your email
4. Log in to your dashboard
5. Copy your API key 🔑
6. Free tier: 500 requests/day (perfect for testing!)

**🔒 Security Note**: Your API key will be encrypted with AES-256 before storage!

## Step 2: Install Extension (1 minute)

1. Open Chrome and navigate to `chrome://extensions/`
2. Toggle "Developer mode" ON (top right)
3. Click "Load unpacked"
4. Select the `EntityScholar` folder
5. Extension icon appears in toolbar ✅

## Step 3: Generate Icons (1 minute)

Choose one method:

### Method A: Browser-Based (Easiest)
1. Open `icons/create-icons.html` in Chrome
2. Icons generate automatically
3. Right-click each icon → "Save image as..."
4. Save as `icon16.png`, `icon48.png`, `icon128.png`
5. Place files in `/icons` folder

### Method B: Python Script
```bash
pip install Pillow
python3 scripts/generate-icons.py
```

## Step 4: Configure API Key (1 minute)

1. Click EntityScholar icon in toolbar
2. Click "Configure API Key" button
3. Paste your TextRazor API key from Step 1
4. Click "Test API Connection" (should see "✓ API connection successful! Found X test entities.")
5. Click "Save Settings" (key is encrypted automatically with AES-256!)

## Step 5: Start Using! (30 seconds)

### Try Manual Scan
1. Navigate to any webpage (try [Wikipedia](https://en.wikipedia.org/wiki/Artificial_intelligence))
2. Click EntityScholar icon
3. Click "🔍 Scan This Page"
4. See entities appear!
5. Click "Search .edu" or "Wikipedia" on any entity

### Try Auto-Scan (Optional)
1. Click settings icon (⚙️) in popup
2. Toggle "Enable automatic scanning on page load"
3. Set cache duration and scan delay
4. Click "Save Settings"
5. Browse normally - entities scan automatically!

## Common Use Cases

### 📚 Research
1. Reading an article about climate change
2. Scan page to extract key entities
3. Click "Search .edu" on entities like "IPCC" or "carbon emissions"
4. Find academic sources instantly

### 📰 News Reading
1. Open a news article
2. Auto-scan extracts people, organizations, locations
3. Click Wikipedia on names you don't recognize
4. Get quick context without leaving your workflow

### 🎓 Student Learning
1. Reading course materials online
2. Scan to identify key concepts and entities
3. Search .edu sites for scholarly papers
4. Build bibliography for assignments

## Keyboard Shortcuts

- `Alt+Shift+S` - Scan current page (without opening popup)

## Tips & Tricks

### 💡 Performance Tips
- Enable auto-scan for seamless experience
- Increase cache duration to reduce API calls
- Add social media sites to exclusion list
- Use badge to see entity count at a glance

### 🎯 Accuracy Tips
- Works best on text-heavy pages (articles, blogs, papers)
- Wikipedia pages provide excellent results
- News articles typically return 3-5 high-quality entities
- Academic papers work great

### 💰 Save API Quota
- Cache prevents rescanning same page within 5 minutes
- Exclude sites you don't need analyzed
- Use manual mode if you only occasionally need entity extraction
- Monitor usage in [TextRazor Dashboard](https://www.textrazor.com/)

## Troubleshooting

### ❌ "API Key Required" Error
→ Go to settings and add your TextRazor API key (it will be encrypted)

### ❌ "Scan Failed" Error
→ Check internet connection
→ Verify API key in settings
→ Test API connection in settings page

### ❌ No Entities Found
→ Page may have minimal text
→ Try a Wikipedia article or news article
→ Check that content isn't in images/videos

### ❌ Extension Icon Not Showing
→ Check that icons are generated in `/icons` folder
→ Reload extension: `chrome://extensions/` → Reload button
→ Check console for errors: Details → Inspect views

### ❌ Auto-Scan Not Working
→ Verify "Enable automatic scanning" is toggled ON
→ Check excluded sites list doesn't include current domain
→ Ensure API key is configured
→ Check badge setting is enabled

## Need More Help?

- 📖 Read the full [README.md](README.md)
- 🐛 Report bugs on [GitHub Issues](https://github.com/Ryannz-dot/EntityScholar/issues)
- 💬 Ask questions in [Discussions](https://github.com/Ryannz-dot/EntityScholar/discussions)

## What's Next?

Now that you're set up, try:

1. **Customize Settings**
   - Adjust cache duration for your needs
   - Enable/disable notifications
   - Add sites to exclusion list

2. **Explore Features**
   - Try keyboard shortcut (Alt+Shift+S)
   - Check usage statistics in settings
   - Experiment with different types of pages

3. **Contribute**
   - Star the repo on GitHub
   - Share with friends and colleagues
   - Submit feature requests
   - Contribute code improvements

Happy researching! 🎓✨
