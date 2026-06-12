## Day 111 - May 30

**Project:** TypeScript Terminal Dashboard v2
**Time Spent:** 3 hours

### What I Built

Built an enhanced terminal dashboard that improves on Day 101 with four additions: a Unicode sparkline trend chart, a medal-ranked leaderboard panel, a live-cycling notification feed, and a pulsing uptime counter. The layout now uses a two-column top row (summary + notifications side by side) followed by two full-width rows (trend with sparkline, leaderboard). All rendering still uses pure ANSI escape codes with no external TUI library.

The sparkline maps an array of monthly revenue values to 8 Unicode block characters (`▁` through `█`) by normalising each value to `[0, 7]` — `Math.floor((v - min) / range * 7)`. This produces a compact visual trend above the bar chart that shows the shape of the revenue curve at a glance. The notification panel takes a static list and cycles through it using a `Math.floor(tick / 5) % length` offset so entries rotate every 10 seconds, creating the appearance of a live feed without any real event system. The pulse indicator in the summary panel toggles between `●` and `○` based on `tick % 2` — a simple way to show the dashboard is alive.

The `visLen` and `visPad` helpers from the ANSI module strip escape codes before measuring string length — essential for correct column alignment when mixing coloured and plain text in the same row. Auto-scaling Naira formatting (`₦1.2B`, `₦450M`, `₦12K`) keeps all monetary values readable regardless of magnitude without any manual padding decisions. The data loader checks for the Day 110 pipeline's `summary.json` and falls back to realistic mock data — making the dashboard runnable with zero setup.

### What I Learned

- Sparklines map values to Unicode blocks by normalising to `[0, 7]` with `Math.floor((v - min) / range * 7)` — the same 8-step quantisation used by most terminal sparkline libraries
- ANSI colour codes must be stripped before measuring string length — `visLen` using `/\x1b\[[0-9;]*m/g` regex is required for correct column padding when mixing coloured and plain text
- A two-column terminal layout is just two box arrays rendered side by side on each line — no grid library needed, just padding each box to a fixed width
- Cycling a list with `Math.floor(tick / N) % length` controls how many render ticks pass between each rotation step — `N = 5` at 2s refresh means 10 seconds per step
- A `tick` counter passed to panel render functions enables time-based animations without any shared mutable state between panels
- Auto-scaling number formatting with explicit magnitude thresholds (B/M/K) is more readable on dashboards than fixed decimal places

### Resources Used

- [Unicode block elements](https://en.wikipedia.org/wiki/Block_Elements)
- [ANSI escape code reference](https://en.wikipedia.org/wiki/ANSI_escape_code)
- [Terminal sparkline techniques](https://github.com/holman/spark)
- Day 101 source code — extended and improved

## Day 112 - May 31

**Project:** Advanced Cron Scheduler with dependencies, retries, and webhooks
**Time Spent:** 3 hours

### What I Built

Extended the Day 102 cron scheduler with three production features. First, job dependencies — each job can declare a `dependsOn` array of job IDs; before each run, the scheduler queries SQLite for the last successful run of each dependency and skips the current job if any dependency hasn't succeeded within the last 5 minutes. Second, exponential backoff retry — when a job fails, it schedules a `setTimeout` retry with delay `BACKOFF_BASE * 2^(attempt-1)`, capped at 30 seconds, up to `maxRetries` attempts. Third, webhook notifications — after every success or final failure, the scheduler POSTs a JSON payload to a configurable `WEBHOOK_URL` using native `fetch`.

Added an overlap prevention `Set<string>` that tracks currently-running job IDs — if the same job fires before its previous run completes, it's skipped rather than allowed to stack. Jobs can also declare a `timeout` in milliseconds; `Promise.race` between the handler and a rejecting timeout promise kills runaway jobs cleanly. All five new job types have realistic behaviour: the api-sync job has a 10% simulated failure rate specifically to demonstrate the retry chain, and report-generator depends on api-sync to show the dependency skip in action.

The SQLite schema gained two columns: `attempt` (which retry number this run is) and `triggered_by` (whether it was triggered by the cron schedule, a retry, or a dependency check). The history printer shows both fields, making it easy to trace a full retry chain through the log.

### What I Learned

- `setTimeout` inside a catch block for retry scheduling is cleaner than a retry queue — the closure captures the job definition and current attempt count correctly without any additional state
- `Promise.race([handler(), timeoutPromise])` where `timeoutPromise` is `new Promise<never>` that only rejects means the type of the race resolves to the handler's return type — no union type needed
- A `Set<string>` of currently-running job IDs is sufficient for overlap prevention in a single-process scheduler — no mutex or semaphore needed
- Dependency freshness by timestamp age (`Date.now() - lastSuccess.started_at > threshold`) handles the case where the upstream job has never run, the case where it ran too long ago, and the case where it's up-to-date — all in one check
- Storing `triggered_by` in the run log separates cron-triggered runs from retries and dependency skips in the history view — much cleaner than inferring from the attempt number
- `BACKOFF_BASE * 2^(attempt-1)` with `Math.min(..., 30_000)` cap ensures the backoff never exceeds 30 seconds regardless of how many retries are configured

### Resources Used

- [Exponential backoff algorithm](https://en.wikipedia.org/wiki/Exponential_backoff)
- [Promise.race MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)
- [node-cron documentation](https://github.com/node-cron/node-cron)
- Day 102 source code — extended

## Day 113 - June 04

**Project:** GitHub Actions CI for React Native / Expo
**Time Spent:** 3 hours

### What I Built

Built a production-grade GitHub Actions CI pipeline specifically for a React Native / Expo project. The pipeline has six jobs: TypeScript type-check, ESLint with both `@typescript-eslint` and `eslint-plugin-react-native` rules, a Jest test matrix across Node 18 and 20, an Expo Doctor health check, an EAS Build trigger on `main` pushes, and an always-running summary job. Wrote 35 unit tests across three files — currency utilities, validation helpers, and a `useCounter` custom hook tested with `renderHook` and `act` from `@testing-library/react-native`.

The biggest difference from Day 103's generic TypeScript CI is the React Native-specific test setup. The `jest-expo` preset handles the complex `transformIgnorePatterns` list that makes Jest work with React Native's mix of CommonJS and ESM modules. Without the right patterns, imports from `expo`, `react-native`, and related packages fail during transformation. The `useCounter` hook tests use `renderHook` to mount the hook in isolation and `act` to wrap state-changing calls before assertions — the same pattern used in real React Native projects.

The Expo Doctor job runs `npx expo-doctor` with `continue-on-error: true`, making it advisory-only — it reports version mismatches and config issues without ever blocking the pipeline. The EAS Build job only triggers on `push` to `main` (skipped on PRs) and requires an `EXPO_TOKEN` secret, so it cleanly separates integration checks from deployment triggers.

### What I Learned

- `jest-expo` preset bundles the `transformIgnorePatterns` configuration needed for React Native — without it, Jest fails on any import from `expo`, `react-native`, or related packages
- `renderHook(() => useHook())` from `@testing-library/react-native` renders a hook in isolation without a full component; `act(() => result.current.someAction())` flushes React state updates synchronously before assertions
- `expo-doctor` is a CLI diagnostic tool that checks for dependency version mismatches and common configuration mistakes — ideal as an advisory CI step with `continue-on-error: true`
- EAS Build with `--non-interactive` suppresses prompts that would hang in a CI environment where stdin is not a TTY
- Dependabot should ignore major version bumps for `expo` and `react-native` — they require coordinated upgrades across the whole dependency tree, not automated PRs
- `github.event_name == 'push'` in the `if` condition on the EAS Build job prevents it from triggering on pull request events even when the PR targets main

### Resources Used

- [jest-expo documentation](https://docs.expo.dev/develop/unit-testing/)
- [@testing-library/react-native renderHook](https://callstack.github.io/react-native-testing-library/docs/api#renderhook)
- [EAS Build GitHub Actions](https://docs.expo.dev/eas/github-actions/)
- [expo-doctor CLI](https://github.com/expo/expo/tree/main/packages/expo-doctor)

### Tomorrow

Day 114 — Log Parser v2. Extends Day 104 with structured JSON output, per-IP analysis, error pattern detection, and a configurable alert threshold system.

## Day 114 - June 11

**Project:** Log Parser v2
**Time Spent:** 3 hours

### What I Built
