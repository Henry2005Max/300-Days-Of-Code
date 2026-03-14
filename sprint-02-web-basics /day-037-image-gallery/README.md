# Day 37: Image Gallery with Lazy Load

## Description

A masonry image gallery built with React and TypeScript featuring native lazy loading via IntersectionObserver, a fullscreen lightbox with keyboard navigation, tag filtering, search, and a column count toggle. 16 Unsplash images across 6 categories.

## Features

- Lazy loading with IntersectionObserver — images only fetch when 200px from viewport
- Shimmer placeholder shown while each image loads, fades out on load
- Masonry layout: 2, 3, or 4 column toggle
- Tag filter: All, Nature, City, Architecture, People, Technology, Abstract
- Search by subject or photographer name
- Fullscreen lightbox with high-res image, prev/next navigation
- Keyboard shortcuts in lightbox: Escape to close, Arrow Left/Right to navigate
- Hover overlay with zoom indicator on each card
- Fade-in on image load, scale on hover
- Results count updates live with active filter and search

## Technologies Used

- React 18
- TypeScript
- Vite
- IntersectionObserver API
- CSS (masonry columns, custom properties, keyframe animations)
- Google Fonts (Fraunces, Epilogue)
- Unsplash images

## Installation

```bash
npm install
```

## How to Run

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

## Testing — Step by Step

Step 1 — Page loads. Watch images load one by one as they enter the viewport — scroll slowly to see the shimmer placeholders before each image fades in.

Step 2 — Click the column buttons (2, 3, 4) on the top right. The masonry layout reflows instantly.

Step 3 — Click a tag like “Nature”. The gallery filters to only nature images. The results count updates.

Step 4 — Type in the search box. Try “mountain” or a photographer name like “Luca”. Results filter live as you type.

Step 5 — Hover over an image. It scales up slightly and a dark overlay with a + icon appears.

Step 6 — Click an image. The lightbox opens with the full-resolution version loading.

Step 7 — Click the › and ‹ buttons to navigate between images in the lightbox. Or use Arrow Left / Arrow Right on your keyboard.

Step 8 — Press Escape or click outside the image to close the lightbox.

## What I Learned

- IntersectionObserver for lazy loading without any library
- rootMargin: “200px” pre-loads images just before they enter the visible area
- Masonry layout using CSS column approach vs grid approach
- Separating thumb and full-res URLs to avoid loading large images in the grid
- useCallback for stable function references passed to child components
- Keyboard event listeners in the lightbox with cleanup on unmount

## Challenge Info

**Day:** 37/300
**Sprint:** 2 - Web Basics
**Date:** SAT, MAR 14
**Previous Day:** [Day 36 - Clock/Timer Component](../day-036-clock-timer)
**Next Day:** [Day 38 - Dark Mode with Context API](../day-038-dark-mode)

-----

Part of my 300 Days of Code Challenge!
