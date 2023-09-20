export enum SORT_TYPE {
  DESC_X = 'DESC_X',
  DESC_Y = 'DESC_Y',
  ASC_X = 'ASC_X',
  ASC_Y = 'ASC_Y',
}
export type Aromaticity = 'aromatic' | 'aliphatic';
export type Chirality = 'clockwise' | 'anticlockwise';

export interface AtomQueryProperties {
  aromaticity?: Aromaticity | null;
  degree?: number | null;
  ringMembership?: number | null;
  ringSize?: number | null;
  connectivity?: number | null;
  ringConnectivity?: number | null;
  chirality?: Chirality | null;
  atomicMass?: number | null;
}

export type AtomAttributes = {
  label?: string;
  charge?: number;
  valence?: number;
  fragment?: number;
  isotope?: number;
  radical?: number;
  explicitValence?: number;
  implicitH?: number;
  ringBondCount?: number;
  implicitHCount?: number | null;
  substitutionCount?: number;
  unsaturatedAtom?: number;
  hCount?: number;
  aam?: number;
  invRet?: number;
  exactChangeFlag?: number;
  rxnFragmentType?: number;
  stereoParity?: number;
  badConn?: boolean;
  pseudo?: string;
  queryProperties?: AtomQueryProperties;
};

// need to get this type from Bond class in ketcher-core package
export enum BondType {
  SINGLE = 1,
  DOUBLE,
  TRIPLE,
  AROMATIC,
  SINGLE_OR_DOUBLE,
  SINGLE_OR_AROMATIC,
  DOUBLE_OR_AROMATIC,
  ANY,
  DATIVE,
  HYDROGEN,
}

export type BondAttributes = {
  angle?: number;
  begin?: number;
  end?: number;
  hb1?: number;
  hb2?: number;
  len?: number;
  reactingCenterStatus?: number;
  sa?: number;
  sb?: number;
  stereo?: number;
  topology?: number;
  type?: BondType;
  xxx?: string;
};

export type AtomXy = AtomAttributes & { x: number; y: number };
export type BondXy = BondAttributes & { x: number; y: number };

export enum ELEMENT_TITLE {
  HYDROGEN = 'Hydrogen (H)',
  BENZENE = 'Benzene (T)',
}
