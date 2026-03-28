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
