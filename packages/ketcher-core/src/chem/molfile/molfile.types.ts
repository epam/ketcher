import { Struct } from '../struct'

export interface MolfileManager {
  stringify: (struct: Struct) => string
  parse: (stringifiedStruct: string, options?: MolfileParseOptions) => Struct
}

export interface MolfileParseOptions {
  reactionRelayout?: boolean
  badHeaderRecover?: boolean
}
