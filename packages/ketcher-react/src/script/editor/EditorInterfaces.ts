import { Atom, Bond, Pool, RxnArrow, RxnPlus } from 'ketcher-core'

export interface Selection {
  atoms?: Array<number>
  bonds?: Array<number>
  enhancedFlags?: Array<number>
  rxnPluses?: Array<number>
  rxnArrows?: Array<number>
}

interface Molecule {
  atoms: Pool<Atom>
  bonds: Pool<Bond>
  rxnPluses: Pool<RxnPlus>
  rxnArrows: Pool<RxnArrow>
}

export interface ReStruct {
  molecule: Molecule
}
