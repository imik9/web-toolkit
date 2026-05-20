# Web Toolkit

A lightweight collection of browser utilities for zooming, reading, video speed control, color picking, and page inspection.

## Tools

- Magnifier that follows the cursor and enlarges the page underneath it.
- Video speed control with a live sample video.
- Reading mode with larger text, calmer spacing, and cleaner contrast.
- High contrast mode for accessibility checks.
- On-screen ruler for quick visual measurements.
- Color picker that reads the color under the cursor when supported by the browser.
- Link highlighting, image hiding, night tone, reading line, and scroll-to-top controls in the extension.

## Browser extension

The `extension/` folder contains a Chrome and Edge extension version of Web Toolkit.

To test it locally:

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable Developer mode.
3. Choose Load unpacked.
4. Select the `extension/` folder from this repository.
5. Open any website and click the Web Toolkit extension button.

The extension can toggle the magnifier, reading mode, high contrast mode, night tone, reading line, link highlighting, image hiding, ruler, color picker, scroll-to-top, and video speed controls on the current tab.

## Run locally

Open `index.html` in a browser, or serve the folder with any static file server.

```bash
npx serve .
```

## Project shape

This first version is intentionally built with plain HTML, CSS, and JavaScript. That keeps it easy to understand now and easy to convert into a Chrome extension later.
