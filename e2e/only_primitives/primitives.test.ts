import { describe, expect, it } from "@jest/globals";
import { loadFromPath } from "@pkl-community/pkl-typescript";
import { join } from "path";

import pklGenTypescript from "../../pkl-gen-typescript/main";

describe("E2E of config with only primitive values", () => {
  it("can generate TypeScript sources and load valid values", async () => {
    await pklGenTypescript([join(__dirname, "schema.pkl")]);
    const config = await loadFromPath(join(__dirname, "correct.pkl"));
    expect(config).toStrictEqual({
      addr: "localhost",
      port: 3000,
    });
  });

  it.each([
    ["missing a required property", "missingRequired.pkl"],
    ["property is of the wrong type", "wrongType.pkl"],
    ["property fails validation constraint", "outOfBounds.pkl"],
  ])(
    "can generate TypeScript sources but error on evaluating invalid values: %s",
    async (_, fileBase) => {
      await pklGenTypescript([join(__dirname, "schema.pkl")]);
      await expect(loadFromPath(join(__dirname, `${fileBase}.pkl`))).rejects.toThrowError();
    },
  );
});
