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
  /**
   * Frozen English literal, NOT a translation key - Playwright's
   * settingsDialog/Constants.ts hardcodes `${title}-accordion` test ids
   * (e.g. 'General-accordion'), so this value must never change. Use
   * `titleKey` for the translated, user-visible group label.
   */
  title: string;
  titleKey: string;
  fields: Array<SettingFieldName>;
}

export interface FieldDefinition {
  labelKey: string;
  type: 'checkbox' | 'number' | 'text' | 'select' | 'color';
  options?: Array<{ value: SettingFieldValue; labelKey: string }>;
  min?: number;
  max?: number;
  step?: number;
}

export const FIELD_GROUPS: FieldGroup[] = [
  {
    id: 'general',
    title: 'General',
    titleKey: 'settings.groups.general',
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
    titleKey: 'settings.groups.stereochemistry',
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
    titleKey: 'settings.groups.atoms',
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
    titleKey: 'settings.groups.bonds',
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
    titleKey: 'settings.groups.server',
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
    titleKey: 'settings.groups.viewer3d',
    fields: ['miewMode', 'miewTheme', 'miewAtomLabel'],
  },
  {
    id: 'debug',
    title: 'Options for Debugging',
    titleKey: 'settings.groups.debug',
    fields: ['showAtomIds', 'showBondIds', 'showHalfBondIds', 'showLoopIds'],
  },
];

// Plain literal English (not translation keys): px/pt/cm/inch are unit
// abbreviations, not language content - same convention as ketcher-react's
// own Settings dialog (see .memory-bank/modules/i18n.md).
const UNIT_OPTIONS = [
  { value: 'px', labelKey: 'px' },
  { value: 'pt', labelKey: 'pt' },
  { value: 'cm', labelKey: 'cm' },
  { value: 'inch', labelKey: 'inch' },
];

export const FIELD_DEFINITIONS: Record<string, FieldDefinition> = {
  // General
  resetToSelect: {
    labelKey: 'settings.fields.resetToSelect',
    type: 'select',
    options: [
      { value: true, labelKey: 'settings.fields.resetToSelectEnabled' },
      { value: false, labelKey: 'settings.fields.resetToSelectDisabled' },
      { value: 'paste', labelKey: 'settings.fields.resetToSelectAfterPaste' },
    ],
  },
  rotationStep: {
    labelKey: 'settings.fields.rotationStep',
    type: 'number',
    min: 1,
    max: 90,
    step: 1,
  },
  showValenceWarnings: {
    labelKey: 'settings.fields.showValenceWarnings',
    type: 'checkbox',
  },
  atomColoring: {
    labelKey: 'settings.fields.atomColoring',
    type: 'checkbox',
  },
  font: {
    labelKey: 'settings.fields.font',
    type: 'select',
    // TODO: Replace with dynamic font detection (see ketcher-react/systemfonts.jsx)
    // This hardcoded list should be replaced with runtime font detection using FontFaceObserver
    // to only show fonts actually available on the user's system
    // Font family names are proper nouns, not translation keys.
    options: [
      { value: '30px Arial', labelKey: 'Arial' },
      { value: '30px Arial Black', labelKey: 'Arial Black' },
      { value: '30px Comic Sans MS', labelKey: 'Comic Sans MS' },
      { value: '30px Courier New', labelKey: 'Courier New' },
      { value: '30px Georgia', labelKey: 'Georgia' },
      { value: '30px Impact', labelKey: 'Impact' },
      { value: '30px Charcoal', labelKey: 'Charcoal' },
      { value: '30px Lucida Console', labelKey: 'Lucida Console' },
      { value: '30px Monaco', labelKey: 'Monaco' },
      { value: '30px Palatino Linotype', labelKey: 'Palatino Linotype' },
      { value: '30px Book Antiqua', labelKey: 'Book Antiqua' },
      { value: '30px Palatino', labelKey: 'Palatino' },
      { value: '30px Tahoma', labelKey: 'Tahoma' },
      { value: '30px Geneva', labelKey: 'Geneva' },
      { value: '30px Times New Roman', labelKey: 'Times New Roman' },
      { value: '30px Times', labelKey: 'Times' },
      { value: '30px Verdana', labelKey: 'Verdana' },
      { value: '30px Symbol', labelKey: 'Symbol' },
      { value: '30px MS Serif', labelKey: 'MS Serif' },
      { value: '30px MS Sans Serif', labelKey: 'MS Sans Serif' },
      { value: '30px New York', labelKey: 'New York' },
      { value: '30px Droid Sans', labelKey: 'Droid Sans' },
      { value: '30px Droid Serif', labelKey: 'Droid Serif' },
      { value: '30px Droid Sans Mono', labelKey: 'Droid Sans Mono' },
      { value: '30px Roboto', labelKey: 'Roboto' },
    ],
  },
  fontsz: {
    labelKey: 'settings.fields.fontsz',
    type: 'number',
    min: 1,
    max: 96,
    step: 1,
  },
  fontszUnit: {
    labelKey: 'settings.fields.fontszUnit',
    type: 'select',
    options: UNIT_OPTIONS,
  },
  fontszsub: {
    labelKey: 'settings.fields.fontszsub',
    type: 'number',
    min: 1,
    max: 96,
    step: 1,
  },
  fontszsubUnit: {
    labelKey: 'settings.fields.fontszsubUnit',
    type: 'select',
    options: UNIT_OPTIONS,
  },
  reactionComponentMarginSize: {
    labelKey: 'settings.fields.reactionComponentMarginSize',
    type: 'number',
    min: 0.1,
    max: 1000,
    step: 0.1,
  },
  reactionComponentMarginSizeUnit: {
    labelKey: 'settings.fields.reactionComponentMarginSizeUnit',
    type: 'select',
    options: UNIT_OPTIONS,
  },
  imageResolution: {
    labelKey: 'settings.fields.imageResolution',
    type: 'select',
    options: [
      { value: '72', labelKey: 'settings.fields.imageResolutionLow' },
      { value: '600', labelKey: 'settings.fields.imageResolutionHigh' },
    ],
  },

  // Stereochemistry
  showStereoFlags: {
    labelKey: 'settings.fields.showStereoFlags',
    type: 'checkbox',
  },
  stereoLabelStyle: {
    labelKey: 'settings.fields.stereoLabelStyle',
    type: 'select',
    options: [
      { value: 'Iupac', labelKey: 'settings.fields.stereoLabelStyleIupac' },
      {
        value: 'Classic',
        labelKey: 'settings.fields.stereoLabelStyleClassic',
      },
      { value: 'On', labelKey: 'settings.fields.stereoLabelStyleOn' },
      { value: 'Off', labelKey: 'settings.fields.stereoLabelStyleOff' },
    ],
  },
  colorOfAbsoluteCenters: {
    labelKey: 'settings.fields.colorOfAbsoluteCenters',
    type: 'color',
  },
  colorOfAndCenters: {
    labelKey: 'settings.fields.colorOfAndCenters',
    type: 'color',
  },
  colorOfOrCenters: {
    labelKey: 'settings.fields.colorOfOrCenters',
    type: 'color',
  },
  colorStereogenicCenters: {
    labelKey: 'settings.fields.colorStereogenicCenters',
    type: 'select',
    options: [
      {
        value: 'LabelsOnly',
        labelKey: 'settings.fields.colorStereogenicCentersLabelsOnly',
      },
      {
        value: 'BondsOnly',
        labelKey: 'settings.fields.colorStereogenicCentersBondsOnly',
      },
      {
        value: 'LabelsAndBonds',
        labelKey: 'settings.fields.colorStereogenicCentersLabelsAndBonds',
      },
      {
        value: 'Off',
        labelKey: 'settings.fields.colorStereogenicCentersOff',
      },
    ],
  },
  autoFadeOfStereoLabels: {
    labelKey: 'settings.fields.autoFadeOfStereoLabels',
    type: 'checkbox',
  },
  absFlagLabel: {
    labelKey: 'settings.fields.absFlagLabel',
    type: 'text',
  },
  andFlagLabel: {
    labelKey: 'settings.fields.andFlagLabel',
    type: 'text',
  },
  orFlagLabel: {
    labelKey: 'settings.fields.orFlagLabel',
    type: 'text',
  },
  mixedFlagLabel: {
    labelKey: 'settings.fields.mixedFlagLabel',
    type: 'text',
  },
  ignoreChiralFlag: {
    labelKey: 'settings.fields.ignoreChiralFlag',
    type: 'checkbox',
  },

  // Atoms
  carbonExplicitly: {
    labelKey: 'settings.fields.carbonExplicitly',
    type: 'checkbox',
  },
  showCharge: {
    labelKey: 'settings.fields.showCharge',
    type: 'checkbox',
  },
  showValence: {
    labelKey: 'settings.fields.showValence',
    type: 'checkbox',
  },
  showHydrogenLabels: {
    labelKey: 'settings.fields.showHydrogenLabels',
    type: 'select',
    options: [
      { value: 'off', labelKey: 'settings.fields.showHydrogenLabelsOff' },
      {
        value: 'Hetero',
        labelKey: 'settings.fields.showHydrogenLabelsHetero',
      },
      {
        value: 'Terminal',
        labelKey: 'settings.fields.showHydrogenLabelsTerminal',
      },
      {
        value: 'Terminal and Hetero',
        labelKey: 'settings.fields.showHydrogenLabelsTerminalAndHetero',
      },
      { value: 'On', labelKey: 'settings.fields.showHydrogenLabelsOn' },
    ],
  },

  // Bonds
  aromaticCircle: {
    labelKey: 'settings.fields.aromaticCircle',
    type: 'checkbox',
  },
  bondSpacing: {
    labelKey: 'settings.fields.bondSpacing',
    type: 'number',
    min: 0.1,
    max: 10,
    step: 0.1,
  },
  bondThickness: {
    labelKey: 'settings.fields.bondThickness',
    type: 'number',
    min: 0.1,
    max: 96,
    step: 0.1,
  },
  bondThicknessUnit: {
    labelKey: 'settings.fields.bondThicknessUnit',
    type: 'select',
    options: UNIT_OPTIONS,
  },
  stereoBondWidth: {
    labelKey: 'settings.fields.stereoBondWidth',
    type: 'number',
    min: 0.1,
    max: 96,
    step: 0.1,
  },
  stereoBondWidthUnit: {
    labelKey: 'settings.fields.stereoBondWidthUnit',
    type: 'select',
    options: UNIT_OPTIONS,
  },
  hashSpacing: {
    labelKey: 'settings.fields.hashSpacing',
    type: 'number',
    min: 0.1,
    max: 1000,
    step: 0.1,
  },
  hashSpacingUnit: {
    labelKey: 'settings.fields.hashSpacingUnit',
    type: 'select',
    options: UNIT_OPTIONS,
  },

  // Server
  'smart-layout': {
    labelKey: 'settings.fields.smartLayout',
    type: 'checkbox',
  },
  'ignore-stereochemistry-errors': {
    labelKey: 'settings.fields.ignoreStereochemistryErrors',
    type: 'checkbox',
  },
  'mass-skip-error-on-pseudoatoms': {
    labelKey: 'settings.fields.massSkipErrorOnPseudoatoms',
    type: 'checkbox',
  },
  'gross-formula-add-rsites': {
    labelKey: 'settings.fields.grossFormulaAddRsites',
    type: 'checkbox',
  },
  'gross-formula-add-isotopes': {
    labelKey: 'settings.fields.grossFormulaAddIsotopes',
    type: 'checkbox',
  },

  // 3D Viewer
  miewMode: {
    labelKey: 'settings.fields.miewMode',
    type: 'select',
    options: [
      { value: 'LN', labelKey: 'settings.fields.miewModeLines' },
      { value: 'BS', labelKey: 'settings.fields.miewModeBallAndStick' },
      { value: 'LC', labelKey: 'settings.fields.miewModeLicorice' },
    ],
  },
  miewTheme: {
    labelKey: 'settings.fields.miewTheme',
    type: 'select',
    options: [
      { value: 'light', labelKey: 'settings.fields.miewThemeLight' },
      { value: 'dark', labelKey: 'settings.fields.miewThemeDark' },
    ],
  },
  miewAtomLabel: {
    labelKey: 'settings.fields.miewAtomLabel',
    type: 'select',
    options: [
      { value: 'no', labelKey: 'settings.fields.miewAtomLabelNone' },
      { value: 'bright', labelKey: 'settings.fields.miewAtomLabelBright' },
      {
        value: 'blackAndWhite',
        labelKey: 'settings.fields.miewAtomLabelBlackAndWhite',
      },
      { value: 'black', labelKey: 'settings.fields.miewAtomLabelBlack' },
    ],
  },

  // Debug
  showAtomIds: {
    labelKey: 'settings.fields.showAtomIds',
    type: 'checkbox',
  },
  showBondIds: {
    labelKey: 'settings.fields.showBondIds',
    type: 'checkbox',
  },
  showHalfBondIds: {
    labelKey: 'settings.fields.showHalfBondIds',
    type: 'checkbox',
  },
  showLoopIds: {
    labelKey: 'settings.fields.showLoopIds',
    type: 'checkbox',
  },
};
