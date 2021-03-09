import { Struct } from 'chemistry'

export interface SmilesManager {
  stringify: (struct: Struct) => string
}
