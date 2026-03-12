## Day 29 - March 6

**Project:** Data Pipeline (CSV + Lodash + API)
**Time Spent:** 2hrs

### What I Built

- CSV generator: auto-creates 15 Nigerian student records written to students.csv
- CSV parser: papaparse with TypeScript generics and dynamicTyping for typed data
- Subject breakdown: groupBy subject with average, highest, and lowest scores per group
- Top 5 ranking: orderBy score descending, sliced to top 5 students
- City averages: groupBy city, mean score per city, ranked descending
- Pass/fail filter: filter by score >= 75 threshold, calculates pass rate percentage
- API fetch: live programming joke from official-joke-api with node-fetch
- JSON export: full pipeline summary saved to pipeline-summary.json

### What I Learned

- How papaparse dynamicTyping automatically converts CSV strings to numbers
- Using Lodash groupBy, orderBy, filter, mean, max, min together on a real dataset
- How to structure a multi-phase pipeline combining synchronous and async operations
- Why saving pipeline output to JSON matters for downstream processing
- How TypeScript interfaces make CSV data safer to work with

### Resources Used

- papaparse docs: https://www.papaparse.com/docs
- lodash docs: https://lodash.com/docs/4.17.15
- node-fetch docs: https://github.com/node-fetch/node-fetch
- Official Joke API: https://official-joke-api.appspot.com

### Tomorrow

Day 30 - Sprint 1 Review

## Day 30 - March 07

**Project:** Sprint 1 Review CLI
**Time Spent:** 2

### What I Built

- Interactive menu CLI tying together all Sprint 1 technologies
- Sprint statistics: category and difficulty breakdowns with ASCII bar charts using Lodash
- Project browser: all 30 projects grouped by category with difficulty color coding
- Motivational quote fetcher: live API call to Quotable API with node-fetch
- Live progress ticker: cron job cycling through all 30 projects every 3 seconds
- JSON exporter: full sprint summary saved to sprint-01-summary.json
- CSV data layer: sprint project data stored and parsed with papaparse

### What I Learned

- How to run a cron job inside a readline interactive menu without blocking input
- Using Lodash countBy, mapValues, and sampleSize together for rich data summaries
- How combining multiple tools (lodash + papaparse + node-fetch + node-cron) in one project shows how far the sprint has come
- Structuring a multi-feature CLI with a clean reusable menu loop
- The value of review days for consolidating and reflecting on what was built

### Resources Used

- Lodash docs: https://lodash.com/docs/4.17.15
- papaparse docs: https://www.papaparse.com/docs
- node-cron docs: https://github.com/node-cron/node-cron
- node-fetch docs: https://github.com/node-fetch/node-fetch
- Quotable API: https://api.quotable.io

### Tomorrow

Day 31 - React/TS Static Resume Page (Sprint 2 begins!)

## Day 31 - March 8

**Project:** React/TS Static Resume Page
**Time Spent:** 2hr30

### What I Built

- Two-column resume layout with sticky dark sidebar and scrollable main panel
- Typed resume data object using TypeScript interfaces for all sections
- Sidebar with avatar initials, contact details, and grouped skill tags
- Main panel with Summary, Experience, Projects, and Education sections
- Project cards with accent border-left, tech label, and hover effect
- Responsive layout that collapses to single column on mobile
- CSS custom properties theme system with DM Serif Display + DM Sans fonts

### What I Learned

- How to set up a React + TypeScript project with Vite from scratch
- Using TypeScript interfaces to type nested structured data
- CSS Grid for sticky sidebar layouts without JavaScript
- How to break a page into reusable Section components with typed props
- CSS custom properties for managing a consistent design theme
- The difference between Sprint 1 (Node.js CLI) and Sprint 2 (React UI) workflows

### Resources Used

- React docs: https://react.dev
- Vite docs: https://vitejs.dev/guide
- TypeScript handbook: https://www.typescriptlang.org/docs
- DM Serif Display font: https://fonts.google.com/specimen/DM+Serif+Display
- CSS Grid guide: https://css-tricks.com/snippets/css/complete-guide-grid

### Tomorrow

Day 32 - Styled-Components Themed Landing Page

## Day 32 - March 09

**Project:** Styled-Components Themed Landing Page
**Time Spent:** 2hrs

### What I Built

- Full landing page with Nav, Hero, Features, Testimonial, CTA, and Footer sections
- Dark/light theme toggle with ThemeProvider passing theme to every styled component
- Sticky frosted-glass navbar with backdrop-filter blur and smooth scroll links
- Hero with animated badge (slideIn), title (fadeUp), pulsing CTA button, stats grid, and skill progress bars
- Features grid: 6 cards with hover lift and border highlight transition
- Testimonial section with Playfair Display italic quote and accent quotation marks
- Full-width CTA section with accent orange background and white button
- Keyframe animations: fadeUp, slideIn, pulse, all from styled-components keyframes helper
- TypeScript typed theme objects (lightTheme, darkTheme) with Theme type applied to all component props

### What I Learned

- How ThemeProvider injects theme as a prop into every styled component in the tree
- Defining a Theme type from typeof lightTheme and using it for prop typing
- createGlobalStyle for global resets, font imports, and body transitions
- keyframes helper from styled-components for reusable CSS animations
- How to pass theme explicitly vs relying on automatic injection for TypeScript compatibility
- styled-components v6 no longer needs @types/styled-components separately

### Resources Used

- styled-components docs: https://styled-components.com/docs
- styled-components ThemeProvider: https://styled-components.com/docs/advanced#theming
- Playfair Display font: https://fonts.google.com/specimen/Playfair+Display
- Vite React setup: https://vitejs.dev/guide
- CSS backdrop-filter: https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter

### Tomorrow

Day 33 - React Counter with Hooks

## Day 33 - March 10

**Project:** React Counter with Hooks

### What I Built

- Counter app with useReducer state machine: INCREMENT, DECREMENT, RESET, UNDO, SET actions
- Custom useLocalStorage hook persisting count to localStorage across refreshes
- Undo system tracking full counter history as an array in reducer state
- Configurable step selector: 1, 5, 10, 25, 100 — changes how much each click adds or subtracts
- Set-any-value input with Enter key support
- Keyboard shortcuts: Arrow Up/Down increment/decrement, R resets, Ctrl+Z undoes
- Auto-scrolling history panel using useRef to always show the latest entry
- Live stats panel: total changes, current step, highest and lowest values seen
- Color-coded count display: green (positive), red (negative), indigo (zero)
- Progress bar tracking percentage toward 100 in absolute value

### What I Learned

- Why useReducer outperforms multiple useState calls for interdependent state
- How to write TypeScript discriminated union action types for a reducer
- Building custom hooks that wrap useState + useEffect for localStorage sync
- useEffect cleanup function — removing event listeners to avoid memory leaks
- useCallback for stable function references used as useEffect dependencies
- useRef for scrolling a DOM element without triggering a re-render

### Resources Used

- React hooks docs: https://react.dev/reference/react
- useReducer guide: https://react.dev/reference/react/useReducer
- useRef docs: https://react.dev/reference/react/useRef
- localStorage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- JetBrains Mono font: https://fonts.google.com/specimen/JetBrains+Mono

### Tomorrow

Day 34 - Form Validator with React Hook Form

## Day 34 - March 11

**Project:** Form Validator with React Hook Form

### What I Built

- Registration form with 9 fields all validated using React Hook Form
- Real-time validation on every keystroke using mode: “onChange”
- Password strength meter checking 5 criteria: length, uppercase, lowercase, number, symbol
- Cross-field validation for confirm password using the validate function
- Live field status sidebar showing idle, touched, valid, or error per field
- Progress bar tracking filled fields out of total
- Character counter on Bio textarea with max 200 limit
- Green/red border color feedback on valid/invalid fields
- 800ms simulated async submit with loading state
- Success screen rendering all submitted form data after passing validation
- Fully typed form interface with useForm<RegisterForm> generic

### What I Learned

- React Hook Form’s register replaces manual onChange/value/ref wiring entirely
- mode: “onChange” vs “onBlur” vs “onSubmit” and when to use each
- Cross-field validation with the validate option referencing another watched field
- formState.dirtyFields and touchedFields for driving nuanced UI states
- watch() subscribes to live field values without causing unnecessary re-renders
- handleSubmit only invokes the submit handler when all validations pass
- TypeScript generics on useForm make field names autocomplete and type-safe

### Resources Used

- React Hook Form docs: https://react-hook-form.com/docs
- React Hook Form TypeScript guide: https://react-hook-form.com/ts
- register API: https://react-hook-form.com/docs/useform/register
- formState docs: https://react-hook-form.com/docs/useform/formstate
- IBM Plex Sans font: https://fonts.google.com/specimen/IBM+Plex+Sans

### Tomorrow

Day 35 - Quote Display with Axios


## Day 35 - March 12

**Project:** Quote Display with Axios

### What I Built

- Axios instance with baseURL (https://api.quotable.io) and 5s timeout
- Random quote fetcher with optional tag/category filtering
- 7 category filter buttons updating the active tag and re-fetching
- Shimmer skeleton loading animation while Axios request is in flight
- Graceful fallback to 6 local quotes when API errors or times out
- Save/unsave favorites system with toggle and remove buttons
- Session history array with index pointer — navigate back and forward through seen quotes
- Live stats: total fetched, saved count, average length of saved quotes, most saved tag
- Fade-in CSS animation on each new quote card render
- Keyboard shortcuts: N (new quote), S (save), Arrow Left/Right (history navigation)
- Click saved quote in panel to jump directly to it in the main view

### What I Learned

- Axios auto-parses JSON and throws on non-2xx responses, unlike fetch which requires manual checks
- How to type AxiosError correctly in TypeScript catch blocks
- Creating a history navigation system with an array and a current index pointer
- useCallback dependency arrays — why fetchQuote needs to list activeTag and historyIndex
- CSS shimmer animation using linear-gradient with background-position keyframes
- Graceful degradation: always have fallback data so the UI never breaks on API failure

### Resources Used

- Axios docs: https://axios-http.com/docs/intro
- Axios instance config: https://axios-http.com/docs/instance
- Quotable API: https://api.quotable.io
- CSS shimmer technique: https://css-tricks.com/building-skeleton-screens-css-custom-properties
- Cormorant Garamond font: https://fonts.google.com/specimen/Cormorant+Garamond

### Tomorrow

Day 36 - Clock/Timer Component
