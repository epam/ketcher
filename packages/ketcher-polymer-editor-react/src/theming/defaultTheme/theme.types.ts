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

/* eslint-disable  @typescript-eslint/no-empty-interface */
import '@emotion/react';
import { ThemeOptions as MuiThemeOptions } from '@mui/material/styles';

export type MonomerColorScheme = {
  regular: string;
  hover: string;
};

export type EditorTheme = {
  color: {
    background: {
      canvas: string;
      primary: string;
      secondary: string;
      overlay: string;
    };
    border: {
      primary: string;
    };
    text: {
      primary: string;
      secondary: string;
      light: string;
      dark: string;
      error: string;
    };
    tab: {
      regular: string;
      active: string;
      hover: string;
      content: string;
    };
    scroll: {
      regular: string;
      inactive: string;
    };
    button: {
      primary: {
        active: string;
        hover: string;
        clicked: string;
        disabled: string;
      };
      secondary: {
        active: string;
        hover: string;
        clicked: string;
        disabled: string;
      };
      text: {
        primary: string;
        secondary: string;
        disabled: string;
      };
    };
    dropdown: {
      primary: string;
      secondary: string;
      hover: string;
      disabled: string;
    };
    tooltip: {
      background: string;
      text: string;
    };
    link: {
      active: string;
      hover: string;
    };
    divider: string;
    spinner: string;
    error: string;
    input: {
      text: {
        default: string;
        active: string;
        disabled: string;
        error: string;
      };
      background: {
        default: string;
        hover: string;
        disabled: string;
      };
      border: {
        regular: string;
        active: string;
        hover: string;
        error: string;
        focus: string;
      };
    };
    icon: {
      grey: string;
      hover: string;
      active: string;
      activeMenu: string;
      clicked: string;
      disabled: string;
    };
    monomer: {
      default: string;
    };
  };
  font: {
    size: {
      small: string;
      regular: string;
      medium: string;
      xsmall: string;
    };
    family: {
      montserrat: string;
      inter: string;
      roboto: string;
    };
    weight: {
      light: number;
      regular: number;
      bold: number;
    };
  };
  monomer: {
    color: {
      [key: string]: MonomerColorScheme;
    };
  };
  border: {
    regular: string;
    small: string;
    radius: {
      regular: string;
    };
  };
  shadow: {
    regular: string;
  };
  outline: {
    small: string;
    medium: string;
    color: string;
    selected: {
      color: string;
      medium: string;
    };
  };
  transition: {
    regular: string;
  };
};

export type ThemeType = { ketcher: EditorTheme };

export type MergedThemeType = ThemeType & MuiThemeOptions;

// Declaring Theme interface to be used in styled components and useTheme hooks
declare module '@emotion/react' {
  export interface Theme extends ThemeType {}
}
