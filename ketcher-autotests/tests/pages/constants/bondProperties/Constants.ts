export enum BondTypeOptions {
  Single = 'Single-option',
  SingleUp = 'Single Up-option',
  SingleDown = 'Single Down-option',
  SingleUpDown = 'Single Up/Down-option',
  Double = 'Double-option',
  DoubleCisTrans = 'Double Cis/Trans-option',
  Triple = 'Triple-option',
  Aromatic = 'Aromatic-option',
  Any = 'Any-option',
  Hydrogen = 'Hydrogen-option',
  SingleDouble = 'Single/Double-option',
  SingleAromatic = 'Single/Aromatic-option',
  DoubleAromatic = 'Double/Aromatic-option',
  Dative = 'Dative-option',
}

export enum BondTopologyOptions {
  Either = 'Either-option',
  Ring = 'Ring-option',
  Chain = 'Chain-option',
}

export enum BondReactingCenterOptions {
  Unmarked = 'Unmarked-option',
  NotCenter = 'Not center-option',
  Center = 'Center-option',
  NoChange = 'No change-option',
  MadeBroken = 'Made/broken-option',
  OrderChanges = 'Order changes-option',
  MadeBrokenAndChanges = 'Made/broken and changes-option',
}
