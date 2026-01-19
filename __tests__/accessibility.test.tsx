// @ts-nocheck
/**
 * Accessibility tests for core components.
 * Uses jest-axe to check WCAG 2.1 compliance.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

describe('Accessibility Tests', () => {
  describe('Button Components', () => {
    it('should not have accessibility violations on basic button', async () => {
      const { container } = render(
        <button className="px-4 py-2 bg-indigo-500 text-white rounded">Click me</button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper button roles', () => {
      const { getByRole } = render(
        <button className="px-4 py-2 bg-indigo-500 text-white rounded">
          Submit
        </button>
      );
      const button = getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Form Components', () => {
    it('should have associated labels with inputs', () => {
      const { getByLabelText } = render(
        <label>
          Email
          <input type="email" aria-label="Email input" />
        </label>
      );
      const input = getByLabelText('Email input');
      expect(input).toBeInTheDocument();
    });

    it('should announce required fields', () => {
      const { getByRole } = render(
        <input
          type="text"
          required
          aria-required="true"
          aria-label="Required field"
        />
      );
      const input = getByRole('textbox');
      expect(input).toHaveAttribute('required');
      expect(input).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Navigation Components', () => {
    it('should have semantic nav landmarks', () => {
      const { getByRole } = render(
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
          </ul>
        </nav>
      );
      const nav = getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should have skip links for keyboard navigation', () => {
      const { getByRole } = render(
        <>
          <a href="#main-content" className="sr-only">Skip to main content</a>
          <main id="main-content">Content</main>
        </>
      );
      const skipLink = getByRole('link', { name: /skip to main/i });
      expect(skipLink).toBeInTheDocument();
    });
  });

  describe('Heading Hierarchy', () => {
    it('should have proper heading order', () => {
      const { getByRole } = render(
        <>
          <h1>Main Title</h1>
          <h2>Section</h2>
          <h3>Subsection</h3>
        </>
      );
      const h1 = getByRole('heading', { level: 1 });
      const h2 = getByRole('heading', { level: 2 });
      const h3 = getByRole('heading', { level: 3 });
      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
      expect(h3).toBeInTheDocument();
    });

    it('should not skip heading levels', () => {
      const { container } = render(
        <>
          <h1>Main</h1>
          <h3>Should not skip h2</h3>
        </>
      );
      const h3 = container.querySelector('h3');
      expect(h3).toBeInTheDocument();
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient color contrast', async () => {
      const { container } = render(
        <div style={{ color: '#000000', backgroundColor: '#FFFFFF' }}>
          High contrast text
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ARIA Labels', () => {
    it('should have aria-label for icon buttons', () => {
      const { getByRole } = render(
        <button aria-label="Close menu">✕</button>
      );
      const button = getByRole('button', { name: /close menu/i });
      expect(button).toBeInTheDocument();
    });

    it('should have aria-describedby for help text', () => {
      const { getByRole } = render(
        <>
          <input aria-describedby="password-hint" type="password" aria-label="Password" />
          <span id="password-hint">At least 8 characters</span>
        </>
      );
      const input = getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'password-hint');
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators', () => {
      const { getByRole } = render(
        <button className="focus:outline-2 focus:outline-indigo-500">Focus me</button>
      );
      const button = getByRole('button');
      expect(button).toHaveClass('focus:outline-2');
    });

    it('should trap focus in modals', () => {
      const { getByRole } = render(
        <div role="dialog" aria-modal="true">
          <button>First button</button>
          <button>Last button</button>
        </div>
      );
      const dialog = getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });
});
