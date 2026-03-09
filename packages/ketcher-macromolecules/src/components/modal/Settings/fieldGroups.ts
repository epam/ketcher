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

import { Settings } from 'ketcher-core';

export interface FieldGroup {
  id: string;
  title: string;
  fields: Array<keyof Settings>;
}

export interface FieldDefinition {
  label: string;
  type: 'checkbox' | 'number' | 'text' | 'select' | 'color';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: Array<{ value: any; label: string }>;
  min?: number;
  max?: number;
  step?: number;
}

export const FIELD_GROUPS: FieldGroup[] = [
  {
    id: 'general',
    title: 'General',
    fields: [
      'resetToSelect',
      'rotationStep',
      'showValenceWarnings',
      'atomColoring',
      'font',
      'fontsz',
      'fontszUnit',
      'fontszsub',
      'fontszsubUnit',
      'reactionComponentMarginSize',
      'reactionComponentMarginSizeUnit',
      'imageResolution',
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
    id: 'atoms',
    title: 'Atoms',
    fields: [
      'carbonExplicitly',
      'showCharge',
      'showValence',
      'showHydrogenLabels',
    ],
  },
  {
    id: 'bonds',
    title: 'Bonds',
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
    id: 'server',
    title: 'Server',
    fields: [
      'smart-layout',
      'ignore-stereochemistry-errors',
      'mass-skip-error-on-pseudoatoms',
      'gross-formula-add-rsites',
      'gross-formula-add-isotopes',
    ],
  },
  {
    id: 'viewer3d',
    title: '3D Viewer',
    fields: ['miewMode', 'miewTheme', 'miewAtomLabel'],
  },
  {
    id: 'debug',
    title: 'Options for Debugging',
    fields: ['showAtomIds', 'showBondIds', 'showHalfBondIds', 'showLoopIds'],
  },
];

export const FIELD_DEFINITIONS: Record<string, FieldDefinition> = {
  // General
  resetToSelect: {
    label: 'Reset to Select Tool',
    type: 'select',
    options: [
      { value: true, label: 'Enabled' },
      { value: false, label: 'Disabled' },
      { value: 'paste', label: 'After Paste' },
    ],
  },
  rotationStep: {
    label: 'Rotation Step (degrees)',
    type: 'number',
    min: 1,
    max: 90,
    step: 1,
  },
  showValenceWarnings: {
    label: 'Show Valence Warnings',
    type: 'checkbox',
  },
  atomColoring: {
    label: 'Atom Coloring',
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
    label: 'Font Size',
    type: 'number',
    min: 1,
    max: 96,
    step: 1,
  },
  fontszUnit: {
    label: 'Font Size Unit',
    type: 'select',
    options: [
      { value: 'px', label: 'px' },
      { value: 'pt', label: 'pt' },
      { value: 'cm', label: 'cm' },
      { value: 'inch', label: 'inch' },
    ],
  },
  fontszsub: {
    label: 'Sub/Superscript Font Size',
    type: 'number',
    min: 1,
    max: 96,
    step: 1,
  },
  fontszsubUnit: {
    label: 'Sub/Superscript Font Size Unit',
    type: 'select',
    options: [
      { value: 'px', label: 'px' },
      { value: 'pt', label: 'pt' },
      { value: 'cm', label: 'cm' },
      { value: 'inch', label: 'inch' },
    ],
  },
  reactionComponentMarginSize: {
    label: 'Reaction Component Margin Size',
    type: 'number',
    min: 0.1,
    max: 1000,
    step: 0.1,
  },
  reactionComponentMarginSizeUnit: {
    label: 'Reaction Component Margin Size Unit',
    type: 'select',
    options: [
      { value: 'px', label: 'px' },
      { value: 'pt', label: 'pt' },
      { value: 'cm', label: 'cm' },
      { value: 'inch', label: 'inch' },
    ],
  },
  imageResolution: {
    label: 'Image Resolution',
    type: 'select',
    options: [
      { value: '72', label: 'low (72 DPI)' },
      { value: '600', label: 'high (600 DPI)' },
    ],
  },

  // Stereochemistry
  showStereoFlags: {
    label: 'Show Stereo Flags',
    type: 'checkbox',
  },
  stereoLabelStyle: {
    label: 'Label Display at Stereogenic Centers',
    type: 'select',
    options: [
      { value: 'Iupac', label: 'IUPAC style' },
      { value: 'Classic', label: 'Classic' },
      { value: 'On', label: 'On' },
      { value: 'Off', label: 'Off' },
    ],
  },
  colorOfAbsoluteCenters: {
    label: 'Color of Absolute Centers',
    type: 'color',
  },
  colorOfAndCenters: {
    label: 'Color of AND Centers',
    type: 'color',
  },
  colorOfOrCenters: {
    label: 'Color of OR Centers',
    type: 'color',
  },
  colorStereogenicCenters: {
    label: 'Color Stereogenic Centers',
    type: 'select',
    options: [
      { value: 'LabelsOnly', label: 'Labels Only' },
      { value: 'BondsOnly', label: 'Bonds Only' },
      { value: 'LabelsAndBonds', label: 'Labels and Bonds' },
      { value: 'Off', label: 'Off' },
    ],
  },
  autoFadeOfStereoLabels: {
    label: 'Auto Fade of Stereo Labels',
    type: 'checkbox',
  },
  absFlagLabel: {
    label: 'Absolute Flag Label',
    type: 'text',
  },
  andFlagLabel: {
    label: 'AND Flag Label',
    type: 'text',
  },
  orFlagLabel: {
    label: 'OR Flag Label',
    type: 'text',
  },
  mixedFlagLabel: {
    label: 'Mixed Flag Label',
    type: 'text',
  },
  ignoreChiralFlag: {
    label: 'Ignore Chiral Flag',
    type: 'checkbox',
  },

  // Atoms
  carbonExplicitly: {
    label: 'Show Carbon Explicitly',
    type: 'checkbox',
  },
  showCharge: {
    label: 'Show Charge',
    type: 'checkbox',
  },
  showValence: {
    label: 'Show Valence',
    type: 'checkbox',
  },
  showHydrogenLabels: {
    label: 'Show Hydrogen Labels',
    type: 'select',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'Hetero', label: 'Heteroatoms' },
      { value: 'Terminal', label: 'Terminal' },
      { value: 'Terminal and Hetero', label: 'Terminal and Hetero' },
      { value: 'On', label: 'On' },
    ],
  },

  // Bonds
  aromaticCircle: {
    label: 'Aromatic Circle',
    type: 'checkbox',
  },
  bondSpacing: {
    label: 'Bond Spacing',
    type: 'number',
    min: 0.1,
    max: 10,
    step: 0.1,
  },
  bondThickness: {
    label: 'Bond Thickness',
    type: 'number',
    min: 0.1,
    max: 96,
    step: 0.1,
  },
  bondThicknessUnit: {
    label: 'Bond Thickness Unit',
    type: 'select',
    options: [
      { value: 'px', label: 'px' },
      { value: 'pt', label: 'pt' },
      { value: 'cm', label: 'cm' },
      { value: 'inch', label: 'inch' },
    ],
  },
  stereoBondWidth: {
    label: 'Stereo Bond Width',
    type: 'number',
    min: 0.1,
    max: 96,
    step: 0.1,
  },
  stereoBondWidthUnit: {
    label: 'Stereo Bond Width Unit',
    type: 'select',
    options: [
      { value: 'px', label: 'px' },
      { value: 'pt', label: 'pt' },
      { value: 'cm', label: 'cm' },
      { value: 'inch', label: 'inch' },
    ],
  },
  hashSpacing: {
    label: 'Hash Spacing',
    type: 'number',
    min: 0.1,
    max: 1000,
    step: 0.1,
  },
  hashSpacingUnit: {
    label: 'Hash Spacing Unit',
    type: 'select',
    options: [
      { value: 'px', label: 'px' },
      { value: 'pt', label: 'pt' },
      { value: 'cm', label: 'cm' },
      { value: 'inch', label: 'inch' },
    ],
  },

  // Server
  'smart-layout': {
    label: 'Smart Layout',
    type: 'checkbox',
  },
  'ignore-stereochemistry-errors': {
    label: 'Ignore Stereochemistry Errors',
    type: 'checkbox',
  },
  'mass-skip-error-on-pseudoatoms': {
    label: 'Skip Mass Error on Pseudoatoms',
    type: 'checkbox',
  },
  'gross-formula-add-rsites': {
    label: 'Add R-sites to Gross Formula',
    type: 'checkbox',
  },
  'gross-formula-add-isotopes': {
    label: 'Add Isotopes to Gross Formula',
    type: 'checkbox',
  },

  // 3D Viewer
  miewMode: {
    label: 'Miew Mode',
    type: 'select',
    options: [
      { value: 'LN', label: 'Lines' },
      { value: 'BS', label: 'Ball and Stick' },
      { value: 'LC', label: 'Licorice' },
    ],
  },
  miewTheme: {
    label: 'Miew Theme',
    type: 'select',
    options: [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
    ],
  },
  miewAtomLabel: {
    label: 'Miew Atom Label',
    type: 'select',
    options: [
      { value: 'no', label: 'None' },
      { value: 'bright', label: 'Bright' },
      { value: 'blackAndWhite', label: 'Black and White' },
      { value: 'black', label: 'Black' },
    ],
  },

  // Debug
  showAtomIds: {
    label: 'Show Atom IDs',
    type: 'checkbox',
  },
  showBondIds: {
    label: 'Show Bond IDs',
    type: 'checkbox',
  },
  showHalfBondIds: {
    label: 'Show Half-Bond IDs',
    type: 'checkbox',
  },
  showLoopIds: {
    label: 'Show Loop IDs',
    type: 'checkbox',
  },
};
