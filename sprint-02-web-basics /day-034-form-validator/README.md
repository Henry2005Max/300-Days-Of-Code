# Day 34: Form Validator with React Hook Form

## Description
A fully validated registration form built with React Hook Form and TypeScript. Nine fields with real-time validation, a live password strength meter, a field status sidebar, a completion progress bar, and a success screen showing submitted data.

## Features
- React Hook Form with mode: onChange for real-time validation as you type
- Nine validated fields: Full Name, Email, Phone, Age, Website, Password, Confirm Password, Bio, Terms
- Password strength meter with 5 checks: length, uppercase, lowercase, number, symbol
- Confirm password cross-field validation using the validate function
- Live validation status sidebar showing idle, touched, valid, or error for each field
- Progress bar tracking how many fields have been filled
- Character counter on the Bio textarea (max 200)
- Green border on valid fields, red border on invalid fields
- 800ms simulated async submit with loading state
- Success screen displaying all submitted data after passing validation
- TypeScript typed form interface with useForm generic

## Technologies Used
- React 18
- TypeScript
- React Hook Form v7
- Vite
- CSS (custom properties, grid, flexbox)
- Google Fonts (IBM Plex Sans, IBM Plex Mono)

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

## Testing — Step by Step

Step 1 — Click directly into Full Name and type one letter, then click away. The field turns red and shows "Name must be at least 3 characters". The status panel on the right shows "error" for Full Name.

Step 2 — Type a valid full name like "Chidi Okeke". The border turns green. Status panel shows "valid".

Step 3 — Type in the Password field. Watch the strength bar and check icons update live as you add uppercase letters, numbers, and symbols.

Step 4 — Fill in Confirm Password with a different value. It shows "Passwords do not match". Fix it to match — it turns green.

Step 5 — Type in the Bio field. Watch the character counter at the bottom right count up toward 200.

Step 6 — Try submitting without ticking the Terms checkbox. It shows an error under the checkbox.

Step 7 — Fill in all fields correctly and click Create Account. A loading state shows for 800ms, then the success screen appears with your submitted data.

Step 8 — Click "Register Another" to reset the form and start over.

## Example Output

```
[ Day 34 ]   Form Validator   Sprint 2 — Web Basics

Create Account                      Validation Status
[===============   ] 77% complete   Full Name      valid
                                    Email          valid
Full Name *                         Phone          error
[ Chidi Okeke          ]            Age            valid
                                    Website        idle
Password *                          Password       valid
[ ••••••••             ]            Confirm Pass   error
[====] [====] [====] [   ] [   ]    Bio            idle
✓ 8+ chars  ✓ Upper  ✓ Lower        Terms          idle
✓ Number    ✗ Symbol   Good

[ Create Account ]
```

## What I Learned
- React Hook Form's register function replaces manual onChange and value binding
- The validate option enables cross-field validation like password confirmation
- mode: "onChange" triggers validation on every keystroke, not just on submit
- formState gives you errors, dirtyFields, and touchedFields to drive UI state
- watch() subscribes to a field's live value without causing full re-renders
- handleSubmit wraps your submit function and only calls it when validation passes
- TypeScript generics on useForm make all field names type-safe

## Challenge Info
**Day:** 34/300
**Sprint:** 2 - Web Basics
**Date:** WED, MAR 11
**Previous Day:** [Day 33 - React Counter with Hooks](../day-033-react-counter)
**Next Day:** [Day 35 - Quote Display with Axios](../day-035-quote-display)

---

Part of my 300 Days of Code Challenge!
