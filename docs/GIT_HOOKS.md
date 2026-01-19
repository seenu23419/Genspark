# Pre-Commit Hooks & Git Workflow

This project uses **Husky** to enforce code quality on every commit and **lint-staged** to run checks on staged files only.

## Setup

After cloning and installing dependencies, Husky hooks are automatically installed:

```bash
npm install
# This runs "npm run prepare" which installs husky hooks
```

## How It Works

On every `git commit`, the pre-commit hook runs:

1. **ESLint** — Fixes linting issues automatically
2. **lint-staged** — Formats staged files with Prettier
3. If checks fail, the commit is blocked until issues are fixed

This prevents bad code from being committed.

## Pre-Commit Hook Details

The `.husky/pre-commit` hook:
- Runs `npm run lint:fix` to auto-fix linting issues
- Runs `npx lint-staged` to format staged files with Prettier

See [.lintstagedrc.json](.lintstagedrc.json) for which file types trigger which checks.

## Bypassing Hooks (Not Recommended)

If you absolutely need to skip hooks (emergency only):

```bash
git commit --no-verify
```

⚠️ Use sparingly; CI will still catch issues.

## Troubleshooting

### Hooks not running?
```bash
husky install
# OR
npm run prepare
```

### Hooks failing on commit?

1. Read the error message — usually linting or formatting issues
2. Fix the issues (or run `npm run lint:fix && npm run format`)
3. Re-stage files: `git add .`
4. Try commit again

### Files not being formatted?

Ensure they're staged before committing:
```bash
git add <file>
git commit
```

lint-staged only formats **staged** files, not unstaged changes.

## CI Integration

- **Pre-commit:** Local checks prevent bad commits
- **CI/CD:** GitHub Actions runs full test suite + lint + build on all PRs
- **Combined:** Developers catch issues early, CI ensures quality

This layered approach saves time and prevents regressions.
