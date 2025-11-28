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

import { MonomerColorScheme } from 'domain/types';

/**
 * Default color schemes for monomers.
 * These colors are used consistently across molecules and macromolecules modes.
 */
export const monomerColors: Record<string, MonomerColorScheme> = {
  colorA: { regular: '#5ADC11', hover: '#4FC218' },
  colorCM: { regular: '#59D0FF', hover: '#3CB9EB' },
  colorDQ: { regular: '#AD4551', hover: '#AB0014' },
  colorEN: { regular: '#93F5F5', hover: '#00F0F0' },
  colorFY: { regular: '#5656BF', hover: '#2626BF' },
  colorGX: { regular: '#FFE97B', hover: '#F8DC50' },
  colorH: { regular: '#BFC9FF', hover: '#99AAFF' },
  colorILV: { regular: '#50E576', hover: '#00D936' },
  colorKR: { regular: '#365CFF', hover: '#002CEB' },
  colorP: { regular: '#F2C5B6', hover: '#FFA98C' },
  colorST: { regular: '#FF8D8D', hover: '#ED6868' },
  colorW: { regular: '#99458B', hover: '#7F006B' },
  colorU: { regular: '#FF973C', hover: '#2EE55D' },
  colorX: { regular: '#CAD3DD', hover: '#B8BBCC' },
  chem: { regular: '#333333', hover: '#555555' },
  default: { regular: '#CCCBD6', hover: '#B8BBCC' },
};

/**
 * Color scheme for peptides based on natural analog code.
 */
export const peptideColors: Record<string, MonomerColorScheme> = {
  D: { regular: '#FF8C69', hover: '#0097A8' },
  E: { regular: '#DC143C', hover: '#0097A8' },
  K: { regular: '#B0E0E6', hover: '#0097A8' },
  H: { regular: '#007FFF', hover: '#0097A8' },
  O: { regular: '#2A52BE', hover: '#0097A8' },
  R: { regular: '#0A12FF', hover: '#0097A8' },
  Q: { regular: '#EDB4ED', hover: '#0097A8' },
  Y: { regular: '#D65CBC', hover: '#0097A8' },
  U: { regular: '#CA7DE3', hover: '#0097A8' },
  S: { regular: '#9966CC', hover: '#0097A8' },
  C: { regular: '#BF00FF', hover: '#0097A8' },
  N: { regular: '#800080', hover: '#0097A8' },
  T: { regular: '#FF00FF', hover: '#0097A8' },
  L: { regular: '#7FFF00', hover: '#0097A8' },
  I: { regular: '#4CBB17', hover: '#0097A8' },
  F: { regular: '#008A00', hover: '#0097A8' },
  A: { regular: '#008080', hover: '#0097A8' },
  W: { regular: '#50E576', hover: '#0097A8' },
  P: { regular: '#D2D900', hover: '#0097A8' },
  G: { regular: '#BDB76B', hover: '#0097A8' },
  M: { regular: '#FFF600', hover: '#0097A8' },
  V: { regular: '#FFD700', hover: '#0097A8' },
};

/**
 * Monomer colors indexed by natural analog code.
 */
export const monomerColorByNaturalAnalogCode: Record<
  string,
  MonomerColorScheme
> = {
  A: monomerColors.colorA,
  C: monomerColors.colorCM,
  M: monomerColors.colorCM,
  D: monomerColors.colorDQ,
  Q: monomerColors.colorDQ,
  E: monomerColors.colorEN,
  N: monomerColors.colorEN,
  F: monomerColors.colorFY,
  Y: monomerColors.colorFY,
  G: monomerColors.colorGX,
  X: monomerColors.colorX,
  H: monomerColors.colorH,
  I: monomerColors.colorILV,
  L: monomerColors.colorILV,
  V: monomerColors.colorILV,
  K: monomerColors.colorKR,
  R: monomerColors.colorKR,
  P: monomerColors.colorP,
  S: monomerColors.colorST,
  T: monomerColors.colorST,
  W: monomerColors.colorW,
  U: monomerColors.colorU,
  CHEM: monomerColors.chem,
  default: monomerColors.default,
};

/**
 * Text colors for peptides based on natural analog code.
 * Returns color for text that should be visible on peptide shape background.
 */
export const peptideTextColors: Record<string, string> = {
  D: '#333333', // dark on light orange
  E: 'white', // light on dark red
  K: '#333333', // dark on light blue
  H: 'white', // light on blue
  O: 'white', // light on dark blue
  R: 'white', // light on dark blue
  Q: '#333333', // dark on light pink
  Y: 'white', // light on purple
  U: '#333333', // dark on light purple
  S: 'white', // light on purple
  C: 'white', // light on purple
  N: 'white', // light on dark purple
  T: 'white', // light on magenta
  L: '#333333', // dark on chartreuse
  I: 'white', // light on green
  F: 'white', // light on dark green
  A: 'white', // light on teal
  W: '#333333', // dark on light green
  P: '#333333', // dark on yellow-green
  G: '#333333', // dark on khaki
  M: '#333333', // dark on yellow
  V: '#333333', // dark on gold
};

/**
 * Sugar and phosphate specific colors
 */
export const sugarColor: MonomerColorScheme = {
  regular: '#5ADC11', // Same as colorA - green
  hover: '#4FC218',
};

export const phosphateColor: MonomerColorScheme = {
  regular: '#365CFF', // Same as colorKR - blue
  hover: '#002CEB',
};

export const unresolvedMonomerColor = '#585858';
