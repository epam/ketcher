export enum ToolName {
  monomer = 'monomer',
  preset = 'preset',
  selectRectangle = 'select-rectangle',
  selectLasso = 'select-lasso',
  selectFragment = 'select-fragment',
  bondSingle = 'bond-single',
  bondHydrogen = 'bond-hydrogen',
  erase = 'erase',
  clear = 'clear',
  hand = 'hand',
}

export enum MACROMOLECULES_BOND_TYPES {
  SINGLE = 'single',
  HYDROGEN = 'hydrogen',
}

export type MonomersAlignment = 'horizontal' | 'vertical';
