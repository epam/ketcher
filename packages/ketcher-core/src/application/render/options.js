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

import { Vec2 } from 'domain/entities'
import utils from '../editor/shared/utils'
import { ShowHydrogenLabels } from './restruct/reatom'

function defaultOptions(opt) {
  const scaleFactor = opt.scale || 100

  if (opt.rotationStep) utils.setFracAngle(opt.rotationStep)

  const labelFontSize = Math.ceil(1.9 * (scaleFactor / 6))
  const subFontSize = 5 // Math.ceil(0.5 * labelFontSize)

  const defaultOptions = {
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

    scale: scaleFactor,
    zoom: 1.0,
    offset: new Vec2(),

    lineWidth: scaleFactor / 20,
    bondSpace: opt.doubleBondWidth || scaleFactor / 7,
    stereoBond: opt.stereoBondWidth || scaleFactor / 7,
    subFontSize,
    font: '30px Arial',
    fontsz: labelFontSize,
    fontszsub: 4, //subFontSize,
    fontRLabel: labelFontSize * 1.2,
    fontRLogic: labelFontSize * 0.7,

    /* styles */
    lineattr: {
      stroke: '#000',
      'stroke-width': opt.bondThickness || scaleFactor / 20,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    },
    /* eslint-enable quote-props */
    selectionStyle: {
      fill: '#57ff8f',
      stroke: '#57ff8f'
    },
    hoverStyle: {
      stroke: '#0097A8',
      'stroke-width': (0.6 * scaleFactor) / 20
    },
    sgroupBracketStyle: {
      stroke: 'darkgray',
      'stroke-width': (0.5 * scaleFactor) / 20
    },
    lassoStyle: {
      stroke: 'gray',
      'stroke-width': '1px'
    },
    hoverStyleSimpleObject: {
      stroke: '#0c0',
      'stroke-width': scaleFactor / 4,
      'stroke-linecap': 'round',
      'stroke-opacity': 0.6
    },
    atomSelectionPlateRadius: labelFontSize * 1,
    contractedFunctionalGroupSize: 50
  }

  return Object.assign({}, defaultOptions, opt)
}

export default defaultOptions
