# Day 113: GitHub Actions CI for React Native

A production-grade GitHub Actions CI pipeline for a React Native / Expo project. Six jobs: TypeScript type-check, ESLint with React Native rules, Jest tests across a Node 18 and 20 matrix, Expo Doctor health check, EAS Build trigger on main pushes, and a summary job. Includes 35 unit tests across three test files — currency utilities, validation helpers, and a custom `useCounter` hook.

## Pipeline Architecture

```
typecheck ─┐
           ├──▶ test (Node 18) ─┐
lint      ─┤                   ├──▶ eas-build (main only)
           ├──▶ test (Node 20) ─┘
           └──▶ expo-doctor          └──▶ summary (always)
```

## What's New vs Day 103

| Feature | Day 103 | Day 113 |
|---------|---------|---------|
| Target | Generic TypeScript | React Native / Expo |
| Lint rules | @typescript-eslint | + react, react-native plugins |
| Extra job | None | Expo Doctor (advisory) |
| Build trigger | None | EAS Build on main branch push |
| Test preset | ts-jest | jest-expo (handles RN transforms) |
| Hook tests | None | `renderHook` + `act` from @testing-library/react-native |

## Key Workflow Features

- `jest-expo` preset handles the complex React Native module transform ignore list
- `expo-doctor` runs with `continue-on-error: true` — advisory check, never blocks the pipeline
- EAS Build only triggers on `push` to `main` (not on PRs) and requires `EXPO_TOKEN` secret
- `concurrency` group cancels in-progress runs when a new push arrives on the same branch
- `fail-fast: false` on the matrix — both Node versions run even if one fails
- Dependabot ignores major version bumps for `expo` and `react-native` — those need manual review

## Source Files Under Test

- `src/utils/currency.ts` — `formatNaira`, `convertUsdToNgn`, `applyDiscount`, `parseNaira`
- `src/utils/validation.ts` — `isValidNigerianPhone`, `isValidEmail`, `sanitizeInput`, `truncate`, `titleCase`
- `src/hooks/useCounter.ts` — full hook tested with `renderHook` and `act`

## Technologies Used

- React Native + Expo 51
- GitHub Actions — CI/CD automation
- Jest + jest-expo — unit testing with RN transform support
- ESLint + @typescript-eslint + eslint-plugin-react-native
- EAS (Expo Application Services) — cloud builds
- Dependabot — automated dependency updates

## Folder Structure

```
day-113-github-action-rn/
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       └── ci.yml                          # 6-job CI pipeline
├── src/
│   ├── __tests__/
│   │   ├── currency.test.ts                # 14 tests
│   │   ├── useCounter.test.ts              # 10 tests
│   │   └── validation.test.ts              # 14 tests
│   ├── hooks/
│   │   └── useCounter.ts                   # Custom counter hook
│   └── utils/
│       ├── currency.ts                     # Naira formatting utilities
│       └── validation.ts                   # Phone, email, sanitize helpers
├── .eslintrc.js
├── .gitignore
├── babel.config.js
├── package.json
└── tsconfig.json
```

## Setup

```bash
cd day-113-github-action-rn
npm install
```

## Local CI Run

```bash
npm run typecheck      # Type check only
npm run lint           # Lint only
npm run test:coverage  # Tests with coverage
npm run ci             # All three in sequence
```

## Testing Step by Step

1. **Install and run locally:**
   ```bash
   npm install
   npm run ci
   ```

2. **Push to GitHub** and watch the Actions tab for all 6 jobs.

3. **Check the workflow summary** — coverage table and job results posted automatically.

4. **EAS Build setup** — add `EXPO_TOKEN` to repository secrets:
   - Go to expo.dev → Account Settings → Access Tokens
   - Create a token and add it as `EXPO_TOKEN` in GitHub repo secrets
   - EAS build triggers automatically on next `main` push

5. **Test Expo Doctor** — it runs but `continue-on-error: true` means it never fails the pipeline.

## What I Learned

- `jest-expo` preset includes the `transformIgnorePatterns` list needed to handle React Native's CommonJS/ESM module mix — without it, imports from `expo`, `react-native`, and related packages fail during Jest transforms
- `renderHook` from `@testing-library/react-native` renders a hook in isolation; `act` wraps state-changing calls to flush React updates before assertions
- `expo-doctor` is a CLI tool that checks for version mismatches and configuration issues — running it in CI with `continue-on-error: true` gives advisory output without blocking builds
- EAS Build with `--non-interactive` suppresses prompts — required for CI environments where stdin is not a TTY
- Dependabot should ignore major version bumps for `expo` and `react-native` because they require coordinated upgrades across the entire dependency tree, not automated PRs

## Challenge Info

| Field    | Detail                                        |
|----------|-----------------------------------------------|
| Day      | 113                                           |
| Sprint   | 4 — Data Engineering & Databases              |
| Date     | June 4, 2025                                  |
| Previous | [Day 112](../day-112-cron-examples-2)         |
| Next     | [Day 114](../day-114-log-parser-2)            |

Part of my 300 Days of Code Challenge!
