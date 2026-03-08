# Day 31: React/TS Static Resume Page

## Description
A clean, responsive personal resume page built with React and TypeScript. Features a two-column layout with a dark sidebar for contact and skills, and a light main panel for experience, projects, and education. All resume data is stored in a typed TypeScript object — no backend needed.

## Features
- Two-column layout with sticky dark sidebar and scrollable main content
- Fully typed resume data using TypeScript interfaces
- Skills grouped by category with styled tags
- Project cards with tech stack labels and descriptions
- Responsive design that stacks to single column on mobile
- Google Fonts integration (DM Serif Display + DM Sans)
- CSS custom properties for easy theme changes
- Hover interactions on project cards

## Technologies Used
- React 18
- TypeScript
- Vite
- CSS (custom properties, grid, flexbox)
- Google Fonts

## Installation

```bash
npm install
```

## How to Run

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

## Build for Production

```bash
npm run build
npm run preview
```

## Example Output

### Sidebar:
```
HE                        (avatar initials)
Henry Ehindero
Aspiring AI Engineer & Full-Stack Developer

Location    Lagos, Nigeria
Email       henry@example.com
GitHub      github.com/Henry2005Max
LinkedIn    linkedin.com/in/henry-ehindero

Skills
  Languages    TypeScript  JavaScript  Python  C++
  Frontend     React  HTML/CSS  Tailwind CSS
  Backend      Node.js  Express  REST APIs
  Tools        Git  GitHub Actions  VS Code  Jest
  AI & Data    Anthropic API  LangChain  Papaparse
```

### Main Panel:
```
Summary
  Building expertise in software development and AI systems...

Experience
  Freelance Web Developer                      2024 - Present
  Self-Employed
  - Built and delivered client websites...

Projects
  300 Days of Code - Sprint 1
  TypeScript · Node.js · lodash · papaparse · node-cron
  30-day CLI challenge building tools from calculators to...

Education
  Self-Directed Software Engineering           2025 - Present
  300 Days of Code Challenge
```

## Project Structure

```
day-031-react-resume/
├── src/
│   ├── App.tsx        # Main component with resume data and layout
│   ├── App.css        # All styles
│   └── main.tsx       # React entry point
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## What I Learned
- Setting up a React + TypeScript project with Vite from scratch
- Using TypeScript interfaces to type structured data like a resume
- CSS Grid for two-column layouts with a sticky sidebar
- Passing typed data through React components as props
- Organising a component tree for a static page (Section, App)
- Using CSS custom properties for consistent theming across components

## Challenge Info
**Day:** 31/300
**Sprint:** 2 - Web Basics
**Date:** SUN, MAR 08
**Previous Day:** [Day 30 - Sprint 1 Review](../day-030-sprint-review)
**Next Day:** [Day 32 - Styled-Components Themed Landing](../day-032-styled-landing)

---

Part of my 300 Days of Code Challenge!
