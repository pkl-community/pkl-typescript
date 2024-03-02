import { describe, expect, it } from "@jest/globals";

import pklGenTypescript from "../../pkl-gen-typescript/main";
import { join } from "path";

describe("E2E of config with only primitive values", () => {
  it("can generate the TypeScript sources", async () => {
    await pklGenTypescript([join(__dirname, "schema.pkl")]);
    const configPkl = await import(join(__dirname, "../../.out/schema.pkl.ts"));
    const config = await configPkl.loadFromPath(join(__dirname, "values.pkl"));
    expect(config).toStrictEqual({
      addr: "localhost",
      port: 3000,
    });
  });
});
