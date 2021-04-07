import { Struct } from 'chemistry/entities'

export interface Serializer {
  deserialize: (content: string) => Struct
  serialize: (struct: Struct) => string
}
