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
import { EditorTheme } from '.'

const color = {
  background: {
    canvas: '#F2F2F2',
    primary: '#FFFFFF',
    secondary: '#F8FEFF',
    overlay: '#005662'
  },
  text: {
    primary: '#121212',
    secondary: '#BCBCBC',
    light: '#FFFFFF',
    dark: '#000000'
  },
  tab: {
    regular: '#F3F3F3',
    active: '#005662',
    hover: '#00838F'
  },
  scroll: {
    regular: '#717171',
    inactive: '#DDDDDD'
  },
  button: {
    primary: {
      active: '#005662',
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
  error: '#FF4A4A',
  input: {
    border: {
      regular: '#005662',
      active: '#FFFFFF',
      hover: '#DDDDDD'
    }
  },
  icon: {
    hover: '#005662',
    active: '#525252',
    activeMenu: '#005662',
    clicked: '#FFFFFF',
    disabled: 'rgba(82, 82, 82, 0.4)'
  }
}

const font = {
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
      'Arial, sans-serif'
  },
  weight: {
    light: 300,
    regular: 400,
    bold: 600
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

export const defaultTheme: EditorTheme = {
  color,
  font
}
