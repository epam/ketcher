export enum MicroBondType {
  Single = 'bond-single',
  Double = 'bond-double',
  Triple = 'bond-triple',
  Any = 'bond-any',
  Aromatic = 'bond-aromatic',
  SingleDouble = 'bond-singledouble',
  SingleAromatic = 'bond-singlearomatic',
  DoubleAromatic = 'bond-doublearomatic',
  Dative = 'bond-dative',
  Hydrogen = 'bond-hydrogen',
  SingleUp = 'bond-up',
  SingleDown = 'bond-down',
  SingleUpDown = 'bond-updown',
  DoubleCisTrans = 'bond-crossed',
}

export enum MacroBondType {
  Single = 'single-bond',
  Hydrogen = 'hydrogen-bond',
}

export enum MacroBondDataIds {
  Single = 'covalent',
  Hydrogen = 'hydrogen',
}

export enum MicroBondDataIds {
  Single = '1',
  Double = '2',
  Triple = '3',
  Any = '8',
  Aromatic = '',
  SingleDouble = '5',
  SingleAromatic = '',
  DoubleAromatic = '',
  Dative = '9',
  Hydrogen = '10',
  SingleUp = '13',
  SingleDown = '23',
  SingleUpDown = '19',
  DoubleCisTrans = '18',
}
