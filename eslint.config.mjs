// @ts-check
import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import pluginJest from "eslint-plugin-jest";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  prettier,

  {
    // A config object with just an `ignores` key is the replacement for `.eslintignore`.
    // Patterns for all files and directories that will be ignored by eslint.
    ignores: [
      "**/bin/**",
      "**/dist/**",
      "**/.out/**",
      "*/**/*.js",
      "*/**/*.d.ts",
      "*/**/*.pkl.js",
      "codegen/snippet-tests/output/**/*",
    ],
  },
  /**
   * Global configuration settings (for all configuration objects).
   */
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    languageOptions: {
      parserOptions: {
        projectService: {
          /** Files that will be linted that are not included in the defaultProject (tsconfig) file. See [typescript-eslint allowedDefaultProject](https://typescript-eslint.io/packages/parser#allowdefaultproject) */
          allowDefaultProject: [
            ".out/*.pkl.ts",
            "examples/basic-intro/*.ts",
            "examples/basic-intro/generated/*.pkl.ts",
            "examples/express-server/*.ts",
            "examples/express-server/generated/*.pkl.ts",
          ],
          defaultProject: "tsconfig.json", // Required when using allowDefaultProject
        },
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "simple-import-sort/imports": "error",
      camelcase: ["error", { properties: "always" }],
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
      "no-throw-literal": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      // Specifically allow "_" as a placeholder argument name
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_$" }],
    },
  },

  /**
   * Config specific only to configuration files in project root
   */
  {
    name: "Configuration files in project root",
    files: ["./*.js", "./.*.js", "./*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  /**
   * Config specific to test files only.
   */
  {
    name: "Test files",
    files: ["**/*.test.ts"],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: {
        // recognize 'describe', 'it', 'expect', etc. from jest
        ...globals.jest,
      },
    },
  },
);
