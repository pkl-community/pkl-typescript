export type Any = null | AnyObject | Map<Any, Any> | string | number | bigint | boolean
export type AnyObject =
  BaseObject
  | Dynamic
  | Map<Any, Any>
  | Any[]
  | Set<Any>
  | Duration
  | DataSize
  | Pair<any, any>
  | IntSeq
  | Regex
  | {}

// BaseObject is the TS representation of `pkl.base#Object`.
export type BaseObject = {
  // object properties
  [k: string]: Any
}

// Dynamic is the TS representation of `pkl.base#Dynamic`.
export type Dynamic = {
  properties: { [key: string]: Any }
  entries: Map<Any, Any>
  elements: Any[]
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
