// ModuleSource represents a source for Pkl evaluation.
import * as path from "node:path";

export type ModuleSource = {
  // uri is the URL of the resource.
  uri: URL,

  // Contents is the text contents of the resource, if any.
  //
  // If Contents is not provided, it gets resolved by Pkl during evaluation time.
  // If the scheme of the Uri matches a ModuleReader, it will be used to resolve the module.
  contents?: string,
}

// FileSource builds a ModuleSource, treating its arguments as paths on the file system.
//
// If the provided path is not an absolute path, it will be resolved against the current working
// directory.
//
// If multiple path arguments are provided, they are joined as multiple elements of the path.
export function FileSource(...pathElems: string[]): ModuleSource {
  const src = path.resolve(path.join(...pathElems))
  return {
    uri: new URL(`file://${src}`)
  }
}

const replTextUri = new URL("repl:text")

// TextSource builds a ModuleSource whose contents are the provided text.
export function TextSource(text: string): ModuleSource {
  return {
    uri: replTextUri,
    contents: text,
  }
}

// UriSource builds a ModuleSource using the input uri.
export function UriSource(uri: string): ModuleSource {
  const parsedUri = new URL(uri)
  return {
    uri: parsedUri,
  }
}
