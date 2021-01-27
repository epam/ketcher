import Struct from '../chem/struct'

export interface StructProvider {
  struct: () => Struct
}
