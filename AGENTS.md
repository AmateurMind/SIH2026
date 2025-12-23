AGENTS.md - Build, lint, test and style guidelines for this repo.

Build/Run:
- Install all deps: `npm run install:all` (root)
- Build frontend: `npm run build` (root) or `cd frontend && npm run build`
- Start dev: `npm run dev` (root) to run backend+frontend in parallel
- Run a single frontend test: `cd frontend && npm test -t "<Test Name>"`
- Run Python-based tests: `pytest testsprite_tests -k "<pattern>"`

Code Style:
- Imports: group stdlib, third-party, local; sort; remove unused
- Formatting: apply Prettier/ESLint where configured; format before commits
- Types: prefer TypeScript or JSDoc; maintain consistency when mixing
- Naming: components PascalCase; functions camelCase; constants UPPER_SNAKE
- Errors: handle API failures gracefully; use try/catch; return sensible defaults
- Async: always await; propagate errors appropriately
- Tests: name clearly; minimize flakiness; keep tests hermetic
- Comments: meaningful but not overly verbose; avoid noise
- Modules: small, cohesive units; limit cross-file responsibilities

Cursor rules: none detected in this repo.
Copilot rules: follow existing repo conventions; do not apply automated patches without review.
