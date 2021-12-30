/// <reference types="react-scripts" />

import { Theme as MuiTheme } from '@mui/material'
import '@emotion/react'

declare module '*.less' {
  const classes: { [className: string]: string }
  export default classes
}

declare namespace NodeJS {
  export interface ProcessEnv {
    VERSION: string
    BUILD_DATE: string
    BUILD_NUMBER: string
  }
}

declare module '@emotion/react' {
  /* eslint-disable  @typescript-eslint/no-empty-interface */
  export interface Theme extends MuiTheme {}
}
