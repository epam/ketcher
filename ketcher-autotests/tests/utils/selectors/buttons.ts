export enum TopPanelButton {
  Copy = 'Copy',
  Paste = 'Paste',
  Cut = 'Cut',
  Settings = 'Settings',
  Help = 'Help',
  About = 'About',
}

export enum LeftPanelButton {
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
}

export const STRUCTURE_LIBRARY_BUTTON_NAME = 'Structure Library';

export type ToolbarButton =
  | TopPanelButton
  | LeftPanelButton
  | typeof STRUCTURE_LIBRARY_BUTTON_NAME;
