import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import { globalIgnores } from "eslint/config";

export default tseslint.config([
  // Editor/agent worktrees (.kilo, .claude) hold full repo copies with their own tsconfig.json,
  // which makes typescript-eslint's parser refuse to guess a root — keep them out of the lint.
  globalIgnores([
    "dist",
    "node_modules",
    "legacy",
    "src/components/ui",
    ".kilo",
    ".claude",
    ".planning",
    "design-exploration",
    "graphify-out",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended, reactRefresh.configs.vite],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs["recommended-latest"].rules,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // eslint-config-prettier must stay last so it can disable stylistic
  // rules that would otherwise conflict with Prettier formatting.
  eslintConfigPrettier,
]);
