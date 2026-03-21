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


## Day 44 - March 21

**Project:** BMI Calculator Form

### What I Built

- BMI calculator with metric (kg/cm) and imperial (lbs/ft/in) unit modes
- Correct BMI formula for each unit system applied via calcBMI helper
- useMemo for BMI value — only recalculates when weight or height inputs change
- Imperial height split into ft/in inputs, combined to total inches via a second useMemo
- Visual gauge: four colour-coded segments with an animated needle tracking BMI position on a 10–40 scale
- BMI category table with the matching row highlighted after calculation
- Ideal weight range back-calculated from BMI bounds for current height
- Health advice block per category with colour-coded styling
- Calculation history: typed BMIRecord array, last 10 entries, clearable
- Nigerian city BMI reference bar chart with proportional bars and category colours
- Optional age and gender fields shown in result details panel

### What I Learned

- Imperial BMI formula: (703 × weight_lbs) / height_in² — the 703 constant converts units
- useMemo dependency array — only the values that trigger recalculation go in the array
- Deriving ideal weight from BMI: weight = BMI × height² (rearranged formula)
- Gauge needle: clamp BMI between 10-40, compute percentage, use CSS left with transition
- Splitting state resets on unit switch prevents stale values carrying across modes
- Typed history records make the history list fully type-safe without any casting

### Resources Used

- BMI formula: https://www.cdc.gov/healthyweight/assessing/bmi/adult_bmi/index.html
- useMemo docs: https://react.dev/reference/react/useMemo
- WHO BMI classification: https://www.who.int/europe/news-room/fact-sheets/item/a-healthy-lifestyle—who-recommendations
- Plus Jakarta Sans font: https://fonts.google.com/specimen/Plus+Jakarta+Sans
- JetBrains Mono font: https://fonts.google.com/specimen/JetBrains+Mono

### Tomorrow

Day 45 - Password Strength Meter
