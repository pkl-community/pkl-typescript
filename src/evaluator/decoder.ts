import * as msgpackr from "msgpackr";
import {
  Any,
  AnyObject,
  BaseObject,
  DataSize,
  DataSizeUnit,
  Duration,
  DurationUnit,
  Dynamic,
  IntSeq,
  Pair,
  Regex
} from "../types/pkl";

const
  codeObject = 0x1 as const,
  codeMap = 0x2 as const,
  codeMapping = 0x3 as const,
  codeList = 0x4 as const,
  codeListing = 0x5 as const,
  codeSet = 0x6 as const,
  codeDuration = 0x7 as const,
  codeDataSize = 0x8 as const,
  codePair = 0x9 as const,
  codeIntSeq = 0xA as const,
  codeRegex = 0xB as const,
  codeClass = 0xC as const,
  codeTypeAlias = 0xD as const,
  codeObjectMemberProperty = 0x10 as const,
  codeObjectMemberEntry = 0x11 as const,
  codeObjectMemberElement = 0x12 as const;

type code = typeof codeObject |
  typeof codeMap |
  typeof codeMapping |
  typeof codeList |
  typeof codeListing |
  typeof codeSet |
  typeof codeDuration |
  typeof codeDataSize |
  typeof codePair |
  typeof codeIntSeq |
  typeof codeRegex |
  typeof codeClass |
  typeof codeTypeAlias |
  typeof codeObjectMemberProperty |
  typeof codeObjectMemberEntry |
  typeof codeObjectMemberElement;

type codeObjectMember = typeof codeObjectMemberProperty |
  typeof codeObjectMemberEntry |
  typeof codeObjectMemberElement;


export class Decoder {
  readonly decoder: msgpackr.Decoder

  constructor(options: msgpackr.Options) {
    this.decoder = new msgpackr.Decoder({
      int64AsType: "bigint",
      useRecords: false,
      mapsAsObjects: false,
    })
  }

  decode(bytes: Uint8Array): Any {
    return this.decodeAny(this.decoder.decode(bytes))
  }

  decodeCode(code: code, rest: any[]): AnyObject {
    switch (code) {
      case codeObject: {
        const [name, moduleUri, entries] = rest as [string, string, [codeObjectMember, ...any][]];
        if (name === "Dynamic" && moduleUri === "pkl:base") {
          return this.decodeDynamic(entries)
        }
        return this.decodeObject(name, moduleUri, entries)
      }
      case codeMap:
      case codeMapping: {
        const [map] = rest as [Map<any, any>];
        return this.decodeMap(map)
      }
      case codeList:
      case codeListing: {
        const [list] = rest as [any[]];
        return this.decodeList(list)
      }
      case codeSet: {
        const [list] = rest as [any[]];
        return new Set(this.decodeList(list))
      }
      case codeDuration: {
        const [value, unit] = rest as [number, string];

        const du: Duration = {value, unit: unit as DurationUnit}
        return du
      }
      case codeDataSize: {
        const [value, unit] = rest as [number, string];

        const ds: DataSize = {value, unit: unit as DataSizeUnit}
        return ds
      }
      case codePair: {
        const [first, second] = rest as [any, any]
        const p: Pair<Any, Any> = [this.decodeAny(first), this.decodeAny(second)]
        return p
      }
      case codeIntSeq: {
        const [start, end, step] = rest as [number, number, number];

        const is: IntSeq = {start, end, step}
        return is
      }
      case codeRegex: {
        const [pattern] = rest as [string];

        const re: Regex = {pattern}
        return re
      }
      case codeClass: {
        return {}
      }
      case codeTypeAlias: {
        return {}
      }
      default: {
        throw new Error(`encountered unknown object code: ${code}`)
      }
    }
  }

  decodeObject(name: string, moduleUri: string, rest: [codeObjectMember, ...any][]): BaseObject {
    const out: BaseObject = {}

    for (const entry of rest) {
      const [code, ...rest] = entry;
      switch (code) {
        case codeObjectMemberProperty: {
          const [name, value] = rest as [string, any]
          out[name] = this.decodeAny(value)
          break
        }
        case codeObjectMemberEntry: {
          throw new Error("Unexpected object member entry in non-Dynamic object")
        }
        case codeObjectMemberElement: {
          throw new Error("Unexpected object member element in non-Dynamic object")
        }
      }
    }

    return out
  }

  decodeDynamic(rest: [codeObjectMember, ...any][]): Dynamic {
    let properties: Record<string, Any> = {}
    let entries = new Map<Any, Any>
    let elements = new Array<Any>

    for (const entry of rest) {
      const [code, ...rest] = entry;
      switch (code) {
        case codeObjectMemberProperty: {
          const [name, value] = rest as [any, any]
          if (typeof name !== "string") {
            throw new Error("object member property keys must be strings")
          }
          properties[name] = this.decodeAny(value)
          break
        }
        case codeObjectMemberEntry: {
          const [key, value] = rest as [any, any]
          entries.set(this.decodeAny(key), this.decodeAny(value))
          break
        }
        case codeObjectMemberElement: {
          const [i, value] = rest as [any, any]
          if (typeof i !== "number") {
            throw new Error("object member element indices must be numbers")
          }
          elements[i] = this.decodeAny(value)
          break
        }
      }
    }

    return {properties, entries, elements}
  }

  decodeMap(map: Map<any, any>): Map<Any, Any> {
    const out = new Map();

    for (const [k, v] of map.entries()) {
      out.set(this.decodeAny(k), this.decodeAny(v))
    }

    return out
  }

  decodeList(list: any[]): Any[] {
    return list.map((item) => this.decodeAny(item))
  }

  decodeAny(value: any): Any {
    if (value === null) {
      return value
    }
    if (Array.isArray(value)) {
      // object case
      const [code, ...rest] = value
      return this.decodeCode(code, rest)
    }
    if (typeof value === "object") {
      throw new Error(`unexpected object ${value} provided to decodeAny; expected primitive type or Array`)
    }
    // primitives
    return value
  }
}
