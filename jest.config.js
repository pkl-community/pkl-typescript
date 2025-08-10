/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@pkl-community/pkl-typescript$": "<rootDir>/src",
  },
  testMatch: [
    "<rootDir>/codegen/**/*.test.ts",
    "<rootDir>/e2e/**/*.ts",
    "<rootDir>/src/**/*.test.ts",
    "!**/dist/**",
  ]
};
