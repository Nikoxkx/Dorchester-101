import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  // Keep the starter on the flat config export that actually runs under the pinned ESLint/Next toolchain.
  ...nextCoreWebVitals,
  globalIgnores([".next/**", "out/**", "build/**", "node_modules/**", "dist/**", "release/**"]),
  {
    rules: {
      /**
       * `purity`, `immutability` and `set-state-in-effect` are new in
       * eslint-plugin-react-hooks v6 and arrive as errors in a codebase written
       * against the v5 rules. The flagged patterns here are deliberate:
       *
       * - measuring the media query, `navigator.onLine` or an element after
       *   mount, which must happen in an effect because the server has no
       *   answer (useMediaPreferences, useOnline, StatCard, PWAInstaller);
       * - a clock and a search field syncing on mount (DorchesterMap,
       *   SearchDialog, FoodPageView);
       * - `Date.now()` and `matchMedia` inside render for the same reason
       *   (purity / immutability).
       *
       * Downgraded to warnings rather than switched off, so they stay visible
       * in the editor and the PR. They can go back to errors once the code has
       * had a dedicated pass at `useSyncExternalStore` and event-based
       * synchronisation.
       */
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);
