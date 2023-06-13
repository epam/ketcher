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
import { Vec2 } from 'ketcher-core'

export const renderOptions = {
  showAtomIds: false,
  showBondIds: false,
  showHalfBondIds: false,
  showLoopIds: false,
  showValenceWarnings: true,
  autoScale: true,
  autoScaleMargin: 10,
  maxBondLength: 0,
  atomColoring: true,
  hideImplicitHydrogen: false,
  hideTerminalLabels: false,
  carbonExplicitly: false,
  showCharge: true,
  showHydrogenLabels: 'Terminal and Hetero',
  showValence: true,
  aromaticCircle: true,
  scale: 40,
  zoom: 1,
  lineWidth: 2,
  bondSpace: 6,
  stereoBond: 6,
  subFontSize: 7,
  font: '30px Arial',
  fontsz: 13,
  fontszsub: 13,
  fontRLabel: 15.6,
  fontRLogic: 9.1,
  radiusScaleFactor: 0.38,
  lineattr: {
    stroke: '#000',
    'stroke-width': 2,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  },
  selectionStyle: {
    fill: '#57FF8F',
    stroke: '#57FF8F'
  },
  hoverStyle: {
    stroke: '#0097A8',
    fill: 'transparent',
    fillSelected: '#CCFFDD',
    'stroke-width': 1.2
  },
  sgroupBracketStyle: {
    stroke: 'darkgray',
    'stroke-width': 1
  },
  offset: new Vec2(),
  lassoStyle: {
    stroke: 'gray',
    'stroke-width': '1px'
  },
  hoverStyleSimpleObject: {
    stroke: '#57FF8F',
    'stroke-width': 10,
    'stroke-linecap': 'round',
    'stroke-opacity': 0.6
  },
  atomSelectionPlateRadius: 13,
  contractedFunctionalGroupSize: 50,
  doubleBondWidth: 6,
  bondThickness: 2,
  stereoBondWidth: 6
} as const
