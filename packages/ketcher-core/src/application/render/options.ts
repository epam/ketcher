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

import { Vec2 } from 'domain/entities';
import utils from '../editor/shared/utils';
import { ShowHydrogenLabels } from './restruct/reatom';
import { RenderOptions } from './render.types';

function defaultOptions(renderOptions: RenderOptions): RenderOptions {
  const options = getOptionsWithConvertedUnits(renderOptions);

  const scaleFactorMicro = options.microModeScale || 100;
  const scaleFactorMacro = options.macroModeScale || 200;

  if (options.rotationStep) {
    utils.setFracAngle(options.rotationStep);
  }

  const labelFontSize = Math.ceil(1.9 * (scaleFactorMicro / 6));
  const subFontSize = Math.ceil(0.5 * labelFontSize);

  const defaultOptions: Partial<RenderOptions> = {
    'dearomatize-on-load': false,
    ignoreChiralFlag: false,
    disableQueryElements: null,
    // flags for debugging
    showAtomIds: false,
    showBondIds: false,
    showHalfBondIds: false,
    showLoopIds: false,
    // rendering customization flags
    // TODO: hide enhanced flags opts
    showValenceWarnings: true,
    autoScale: false, // scale structure to fit into the given view box, used in view mode
    autoScaleMargin: 0,
    maxBondLength: 0, // 0 stands for "not specified"
    atomColoring: true,
    hideImplicitHydrogen: false,
    hideTerminalLabels: false,
    // atoms
    carbonExplicitly: false,
    showCharge: true,
    showHydrogenLabels: ShowHydrogenLabels.TerminalAndHetero,
    showValence: true,
    // bonds
    aromaticCircle: true,

    microModeScale: scaleFactorMicro,
    macroModeScale: scaleFactorMacro,
    zoom: 1.0,
    offset: new Vec2(),

    lineWidth: scaleFactorMicro / 20,
    bondSpace: options.bondSpacingInPx || scaleFactorMicro / 7,
    stereoBond: options.stereoBondWidthInPx || scaleFactorMicro / 7,
    subFontSize: options.fontszsubInPx || subFontSize,
    font: '30px Arial',
    fontszInPx: options.fontszInPx || labelFontSize,
    fontszsubInPx: options.fontszsubInPx || subFontSize,
    fontRLabel: (options.fontszInPx || labelFontSize) * 1.2,
    fontRLogic: (options.fontszInPx || labelFontSize) * 0.7,

    radiusScaleFactor: 0.38,

    /* styles */
    lineattr: {
      stroke: '#000',
      'stroke-width': options.bondThicknessInPx || scaleFactorMicro / 20,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    arrowSnappingStyle: {
      fill: '#365CFF',
      stroke: '#365CFF',
    },
    bondSnappingStyle: {
      fill: '#365CFF',
      stroke: '#365CFF',
      'stroke-width': options.bondThicknessInPx * 1.5,
    },
    /* eslint-enable quote-props */
    selectionStyle: {
      fill: '#57FF8F',
      stroke: '#57FF8F',
    },
    hoverStyle: {
      stroke: '#0097A8',
      fill: '#CCFFDD',
      'stroke-width': (0.6 * scaleFactorMicro) / 20,
    },
    innerHoverStyle: {
      stroke: '#CCFFDD',
      fill: 'none',
      'stroke-width': (4.6 * scaleFactorMicro) / 20,
    },
    sgroupBracketStyle: {
      stroke: 'darkgray',
      'stroke-width': (0.5 * scaleFactorMicro) / 20,
    },
    lassoStyle: {
      stroke: 'gray',
      'stroke-width': '1px',
    },
    selectionStyleSimpleObject: {
      stroke: '#57FF8F',
      'stroke-width': scaleFactorMicro / 4,
      'stroke-linecap': 'round',
    },
    movingStyle: {
      cursor: 'all-scroll',
    },
    atomSelectionPlateRadius: options.fontszInPx || labelFontSize,
    contractedFunctionalGroupSize: 50,

    previewOpacity: 0.5,
    viewOnlyMode: false,
  };

  return Object.assign({}, defaultOptions, options);
}

const measureMap = {
  px: 1,
  cm: 37.795278,
  pt: 1.333333,
  inch: 96,
};

function convertValue(
  value: number,
  measureFrom: keyof typeof measureMap,
  measureTo: keyof typeof measureMap,
) {
  const convertedValue =
    measureTo === 'px' || measureTo === 'pt'
      ? ((value * measureMap[measureFrom]) / measureMap[measureTo]).toFixed()
      : ((value * measureMap[measureFrom]) / measureMap[measureTo]).toFixed(3);

  return Number(convertedValue);
}

export function getOptionsWithConvertedUnits(
  options: RenderOptions,
): RenderOptions {
  const convertedOptions: Partial<
    Pick<
      RenderOptions,
      | 'fontszInPx'
      | 'fontszsubInPx'
      | 'bondSpacingInPx'
      | 'bondThicknessInPx'
      | 'stereoBondWidthInPx'
      | 'microModeScale'
    >
  > = {};
  const defaultUnit = 'px';

  if (typeof options.fontsz !== 'undefined') {
    convertedOptions.fontszInPx = convertValue(
      options.fontsz,
      options.fontszUnit || defaultUnit,
      defaultUnit,
    );
  }

  if (typeof options.fontszsub !== 'undefined') {
    convertedOptions.fontszsubInPx = convertValue(
      options.fontszsub,
      options.fontszsubUnit || defaultUnit,
      defaultUnit,
    );
  }

  if (
    typeof options.bondSpacing !== 'undefined' &&
    typeof options.bondLength !== 'undefined'
  ) {
    const convertedBondLength = convertValue(
      options.bondLength,
      options.bondLengthUnit || defaultUnit,
      defaultUnit,
    );

    // bondSpacing is a percentage of bondLength
    convertedOptions.bondSpacingInPx =
      (options.bondSpacing / 100) * convertedBondLength;
  }

  if (typeof options.bondThickness !== 'undefined') {
    convertedOptions.bondThicknessInPx = convertValue(
      options.bondThickness,
      options.bondThicknessUnit || defaultUnit,
      defaultUnit,
    );
  }

  if (typeof options.stereoBondWidth !== 'undefined') {
    convertedOptions.stereoBondWidthInPx = convertValue(
      options.stereoBondWidth,
      options.stereoBondWidthUnit || defaultUnit,
      defaultUnit,
    );
  }

  if (
    typeof options.bondLength !== 'undefined' &&
    typeof options.bondLengthUnit !== 'undefined'
  ) {
    convertedOptions.microModeScale = convertValue(
      options.bondLength,
      options.bondLengthUnit || defaultUnit,
      defaultUnit,
    );
  }

  return {
    ...options,
    ...convertedOptions,
  };
}

export default defaultOptions;
