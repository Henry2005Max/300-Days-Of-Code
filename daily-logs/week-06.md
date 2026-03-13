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
