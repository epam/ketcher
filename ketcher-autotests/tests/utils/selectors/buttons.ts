export enum TopPanelButton {
  Copy = 'Copy',
  Paste = 'Paste',
  Cut = 'Cut',
  Settings = 'Settings',
  Help = 'Help',
  About = 'About',
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
  | TopPanelButton
  | RingButton
  | typeof STRUCTURE_LIBRARY_BUTTON_NAME;
