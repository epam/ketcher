/**
 * Usage: await selectAtom(AtomButton.Carbon, page)
 * Select an atom from Atom toolbar
 *
 **/

export enum BondTypeId {
  BondSingle = 'bond-single',
  BondDouble = 'bond-double',
  BondTriple = 'bond-triple',
  BondDown = 'bond-down',
}

export type BondIds =
  | BondTypeId.BondSingle
  | BondTypeId.BondDouble
  | BondTypeId.BondTriple
  | 'bond-dative'
  | 'bond-stereo'
  | 'bond-up'
  | BondTypeId.BondDown
  | 'bond-updown'
  | 'bond-crossed'
  | 'bond-query'
  | 'bond-special'
  | 'bond-any'
  | 'bond-hydrogen'
  | 'bond-aromatic'
  | 'bond-singledouble'
  | 'bond-singlearomatic'
  | 'bond-doublearomatic';

export enum AtomButton {
  Hydrogen = 'Hydrogen',
  Carbon = 'Carbon',
  Nitrogen = 'Nitrogen',
  Oxygen = 'Oxygen',
  Sulfur = 'Sulfur',
  Phosphorus = 'Phosphorus',
  Fluorine = 'Fluorine',
  Chlorine = 'Chlorine',
  Bromine = 'Bromine',
  Iodine = 'Iodine',
  Gold = 'Gold',
  Platinum = 'Platinum',
  Periodic = 'Periodic',
  Any = 'Any',
  Extended = 'Extended',
}

export type Atoms = Exclude<
  AtomButton,
  | AtomButton.Gold
  | AtomButton.Platinum
  | AtomButton.Periodic
  | AtomButton.Any
  | AtomButton.Extended
>;

export enum TopPanelButton {
  Clear = 'Clear',
  Open = 'Open...',
  Save = 'Save',
  Copy = 'Copy',
  Paste = 'Paste',
  Cut = 'Cut',
  Undo = 'Undo',
  Redo = 'Redo',
  Aromatize = 'Aromatize',
  Dearomatize = 'Dearomatize',
  Layout = 'Layout',
  Clean = 'Clean',
  Calculate = 'Calculate CIP',
  Check = 'Check',
  Calculated = 'Calculated',
  ThreeD = '3D',
  Settings = 'Settings',
  Help = 'Help',
  About = 'About',
  Fullscreen = 'Fullscreen',
  toggleExplicitHydrogens = 'Add/Remove explicit hydrogens',
}

export enum LeftPanelButton {
  HandTool = 'Hand tool',
  RectangleSelection = 'Rectangle Selection',
  Erase = 'Erase',
  SingleBond = 'Single Bond',
  Chain = 'Chain',
  Stereochemistry = 'Stereochemistry',
  ChargePlus = 'Charge Plus',
  ChargeMinus = 'Charge Minus',
  RotateTool = 'Rotate Tool',
  S_Group = 'S-Group',
  ReactionPlusTool = 'Reaction Plus Tool',
  ArrowOpenAngleTool = 'Arrow Open Angle Tool',
  ReactionMappingTool = 'Reaction Mapping Tool',
  R_GroupLabelTool = 'R-Group Label Tool',
  ShapeEllipse = 'Shape Ellipse',
  AddText = 'Add text',
  AddImage = 'Add Image',
  ZoomIn = 'Zoom In',
  ZoomOut = 'Zoom Out',
  ZoomReset = 'Reset Zoom',
}

export enum RingButton {
  Benzene = 'Benzene',
  Cyclopentadiene = 'Cyclopentadiene',
  Cyclohexane = 'Cyclohexane',
  Cyclopentane = 'Cyclopentane',
  Cyclopropane = 'Cyclopropane',
  Cyclobutane = 'Cyclobutane',
  Cycloheptane = 'Cycloheptane',
  Cyclooctane = 'Cyclooctane',
}

export const STRUCTURE_LIBRARY_BUTTON_NAME = 'Structure Library';

export enum MacromoleculesTopPanelButton {
  Clear = 'Clear',
  Undo = 'Undo',
  Redo = 'Redo',
  Open = 'Open...',
  Save = 'Save',
  ZoomIn = 'Zoom In',
  ZoomOut = 'Zoom Out',
  ZoomReset = 'Zoom 100%',
}

export type ToolbarButton =
  | AtomButton
  | TopPanelButton
  | LeftPanelButton
  | MacromoleculesTopPanelButton
  | RingButton
  | typeof STRUCTURE_LIBRARY_BUTTON_NAME;

export enum MacromoleculesLeftPanelButton {
  Erase = 'Erase',
  SingleBond = 'Single Bond',
}
