# Day 43: Meme Generator with Canvas

## Description

A meme generator built with React, TypeScript, and the HTML5 Canvas API. Pick from 8 classic meme templates or upload your own image, edit multiple text layers with full styling controls, then download the finished meme as a PNG.

## Features

- Canvas API rendering — image + text drawn directly to a 560x420 canvas
- 8 classic meme templates: Drake, Distracted Boyfriend, Two Buttons, Change My Mind, and more
- Upload your own image via file input
- Multiple text layers — add, delete, and switch between layers
- Per-layer controls: text content, font family, font size, text color, stroke color, X/Y position, alignment, bold, italic
- Automatic word wrap — long text wraps within 90% of canvas width
- Impact-style stroke text (white fill with black outline) as default
- Download button exports the canvas as a PNG file
- Dark theme UI

## Technologies Used

- React 18
- TypeScript
- HTML5 Canvas API
- Vite
- CSS (custom properties, grid)
- Google Fonts (Outfit)

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

Step 1 — Click any template thumbnail. The image loads onto the canvas.

Step 2 — The two default text layers show “TOP TEXT” and “BOTTOM TEXT”. Edit the top layer text in the Text field.

Step 3 — Drag the Y slider to reposition the text up or down on the canvas. Drag X to move left or right.

Step 4 — Change font size with the Size slider. Watch the canvas update live.

Step 5 — Click the text color swatch and pick yellow. The text color changes instantly.

Step 6 — Click “+ Add” to add a third text layer. Edit it and position it in the middle of the image.

Step 7 — Click “Upload Image” and select any image from your computer. It replaces the template.

Step 8 — Click “Download Meme”. A PNG file saves to your downloads folder.

## What I Learned

- Canvas API: drawImage, fillText, strokeText, measureText for text layout
- Word wrap on canvas — manual implementation splitting text by word and measuring width
- crossOrigin=“anonymous” required on Image elements to draw external URLs to canvas without CORS errors
- canvas.toDataURL(“image/png”) converts the canvas to a base64 PNG for download
- useRef for the canvas element — direct DOM access needed for the 2D context
- useEffect + useCallback pattern to redraw the canvas whenever image or layers change

## Challenge Info

**Day:** 43/300
**Sprint:** 2 - Web Basics
**Date:** FRI, MAR 20
**Previous Day:** [Day 42 - Color Picker](../day-042-color-picker)
**Next Day:** [Day 44 - BMI Calculator Form](../day-044-bmi-calculator)

-----

Part of my 300 Days of Code Challenge!
