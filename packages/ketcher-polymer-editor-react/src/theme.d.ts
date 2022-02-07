import '@mui/material/styles'
import { Theme as MuiTheme } from '@mui/material'
import '@emotion/react'

declare module '@mui/material/styles' {
  interface Theme {
    color: {
      background: {
        canvas: string
        primary: string
        secondary: string
        overlay: string
      }
      text: {
        primary: string
        secondary: string
        light: string
        dark: string
        black: string
      }
      tab: {
        regular: string
        active: string
        hover: string
      }
      scroll: {
        regular: string
        inactive: string
      }
      button: {
        primary: {
          active: string
          hover: string
          clicked: string
          disabled: string
        }
        secondary: {
          active: string
          hover: string
          clicked: string
          disabled: string
        }
        text: {
          primary: string
          secondary: string
          disabled: string
        }
        reset: string
      }
      dropdown: {
        primary: string
        secondary: string
        hover: string
        disabled: string
      }
      tooltip: {
        background: string
        text: string
      }
      link: {
        active: string
        hover: string
      }
      divider: string
      error: string
      input: {
        border: {
          regular: string
          active: string
          hover: string
        }
      }
      icon: {
        hover: string
        active: string
        activeMenu: string
        clicked: string
        disabled: string
      }
      monomer: {
        default: string
      }
    }
    font: {
      size: {
        small: string
        regular: string
        medium: string
        xsmall: string
      }
      family: {
        montserrat: string
        inter: string
        roboto: string
      }
      weight: {
        light: number
        regular: number
        bold: number
      }
    }
  }

  // allow configuration using `createTheme`
  interface ThemeOptions {
    color?: {
      background?: {
        canvas?: string
        primary?: string
        secondary?: string
      }
      text?: {
        primary?: string
        secondary?: string
        light?: string
        dark?: string
      }
      tab?: {
        regular?: string
        active?: string
        hover?: string
      }
      scroll?: {
        regular?: string
        inactive?: string
      }
      button?: {
        primary?: {
          active?: string
          hover?: string
          clicked?: string
          disabled?: string
        }
        secondary?: {
          active?: string
          hover?: string
          clicked?: string
          disabled?: string
        }
        text?: {
          primary?: string
          secondary?: string
          disabled?: string
        }
      }
      dropdown?: {
        primary?: string
        secondary?: string
        hover?: string
        disabled?: string
      }
      tooltip?: {
        background?: string
        text?: string
      }
      link?: {
        active?: string
        hover?: string
      }
      divider?: string
      error?: string
      input?: {
        border?: {
          regular?: string
          active?: string
          hover?: string
        }
      }
      icon?: {
        hover?: string
        active?: string
        activeMenu?: string
        clicked?: string
        disabled?: string
      }
    }
    font?: {
      size?: {
        small?: string
        regular?: string
        medium?: string
        xsmall?: string
      }
      family?: {
        montserrat?: string
        inter?: string
      }
      weight?: {
        light?: number
        regular?: number
        bold?: number
      }
    }
  }
}

declare module '@emotion/react' {
  /* eslint-disable  @typescript-eslint/no-empty-interface */
  export interface Theme extends MuiTheme {}
}
