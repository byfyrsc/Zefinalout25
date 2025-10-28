# 📘 Project Best Practices

This document outlines the conventions, patterns, and best practices to follow when contributing to this project. Adhering to these guidelines ensures code quality, consistency, and maintainability.

## 1. Package Manager

**Standardize on `pnpm`**. This project uses `pnpm` to manage dependencies, ensuring fast, efficient, and consistent installations.

- **Lockfile**: The official lockfile is `pnpm-lock.yaml`.
- **Action Required**: To prevent conflicts, please delete any other lockfiles from your local environment:
  ```bash
  rm package-lock.json bun.lockb
  ```
- **Usage**:
  - Install dependencies: `pnpm install`
  - Add a dependency: `pnpm add <package-name>`
  - Run scripts: `pnpm <script-name>`

## 2. Path Aliases

The project uses the `@` alias for absolute imports from the `src` directory. This improves readability and avoids fragile relative paths (`../../...`).

- **Convention**: Always use the `@` alias for imports within the `src` folder.
  ```typescript
  // Good
  import { AppProviders } from '@/components/AppProviders';
  import { supabase } from '@/lib/supabase';

  // Bad
  import { AppProviders } from '../components/AppProviders';
  ```
- **Configuration**: The alias is configured in both `tsconfig.json` and `vite.config.ts`.

  <details>
  <summary>tsconfig.json</summary>

  ```json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["src/*"]
      }
    }
  }
  ```
  </details>

  <details>
  <summary>vite.config.ts</summary>

  ```typescript
  import path from 'node:path';
  import { defineConfig } from 'vite';

  export default defineConfig({
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  });
  ```
  </details>

## 3. Linting and Formatting

A consistent code style is enforced using **ESLint** and **Prettier**.

- **Linting**: Run ESLint to identify and fix code quality issues.
  ```bash
  # Run the linter
  pnpm lint
  ```
  - **Rules**: Our ESLint configuration enforces React Hooks rules, TypeScript best practices, and accessibility standards. All lint errors must be fixed before merging a pull request.

- **Formatting**: Prettier is used for automatic code formatting.
  ```bash
  # Format all files
  pnpm format
  ```
  - **CI**: A formatting check runs in CI. Ensure your code is formatted before pushing.

## 4. Environment Variables

All environment variables are managed centrally and validated to ensure type safety and prevent runtime errors.

- **Central Module**: All environment variable access **must** go through `src/lib/env.ts`. Do not use `process.env` or `import.meta.env` anywhere else in the application.
- **Validation**: We use `zod` to parse and validate environment variables at startup. This provides type safety and ensures that all required variables are present.

  ```typescript
  // src/lib/env.ts
  import { z } from 'zod';

  const EnvSchema = z.object({
    VITE_SUPABASE_URL: z.string().url('A valid Supabase URL is required'),
    VITE_SUPABASE_ANON_KEY: z.string().min(1, 'A Supabase anon key is required'),
    VITE_SENTRY_DSN: z.string().url().optional(),
  });

  const parsedEnv = EnvSchema.safeParse(import.meta.env);

  if (!parsedEnv.success) {
    console.error(
      '❌ Invalid environment variables:',
      parsedEnv.error.flatten().fieldErrors,
    );
    throw new Error('Invalid environment variables.');
  }

  export const env = parsedEnv.data;
  ```

## 5. Testing

The project uses **Vitest**, **React Testing Library**, and `jsdom` for unit and integration tests.

- **Configuration**: The test environment is configured in `vitest.config.ts`.

  ```typescript
  // vitest.config.ts
  import { defineConfig } from 'vitest/config';

  export default defineConfig({
    test: {
      globals: true,
      environment: 'jsdom', // Simulate a browser environment
      setupFiles: 'src/tests/setup.ts', // Global setup file
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  });
  ```

- **Running Tests**:
  - `pnpm test`: Run tests in watch mode.
  - `pnpm test:run`: Run tests once (for CI).
  - `pnpm test:ui`: Open the Vitest UI for interactive testing.

- **Test Placement**:
  - **Co-location**: Place test files directly next to the source files they are testing (e.g., `Button.tsx` and `Button.test.tsx`). This improves discoverability.
  - **`__tests__` Directory**: For complex components or modules with multiple test files, a `__tests__` sub-directory is acceptable.

- **Coverage**:
  - Aim for meaningful coverage on critical paths: **auth logic, routing guards, validation, and core business logic**.
  - Do not chase 100% coverage with low-value tests.

- **Mocking**:
  - Mock external services and APIs at the boundary (e.g., in the `lib` directory) to isolate tests.

## 6. Error Handling & Monitoring

**Sentry** is used for centralized error monitoring in production.

- **Initialization**: Sentry is initialized in a dedicated module (e.g., `src/lib/sentry.ts`) and called from `AppProviders`. Its activation is controlled by environment variables to keep it disabled in development.

  ```typescript
  // src/lib/sentry.ts
  import * as Sentry from '@sentry/react';
  import { env } from '@/lib/env';

  export function initializeSentry() {
    if (env.VITE_SENTRY_DSN) {
      Sentry.init({
        dsn: env.VITE_SENTRY_DSN,
        integrations: [Sentry.browserTracingIntegration()],
        tracesSampleRate: 0.1, // Adjust as needed
        enabled: import.meta.env.PROD, // Only enable in production
        beforeSend(event) {
          // TODO: Add logic to scrub personally identifiable information (PII)
          return event;
        },
      });
    }
  }
  ```

## 7. PWA & Capacitor

The application is a Progressive Web App (PWA) and uses Capacitor for native mobile capabilities.

- **PWA**:
  - **Service Worker**: The `vite-plugin-pwa` handles service worker generation and caching strategies.
  - **Offline UX**: Design features to be resilient to network interruptions. Use caching and background sync where appropriate.
  - **Update Flow**: Implement a user-friendly notification when a new version of the app is available.

- **Capacitor**:
  - **Builds**: To create a native build, first sync the web app assets:
    ```bash
    pnpm build
    npx cap sync
    ```
  - Follow the official Capacitor documentation for building and running on [Android](https://capacitorjs.com/docs/android) and [iOS](https://capacitorjs.com/docs/ios).

## 8. Code Structure & Conventions

- **`src/components`**: Reusable UI components.
- **`src/contexts`**: Global state and context providers.
- **`src/hooks`**: Custom hooks for reusable logic.
- **`src/lib`**: Wrappers for external services (e.g., Supabase, Stripe) and environment variables.
- **`src/pages`**: Top-level application screens.
- **`src/routes`**: Routing configuration.
- **`src/types`**: Shared TypeScript types and interfaces.
- **`src/utils`**: Utility functions.