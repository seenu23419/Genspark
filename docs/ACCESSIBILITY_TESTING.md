# Accessibility & Component Testing

This project includes comprehensive accessibility tests (WCAG 2.1) and component integration tests using React Testing Library and jest-axe.

## Running Tests

### Run all tests
```bash
npm test
```

### Run accessibility tests only
```bash
npm test -- __tests__/accessibility.test.tsx
```

### Run component tests only
```bash
npm test -- __tests__/components.test.tsx
```

### Run tests in watch mode
```bash
npm test:watch
```

### Generate coverage report
```bash
npm test -- --coverage
```

## Test Coverage

### Accessibility Tests (`__tests__/accessibility.test.tsx`)

Validates WCAG 2.1 compliance with:
- **Button Components** - Proper roles and attributes
- **Form Components** - Associated labels, required fields, aria attributes
- **Navigation Components** - Semantic landmarks, skip links
- **Heading Hierarchy** - Proper h1-h6 order
- **Color Contrast** - Sufficient contrast ratios
- **ARIA Labels** - Descriptive labels for all interactive elements
- **Focus Management** - Visible focus indicators, focus trapping in modals

### Component Tests (`__tests__/components.test.tsx`)

Integration tests for:
- **Button Component** - Rendering, click handlers, disabled state
- **Form Component** - Input fields, value updates, validation
- **Navigation Component** - Links, active states
- **Modal Component** - Rendering, backdrop interaction
- **List Component** - Item rendering, empty states
- **Async Operations** - Data loading, loading states
- **Error Handling** - Error messages, error styling
- **Event Handling** - Keyboard events, focus events

### Backend Tests (`__tests__/server.test.ts`)

60+ assertions covering:
- Request validation, language mapping, rate-limiting, authentication, execution timeouts

## jest-axe Integration

jest-axe checks for accessibility violations using Axe DevTools engine:

```typescript
import { axe } from 'jest-axe';

const { container } = render(<MyComponent />);
const results = await axe(container);
expect(results).toHaveNoViolations();
```

## React Testing Library Best Practices

Tests follow the principle of testing behavior, not implementation:

- Query by accessible roles: `getByRole('button')`
- Query by labels: `getByLabelText('Email')`
- Use `userEvent` for user interactions (preferred over `fireEvent`)

## CI Integration

All tests run on every push/PR:
```bash
npm test                # Runs all tests
npm run typecheck       # TypeScript validation
npm run lint:fix        # ESLint + Prettier
```

## Adding New Tests

1. Create test file in `__tests__/` with `.test.tsx` suffix
2. Import `render`, `screen` from `@testing-library/react`
3. Import `axe` from `jest-axe` for accessibility tests
4. Use semantic queries (`getByRole`, `getByLabelText`)

Example:
```typescript
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('should render without accessibility violations', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should handle user interactions', async () => {
    render(<MyComponent />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

## Coverage Goals

- **Unit Tests:** >80% coverage for services and utilities
- **Integration Tests:** >70% coverage for components
- **Accessibility:** 0 violations on critical paths
- **E2E:** Covered by CI typecheck + build validation
