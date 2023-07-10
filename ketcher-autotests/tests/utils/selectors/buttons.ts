/**
 * Usage: await selectAtom(AtomButton.Carbon, page)
 * Select an atom from Atom toolbar
 *
 **/

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
  Platinum = 'Platinum',
  Periodic = 'Periodic',
  Any = 'Any',
  Extended = 'Extended',
}

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

export type ToolbarButton =
  | AtomButton
  | TopPanelButton
  | LeftPanelButton
  | RingButton
  | typeof STRUCTURE_LIBRARY_BUTTON_NAME;
