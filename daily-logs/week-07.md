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

## Day 45 - March 22

**Project:** Password Strength Meter

### What I Built

- Password input with show/hide toggle and copy to clipboard
- 8 weighted security checks evaluated live as user types
- Weighted score system — max 11 points, symbols and long length worth double
- 5-level strength classification with colour-coded label and animated bar
- Crack time estimator using charset size, password length, and 10B attempts/sec assumption
- Entropy calculator: length × log₂(charset_size) in bits
- Password generator with length slider (8–64) and 4 charset toggles
- Generator enforces at least one char per enabled charset before padding with random pool
- Recent generated passwords kept in state — click to restore
- Strength legend panel with active level highlighted

### What I Learned

- Weighted scoring is more accurate than simple pass/fail counts for password strength
- Entropy in bits tells you the information content: higher = harder to guess
- Crack time is an estimate based on offline GPU brute force — real attackers may be faster or slower
- Shuffling with sort(() => Math.random() - 0.5) isn’t cryptographically secure but fine for a UI demo
- Guaranteeing charset inclusion means picking one forced char per set first, then padding randomly
- useMemo for all derived values (score, strength, crackTime, entropy) keeps renders cheap

### Resources Used

- Password entropy: https://en.wikipedia.org/wiki/Password_strength#Entropy_as_a_measure_of_password_strength
- NIST password guidelines: https://pages.nist.gov/800-63-3/sp800-63b.html
- Clipboard API: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
- Sora font: https://fonts.google.com/specimen/Sora
- JetBrains Mono: https://fonts.google.com/specimen/JetBrains+Mono

### Tomorrow

Day 46 - Quiz App


## Day 46 - March 23

**Project:** Quiz App

### What I Built

- Three-screen quiz app: Setup → Quiz → Results managed via a single screen state string
- 20 questions across Tech, Science, Nigeria, and General categories with Easy/Medium/Hard difficulties
- Setup screen with category pills, difficulty pills, question count slider, and time-per-question slider
- Countdown timer using setTimeout chain, resets on each question, auto-submits as wrong on expiry
- Answer reveal: correct turns green, wrong selection turns red, others dim — via getOptionClass helper
- Explanation text revealed after each answer with correct/wrong icon
- Live score sidebar: correct count, wrong count, mini coloured dot per answered question
- Results screen: grade circle (A–F based on %) , score stats, average response time
- Full review list: every question showing selected answer, correct answer, explanation
- Retry Same and New Quiz actions on results screen

### What I Learned

- A screen state string (“setup” | “quiz” | “result”) cleanly replaces multiple boolean flags
- Timer implemented as setTimeout chain — useEffect sets timeLeft, another useEffect decrements it
- Cleanup function in useEffect (return () => clearTimeout) prevents stale timers on question change
- getOptionClass centralises button CSS logic — keeps JSX clean, logic in one place
- Date.now() diff for per-question response time tracking
- Shuffling with sort(() => Math.random() - 0.5) before slice gives a random subset each quiz

### Resources Used

- React useEffect docs: https://react.dev/reference/react/useEffect
- setTimeout cleanup pattern: https://react.dev/learn/synchronizing-with-effects#step-3-add-cleanup-if-needed
- Nunito font: https://fonts.google.com/specimen/Nunito

### Tomorrow

Day 47 - Currency UI

## Day 47 - March 24

**Project:** Currency UI

### What I Built

- Currency converter with live rates fetched via Axios from exchangerate-api.com
- 12 currencies including NGN, GHS, KES, ZAR and other African currencies
- Currency swap button flipping from/to pair with one click
- Intl.NumberFormat for correct locale currency formatting per code
- Bidirectional rate display: 1 NGN = x USD and 1 USD = x NGN shown simultaneously
- NGN Quick Reference table for 7 common Naira amounts with click-to-populate
- All Rates vs NGN panel showing Naira cost of 1 unit of each currency
- Click-to-set on both reference tables populates the converter instantly
- Conversion history saving up to 10 records, click to restore
- Demo mode with fallback hardcoded rates when API key not configured
- Refresh button to manually trigger rate refetch

### What I Learned

- Cross-rate formula: to_rate / from_rate gives the exchange rate between any two currencies when both rates are relative to a common base (USD)
- Intl.NumberFormat style: “currency” handles symbol, decimal places, and grouping per locale automatically
- JPY has no subunit — maximumFractionDigits: 0 prevents “.00” appearing on yen amounts
- Demo/fallback mode: checking for a placeholder key string avoids a failed API call on load
- useMemo for rate and result — only recalculate when from, to, or amount change, not on history updates
- Axios response is already parsed JSON — res.data is the object, no .json() step needed

### Resources Used

- exchangerate-api.com docs: https://www.exchangerate-api.com/docs/overview
- Intl.NumberFormat MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
- Axios docs: https://axios-http.com/docs/api_intro
- Currency codes ISO 4217: https://en.wikipedia.org/wiki/ISO_4217
- Inter font: https://fonts.google.com/specimen/Inter

### Tomorrow

Day 48 - Rock Paper Scissors

## Day 48 - March 25

**Project:** Rock Paper Scissors


### What I Built

- Rock Paper Scissors game with Free Play, Best of 3, and Best of 5 modes
- Pure function game logic: getResult uses a BEATS record to determine winner, randomChoice picks from the 3 options
- 600ms reveal delay using setTimeout inside useCallback — CPU emoji shakes then pops in
- Arena background tints reactively based on result via CSS class on the arena div
- Series progress dots: filled green for player wins, red for CPU wins
- Series completion detected via useEffect watching seriesWins vs target
- Random taunts: 5 strings per result outcome, random pick on each reveal
- Scoreboard: wins, losses, draws with Righteous display font
- Win streak counter showing with fire emoji when > 1
- Stats panel: total rounds, win rate, best streak, favourite choice (derived from history)
- Stacked bar chart: proportional win/draw/loss segments with transition
- Round history: last 15 rounds with player emoji, CPU emoji, W/L/D badge
- Keyboard shortcuts via useEffect on window keydown with useCallback dependency

### What I Learned

- Pure functions for game logic (getResult, randomChoice) make the core logic easy to reason about
- setTimeout inside play handler works well for a simple delay — no need for a timer state
- useCallback dependency array must include all values the function closes over
- useEffect watching derived state (series wins) is cleaner than checking inside the play function
- CSS animation classes (shake on revealing, pop on shown) add game feel with minimal code
- IIFE inside JSX to derive favourite choice keeps the state minimal — no need to track it separately

### Resources Used

- React useCallback docs: https://react.dev/reference/react/useCallback
- CSS animation docs: https://developer.mozilla.org/en-US/docs/Web/CSS/animation
- Righteous font: https://fonts.google.com/specimen/Righteous
- Nunito font: https://fonts.google.com/specimen/Nunito

### Tomorrow

Day 49 - Tip Calculator
