import { Struct } from '../struct'

export interface MolfileManager {
  stringify: (struct: Struct) => string
}
