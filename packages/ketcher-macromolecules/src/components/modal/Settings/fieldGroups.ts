/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import type { SettingsFormValue } from 'ketcher-core';

export type SettingFieldValue = boolean | number | string;
export type SettingFieldName = {
  [Key in keyof SettingsFormValue]-?: Exclude<
    SettingsFormValue[Key],
    undefined
  > extends SettingFieldValue
    ? Key
    : never;
}[keyof SettingsFormValue];

export interface FieldGroup {
  id: string;
  title: string;
  fields: Array<SettingFieldName>;
}

export interface FieldDefinition {
  label: string;
  type: 'checkbox' | 'number' | 'text' | 'select' | 'color';
  options?: Array<{ value: SettingFieldValue; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
}

export const FIELD_GROUPS: FieldGroup[] = [
  {
    id: 'atoms',
    title: 'Atoms',
    fields: [
      'carbonExplicitly',
      'showCharge',
      'showValence',
      'showHydrogenLabels',
      'atomColoring',
    ],
  },
  {
    id: 'bonds',
    title: 'Bonds',
    // bondLength is not tracked by the macromolecules settings form; omitted.
    fields: [
      'aromaticCircle',
      'bondSpacing',
      'bondThickness',
      'bondThicknessUnit',
      'stereoBondWidth',
      'stereoBondWidthUnit',
      'hashSpacing',
      'hashSpacingUnit',
    ],
  },
  {
    id: 'stereochemistry',
    title: 'Stereochemistry',
    fields: [
      'showStereoFlags',
      'stereoLabelStyle',
      'colorOfAbsoluteCenters',
      'colorOfAndCenters',
      'colorOfOrCenters',
      'colorStereogenicCenters',
      'autoFadeOfStereoLabels',
      'absFlagLabel',
      'andFlagLabel',
      'orFlagLabel',
      'mixedFlagLabel',
      'ignoreChiralFlag',
    ],
  },
  {
    id: 'reactions',
    title: 'Reactions & Components',
    fields: [
      'reactionComponentMarginSize',
      'reactionComponentMarginSizeUnit',
      'gross-formula-add-rsites',
      'gross-formula-add-isotopes',
    ],
  },
  {
    id: 'general',
    title: 'General Editing & Display',
    fields: [
      'resetToSelect',
      'rotationStep',
      'font',
      'fontsz',
      'fontszUnit',
      'fontszsub',
      'fontszsubUnit',
      'imageResolution',
    ],
  },
  {
    id: 'viewer3d',
    title: '3D Viewer',
    fields: ['miewMode', 'miewTheme', 'miewAtomLabel'],
  },
  {
    id: 'validation',
    title: 'Validation & Calculation',
    // valence-mode is not tracked by the macromolecules settings form; omitted.
    fields: [
      'showValenceWarnings',
      'ignore-stereochemistry-errors',
      'mass-skip-error-on-pseudoatoms',
    ],
  },
  {
    id: 'debug',
    title: 'Debugging',
    fields: [
      'smart-layout',
      'showAtomIds',
      'showBondIds',
      'showHalfBondIds',
      'showLoopIds',
    ],
  },
];

export const FIELD_DEFINITIONS: Record<string, FieldDefinition> = {
  // General
  resetToSelect: {
    label: 'Reset to Select Tool',
    type: 'select',
    options: [
      { value: true, label: 'Auto-Select On' },
      { value: 'paste', label: 'Auto-Select After Paste' },
      { value: false, label: 'Manual Select' },
    ],
  },
  rotationStep: {
    label: 'Rotation Step, º',
    type: 'number',
    min: 1,
    max: 90,
    step: 1,
    tooltip:
      'Allows the rotation tool to move only at the specified angle increments. To disable, hold CTRL.',
  },
  showValenceWarnings: {
    label: 'Show valence warnings',
    type: 'checkbox',
    tooltip: 'Underline atom in red when their valence is exceeded.',
  },
  atomColoring: {
    label: 'Atom coloring',
    type: 'checkbox',
  },
  font: {
    label: 'Font',
    type: 'select',
    // TODO: Replace with dynamic font detection (see ketcher-react/systemfonts.jsx)
    // This hardcoded list should be replaced with runtime font detection using FontFaceObserver
    // to only show fonts actually available on the user's system
    options: [
      { value: '30px Arial', label: 'Arial' },
      { value: '30px Arial Black', label: 'Arial Black' },
      { value: '30px Comic Sans MS', label: 'Comic Sans MS' },
      { value: '30px Courier New', label: 'Courier New' },
      { value: '30px Georgia', label: 'Georgia' },
      { value: '30px Impact', label: 'Impact' },
      { value: '30px Charcoal', label: 'Charcoal' },
      { value: '30px Lucida Console', label: 'Lucida Console' },
      { value: '30px Monaco', label: 'Monaco' },
      { value: '30px Palatino Linotype', label: 'Palatino Linotype' },
      { value: '30px Book Antiqua', label: 'Book Antiqua' },
      { value: '30px Palatino', label: 'Palatino' },
      { value: '30px Tahoma', label: 'Tahoma' },
      { value: '30px Geneva', label: 'Geneva' },
      { value: '30px Times New Roman', label: 'Times New Roman' },
      { value: '30px Times', label: 'Times' },
      { value: '30px Verdana', label: 'Verdana' },
      { value: '30px Symbol', label: 'Symbol' },
      { value: '30px MS Serif', label: 'MS Serif' },
      { value: '30px MS Sans Serif', label: 'MS Sans Serif' },
      { value: '30px New York', label: 'New York' },
      { value: '30px Droid Sans', label: 'Droid Sans' },
      { value: '30px Droid Serif', label: 'Droid Serif' },
      { value: '30px Droid Sans Mono', label: 'Droid Sans Mono' },
      { value: '30px Roboto', label: 'Roboto' },
    ],
  },
  fontsz: {
    label: 'Font size',
    type: 'number',
    min: 1,
    max: 96,
    step: 1,
  },
  fontszUnit: {
    label: 'Font size unit',
    type: 'select',
    options: [
      { value: 'px', label: 'px' },
      { value: 'cm', label: 'cm' },
      { value: 'pt', label: 'pt' },
      { value: 'inch', label: 'inch' },
    ],
  },
  fontszsub: {
    label: 'Subscript/Superscript font size',
    type: 'number',
    min: 1,
    max: 96,
    step: 1,
  },
  fontszsubUnit: {
    label: 'Subscript/Superscript font size unit',
    type: 'select',
    options: [
      { value: 'px', label: 'px' },
      { value: 'cm', label: 'cm' },
      { value: 'pt', label: 'pt' },
      { value: 'inch', label: 'inch' },
    ],
  },
  reactionComponentMarginSize: {
    label: 'Reaction component margin size',
    type: 'number',
    min: 0.1,
    max: 1000,
    step: 0.1,
    tooltip:
      'Adjust the spacing between reactants, products, arrows, catalyst in reaction diagrams.',
  },
  reactionComponentMarginSizeUnit: {
    label: 'Reaction component margin size unit',
    type: 'select',
    options: [
      { value: 'px', label: 'px' },
      { value: 'cm', label: 'cm' },
      { value: 'pt', label: 'pt' },
      { value: 'inch', label: 'inch' },
    ],
  },
  imageResolution: {
    label: 'Image resolution',
    type: 'select',
    tooltip: 'Set image quality for PNG files: Low = 72 DPI, High = 600 DPI.',
    options: [
      { value: '600', label: 'high' },
      { value: '72', label: 'low' },
    ],
  },

  // Stereochemistry
  showStereoFlags: {
    label: 'Show the Stereo flags',
    type: 'checkbox',
    tooltip:
      'Display stereochemistry designation labels (ABS, AND Enantiomer, OR Enantiomer and Mixed) for the whole molecule.',
  },
  stereoLabelStyle: {
    label: 'Label display at chiral centers',
    type: 'select',
    tooltip:
      'Controls the placement of stereochemical labels. At the chiral centers, On displays ‘abs’, ‘or’, ‘and’, and mixed labels; Classic displays ‘or’ and mixed labels; IUPAC Style displays mixed labels; and Off displays none.',
    options: [
      { value: 'Iupac', label: 'IUPAC style' },
      { value: 'Classic', label: 'Classic' },
      { value: 'On', label: 'On' },
      { value: 'Off', label: 'Off' },
    ],
  },
  colorOfAbsoluteCenters: {
    label: 'ABS Center color',
    type: 'color',
    tooltip:
      'Color of atom ABS label (centers with a defined absolute configuration).',
  },
  colorOfAndCenters: {
    label: 'AND Centers color',
    type: 'color',
    tooltip:
      'Color of atom & (AND) label (both isomers at the marked centers are included).',
  },
  colorOfOrCenters: {
    label: 'OR Centers color',
    type: 'color',
    tooltip:
      'Color of atom OR labels (one isomer at the marked center is included).',
  },
  colorStereogenicCenters: {
    label: 'Color chiral centers',
    type: 'select',
    options: [
      { value: 'LabelsOnly', label: 'Labels Only' },
      { value: 'BondsOnly', label: 'Bonds Only' },
      { value: 'LabelsAndBonds', label: 'Labels And Bonds' },
      { value: 'Off', label: 'Off' },
    ],
  },
  autoFadeOfStereoLabels: {
    label: 'Auto fade And/Or center labels',
    type: 'checkbox',
    tooltip:
      'Automatically fades center labels when a molecule has many chiral centers.',
  },
  absFlagLabel: {
    label: 'Text of Absolute flag',
    type: 'text',
  },
  andFlagLabel: {
    label: 'Text of AND flag',
    type: 'text',
  },
  orFlagLabel: {
    label: 'Text of OR flag',
    type: 'text',
  },
  mixedFlagLabel: {
    label: 'Text of Mixed flag',
    type: 'text',
  },
  ignoreChiralFlag: {
    label: 'Ignore the chiral flag',
    type: 'checkbox',
    tooltip:
      'Hide stereo flags and show labels only for non-absolute chiral centers on load from MOL files.',
  },

  // Atoms
  carbonExplicitly: {
    label: 'Display carbon labels explicitly',
    type: 'checkbox',
  },
  showCharge: {
    label: 'Display charge',
    type: 'checkbox',
  },
  showValence: {
    label: 'Display valence',
    type: 'checkbox',
  },
  showHydrogenLabels: {
    label: 'Display hydrogen labels explicitly',
    type: 'select',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'Hetero', label: 'Hetero' },
      { value: 'Terminal', label: 'Terminal' },
      { value: 'Terminal and Hetero', label: 'Terminal and Hetero' },
      { value: 'On', label: 'On' },
    ],
  },

  // Bonds
  aromaticCircle: {
    label: 'Aromatic Bonds as circle',
    type: 'checkbox',
  },
  bondSpacing: {
    label: 'Bond spacing',
    type: 'number',
    min: 0.1,
    max: 10,
    step: 0.1,
  },
  bondThickness: {
    label: 'Bond thickness',
    type: 'number',
    min: 0.1,
    max: 96,
    step: 0.1,
  },
  bondThicknessUnit: {
    label: 'Bond thickness unit',
    type: 'select',
    options: [
      { value: 'px', label: 'px' },
      { value: 'cm', label: 'cm' },
      { value: 'pt', label: 'pt' },
      { value: 'inch', label: 'inch' },
    ],
  },
  stereoBondWidth: {
    label: 'Stereo (Wedge) bond width',
    type: 'number',
    min: 0.1,
    max: 96,
    step: 0.1,
  },
  stereoBondWidthUnit: {
    label: 'Stereo (Wedge) bond width unit',
    type: 'select',
    options: [
      { value: 'px', label: 'px' },
      { value: 'cm', label: 'cm' },
      { value: 'pt', label: 'pt' },
      { value: 'inch', label: 'inch' },
    ],
  },
  hashSpacing: {
    label: 'Hash spacing',
    type: 'number',
    min: 0.1,
    max: 1000,
    step: 0.1,
    tooltip: "Sets the spacing for 'down' stereochemical bond.",
  },
  hashSpacingUnit: {
    label: 'Hash spacing unit',
    type: 'select',
    options: [
      { value: 'px', label: 'px' },
      { value: 'cm', label: 'cm' },
      { value: 'pt', label: 'pt' },
      { value: 'inch', label: 'inch' },
    ],
  },

  // Reactions & Components / Validation & Calculation / Debugging
  'smart-layout': {
    label: 'Smart-layout',
    type: 'checkbox',
    tooltip:
      'Displays cyclic structures as regular polygons with equal bond angles and lengths when off, or irregular polygons when on.',
  },
  'ignore-stereochemistry-errors': {
    label: 'Ignore stereochemistry errors',
    type: 'checkbox',
    tooltip:
      'Allow conversion between file formats for structures with invalid stereochemistry without showing errors.',
  },
  'mass-skip-error-on-pseudoatoms': {
    label: 'Ignore pseudoatoms at mass',
    type: 'checkbox',
  },
  'gross-formula-add-rsites': {
    label: 'Add R sites at mass calculation',
    type: 'checkbox',
  },
  'gross-formula-add-isotopes': {
    label: 'Add Isotopes at mass calculation',
    type: 'checkbox',
  },

  // 3D Viewer
  miewMode: {
    label: 'Display mode',
    type: 'select',
    options: [
      { value: 'LN', label: 'Lines' },
      { value: 'BS', label: 'Balls and Sticks' },
      { value: 'LC', label: 'Licorice' },
    ],
  },
  miewTheme: {
    label: 'Background color',
    type: 'select',
    options: [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
    ],
  },
  miewAtomLabel: {
    label: 'Label coloring',
    type: 'select',
    options: [
      { value: 'no', label: 'No' },
      { value: 'bright', label: 'Bright' },
      { value: 'blackAndWhite', label: 'Black and White' },
      { value: 'black', label: 'Black' },
    ],
  },

  // Debug
  showAtomIds: {
    label: 'Show atom IDs',
    type: 'checkbox',
  },
  showBondIds: {
    label: 'Show bonds IDs',
    type: 'checkbox',
  },
  showHalfBondIds: {
    label: 'Show half bonds IDs',
    type: 'checkbox',
  },
  showLoopIds: {
    label: 'Show loop IDs',
    type: 'checkbox',
  },
};
