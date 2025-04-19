
# AltMarket - Amazon Alternative Finder

A browser extension that helps users save money by finding second-hand alternatives available on Leboncoin.fr while browsing Amazon.

## Project Structure

This project consists of two distinct parts:

```
├── extension/             # Browser extension files
│   ├── manifest.json      # Extension manifest
│   ├── background.js      # Background service worker
│   ├── content.js         # Script injected into Amazon pages
│   ├── content.css        # Styles for extension UI
│   ├── _locales/          # Localization files
│   │   ├── en/            # English translations
│   │   └── fr/            # French translations
│   └── icons/             # Extension icons
│
└── landing-page/          # Extension presentation website
    ├── index.html         # Main HTML page
    ├── styles.css         # CSS stylesheet
    ├── main.js            # JavaScript for landing page
    └── images/            # Visual resources
        ├── amazon.png     # Amazon logo for demos
        ├── blender1.png   # Demonstration images
        ├── blender2.png   # Demonstration images
        ├── blender3.png   # Demonstration images
        └── opengraph.png  # Social media sharing image
```

## Browser Extension

### Features

- Automatically detects when you are browsing product pages on Amazon.fr
- Displays second-hand alternatives available on Leboncoin.fr
- Clean and minimalist interface
- Helps users make economical and sustainable purchasing decisions

### Extension Installation

1. Via Chrome Web Store: Visit [the extension page](https://chromewebstore.google.com/detail/cimlfbhfcmldcaklknleaacnanjonfbl) and click "Add to Chrome"
2. Manual installation:
   - Download the source code or clone this repository
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the `extension` folder
   - The extension should now be installed and active

## Presentation Website

The `landing-page` folder contains a static website that presents the extension, explains how it works, and highlights its benefits.

### Website Features

- Interactive extension presentation
- Demonstration of functionality with a product example
- Direct link to Chrome Web Store for installation
- Responsive design compatible with all devices

### Website Deployment

To deploy the website:

1. Download the contents of the `landing-page` folder to your web server
2. Ensure all files (HTML, CSS, JS, images) are accessible
3. The site is ready to be viewed

## Development

### Extension

To modify the extension:

1. Make changes in the `extension` folder
2. Reload the extension in Chrome by clicking the reload icon on the `chrome://extensions/` page
3. Test your modifications

### Website

To modify the website:

1. Edit files in the `landing-page` folder
2. Test locally by opening `index.html` in a browser
3. Deploy modified files to your web server

## Performance & SEO

The project is optimized for:
- Fast loading times
- Search engine visibility
- Cross-browser compatibility

## Contributing

Contributions are welcome! Please read our contribution guidelines before starting.

## Support

If you encounter any issues or have suggestions, please open an issue on our GitHub repository.

## License

MIT License
