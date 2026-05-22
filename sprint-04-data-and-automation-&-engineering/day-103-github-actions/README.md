# Day 103: GitHub Actions CI Pipeline

A production-grade GitHub Actions CI pipeline for a TypeScript project. Five jobs run in a dependency chain — type-checking, linting, matrix tests across Node.js 18 and 20, a build step, and a summary job that posts a results table to the workflow run's summary page. Includes 39 unit tests across three test files with an 80% coverage threshold enforced by Jest.

## Pipeline Architecture

```
typecheck ─┐
           ├──▶ test (Node 18) ─┐
lint      ─┘                   ├──▶ build ──▶ summary
           └──▶ test (Node 20) ─┘
```

- `typecheck` and `lint` run in parallel on push/PR
- `test` runs after both pass, in a matrix across Node 18 and 20
- `build` runs after all tests pass
- `summary` always runs and posts a results table

## Workflow Features

- `concurrency` group cancels in-progress runs on the same branch when a new push arrives
- `actions/setup-node@v4` with `cache: 'npm'` caches the npm cache directory automatically
- `npm ci` (not `npm install`) for reproducible installs from `package-lock.json`
- Coverage report uploaded as a GitHub artifact (7-day retention) on Node 20
- Coverage summary written to `$GITHUB_STEP_SUMMARY` as a Markdown table
- Build `dist/` uploaded as an artifact (3-day retention)
- `fail-fast: false` on the test matrix — both Node versions run even if one fails
- Dependabot configured for weekly updates to both Actions versions and npm deps

## Source Files Under Test

Three utility modules with full test coverage:

- `currency.ts` — `formatNaira`, `convertUsdToNgn`, `applyDiscount`, `parseNaira`
- `validation.ts` — `validateOrder` (Zod), `isValidEmail`, `isValidNigerianPhone`, `sanitizeInput`
- `transforms.ts` — `groupBy`, `sumBy`, `sortByDesc`, `paginate`, `chunkArray`

## Technologies Used

- Node.js + TypeScript
- GitHub Actions — CI/CD workflow automation
- Jest + ts-jest — unit testing with coverage
- ESLint + @typescript-eslint — static analysis
- `zod` — runtime schema validation
- Dependabot — automated dependency updates

## Folder Structure

```
day-103-github-action-ci/
├── .github/
│   ├── dependabot.yml              # Weekly dep update config
│   └── workflows/
│       └── ci.yml                  # Main CI workflow
├── src/
│   ├── __tests__/
│   │   ├── currency.test.ts        # 16 currency utility tests
│   │   ├── transforms.test.ts      # 14 data transform tests
│   │   └── validation.test.ts      # 14 validation tests
│   ├── currency.ts
│   ├── index.ts
│   ├── transforms.ts
│   └── validation.ts
├── .eslintrc.js
├── .gitignore
├── package.json
└── tsconfig.json
```

## Installation & Local CI Run

```bash
cd day-103-github-action-ci
npm install
```

## How to Run Locally

```bash
# Type-check only
npm run typecheck

# Lint only
npm run lint

# Tests with coverage
npm run test:coverage

# Run all three sequentially (mirrors CI)
npm run ci
```

## Testing Step by Step

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run type-check:**
   ```bash
   npm run typecheck
   ```
   Should exit 0 with no output.

3. **Run linter:**
   ```bash
   npm run lint
   ```
   Should exit 0. Fix any warnings if present.

4. **Run tests:**
   ```bash
   npm run test:coverage
   ```
   Should show 39 passing tests and coverage ≥ 80% on all metrics.

5. **Run the full CI sequence locally:**
   ```bash
   npm run ci
   ```

6. **Push to GitHub** — create a repo, add the remote, and push:
   ```bash
   git init
   git add .
   git commit -m "Day 103: GitHub Actions CI pipeline"
   git remote add origin https://github.com/Henry2005Max/300-Days-Of-Code.git
   git push
   ```
   Go to the Actions tab to watch the workflow run.

7. **Open a PR** — the workflow also triggers on pull requests to `main` and `develop`.

8. **Check the workflow summary** — click a completed run, scroll to the Summary tab to see the coverage table and CI results table.

9. **Verify matrix** — in the Actions tab, expand the test job to see two parallel runs labeled `Tests (Node 18)` and `Tests (Node 20)`.

10. **Break a test intentionally** — edit `currency.ts` to return a wrong value, push, and watch the workflow fail with a clear test failure message.

## What I Learned

- `actions/setup-node@v4` with `cache: 'npm'` caches `~/.npm` automatically — no manual `actions/cache` step needed for npm
- `npm ci` installs from `package-lock.json` exactly and fails if it doesn't match `package.json` — more reliable than `npm install` in CI
- `concurrency` with `cancel-in-progress: true` saves CI minutes by stopping the old run when a new push arrives on the same branch
- `needs: [jobA, jobB]` makes a job wait for multiple upstream jobs — the dependency graph is declared, not procedural
- `if: always()` on the summary job runs it even when upstream jobs fail — essential for a summary that shows what failed
- `$GITHUB_STEP_SUMMARY` is a file path written to by `echo "..." >> $GITHUB_STEP_SUMMARY` — GitHub renders it as Markdown on the run summary page
- `fail-fast: false` in a matrix strategy lets all matrix variants run even if one fails — useful to see if a failure is Node-version-specific
- `actions/upload-artifact@v4` stores files between jobs and for download after the run — coverage reports and build artifacts are common use cases
- Coverage thresholds in Jest config (`coverageThreshold`) fail the test run if coverage drops below the defined percentages

## Challenge Info

| Field    | Detail                                      |
|----------|---------------------------------------------|
| Day      | 103                                         |
| Sprint   | 4 — Data Engineering & Databases            |
| Date     | 2025-01-17                                  |
| Previous | [Day 102](../day-102-cron-examples)         |
| Next     | [Day 104](../day-104-log-parser)            |

Part of my 300 Days of Code Challenge!
