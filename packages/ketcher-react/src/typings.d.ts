/// <reference types="react-scripts" />

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
