
# Testing Guide

## 📝 Testing Framework

This project uses multiple testing approaches:

### Unit Testing
- Vitest for fast, lightweight tests
- React Testing Library for component testing
- Jest-DOM for DOM assertions

### Integration Testing
- Component interaction testing
- Service and hook testing
- State management testing

### End-to-End Testing
- Playwright for browser automation
- Cypress for alternative E2E testing
- Real user flow simulation

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- src/components/features/shopping/ShoppingList.test.tsx
```

### End-to-End Tests

```bash
# Run Playwright tests
npm run test:e2e

# Run Cypress tests
npm run cypress:run

# Open Cypress test runner
npm run cypress:open
```

## Writing Tests

### Component Test Example

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ShoppingItem from '../ShoppingItem';

describe('ShoppingItem', () => {
  it('renders the item name', () => {
    render(<ShoppingItem name="Apples" checked={false} onToggle={() => {}} />);
    expect(screen.getByText('Apples')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', () => {
    const mockToggle = vi.fn();
    render(<ShoppingItem name="Apples" checked={false} onToggle={mockToggle} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });
});
```

### Testing Best Practices

1. **Test behavior, not implementation**
2. **Use data-testid sparingly**
3. **Mock external dependencies**
4. **Keep tests independent**
5. **Test edge cases and error states**

## Test Coverage

We aim for at least 80% test coverage across the codebase, with critical paths having closer to 100% coverage.

To view test coverage:

```bash
npm run test:coverage
```

This will generate a coverage report in the `coverage` directory.
