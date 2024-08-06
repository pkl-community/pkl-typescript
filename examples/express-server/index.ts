import { loadFromPath } from "@pkl-community/pkl-typescript";
import express from "express";

import type { ConfigSchema } from "./generated/config_schema.pkl";

const app = express();

app.get("/", (_, res) => {
  res.send("Hello from a pkl-configured app!");
});

// The config file to evaluate can be dynamically chosen based on the value of NODE_ENV
const configFile = `config.${process.env.NODE_ENV ?? "dev"}.pkl`;

// Use pkl-typescript to load and evaluate the selected Pkl file
loadFromPath<ConfigSchema>(configFile)
  .then((config) => {
    console.log("Loaded config values from Pkl:", JSON.stringify(config));

    // `config` is a typed object, of the schema given in ConfigSchema.pkl
    app.listen(config.port, config.address, () => {
      console.log("Server started");
    });
  })
  .catch((err: unknown) => {
    console.error(err);
  });
