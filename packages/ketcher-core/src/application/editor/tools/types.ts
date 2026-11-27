export enum ToolName {
  monomer = 'monomer',
  preset = 'preset',
  selectRectangle = 'select-rectangle',
  selectLasso = 'select-lasso',
  selectStructure = 'select-structure',
  bondSingle = 'bond-single',
  bondHydrogen = 'bond-hydrogen',
  erase = 'erase',
  clear = 'clear',
  hand = 'hand',
  shapeEllipse = 'shape-ellipse',
  shapeRectangle = 'shape-rectangle',
  shapeLine = 'shape-line',
}

export enum MACROMOLECULES_BOND_TYPES {
  SINGLE = 'single',
  HYDROGEN = 'hydrogen',
}

export type MonomersAlignment = 'horizontal' | 'vertical';
