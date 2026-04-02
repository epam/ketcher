import { MonomerColorScheme } from './monomers';

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
      secondary: string;
    };
    text: {
      primary: string;
      secondary: string;
      light: string;
      dark: string;
      error: string;
      lightgrey: string;
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
      group: {
        active: string;
        hover: string;
      };
      transparent: {
        active: string;
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
        primary: string;
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
    editMode: {
      sequenceInRNABuilder: string;
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
  peptide: {
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
    mainLayoutBlocks: string;
  };
  outline: {
    small: string;
    medium: string;
    color: string;
    selected: {
      color: string;
      small: string;
      medium: string;
    };
    grey: {
      small: string;
    };
  };
  transition: {
    regular: string;
  };
  zIndex: {
    base: number;
    toolbar: number;
    sticky: number;
    overlay: number;
    modal: number;
    critical: number;
  };
};
