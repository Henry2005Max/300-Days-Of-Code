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
