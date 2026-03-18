## Day 36 - March 13

**Project:** Clock / Timer Component

### What I Built

- Three-mode component: Clock, Stopwatch, Countdown with tab switching that preserves each mode’s state
- Clock: live time via setInterval every 1s, 12h/24h toggle, timezone via Intl.DateTimeFormat, UTC offset, Unix timestamp, day of year
- Stopwatch: requestAnimationFrame loop for smooth centisecond display, lap system with fastest (green) and slowest (red) auto-highlighted
- Countdown: 5 presets + custom h/m/s input, progress bar depleting in real time, red display under 20%, “Done!” completion banner
- All timers based on Date.now() arithmetic so they stay accurate even when the tab is in the background

### What I Learned

- requestAnimationFrame gives 60fps updates and is more accurate than setInterval for timers
- Storing start as Date.now() and computing elapsed = Date.now() - start on each frame prevents cumulative drift
- useRef for frameRef and startRef — mutable values that change every frame but should never trigger a re-render
- cancelAnimationFrame in useEffect cleanup is essential to prevent memory leaks on unmount
- Intl.DateTimeFormat().resolvedOptions().timeZone reads the system timezone with no library
- Tab switching in React: each child component mounts/unmounts unless you use CSS display:none or keep state lifted up

### Resources Used

- requestAnimationFrame MDN: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
- Intl.DateTimeFormat MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
- useRef docs: https://react.dev/reference/react/useRef
- Space Mono font: https://fonts.google.com/specimen/Space+Mono

### Tomorrow

Day 37 - Image Gallery with Lazy Load

## Day 37 - March 14

**Project:** Image Gallery with Lazy Load

### What I Built

- Masonry image gallery with 16 Unsplash images across 6 categories
- LazyImage component using IntersectionObserver to defer image fetching until 200px from viewport
- Shimmer placeholder animation per image, fades out when the image loads
- Masonry layout via CSS grid with 2/3/4 column toggle
- Tag filter bar with image count per tag
- Live search filtering by subject or photographer
- Fullscreen Lightbox component with high-res image, prev/next buttons and keyboard nav
- Hover overlay with scale and overlay effects on each gallery card
- Results count updating live with active filter and search term

### What I Learned

- IntersectionObserver API replaces scroll event listeners for lazy loading — more performant, no calculation needed
- rootMargin: “200px” starts loading images before they are visible, so there is no flash
- Calling observer.disconnect() after first intersection prevents repeated callbacks
- Masonry achieved by splitting images into N column arrays and rendering each as a flex column
- Separating thumb URL from full-res URL keeps the grid fast while lightbox loads quality images
- useCallback prevents unnecessary re-renders when passing handlers to deeply nested children

### Resources Used

- IntersectionObserver MDN: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
- Unsplash source images: https://unsplash.com
- CSS masonry patterns: https://css-tricks.com/piecing-together-approaches-for-a-css-masonry-layout
- Fraunces font: https://fonts.google.com/specimen/Fraunces

### Tomorrow

Day 38 - Dark Mode with Context API

## Day 38 - March 15

**Project:** Dark Mode with Context API

### What I Built

- ThemeContext.tsx: createContext, ThemeProvider component, custom useTheme hook
- Theme initializer reading localStorage first, then system prefers-color-scheme as fallback
- useEffect syncing theme to localStorage and setting data-theme on document.documentElement
- Full landing page consuming useTheme in every component: Navbar, Hero, ComponentsSection, CardsSection, FormSection, Footer
- Animated toggle switch in navbar showing current mode
- CSS custom properties for all design tokens — light values on :root, dark overrides on [data-theme=“dark”]
- 0.3s smooth transition on background and color changes across the entire page
- Live theme info block showing active mode, context source, persistence, and system pref

### What I Learned

- createContext sets a default value used only when there is no matching Provider above in the tree
- useContext re-renders the component whenever the context value changes — automatic and efficient
- Putting the initial state in a function (lazy initializer) in useState prevents localStorage from being read on every render
- CSS [data-theme=“dark”] on the html element cascades to every element — cleaner than toggling a class
- Keeping context in a separate file is the standard pattern for scalable React apps
- window.matchMedia().matches gives a boolean for system dark mode preference

### Resources Used

- React createContext docs: https://react.dev/reference/react/createContext
- React useContext docs: https://react.dev/reference/react/useContext
- CSS prefers-color-scheme: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
- localStorage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- Manrope font: https://fonts.google.com/specimen/Manrope

### Tomorrow

Day 39 - Weather App UI

## Day 39 - March 16

**Project:** Weather App UI (Fetch Data)

### What I Built

- Weather app fetching current conditions and 5-day forecast from OpenWeatherMap API
- Parallel API calls using Promise.all for weather and forecast endpoints simultaneously
- Dynamic background gradient based on weather icon code (clear, cloudy, rain, storm, snow, mist)
- Current weather card: city, date, description, large temperature, high/low, feels like, weather icon
- 6-stat detail grid: humidity, wind speed + direction, pressure, visibility, sunrise, sunset
- 5-day forecast by grouping OpenWeatherMap 3h intervals into daily min/max summaries
- 10 Nigerian city quick-chips: Lagos, Abuja, Kano, Port Harcourt, Ibadan, Enugu, Kaduna, Benin City, Calabar, Jos
- °C / °F toggle re-fetching with correct units parameter
- Spinner loading, error handling for invalid cities
- Demo mode: detects missing API key and serves mock Lagos data with a banner

### What I Learned

- Promise.all runs multiple async requests concurrently — faster than awaiting them sequentially
- OpenWeatherMap /forecast returns 3-hourly data — grouping by date string gives daily summaries
- Dynamic CSS class names based on data (icon code → bg class) is a clean React pattern
- Glassmorphism requires a non-transparent parent behind the element for the blur to work
- Demo/mock mode is essential for projects with API keys — lets the app still run and look good
- Wind direction in degrees converted to compass points using an 8-direction lookup

### Resources Used

- OpenWeatherMap current weather API: https://openweathermap.org/current
- OpenWeatherMap forecast API: https://openweathermap.org/forecast5
- OpenWeatherMap weather icons: https://openweathermap.org/weather-conditions
- Promise.all MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
- Barlow Condensed font: https://fonts.google.com/specimen/Barlow+Condensed

### Tomorrow

Day 40 - Review: Add Tailwind responsiveness to Day 31 Resume

## Day 40 - March 17

**Project:** Review — Resume with Tailwind CSS

### What I Built

- Day 31 resume page fully rebuilt using Tailwind CSS utility classes
- Replaced entire App.css with className utilities directly in JSX
- lg:grid-cols-[280px_1fr] for two-column layout that collapses on mobile
- sm:flex-row on experience rows so date/company wraps correctly at small sizes
- Hover transitions on project cards using hover:border-l-gray-900 and transition-all
- Tailwind stone/orange/gray palette replacing custom CSS variables
- Showcase block at the bottom listing every responsive decision made

### What I Learned

- Utility-first CSS means writing styles in JSX, not a separate file — faster iteration
- Tailwind responsive prefixes are mobile-first: sm: means “at 640px and above”
- Arbitrary value syntax grid-cols-[280px_1fr] escapes the default scale when needed
- JIT (Just-In-Time) compilation means Tailwind scans your files and only ships classes you use
- PostCSS config is mandatory — tailwindcss and autoprefixer plugins required
- Comparing Day 31 vs Day 40: Tailwind is faster to write, custom CSS is easier to read at scale

### Resources Used

- Tailwind CSS docs: https://tailwindcss.com/docs
- Tailwind responsive design: https://tailwindcss.com/docs/responsive-design
- Tailwind arbitrary values: https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values
- Vite + Tailwind setup: https://tailwindcss.com/docs/guides/vite
- DM Serif Display font: https://fonts.google.com/specimen/DM+Serif+Display

### Tomorrow

Day 41 - Todo App with Recoil/Redux

## Day 41 - March 18

**Project:** Todo App with Redux Toolkit

### What I Built

- Redux Toolkit slice with 10 typed actions: addTodo, toggleTodo, deleteTodo, editTodo, setPriority, setFilter, setSearch, setActiveCategory, clearCompleted, reorderTodo
- configureStore wiring the todos reducer and exporting RootState and AppDispatch types
- Typed useAppDispatch and useAppSelector hooks eliminating all casting
- AddTodoForm that expands on focus to show priority buttons, category select, and due date input
- TodoItem with checkbox toggle, double-click inline edit, priority border, category/priority tags, overdue detection
- Category sidebar with live item counts per category
- Stats panel: total, active, completed, high-priority counts with progress bar
- Search input and All/Active/Completed filter bar
- Clear Completed button dispatching clearCompleted action
- Hover-reveal Edit and Delete action buttons on each task
- 6 Nigerian-themed pre-loaded tasks across multiple categories

### What I Learned

- createSlice combines action creators and reducer in one — no separate switch statements
- Immer is baked into Redux Toolkit — writing state.items.push() in a reducer is safe
- configureStore automatically enables Redux DevTools Extension in the browser
- useAppSelector runs the selector on every Redux state change — cheap selectors matter
- Provider at the root gives all children access to the store via hooks
- Separating slice, store, and hooks into a /store folder is the standard RTK pattern

### Resources Used

- Redux Toolkit docs: https://redux-toolkit.js.org/introduction/getting-started
- createSlice API: https://redux-toolkit.js.org/api/createSlice
- React Redux hooks: https://react-redux.js.org/api/hooks
- configureStore: https://redux-toolkit.js.org/api/configureStore
- Inter font: https://fonts.google.com/specimen/Inter

### Tomorrow

Day 42 - Color Picker
