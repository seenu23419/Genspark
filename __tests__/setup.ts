// @ts-nocheck
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Suppress console logs in tests
global.console.log = jest.fn();
global.console.debug = jest.fn();
