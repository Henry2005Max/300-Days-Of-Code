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
