import { Struct } from '../struct'

export interface SmilesManager {
  stringify: (struct: Struct) => string
}
