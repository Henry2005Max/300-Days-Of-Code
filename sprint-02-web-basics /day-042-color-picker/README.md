# Day 42: Color Picker

## Description

A full-featured color picker built with React and TypeScript. Pick colors using HSL sliders, generate color harmonies, browse 9 shades, copy values in HEX/HSL/RGB, save a personal palette, and paste any hex code to jump directly to a color. All color math done from scratch — no color library used.

## Features

- HSL sliders: Hue (0-360), Saturation (0-100%), Lightness (0-100%) with live gradient tracks
- Color preview card showing the active color with auto-contrast text (dark or light)
- Copy to clipboard: HEX, HSL, or RGB format with a “Copied!” confirmation
- Paste any hex code into the input to jump directly to that color
- Auto color naming: identifies colors as “Vivid Blue”, “Dark Orange”, “Light Teal” etc.
- Color harmonies: Complementary, Triadic, Analogous, Split-Complementary, Tetradic
- 9 shades panel from light to dark at fixed lightness steps
- Click any shade or harmony swatch to set it as the active color
- Saved palette: save up to 20 colors, click to restore, copy hex, or delete
- Color Info panel: name, HEX, HSL, RGB, individual H/S/L values, contrast info
- All color conversion math hand-written: hslToHex, hexToHsl, hslToRgb

## Technologies Used

- React 18
- TypeScript
- Vite
- CSS (custom properties, grid, flexbox)
- Clipboard API
- Google Fonts (Geist, Geist Mono)

## Installation

```bash
npm install
```

## How to Run

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

## Testing — Step by Step

Step 1 — Drag the Hue slider. Watch the preview card, gradient tracks, and color info all update live.

Step 2 — Drag Saturation to 0. Color becomes grey. Drag back up to see it become vivid again.

Step 3 — Click “Copy HEX”. The button turns green and shows “Copied!”. Paste it anywhere.

Step 4 — Paste a hex code like #ff6b35 into the hex input field. The color jumps to that value.

Step 5 — Click “+ Save”. The color appears in the Saved Colors panel. Save a few more.

Step 6 — Click the Shades tab. Nine shades of your current hue appear. Click one to set it as active.

Step 7 — Click the Harmony tab. Select “Triadic”. Three harmonious colors appear. Click any to set as active.

Step 8 — Click a saved color in the right panel to restore it. Click ✕ to remove it.

## What I Learned

- HSL to HEX conversion math using the CSS color model algorithm
- HEX to HSL conversion by normalising RGB channels and finding min/max
- Luminance formula (0.299R + 0.587G + 0.114B) for automatic contrast detection
- Color harmony theory: complementary (180°), triadic (120°/240°), analogous (±30°)
- CSS gradient tracks on sliders that update live with the current color values
- Clipboard API with navigator.clipboard.writeText for one-click copy

## Challenge Info

**Day:** 42/300
**Sprint:** 2 - Web Basics
**Date:** THU, MAR 19
**Previous Day:** [Day 41 - Todo App with Redux Toolkit](../day-041-todo-redux)
**Next Day:** [Day 43 - Meme Generator with Canvas](../day-043-meme-generator)

-----

Part of my 300 Days of Code Challenge!
