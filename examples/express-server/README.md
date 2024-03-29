# PklTypescript Example: Express server

This is an example of a simple TypeScript program that uses Pkl for configuration.

## Hand-written code

A summary of each of the files in this directory, and what they do:

- `index.ts`: contains the source code of the express app
- `ConfigSchema.pkl`: contains the schema of the configuration (just the properties and their types, but not any values)
- `config.dev.pkl`: amends `ConfigSchema.pkl`, adding the config values that would be used in local development
- `config.prod.pkl`: amends `ConfigSchema.pkl` but with values to be used in production

## Generated code

There is also another directory, `generated`, that contains `.pkl.ts` files that were generated by `pkl-gen-typescript` based on the given schema.

The `package.json` has a script, titled `gen-config` (but the script name doesn't matter), that executes the following:

```bash
pkl-gen-typescript ./ConfigSchema.pkl -o ./generated
```

This uses the `pkl-gen-typescript` CLI, passing in `ConfigSchema.pkl` as the Pkl module to be evaluated, and outputting the generated TypeScript files to the `./generated` directory.

## Running the app

1. Run `npm install` in this directory to install dependencies (including a local link to the `pkl-typescript` project at the root of this repo)
1. Run `npm run gen-config` to make sure the generated `.pkl.ts` files in the `./generated` directory are up-to-date
1. Run `npm run start` to start the local dev server

Then, in another terminal, run `curl localhost:3003` to see a response from your Pkl-configured Express server.
