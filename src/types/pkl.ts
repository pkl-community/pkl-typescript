export type Any = null | AnyObject | Map<Any, Any> | string | number | bigint | boolean
export type AnyObject = BaseObject | Map<Any, Any> | Any[] | Set<Any> | Duration | DataSize | Pair<any, any> | IntSeq | Regex | {}

// BaseObject is the TS representation of `pkl.base#Object`.
// It is a container for properties (as object properties), entries (in an interior Map), and elements (as Array elements).
export class BaseObject extends Array<any> {
  // #moduleUri is the URI of the module that holds the definition of this object's class.
  #moduleUri: string

  // #name is the qualified name of Pkl object's class.
  //
  // Example:
  //
  // 		"pkl.base#Dynamic"
  #name: string

  // #entries is the set of key-value pairs in an Object.
  #entries: Map<any, any>

  constructor(moduleUri: string, name: string, entries: Map<any, any>) {
    super()

    this.#moduleUri = moduleUri;
    this.#name = name
    this.#entries = entries
  }

  _getEntry(key: any): any {
    return this.#entries.get(key)
  }

  get _moduleUri(): string {
    return this.#moduleUri
  }

  get _name(): string {
    return this.#name
  }

  get _entryMap(): Map<any, any> {
    return this.#entries
  }
}

export type DataSizeUnit = "b" | "kb" | "kib" | "mb" | "mib" | "gb" | "gib" | "tb" | "tib" | "pb" | "pib"

// DataSize is the TS representation of `pkl.base#DataSize`.
//
// It represents a quantity of binary data, represented by value (e.g. 30.5) and unit
// (e.g. mb).
export type DataSize = {
  // value is the value of this data size.
  value: number

  // unit is the unit of this data size.
  unit: DataSizeUnit
}

export type DurationUnit = "ns" | "us" | "ms" | "s" | "min" | "hour" | "d"

// Duration is the TS representation of `pkl.base#Duration`.
//
// It represents an amount of time, represented by value (e.g. 30.5) and unit
// (e.g. s).
export type Duration = {
  // value is the value of this duration.
  value: number

  // unit is the unit of this duration.
  unit: DurationUnit
}

// IntSeq is the TS representation of `pkl.base#IntSeq`.
//
// This value exists for compatibility. IntSeq should preferrably be used as a way to describe
// logic within a Pkl program, and not passed as data between Pkl and TS.
export type IntSeq = {
  // start is the start of this seqeunce.
  start: number

  // end is the end of this seqeunce.
  end: number

  // step is the common difference of successive members of this sequence.
  step: number
}

// Regex is the TS representation of `pkl.base#Regex`.
export type Regex = {
  // pattern is the regex pattern expression in string form.
  pattern: string
}

// Pair is the TS representation of `pkl.base#Pair`.
export type Pair<A, B> = {
  first: A,
  second: B,
}
