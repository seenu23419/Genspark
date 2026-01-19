# Code Quality & Linting

This project uses ESLint and Prettier for code quality and consistent formatting.

## Running Linters & Formatters

### Check for linting issues
```bash
npm run lint
```

### Auto-fix linting issues
```bash
npm run lint:fix
```

### Check code formatting
```bash
npm run format:check
```

### Auto-format code
```bash
npm run format
```

## ESLint Configuration

- **Parser:** TypeScript (`@typescript-eslint`)
- **Rules:**
  - React best practices (`plugin:react/recommended`, `plugin:react-hooks/recommended`)
  - TypeScript strict mode
  - Unused variables warning (ignored if prefixed with `_`)
  - Console methods restricted to `warn` and `error`
  - React hooks rules enforced

See [.eslintrc.json](.eslintrc.json) for full configuration.

## Prettier Configuration

- **Print Width:** 100 characters
- **Tab Width:** 2 spaces
- **Trailing Commas:** ES5 compatible
- **Single Quotes:** Yes
- **Semicolons:** Yes

See [.prettierrc.json](.prettierrc.json) for full configuration.

## CI Integration

Linting and formatting checks run automatically on every push and pull request:
1. ESLint validation
2. Prettier formatting check
3. TypeScript typecheck
4. Test suite
5. Build

All must pass before merging.

## IDE Integration

### VS Code

Install extensions:
- **ESLint** by Microsoft
- **Prettier - Code formatter** by Prettier

Add to `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

This will auto-fix ESLint issues and format code on save.
