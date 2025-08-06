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

import { ThemeOptions as MuiThemeOptions } from '@mui/material/styles';
import { EditorTheme } from '.';
import { MonomerColorScheme } from 'ketcher-core';

const monomerColors: Record<string, MonomerColorScheme> = {
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
  colorX: { regular: '#E1E6ED', hover: '#CAD3E0' }, // Grey 4 for X natural analogue
  chem: { regular: '#333333', hover: '#555555' },
  default: { regular: '#CCCBD6', hover: '#B8BBCC' },
};

const peptideColorScheme: Record<string, MonomerColorScheme> = {
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
  P: { regular: '#D2D900', hover: '#0097A8' },
  G: { regular: '#BDB76B', hover: '#0097A8' },
  M: { regular: '#FFF600', hover: '#0097A8' },
  V: { regular: '#FFD700', hover: '#0097A8' },
};

export const defaultTheme: EditorTheme = {
  color: {
    background: {
      canvas: '#F5F5F5',
      primary: '#FFFFFF',
      secondary: '#F8FEFF',
      overlay: 'rgba(94,94,94,.8)',
    },
    border: {
      primary: '#CAD3DD',
      secondary: '#7C7C7F',
    },
    text: {
      primary: '#333333',
      secondary: '#167782',
      light: '#585858',
      dark: '#000000',
      error: '#FF4A4A',
      lightgrey: '#7C7C7F',
    },
    tab: {
      regular: '#FFFFFF',
      active: '#E1E5EA',
      hover: '#00838F',
      content: '#EFF2F5',
    },
    scroll: {
      regular: '#717171',
      inactive: '#DDDDDD',
    },
    button: {
      primary: {
        active: '#167782',
        hover: '#00838F',
        clicked: '#4FB3BF',
        disabled: 'rgba(113, 113, 113, 0.4)',
      },
      secondary: {
        active: '#585858',
        hover: '#333333',
        clicked: '#AEAEAE',
        disabled: 'rgba(113, 113, 113, 0.4)',
      },
      group: {
        active: '#167782',
        hover: '#2E858F',
      },
      transparent: {
        active: 'transparent',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#005662',
        disabled: '#7A7A7A',
      },
    },
    dropdown: {
      primary: '#333333',
      secondary: '#FFFFFF',
      hover: '#DDDDDD',
      disabled: '#7A7A7A',
    },
    tooltip: {
      background: '#FFFFFF',
      text: '#333333',
    },
    link: {
      active: '#00838F',
      hover: '#005662',
    },
    divider: '#AEAEAE',
    spinner: '#005662',
    error: '#FF4A4A',
    input: {
      text: {
        default: '#585858',
        active: '#333333',
        disabled: '#585858',
        error: '#FF4A4A',
      },
      background: {
        primary: '#FFFFFF',
        default: '#EFF2F5',
        hover: '#DDDDDD',
        disabled: '#eff2f5',
      },
      border: {
        regular: '#cad3dd',
        active: '#FFFFFF',
        hover: '#43b5c0',
        focus: '#EFF2F5',
        error: '#FF4A4A',
      },
    },
    icon: {
      grey: '#B4B9D6',
      hover: '#005662',
      active: '#525252',
      activeMenu: '#005662',
      clicked: '#FFFFFF',
      disabled: 'rgba(82, 82, 82, 0.4)',
    },
    monomer: {
      default: '#C8C8C8',
    },
    editMode: {
      sequenceInRNABuilder: '#99d7dc',
    },
  },
  font: {
    size: {
      small: '10px',
      regular: '12px',
      medium: '14px',
      xsmall: '6px',
    },
    family: {
      montserrat: 'Montserrat, sans-serif',
      inter:
        "Inter, FreeSans, Arimo, 'Droid Sans', Helvetica, 'Helvetica Neue',\n" +
        'Arial, sans-serif',
      roboto:
        'Roboto, FreeSans, Arimo, Droid Sans, Helvetica, Helvetica Neue, Arial, sans-serif',
    },
    weight: {
      light: 300,
      regular: 400,
      bold: 600,
    },
  },
  monomer: {
    color: {
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
    },
  },
  peptide: {
    color: {
      D: peptideColorScheme.D,
      E: peptideColorScheme.E,
      K: peptideColorScheme.K,
      H: peptideColorScheme.H,
      O: peptideColorScheme.O,
      R: peptideColorScheme.R,
      Q: peptideColorScheme.Q,
      Y: peptideColorScheme.Y,
      U: peptideColorScheme.U,
      S: peptideColorScheme.S,
      C: peptideColorScheme.C,
      N: peptideColorScheme.N,
      T: peptideColorScheme.T,
      L: peptideColorScheme.L,
      I: peptideColorScheme.I,
      F: peptideColorScheme.F,
      A: peptideColorScheme.A,
      P: peptideColorScheme.P,
      G: peptideColorScheme.G,
      M: peptideColorScheme.M,
      V: peptideColorScheme.V,
    },
  },
  border: {
    regular: '1px solid #CAD3DD',
    small: '1px solid #E1E5EA',
    radius: {
      regular: '4px',
    },
  },
  shadow: {
    regular: '0px 1px 1px rgba(197, 203, 207, 0.7)',
    mainLayoutBlocks: '0px 2px 5px rgba(103, 104, 132, 0.15)',
  },
  outline: {
    small: '1px solid #B4B9D6',
    medium: '2px solid #B4B9D6',
    color: '#B4B9D6',
    selected: {
      color: '#167782',
      small: '1px solid #167782',
      medium: '2px solid #167782',
    },
    grey: {
      small: '1px solid #585858',
    },
  },
  transition: {
    regular: 'all .3s',
  },
  zIndex: {
    base: 0,
    toolbar: 10,
    sticky: 100,
    overlay: 200,
    modal: 1000,
    critical: 9999,
  },
};

export const muiOverrides: MuiThemeOptions = {
  // // add overrides here if necessary. For example
  // components: {
  //   MuiButtonBase: {
  //     defaultProps: {
  //       disableRipple: true
  //     }
  //   }
  // }
};
