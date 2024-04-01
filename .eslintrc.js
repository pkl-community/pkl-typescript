/* eslint-env node */
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "simple-import-sort"],

  parserOptions: {
    project: true,
  },

  extends: [
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "prettier",
  ],

  rules: {
    "@typescript-eslint/consistent-type-imports": "error",
    "simple-import-sort/imports": "error",
    camelcase: ["error", { properties: "always" }],
    eqeqeq: ["error", "always"],
    "prefer-const": "error",
    "@typescript-eslint/no-throw-literal": "error",
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    // Specifically allow "_" as a placeholder argument name
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_$" },
    ],
  },

  overrides: [
    {
      files: ["./*.js", "./*.mjs"], // config files
      env: { node: true },
      extends: ["plugin:@typescript-eslint/disable-type-checked"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
    {
      files: ["**/*.test.ts"],
      plugins: ["jest"],
    },
  ],
};
