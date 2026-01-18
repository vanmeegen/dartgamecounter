# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite application with MobX for state management. It's set up with modern tooling including Vitest for testing, ESLint/Prettier for code quality, and Husky/lint-staged for pre-commit hooks.

## Develobunent Commands

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Run linting
bun run lint

# Run tests
bun test                 # Run tests once
bun run test:watch      # Run tests in watch mode
bun run test:ui         # Run tests with UI
bun run test:coverage   # Run tests with coverage report

# Preview production build
bun run preview
```

## Architecture

- **State Management**: MobX with mobx-react-lite for React integration
- **Presentation Model Pattern**: Keep UI components free from any logic, all logic resides in models
- **Avoid Hooks**: React State Hooks will spoil our architecture. Use mobx observables and observers
  where UI state has to be synchronized. Use other hooks only if absolutely needed.
- **Strict Types**: Use typescript strict mode and ensure you don't use untyped arguments or return parameters.
- **Explicit Types**: Avoid inline type declarations. If they are used in more than one place define a type and use this.

## Process

- **TDD Methodology**: Use proper test driven develobunent approach:
  1. First write tests that fail
  2. Then create empty functions/classes with correct signatures
  3. Run tests to verify they compile but fail as expected
  4. Implement the functionality to make tests pass
  5. Refactor if needed while keeping tests green
- **Step by Step**: Work step by step. For complex tasks make a precise plan using deep thinking
  and write it into a plan.md file. If a step is finished, ensure all tests are running and the system builds.
  Then ask me to verify the result and after confirmation update the plan and commit the step.
- **Plan Management**: Update plan.md with beautiful green checkmarks (✅) for completed tasks
- **Commit Process**:
  - Always run tests and linting before committing
  - Update plan.md with progress before committing
  - Use descriptive commit messages
  - Amend commits when requested to update plan status
- **Build Tool**: bun
- **Testing**: bun with happydom environment, tests located in `__tests__` directories
- **Code Quality**: ESLint with TypeScript support, Prettier for formatting
- **Pre-commit**: Husky + lint-staged runs ESLint and Prettier on staged files

## Test Configuration

Tests are configured in vite.config.ts:

- Test files: `**/__tests__/**/*.spec.ts` and `**/__tests__/**/*.spec.tsx`

## Lint-staged Configuration

Automatically runs on commit:

- TypeScript files: ESLint fix + Prettier
- Other files (json, md, css, html): Prettier only

## Code Quality Guidelines

- Avoid disabling linter rules in your code files if possible
- always use strict mode
- DRY: avoid duplicate code lines, refactor common parts into shared functions
- 
