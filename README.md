> [!CAUTION]
>
> # THIS LIBRARY IS CURRENTLY PRE-RELEASE
>
> `pkl-typescript` is currently major version `v0`, and **breaking changes will happen** between versions.
>
> Please read the section [Roadmap](#roadmap) below to learn more.

# Pkl Bindings for TypeScript

This library exposes TypeScript language bindings for the Pkl configuration language.

These language bindings are made up of:

- an "evaluator", that can execute Pkl code and deserialise the result into JavaScript runtime objects
- the `pkl-gen-typescript` CLI, that can analyse a Pkl schema and generate matching TypeScript definitions

Together, this allows you to embed Pkl into your TypeScript application, complete with code generation for full type safety and ease of use.

## Getting Started

First, install `pkl-typescript` from NPM:

```bash
npm install @pkl-community/pkl-typescript
```

Then, generate a TypeScript file from your Pkl schema (eg. for a file called "config.pkl"):

```bash
npx pkl-gen-typescript config.pkl -o ./generated
```

Lastly, in your TypeScript code, you can import the generated types and loader code:

```typescript
import { type Config, loadFromPath } from "./generated/config.pkl.ts";

const config: Config = await loadFromPath("config.pkl");
```

See more example usage in the [examples directory](./examples/).

### Note on Schemas vs. Configs

`pkl-gen-typescript` generates a TypeScript file based on Pkl's **type information** only, _not_ Pkl's runtime values. For example, a Pkl file with `x: String = "hello"` would produce the TypeScript type `x: string`.  
Conversely, the evaluator (used by the `loadFromPath(string)` function) evaluates a Pkl module that **renders values**.

You may choose to have your Pkl schemas and values defined in separate Pkl files (eg. `schema.pkl` and `config.pkl`, where `config.pkl` starts with `amends "schema.pkl"`). In such a case, you would pass `schema.pkl` to `pkl-gen-typescript`, but then evaluate `config.pkl` at runtime (ie. `await loadFromPath("config.pkl")`).

## Roadmap

This library is currently in pre-release: we believe it is usable and productive in its current state, but not feature-complete, and not yet API-stable.

We will keep the major version at `v0` until we are ready to commit to stability in:

- the evaluator API (as provided by the `@pkl-community/pkl-typescript` NPM package)
- the TypeScript type definitions generated by `pkl-gen-typescript`

Until then, minor and patch releases may contain breaking changes.

> [!WARNING]  
> **We strongly recommend** you regenerate your generated TypeScript code (with `pkl-gen-typescript`) **every time you upgrade** `@pkl-community/pkl-typescript`. If you don't, you may end up with unexpected runtime errors from type mismatches.

### Known Current Limitations

- **Inlined imports**: Imported Pkl types are inlined into the output TypeScript file. For example, if `foo.pkl` has an import like `import "bar.pkl"`, and you run `pkl-gen-typescript foo.pkl`, the resulting `foo.pkl.ts` file will include all types defined in `foo.pkl` _as well as_ all types defined in `bar.pkl`. This means that the resulting TypeScript generated files (in a multi-file codegen) will match the set of input root files, not the file structure of the source Pkl files. This behaviour may create unintended name conflicts; these can be resolved using the `@typescript.Name { value = "..." }` annotation. It may also cause duplication (eg. if the same shared Pkl library file is imported in two schemas); TypeScript's structural typing (where equivalent type shapes can be used interchangeably) should mean that any duplicate types can be safely used as each other.
- **Subclass type overrides**: Pkl class definitions are generated as TypeScript interfaces in code generation; Pkl supports completely changing the type of a property in a child class, but this is not allowed in TypeScript extending interfaces. When a TypeScript interface `extends` a parent interface, overrides of the type of a property must be "compatible" with the parent type (eg. overriding a `string` type with a string-literal type). TypeScript codegen currently has support for a few compatible types, and others may be allowed in the future (if you have an example of a compatible type that should work but fails in codegen, please file a GitHub Issue).
- **Regex deserialisation**: Pkl's `Regex` type will be decoded as a `pklTypescript.Regex` object, which contains a `.pattern` property. Pkl uses Java's regular expression syntax, which may not always be perfectly compatible with JavaScript's regular expression syntax. If you want to use your Pkl `Regex` as a JavaScript `RegExp`, and you are confident that the expression will behave the same way in JavaScript as in Pkl, you can instantiate a new `RegExp` using the `pklTypescript.Regex.pattern` property, eg. `const myConfigRegexp = new RegExp(myConfig.someRegex.pattern)`.
- **IntSeq deserialisation**: Pkl's `IntSeq` type is intended to be used internally within a Pkl program to create a range loop. It is unlikely to be useful as a property type in JavaScript, and is therefore decoded into a custom `pklTypescript.IntSeq` type with signature `{ start: number; end: number: step: number }` - it is _not_ decoded into an array containing the ranged values. If you have a use-case to use `IntSeq` as an array of ranged values in a TypeScript program, please file a GitHub Issue.
- **Duration and DataSize APIs**: Pkl has a rich API for many of its custom types, but two of note (that are not common in standard libraries of other languages) are `Duration` and `DataSize`, which include convenience APIs for eg. converting between units or summing values. These types are decoded into `pklTypescript.DataSize`/`pklTypescript.Duration` types (each of which have a `value` and `unit` property), and do not yet have the convenience APIs from Pkl.

## Appendix

### Pkl Binary Version

This package has a peer dependency on `@pkl-community/pkl`, to ensure a Pkl binary is installed. You can use an alternative Pkl binary (for either the evaluator or codegen) by setting the environment variable `PKL_EXEC` with the path to a Pkl binary.

### Type Mappings

When code-generating TypeScript type definitions from Pkl schemas, each Pkl type is converted to an associated TypeScript type, as per the table below. While in pre-release, these mappings are subject to change!

| Pkl type         | TypeScript type            |
| ---------------- | -------------------------- |
| Null             | `null`                     |
| Boolean          | `boolean`                  |
| String           | `string`                   |
| Int              | `number`                   |
| Int8             | `number`                   |
| Int16            | `number`                   |
| Int32            | `number`                   |
| UInt             | `number`                   |
| UInt8            | `number`                   |
| UInt16           | `number`                   |
| UInt32           | `number`                   |
| Float            | `number`                   |
| Number           | `number`                   |
| List<T>          | `Array<T>`                 |
| Listing<T>       | `Array<T>`                 |
| Map<K, V>        | `Map<K, V>`                |
| Mapping<K, V>    | `Map<K, V>`                |
| Set<T>           | `Set<T>`                   |
| Pair<A, B>       | `pklTypescript.Pair<A, B>` |
| Dynamic          | `pklTypescript.Dynamic`    |
| DataSize         | `pklTypescript.DataSize`   |
| Duration         | `pklTypescript.Duration`   |
| IntSeq           | `pklTypescript.IntSeq`     |
| Class            | `interface`                |
| TypeAlias        | `typealias`                |
| Any              | `pklTypescript.Any`        |
| Unions (A\|B\|C) | `A\|B\|C`                  |
| Regex            | `pklTypescript.Regex`      |
