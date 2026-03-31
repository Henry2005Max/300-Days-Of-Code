## Day 50 - March 27

**Project:** Blog Template with MDX

### What I Built

- Blog template with 6 TypeScript post objects simulating MDX content
- Post list view with category filter pills, live search, and tag filtering
- Post cards showing featured badge, category, date, read time, excerpt, and tags
- Full post reading view with back navigation and author bio
- Custom markdown renderer: h2, paragraphs with inline bold, fenced code blocks, pipe tables
- Featured posts sidebar panel with click-to-open links
- Tag cloud in sidebar — click to filter, active tag banner with clear button
- Author bio block with avatar initials, name, bio, and GitHub link
- Posts sorted by date descending via useMemo
- Responsive two-column layout collapsing on mobile

### What I Learned

- MDX content can be simulated by storing markdown strings in TypeScript objects — useful for prototyping
- A line-by-line markdown parser using a while loop and index pointer handles most common elements
- useMemo with [activeCategory, search, activeTag] as deps keeps filtering fast
- Sticky sidebar needs top offset equal to the sticky nav height to avoid overlap
- Editorial typography: Lora serif gives a strong editorial feel for blog content
- The 50-day milestone — Sprint 1 CLI complete, Sprint 2 React UI complete after Day 60

### Resources Used

- MDX docs: https://mdxjs.com
- Lora font: https://fonts.google.com/specimen/Lora
- React rendering patterns: https://react.dev/learn/rendering-lists
- CSS sticky positioning: https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky

### Tomorrow

Day 51 - Todo App with Recoil 

## Day 51 - March 28

**Project:** Todo App with Recoil

### What I Built

- atoms.ts with 4 atoms (todos, filter, search, activeCategory) and 3 selectors (filtered todos, stats, category counts)
- RecoilRoot wrapping the app — no store config needed
- AddForm using useSetRecoilState to append new todos to the atom
- TodoItem using useSetRecoilState for toggle, delete, and inline edit
- CategorySidebar reading category counts from categoryCountsSelector
- StatsBar reading all derived stats from statsSelector
- filteredTodosSelector combining all 4 atoms into a filtered list
- Recoil vs Redux Toolkit comparison table showing key differences

### What I Learned

- Recoil atom = useState but shareable across the component tree without prop drilling
- Selector = useMemo but reactive — automatically recalculates when any upstream atom changes
- useRecoilState returns [value, setter] like useState
- useSetRecoilState returns only the setter — components that only write don’t re-render on state changes
- useRecoilValue returns only the value — read-only components
- RecoilRoot is far simpler to set up than Redux configureStore + Provider + slice
- Fine-grained subscriptions: the search input component only re-renders when searchAtom changes

### Resources Used

- Recoil docs: https://recoiljs.org/docs/introduction/getting-started
- Recoil atoms: https://recoiljs.org/docs/basic-tutorial/atoms
- Recoil selectors: https://recoiljs.org/docs/basic-tutorial/selectors
- Inter font: https://fonts.google.com/specimen/Inter

### Tomorrow

Day 52 - Color Picker Extended

## Day 52 - March 29

**Project:** Color Picker Extended

### What I Built

- Canvas 2D saturation/lightness picker using two overlapping linear gradients and mouse event handlers
- Hue strip with rainbow CSS gradient and a transparent range input overlay
- HSL sliders with live label updates
- Four color space display and copy: HEX, HSL, RGB, oklch
- Hex paste input that jumps to the pasted color on valid 6-digit hex
- Palette tab: 5 harmony types generating 6–9 swatches each, click to activate
- Gradient tab: dynamic stop array with position and hue sliders, live CSS string output, copy button, add stop button
- Swatches tab: 24-slot saved colors grid with hover-reveal delete button
- Contrast checker showing white and black text on the current color with recommendation
- Color values sidebar panel with all four formats, click-to-copy on each row
- H/S/L/R/G/B stats grid

### What I Learned

- Canvas picker: two gradients drawn sequentially — saturation horizontal, then lightness vertical (semi-transparent black overlay)
- Mouse position → S/L: x/width = saturation percentage, y/height = inverted lightness percentage
- useRef for dragging flag prevents re-renders on every mouse move event
- Gradient builder: array of stops sorted by position, mapped to CSS color stops
- oklch is a new CSS color space — more perceptually uniform than HSL but not yet universally supported
- Extending Day 42 showed how a feature set can grow by adding tabs rather than cramming everything into one view

### Resources Used

- Canvas API MDN: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- oklch color space: https://oklch.com
- CSS linear-gradient: https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient
- WCAG contrast: https://www.w3.org/TR/WCAG20-TECHS/G17.html
- Geist font: https://vercel.com/font

### Tomorrow

Day 53 - Weather Dashboard

## Day 53 - March 30

**Project:** Weather Dashboard


### What I Built

- Weather dashboard with mock data for 6 Nigerian cities
- Hero card with dynamic gradient background class switching on city change
- °C/°F unit toggle converting all temperature displays simultaneously
- 8 stat widgets: humidity, wind speed + compass direction, pressure, visibility, UV index with colour label, AQI with colour label, sunrise, sunset
- Custom hourly bar chart: 9 columns, bar heights proportional to temperature range using (temp - min) / (max - min) formula
- 7-day forecast rows with OpenWeatherMap CDN icons, description, high/low, humidity
- City comparison grid: all 6 cities, click to switch active, active city highlighted
- Sidebar city list with search filter, save/unsave star toggle per city
- Saved cities quick-access chips section
- 500ms setTimeout loading simulation between city switches

### What I Learned

- Dynamic background on a card: compute a CSS class name from weather condition data, apply to className — much cleaner than inline styles for multi-property theme changes
- Bar chart without a library: normalise to percentage with (val - min) / (max - min) * 100, set as CSS height
- useMemo for AQI and UV — prevent random regeneration on every render by memoising with [activeCity] as dep
- useCallback for the city fetch simulation to prevent recreation on every render
- Barlow Condensed works very well for large weather numbers — narrow and readable at big sizes

### Resources Used

- OpenWeatherMap icons: https://openweathermap.org/weather-conditions
- UV index scale: https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index
- AQI scale: https://www.airnow.gov/aqi/aqi-basics
- Barlow Condensed font: https://fonts.google.com/specimen/Barlow+Condensed
- Plus Jakarta Sans: https://fonts.google.com/specimen/Plus+Jakarta+Sans

### Tomorrow

Day 54 - Expense Tracker
