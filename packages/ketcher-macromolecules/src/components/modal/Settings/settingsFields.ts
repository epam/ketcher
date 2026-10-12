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

export type SettingsFieldControlType =
  'checkbox' | 'number' | 'text' | 'select' | 'color';

export interface SettingsFieldDescriptor {
  name: SettingFieldName;
  /**
   * Keys resolve against the `settings` and `dialogs` namespaces of ketcher-react,
   * so both modes always render the same label and the same hint for a field.
   * Values that are not translation keys (font family names, unit abbreviations
   * are handled through `settings:units.*`) are passed through unchanged.
   */
  labelKey: string;
  control: SettingsFieldControlType;
  /** Paired unit dropdown rendered right of a number input */
  unitName?: SettingFieldName;
  options?: Array<{ value: SettingFieldValue; labelKey: string }>;
  min?: number;
  max?: number;
  step?: number;
  /** Description rendered as static text beneath the control */
  hintKey?: string;
}

export interface SettingsFieldGroupDescriptor {
  id: string;
  titleKey: string;
  fields: SettingsFieldDescriptor[];
}

const UNIT_OPTIONS = [
  { value: 'px', labelKey: 'settings:units.px' },
  { value: 'cm', labelKey: 'settings:units.cm' },
  { value: 'pt', labelKey: 'settings:units.pt' },
  { value: 'inch', labelKey: 'settings:units.inch' },
];

// Font family names are proper nouns, never translated.
// TODO: Replace with dynamic font detection (see ketcher-react/systemfonts.jsx)
const FONT_OPTIONS = [
  '30px Arial',
  '30px Arial Black',
  '30px Comic Sans MS',
  '30px Courier New',
  '30px Georgia',
  '30px Impact',
  '30px Charcoal',
  '30px Lucida Console',
  '30px Monaco',
  '30px Palatino Linotype',
  '30px Book Antiqua',
  '30px Palatino',
  '30px Tahoma',
  '30px Geneva',
  '30px Times New Roman',
  '30px Times',
  '30px Verdana',
  '30px Symbol',
  '30px MS Serif',
  '30px MS Sans Serif',
  '30px New York',
  '30px Droid Sans',
  '30px Droid Serif',
  '30px Droid Sans Mono',
  '30px Roboto',
].map((value) => ({ value, labelKey: value.replace('30px ', '') }));

/**
 * Group order, field order, labels and hints mirror the molecules-mode panel.
 * The two modes keep separate descriptors because their data sources differ
 * (JSON-schema form vs. plain values from SettingsService).
 */
export const SETTINGS_FIELD_GROUPS: SettingsFieldGroupDescriptor[] = [
  {
    id: 'atoms',
    titleKey: 'dialogs:meta.settings.atomsTab',
    fields: [
      {
        name: 'carbonExplicitly',
        labelKey: 'settings:fields.carbonExplicitly.title',
        control: 'checkbox',
      },
      {
        name: 'showCharge',
        labelKey: 'settings:fields.showCharge.title',
        control: 'checkbox',
      },
      {
        name: 'showValence',
        labelKey: 'settings:fields.showValence.title',
        control: 'checkbox',
      },
      {
        name: 'showHydrogenLabels',
        labelKey: 'settings:fields.showHydrogenLabels.title',
        control: 'select',
        // The schema carries these enum names as plain literals, so molecules
        // mode renders them untranslated too.
        options: [
          { value: 'off', labelKey: 'Off' },
          { value: 'Hetero', labelKey: 'Hetero' },
          { value: 'Terminal', labelKey: 'Terminal' },
          { value: 'Terminal and Hetero', labelKey: 'Terminal and Hetero' },
          { value: 'On', labelKey: 'On' },
        ],
      },
      {
        name: 'atomColoring',
        labelKey: 'settings:fields.atomColoring.title',
        control: 'checkbox',
      },
    ],
  },
  {
    id: 'bonds',
    titleKey: 'dialogs:meta.settings.bondsTab',
    // bondLength is not tracked by the macromolecules settings form; omitted.
    fields: [
      {
        name: 'aromaticCircle',
        labelKey: 'settings:fields.aromaticCircle.title',
        control: 'checkbox',
      },
      {
        name: 'bondSpacing',
        labelKey: 'settings:fields.bondSpacing.title',
        control: 'number',
        min: 0.1,
        max: 10,
        step: 0.1,
        hintKey: 'settings:fields.bondSpacing.extraLabel',
      },
      {
        name: 'bondThickness',
        labelKey: 'settings:fields.bondThickness.title',
        control: 'number',
        unitName: 'bondThicknessUnit',
        min: 0.1,
        max: 96,
        step: 0.1,
      },
      {
        name: 'stereoBondWidth',
        labelKey: 'settings:fields.stereoBondWidth.title',
        control: 'number',
        unitName: 'stereoBondWidthUnit',
        min: 0.1,
        max: 96,
        step: 0.1,
      },
      {
        name: 'hashSpacing',
        labelKey: 'settings:fields.hashSpacing.title',
        control: 'number',
        unitName: 'hashSpacingUnit',
        min: 0.1,
        max: 1000,
        step: 0.1,
        hintKey: 'dialogs:meta.settings.hashSpacingTooltip',
      },
    ],
  },
  {
    id: 'stereochemistry',
    titleKey: 'dialogs:meta.settings.stereochemistryTab',
    fields: [
      {
        name: 'showStereoFlags',
        labelKey: 'settings:fields.showStereoFlags.title',
        control: 'checkbox',
        hintKey: 'dialogs:meta.settings.showStereoFlagsTooltip',
      },
      {
        name: 'stereoLabelStyle',
        labelKey: 'settings:fields.stereoLabelStyle.title',
        control: 'select',
        hintKey: 'dialogs:meta.settings.stereoLabelStyleTooltip',
        options: [
          {
            value: 'Iupac',
            labelKey: 'settings:fields.stereoLabelStyle.enumIupac',
          },
          {
            value: 'Classic',
            labelKey: 'settings:fields.stereoLabelStyle.enumClassic',
          },
          { value: 'On', labelKey: 'settings:fields.stereoLabelStyle.enumOn' },
          {
            value: 'Off',
            labelKey: 'settings:fields.stereoLabelStyle.enumOff',
          },
        ],
      },
      {
        name: 'colorOfAbsoluteCenters',
        labelKey: 'settings:fields.colorOfAbsoluteCenters.title',
        control: 'color',
        hintKey: 'dialogs:meta.settings.colorOfAbsoluteCentersTooltip',
      },
      {
        name: 'colorOfAndCenters',
        labelKey: 'settings:fields.colorOfAndCenters.title',
        control: 'color',
        hintKey: 'dialogs:meta.settings.colorOfAndCentersTooltip',
      },
      {
        name: 'colorOfOrCenters',
        labelKey: 'settings:fields.colorOfOrCenters.title',
        control: 'color',
        hintKey: 'dialogs:meta.settings.colorOfOrCentersTooltip',
      },
      {
        name: 'colorStereogenicCenters',
        labelKey: 'settings:fields.colorStereogenicCenters.title',
        control: 'select',
        options: [
          {
            value: 'LabelsOnly',
            labelKey: 'settings:fields.colorStereogenicCenters.enumLabelsOnly',
          },
          {
            value: 'BondsOnly',
            labelKey: 'settings:fields.colorStereogenicCenters.enumBondsOnly',
          },
          {
            value: 'LabelsAndBonds',
            labelKey:
              'settings:fields.colorStereogenicCenters.enumLabelsAndBonds',
          },
          {
            value: 'Off',
            labelKey: 'settings:fields.colorStereogenicCenters.enumOff',
          },
        ],
      },
      {
        name: 'autoFadeOfStereoLabels',
        labelKey: 'settings:fields.autoFadeOfStereoLabels.title',
        control: 'checkbox',
        hintKey: 'dialogs:meta.settings.autoFadeOfStereoLabelsTooltip',
      },
      {
        name: 'absFlagLabel',
        labelKey: 'settings:fields.absFlagLabel.title',
        control: 'text',
      },
      {
        name: 'andFlagLabel',
        labelKey: 'settings:fields.andFlagLabel.title',
        control: 'text',
      },
      {
        name: 'orFlagLabel',
        labelKey: 'settings:fields.orFlagLabel.title',
        control: 'text',
      },
      {
        name: 'mixedFlagLabel',
        labelKey: 'settings:fields.mixedFlagLabel.title',
        control: 'text',
      },
      {
        name: 'ignoreChiralFlag',
        labelKey: 'settings:fields.ignoreChiralFlag.title',
        control: 'checkbox',
        hintKey: 'dialogs:meta.settings.ignoreChiralFlagTooltip',
      },
    ],
  },
  {
    id: 'reactions',
    titleKey: 'dialogs:meta.settings.reactionsTab',
    fields: [
      {
        name: 'reactionComponentMarginSize',
        labelKey: 'settings:fields.reactionComponentMarginSize.title',
        control: 'number',
        unitName: 'reactionComponentMarginSizeUnit',
        min: 0.1,
        max: 1000,
        step: 0.1,
        hintKey: 'dialogs:meta.settings.reactionComponentMarginSizeTooltip',
      },
      {
        name: 'gross-formula-add-rsites',
        labelKey: 'settings:fields.gross-formula-add-rsites.title',
        control: 'checkbox',
      },
      {
        name: 'gross-formula-add-isotopes',
        labelKey: 'settings:fields.gross-formula-add-isotopes.title',
        control: 'checkbox',
      },
    ],
  },
  {
    id: 'general',
    titleKey: 'dialogs:meta.settings.generalTab',
    fields: [
      {
        name: 'resetToSelect',
        labelKey: 'settings:fields.resetToSelect.title',
        control: 'select',
        options: [
          { value: true, labelKey: 'settings:fields.resetToSelect.enumOn' },
          {
            value: 'paste',
            labelKey: 'settings:fields.resetToSelect.enumAfterPaste',
          },
          { value: false, labelKey: 'settings:fields.resetToSelect.enumOff' },
        ],
      },
      {
        name: 'rotationStep',
        labelKey: 'settings:fields.rotationStep.title',
        control: 'number',
        min: 1,
        max: 90,
        step: 1,
        hintKey: 'dialogs:meta.settings.rotationStepTooltip',
      },
      {
        name: 'font',
        labelKey: 'settings:fields.font.title',
        control: 'select',
        options: FONT_OPTIONS,
      },
      {
        name: 'fontsz',
        labelKey: 'settings:fields.fontsz.title',
        control: 'number',
        unitName: 'fontszUnit',
        min: 1,
        max: 96,
        step: 1,
      },
      {
        name: 'fontszsub',
        labelKey: 'settings:fields.fontszsub.title',
        control: 'number',
        unitName: 'fontszsubUnit',
        min: 1,
        max: 96,
        step: 1,
      },
      {
        name: 'imageResolution',
        labelKey: 'settings:fields.imageResolution.title',
        control: 'select',
        hintKey: 'dialogs:meta.settings.imageResolutionTooltip',
        options: [
          { value: '72', labelKey: 'settings:fields.imageResolution.enumLow' },
          {
            value: '600',
            labelKey: 'settings:fields.imageResolution.enumHigh',
          },
        ],
      },
      // The 3D Viewer group is gone; its three fields close out this group.
      {
        name: 'miewMode',
        labelKey: 'settings:fields.miewMode.title',
        control: 'select',
        options: [
          { value: 'LN', labelKey: 'settings:fields.miewMode.enumLines' },
          {
            value: 'BS',
            labelKey: 'settings:fields.miewMode.enumBallsAndSticks',
          },
          { value: 'LC', labelKey: 'settings:fields.miewMode.enumLicorice' },
        ],
      },
      {
        name: 'miewTheme',
        labelKey: 'settings:fields.miewTheme.title',
        control: 'select',
        options: [
          { value: 'light', labelKey: 'settings:fields.miewTheme.enumLight' },
          { value: 'dark', labelKey: 'settings:fields.miewTheme.enumDark' },
        ],
      },
      {
        name: 'miewAtomLabel',
        labelKey: 'settings:fields.miewAtomLabel.title',
        control: 'select',
        options: [
          { value: 'no', labelKey: 'settings:fields.miewAtomLabel.enumNo' },
          {
            value: 'bright',
            labelKey: 'settings:fields.miewAtomLabel.enumBright',
          },
          {
            value: 'blackAndWhite',
            labelKey: 'settings:fields.miewAtomLabel.enumBlackAndWhite',
          },
          {
            value: 'black',
            labelKey: 'settings:fields.miewAtomLabel.enumBlack',
          },
        ],
      },
    ],
  },
  {
    id: 'validation',
    titleKey: 'dialogs:meta.settings.validationTab',
    // valence-mode is not tracked by the macromolecules settings form; omitted.
    // aromatize-skip-superatoms and dearomatize-on-load are API-only now.
    fields: [
      {
        name: 'showValenceWarnings',
        labelKey: 'settings:fields.showValenceWarnings.title',
        control: 'checkbox',
        hintKey: 'dialogs:meta.settings.showValenceWarningsTooltip',
      },
      {
        name: 'ignore-stereochemistry-errors',
        labelKey: 'settings:fields.ignore-stereochemistry-errors.title',
        control: 'checkbox',
        hintKey: 'dialogs:meta.settings.ignoreStereochemistryErrorsTooltip',
      },
      {
        name: 'mass-skip-error-on-pseudoatoms',
        labelKey: 'settings:fields.mass-skip-error-on-pseudoatoms.title',
        control: 'checkbox',
      },
    ],
  },
  {
    id: 'debug',
    titleKey: 'dialogs:meta.settings.debuggingTab',
    fields: [
      {
        name: 'smart-layout',
        labelKey: 'settings:fields.smart-layout.title',
        control: 'checkbox',
        hintKey: 'dialogs:meta.settings.smartLayoutTooltip',
      },
      {
        name: 'showAtomIds',
        labelKey: 'settings:fields.showAtomIds.title',
        control: 'checkbox',
        hintKey: 'dialogs:meta.settings.showAtomIdsTooltip',
      },
      {
        name: 'showBondIds',
        labelKey: 'settings:fields.showBondIds.title',
        control: 'checkbox',
        hintKey: 'dialogs:meta.settings.showBondIdsTooltip',
      },
      {
        name: 'showHalfBondIds',
        labelKey: 'settings:fields.showHalfBondIds.title',
        control: 'checkbox',
        hintKey: 'dialogs:meta.settings.showHalfBondIdsTooltip',
      },
      {
        name: 'showLoopIds',
        labelKey: 'settings:fields.showLoopIds.title',
        control: 'checkbox',
        hintKey: 'dialogs:meta.settings.showLoopIdsTooltip',
      },
    ],
  },
];

export { UNIT_OPTIONS };
