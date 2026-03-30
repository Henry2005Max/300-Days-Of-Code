# Day 52: Color Picker Extended

## Description

An extended color picker building on Day 42. Adds a Canvas 2D saturation/lightness picker, a gradient builder, five palette generators, a saved swatches grid, oklch color space support, and a contrast checker — all in four tabs.

## Features

- Canvas 2D picker: click or drag on the saturation/lightness field to pick colors visually
- Hue strip slider with rainbow gradient background
- HSL sliders with live value display
- Four color spaces: HEX, HSL, RGB, oklch — switch and copy any format
- Paste any hex code to jump to that color
- Palette tab: 5 harmony types (monochromatic, complementary, triadic, analogous, split)
- Gradient tab: multi-stop gradient builder with position and hue sliders per stop, CSS output with copy button
- Swatches tab: save up to 24 colors, click to restore, hover to delete
- Contrast checker: shows white and black text on the current color, recommends the better choice
- Color values panel: all four formats in one place, click any to copy
- Current color stats: H, S, L, R, G, B values in a grid

## Technologies Used

- React 18
- TypeScript
- Vite
- Canvas API (2D saturation/lightness picker)
- CSS (custom properties, grid)
- Google Fonts (Geist, Geist Mono)

## Installation

```bash
npm install
```

## How to Run

```bash
npm run dev
```

Then open http://localhost:5173

## Testing — Step by Step

Step 1 — Click and drag anywhere on the Canvas picker. Color updates live as you move around the saturation/lightness field.

Step 2 — Drag the hue strip below the canvas. The canvas redraws with the new hue.

Step 3 — Click “OKLCH” in the space switcher. The value updates to oklch format.

Step 4 — Paste #ff6b35 into the hex input. Color jumps instantly.

Step 5 — Click “+ Save”. Go to the Swatches tab — it appears in the grid.

Step 6 — Click the Palette tab. Select “triadic” — 6 swatches appear. Click any to set it as active.

Step 7 — Click the Gradient tab. Drag the position sliders and hue sliders for each stop. Watch the CSS update live. Click Copy.

Step 8 — Check the Contrast card on the right — it shows which text colour (white or black) is more readable on the current background.

## What I Learned

- Canvas 2D picker uses two overlapping gradients: horizontal saturation (white to vivid hue) and vertical lightness (transparent to black)
- Mouse position in the canvas maps to S and L values via percentage of canvas dimensions
- useRef for dragging state prevents re-renders on every mouse move
- oklch is a perceptual colour space — approximated here from HSL for display purposes
- Gradient builder stores stops as an array of { color, position } objects, maps to CSS linear-gradient string
- Contrast recommendation uses the same WCAG luminance formula from Day 42

## Challenge Info

**Day:** 52/300
**Sprint:** 2 - Web Basics
**Date:** SUN, MAR 29
**Previous Day:** [Day 51 - Todo App with Recoil](../day-051-todo-recoil)
**Next Day:** [Day 53 - BMI Calculator](../day-053-bmi-calculator)

-----

Part of my 300 Days of Code Challenge!
