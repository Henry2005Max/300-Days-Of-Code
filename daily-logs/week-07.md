## Day 43 - March 20

**Project:** Meme Generator with Canvas

### What I Built

- Canvas-based meme generator with HTML5 Canvas API
- 8 classic meme templates loaded via crossOrigin anonymous Image elements
- File upload support for custom images using FileReader API
- Multiple text layer system — add, delete, select active layer
- Per-layer styling: font, size, colors, X/Y position sliders, alignment, bold, italic
- Manual word wrap algorithm measuring text width against 90% canvas width
- Impact-style rendering: strokeText for black outline, fillText for white fill
- Download function using canvas.toDataURL and a programmatic anchor click
- Full redraw on every layer or image change via useEffect + useCallback

### What I Learned

- ctx.drawImage(img, 0, 0, w, h) scales the image to fill the canvas
- ctx.strokeText before ctx.fillText creates the classic meme outline effect
- measureText().width lets you check if a word fits before adding it to the current line
- crossOrigin=“anonymous” on the Image element is mandatory for drawing external images — without it the canvas becomes “tainted” and toDataURL throws a security error
- canvas.toDataURL returns a base64 data URL — create a hidden anchor and click it to trigger download
- useRef for canvas is the correct pattern — direct DOM access bypasses React’s rendering

### Resources Used

- Canvas API MDN: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- drawImage docs: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
- strokeText docs: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeText
- CORS and canvas: https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
- FileReader API: https://developer.mozilla.org/en-US/docs/Web/API/FileReader

### Tomorrow

Day 44 - BMI Calculator Form
