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

import { ThemeOptions as MuiThemeOptions } from '@mui/material/styles'
import { EditorTheme, MonomerColorScheme } from '.'

const monomerColors: Record<string, MonomerColorScheme> = {
  colorA: { regular: '#CCCBD6', hover: '#B8BBCC' },
  colorCM: { regular: '#FFE34C', hover: '#FFD700' },
  colorDQ: { regular: '#AD4551', hover: '#AB0014' },
  colorEN: { regular: '#93F5F5', hover: '#00F0F0' },
  colorFY: { regular: '#5656BF', hover: '#2626BF' },
  colorGX: { regular: '#E1E6ED', hover: '#CAD3E0' },
  colorH: { regular: '#BFC9FF', hover: '#99AAFF' },
  colorILV: { regular: '#50E576', hover: '#00D936' },
  colorKR: { regular: '#365CFF', hover: '#002CEB' },
  colorP: { regular: '#F2C5B6', hover: '#FFA98C' },
  colorST: { regular: '#FFC44C', hover: '#FFAA00' },
  colorW: { regular: '#99458B', hover: '#7F006B' }
}

export const defaultTheme: EditorTheme = {
  color: {
    background: {
      canvas: '#F5F5F5',
      primary: '#FFFFFF',
      secondary: '#F8FEFF',
      overlay: '#005662'
    },
    border: {
      primary: '#CAD3DD'
    },
    text: {
      primary: '#333333',
      secondary: '#167782',
      light: '#585858',
      dark: '#000000',
      error: '#FF4A4A'
    },
    tab: {
      regular: '#FFFFFF',
      active: '#EFF2F5',
      hover: '#00838F',
      content: '#EFF2F5'
    },
    scroll: {
      regular: '#717171',
      inactive: '#DDDDDD'
    },
    button: {
      primary: {
        active: '#167782',
        hover: '#00838F',
        clicked: '#4FB3BF',
        disabled: 'rgba(0, 131, 143, 0.4)'
      },
      secondary: {
        active: '#717171',
        hover: '#333333',
        clicked: '#AEAEAE',
        disabled: 'rgba(113, 113, 113, 0.4)'
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#005662',
        disabled: '#7A7A7A'
      }
    },
    dropdown: {
      primary: '#333333',
      secondary: '#FFFFFF',
      hover: '#DDDDDD',
      disabled: '#7A7A7A'
    },
    tooltip: {
      background: '#FFFFFF',
      text: '#333333'
    },
    link: {
      active: '#00838F',
      hover: '#005662'
    },
    divider: '#AEAEAE',
    spinner: '#005662',
    error: '#FF4A4A',
    input: {
      text: {
        default: '#585858',
        active: '#333333',
        disabled: '#585858',
        error: '#FF4A4A'
      },
      background: {
        default: '#EFF2F5',
        hover: '#DDDDDD',
        disabled: '#DDDDDD'
      },
      border: {
        regular: 'transparent',
        active: '#FFFFFF',
        hover: '#DDDDDD',
        focus: '#EFF2F5',
        error: '#FF4A4A'
      }
    },
    icon: {
      grey: '#B4B9D6',
      hover: '#005662',
      active: '#525252',
      activeMenu: '#005662',
      clicked: '#FFFFFF',
      disabled: 'rgba(82, 82, 82, 0.4)'
    },
    monomer: {
      default: '#C8C8C8'
    }
  },
  font: {
    size: {
      small: '10px',
      regular: '12px',
      medium: '14px',
      xsmall: '6px'
    },
    family: {
      montserrat: 'Montserrat, sans-serif',
      inter:
        "Inter, FreeSans, Arimo, 'Droid Sans', Helvetica, 'Helvetica Neue',\n" +
        'Arial, sans-serif',
      roboto:
        'Roboto, FreeSans, Arimo, Droid Sans, Helvetica, Helvetica Neue, Arial, sans-serif'
    },
    weight: {
      light: 300,
      regular: 400,
      bold: 600
    }
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
      X: monomerColors.colorGX,
      H: monomerColors.colorH,
      I: monomerColors.colorILV,
      L: monomerColors.colorILV,
      V: monomerColors.colorILV,
      K: monomerColors.colorKR,
      R: monomerColors.colorKR,
      P: monomerColors.colorP,
      S: monomerColors.colorST,
      T: monomerColors.colorST,
      W: monomerColors.colorW
    }
  },
  border: {
    regular: '1px solid #CAD3DD',
    small: '1px solid #E1E5EA',
    radius: {
      regular: '4px'
    }
  },
  shadow: {
    regular: '0px 1px 1px rgba(197, 203, 207, 0.7)',
    regular: '0px 6px 10px rgba(103, 104, 132, 0.15)'
  },
  outline: {
    small: '1px solid #B4B9D6'
  },
  transition: {
    regular: 'all .3s'
  }
}

export const muiOverrides: MuiThemeOptions = {
  // // add overrides here if necessary. For example
  // components: {
  //   MuiButtonBase: {
  //     defaultProps: {
  //       disableRipple: true
  //     }
  //   }
  // }
}
