
# Amazon Alternative Finder

A browser extension that helps users save money on their Amazon purchases by showing second-hand alternatives from Leboncoin.fr.

## Features

- Automatically detects when you're browsing product pages on Amazon.fr
- Shows available second-hand alternatives from Leboncoin.fr
- Clean, minimal interface inspired by Apple design principles
- Helps users make cost-effective and sustainable shopping decisions

## How It Works

When you visit a product page on Amazon.fr, the extension:

1. Detects the product you're viewing
2. Searches for similar items on Leboncoin.fr
3. Displays matching second-hand alternatives in a sleek side panel
4. Shows you how much you could save by buying pre-owned

## Installation Instructions

### Development Mode

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the `extension` folder from this project
5. The extension should now be installed and active

### From Package

1. Download the latest release package
2. Extract the ZIP file to a location on your computer
3. Follow steps 2-5 from the Development Mode instructions above

## Project Structure

```
├── extension/             # Browser extension files
│   ├── manifest.json      # Extension manifest
│   ├── background.js      # Background service worker
│   ├── content.js         # Content script injected into Amazon pages
│   ├── content.css        # Styles for the extension UI
│   └── icons/             # Extension icons
├── src/                   # Website/demo application
│   ├── components/        # React components
│   └── pages/             # Page components
└── README.md              # This file
```

## Development

This project consists of two parts:
1. A React-based website that demonstrates the extension's functionality
2. The actual browser extension in the `extension/` directory

To develop the website locally:

```bash
npm install
npm run dev
```

To test the extension, load it in Chrome as described in the Installation Instructions.

## Inspiration

This project was inspired by the Faircado.com browser extension, which provides a similar service across multiple platforms.

## License

MIT License
