/* eslint-disable @typescript-eslint/no-explicit-any */
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

import {
  StereoLabelStyleType,
  StereoColoringType,
  ShowHydrogenLabels,
  ShowHydrogenLabelNames,
  defaultBondThickness,
} from 'ketcher-core';
import { type Schema, Validator } from 'jsonschema';

type ExtendedSchema = Schema & {
  enumNames?: Array<string>;
  default?: any;
};

// `title`/`enumNames` below hold translation keys ("settings:fields....."),
// resolved reactively at render time via `resolveTranslatableText` in
// component/form/form/form.tsx and utils/index.ts — mirrors how
// UiAction.title is resolved by resolveActionTitle().
const f = 'settings:fields.';

export enum MeasurementUnits {
  Px = 'px',
  Cm = 'cm',
  Pt = 'pt',
  Inch = 'inch',
}

export enum ImageResolution {
  high = '600',
  low = '72',
}

const editor: {
  resetToSelect: ExtendedSchema;
  rotationStep: ExtendedSchema;
} = {
  resetToSelect: {
    title: `${f}resetToSelect.title`,
    enum: [true, 'paste', false],
    enumNames: [
      `${f}resetToSelect.enumOn`,
      `${f}resetToSelect.enumAfterPaste`,
      `${f}resetToSelect.enumOff`,
    ],
    default: 'paste',
  },
  rotationStep: {
    title: `${f}rotationStep.title`,
    type: 'integer',
    minimum: 1,
    maximum: 90,
    default: 15,
  },
};

const render: {
  showValenceWarnings: ExtendedSchema;
  atomColoring: ExtendedSchema;
  showStereoFlags: ExtendedSchema;
  stereoLabelStyle: ExtendedSchema;
  colorOfAbsoluteCenters: ExtendedSchema;
  colorOfAndCenters: ExtendedSchema;
  colorOfOrCenters: ExtendedSchema;
  colorStereogenicCenters: ExtendedSchema;
  autoFadeOfStereoLabels: ExtendedSchema;
  absFlagLabel: ExtendedSchema;
  andFlagLabel: ExtendedSchema;
  mixedFlagLabel: ExtendedSchema;
  ignoreChiralFlag: ExtendedSchema;
  orFlagLabel: ExtendedSchema;
  font: ExtendedSchema;
  fontsz: ExtendedSchema;
  fontszUnit: ExtendedSchema;
  fontszsub: ExtendedSchema;
  fontszsubUnit: ExtendedSchema;
  carbonExplicitly: ExtendedSchema;
  showCharge: ExtendedSchema;
  showValence: ExtendedSchema;
  showHydrogenLabels: ExtendedSchema;
  aromaticCircle: ExtendedSchema;
  bondSpacing: ExtendedSchema;
  bondThickness: ExtendedSchema;
  bondThicknessUnit: ExtendedSchema;
  stereoBondWidth: ExtendedSchema;
  stereoBondWidthUnit: ExtendedSchema;
  bondLength: ExtendedSchema;
  bondLengthUnit: ExtendedSchema;
  reactionComponentMarginSize: ExtendedSchema;
  reactionComponentMarginSizeUnit: ExtendedSchema;
  hashSpacing: ExtendedSchema;
  hashSpacingUnit: ExtendedSchema;
  imageResolution: ExtendedSchema;
} = {
  showValenceWarnings: {
    title: `${f}showValenceWarnings.title`,
    type: 'boolean',
    description: 'slider',
    default: true,
  },
  atomColoring: {
    title: `${f}atomColoring.title`,
    type: 'boolean',
    description: 'slider',
    default: true,
  },
  showStereoFlags: {
    title: `${f}showStereoFlags.title`,
    type: 'boolean',
    description: 'slider',
    default: true,
  },
  stereoLabelStyle: {
    title: `${f}stereoLabelStyle.title`,
    enum: [
      StereoLabelStyleType.IUPAC,
      StereoLabelStyleType.Classic,
      StereoLabelStyleType.On,
      StereoLabelStyleType.Off,
    ],
    enumNames: [
      `${f}stereoLabelStyle.enumIupac`,
      `${f}stereoLabelStyle.enumClassic`,
      `${f}stereoLabelStyle.enumOn`,
      `${f}stereoLabelStyle.enumOff`,
    ],
    default: StereoLabelStyleType.IUPAC,
  },
  colorOfAbsoluteCenters: {
    title: `${f}colorOfAbsoluteCenters.title`,
    type: 'string',
    default: '#ff0000',
  },
  colorOfAndCenters: {
    title: `${f}colorOfAndCenters.title`,
    type: 'string',
    default: '#0000cd',
  },
  colorOfOrCenters: {
    title: `${f}colorOfOrCenters.title`,
    type: 'string',
    default: '#228b22',
  },
  colorStereogenicCenters: {
    title: `${f}colorStereogenicCenters.title`,
    enum: [
      StereoColoringType.LabelsOnly,
      StereoColoringType.BondsOnly,
      StereoColoringType.LabelsAndBonds,
      StereoColoringType.Off,
    ],
    enumNames: [
      `${f}colorStereogenicCenters.enumLabelsOnly`,
      `${f}colorStereogenicCenters.enumBondsOnly`,
      `${f}colorStereogenicCenters.enumLabelsAndBonds`,
      `${f}colorStereogenicCenters.enumOff`,
    ],
    default: StereoColoringType.LabelsOnly,
  },
  autoFadeOfStereoLabels: {
    title: `${f}autoFadeOfStereoLabels.title`,
    type: 'boolean',
    description: 'slider',
    default: true,
  },
  absFlagLabel: {
    title: `${f}absFlagLabel.title`,
    type: 'string',
    default: 'ABS',
  },
  andFlagLabel: {
    title: `${f}andFlagLabel.title`,
    type: 'string',
    default: 'AND Enantiomer',
  },
  mixedFlagLabel: {
    title: `${f}mixedFlagLabel.title`,
    type: 'string',
    default: 'Mixed',
  },
  ignoreChiralFlag: {
    title: `${f}ignoreChiralFlag.title`,
    type: 'boolean',
    description: 'slider',
    default: false,
  },
  orFlagLabel: {
    title: `${f}orFlagLabel.title`,
    type: 'string',
    default: 'OR Enantiomer',
  },
  font: {
    title: `${f}font.title`,
    type: 'string',
    default: '30px Arial',
  },
  fontsz: {
    title: `${f}fontsz.title`,
    type: 'number',
    default: 13,
    minimum: 0.1,
    maximum: 96,
  },
  fontszUnit: {
    title: 'Font size unit',
    enum: Object.values(MeasurementUnits),
    enumNames: Object.values(MeasurementUnits),
    default: MeasurementUnits.Px,
  },
  fontszsub: {
    title: `${f}fontszsub.title`,
    type: 'number',
    default: 13,
    minimum: 0.1,
    maximum: 96,
  },
  fontszsubUnit: {
    title: 'Sub font size unit',
    enum: Object.values(MeasurementUnits),
    enumNames: Object.values(MeasurementUnits),
    default: MeasurementUnits.Px,
  },
  // Atom
  carbonExplicitly: {
    title: `${f}carbonExplicitly.title`,
    type: 'boolean',
    description: 'slider',
    default: false,
  },
  showCharge: {
    title: `${f}showCharge.title`,
    type: 'boolean',
    description: 'slider',
    default: true,
  },
  showValence: {
    title: `${f}showValence.title`,
    type: 'boolean',
    description: 'slider',
    default: true,
  },
  showHydrogenLabels: {
    title: `${f}showHydrogenLabels.title`,
    enum: Object.values(ShowHydrogenLabels),
    enumNames: Object.values(ShowHydrogenLabelNames),
    default: ShowHydrogenLabels.TerminalAndHetero,
  },
  // Bonds
  aromaticCircle: {
    title: `${f}aromaticCircle.title`,
    type: 'boolean',
    description: 'slider',
    default: true,
  },
  bondSpacing: {
    title: `${f}bondSpacing.title`,
    type: 'integer',
    default: 15,
    minimum: 1,
    maximum: 100,
  },
  bondThickness: {
    title: `${f}bondThickness.title`,
    type: 'number',
    default: defaultBondThickness,
    minimum: 0.1,
    maximum: 96,
  },
  bondThicknessUnit: {
    title: 'Bond thickness unit',
    enum: Object.values(MeasurementUnits),
    enumNames: Object.values(MeasurementUnits),
    default: MeasurementUnits.Px,
  },
  stereoBondWidth: {
    title: `${f}stereoBondWidth.title`,
    type: 'number',
    default: 6,
    minimum: 0.1,
    maximum: 96,
  },
  stereoBondWidthUnit: {
    title: 'Stereo (Wedge) bond width unit',
    enum: Object.values(MeasurementUnits),
    enumNames: Object.values(MeasurementUnits),
    default: MeasurementUnits.Px,
  },
  bondLength: {
    title: `${f}bondLength.title`,
    type: 'number',
    default: 40,
    minimum: 0.1,
    maximum: 1000,
  },
  bondLengthUnit: {
    title: 'Bond length unit',
    enum: Object.values(MeasurementUnits),
    enumNames: Object.values(MeasurementUnits),
    default: MeasurementUnits.Px,
  },
  reactionComponentMarginSize: {
    title: `${f}reactionComponentMarginSize.title`,
    type: 'number',
    default: 20, // half of bond length
    minimum: 0.1,
    maximum: 1000,
  },
  reactionComponentMarginSizeUnit: {
    title: 'Reaction component margin size unit',
    enum: Object.values(MeasurementUnits),
    enumNames: Object.values(MeasurementUnits),
    default: MeasurementUnits.Px,
  },
  hashSpacing: {
    title: `${f}hashSpacing.title`,
    type: 'number',
    default: 1.2,
    minimum: 0.1,
    maximum: 1000,
  },
  hashSpacingUnit: {
    title: 'Hash spacing unit',
    enum: Object.values(MeasurementUnits),
    enumNames: Object.values(MeasurementUnits),
    default: MeasurementUnits.Px,
  },
  imageResolution: {
    title: `${f}imageResolution.title`,
    enum: Object.values(ImageResolution),
    enumNames: [`${f}imageResolution.enumHigh`, `${f}imageResolution.enumLow`],
    default: ImageResolution.low,
  },
};

const server: {
  'smart-layout': ExtendedSchema;
  'ignore-stereochemistry-errors': ExtendedSchema;
  'mass-skip-error-on-pseudoatoms': ExtendedSchema;
  'gross-formula-add-rsites': ExtendedSchema;
  'aromatize-skip-superatoms': ExtendedSchema;
  'gross-formula-add-isotopes': ExtendedSchema;
  'dearomatize-on-load': ExtendedSchema;
  'valence-mode': ExtendedSchema;
  ignoreChiralFlag: ExtendedSchema;
} = {
  'dearomatize-on-load': {
    title: `${f}dearomatize-on-load.title`,
    type: 'boolean',
    description: 'slider',
    default: false,
  },
  'valence-mode': {
    title: `${f}valence-mode.title`,
    enum: ['biovia-2009', 'biovia-2017', 'default'],
    enumNames: [
      `${f}valence-mode.enumBiovia2009`,
      `${f}valence-mode.enumBiovia2017`,
      `${f}valence-mode.enumDefault`,
    ],
    default: 'default',
  },
  'smart-layout': {
    title: `${f}smart-layout.title`,
    type: 'boolean',
    description: 'slider',
    default: true,
  },
  ignoreChiralFlag: {
    title: `${f}ignoreChiralFlag.title`,
    type: 'boolean',
    description: 'slider',
    default: false,
  },
  'ignore-stereochemistry-errors': {
    title: `${f}ignore-stereochemistry-errors.title`,
    type: 'boolean',
    description: 'slider',
    default: true,
  },
  'mass-skip-error-on-pseudoatoms': {
    title: `${f}mass-skip-error-on-pseudoatoms.title`,
    type: 'boolean',
    description: 'slider',
    default: false,
  },
  'gross-formula-add-rsites': {
    title: `${f}gross-formula-add-rsites.title`,
    type: 'boolean',
    description: 'slider',
    default: true,
  },
  'aromatize-skip-superatoms': {
    title: `${f}aromatize-skip-superatoms.title`,
    type: 'boolean',
    description: 'slider',
    default: true,
  },
  'gross-formula-add-isotopes': {
    title: `${f}gross-formula-add-isotopes.title`,
    type: 'boolean',
    description: 'slider',
    default: true,
  },
};

export const SERVER_OPTIONS = Object.keys(server);

const debug: {
  showAtomIds: ExtendedSchema;
  showBondIds: ExtendedSchema;
  showHalfBondIds: ExtendedSchema;
  showLoopIds: ExtendedSchema;
} = {
  showAtomIds: {
    title: `${f}showAtomIds.title`,
    type: 'boolean',
    description: 'slider',
    default: false,
  },
  showBondIds: {
    title: `${f}showBondIds.title`,
    type: 'boolean',
    description: 'slider',
    default: false,
  },
  showHalfBondIds: {
    title: `${f}showHalfBondIds.title`,
    type: 'boolean',
    description: 'slider',
    default: false,
  },
  showLoopIds: {
    title: `${f}showLoopIds.title`,
    type: 'boolean',
    description: 'slider',
    default: false,
  },
};

const miew: {
  miewMode: ExtendedSchema;
  miewTheme: ExtendedSchema;
  miewAtomLabel: ExtendedSchema;
} = {
  miewMode: {
    title: `${f}miewMode.title`,
    enum: ['LN', 'BS', 'LC'],
    enumNames: [
      `${f}miewMode.enumLines`,
      `${f}miewMode.enumBallsAndSticks`,
      `${f}miewMode.enumLicorice`,
    ],
    default: 'LN',
  },
  miewTheme: {
    title: `${f}miewTheme.title`,
    enum: ['light', 'dark'],
    enumNames: [`${f}miewTheme.enumLight`, `${f}miewTheme.enumDark`],
    default: 'light',
  },
  miewAtomLabel: {
    title: `${f}miewAtomLabel.title`,
    enum: ['no', 'bright', 'blackAndWhite', 'black'],
    enumNames: [
      `${f}miewAtomLabel.enumNo`,
      `${f}miewAtomLabel.enumBright`,
      `${f}miewAtomLabel.enumBlackAndWhite`,
      `${f}miewAtomLabel.enumBlack`,
    ],
    default: 'bright',
  },
};

export const MIEW_OPTIONS = Object.keys(miew);

const optionsSchema: ExtendedSchema = {
  title: 'Settings',
  type: 'object',
  required: [],
  properties: {
    ...editor,
    ...render,
    ...server,
    ...debug,
    ...miew,
  },
};

export default optionsSchema;

export function getDefaultOptions(): Record<string, any> {
  const props = optionsSchema.properties;
  if (!props) return {};

  return Object.keys(props).reduce((res, prop) => {
    res[prop] = props[prop].default;
    return res;
  }, {});
}

export function validation(settings): Record<string, string> | null {
  if (typeof settings !== 'object' || settings === null) return null;

  const result = new Validator().validate(settings, optionsSchema as Schema, {
    base: 'https://ketcher.local/',
  });
  const errorsProps = result.errors.map((e) =>
    e.property.replace(/^instance\./, ''),
  );

  return Object.keys(settings).reduce((res, prop) => {
    if (!optionsSchema.properties) return res;

    if (optionsSchema.properties[prop] && !errorsProps.includes(prop))
      res[prop] = settings[prop];

    return res;
  }, {});
}
