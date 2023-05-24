// <reference types="react-scripts" />
/* eslint-disable no-var, no-use-before-define */
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

declare module '*.sdf' {
  const content: string
  export default content
}

declare module '*.svg' {
  import * as React from 'react'

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >

  const src: ReactComponent
  export default src
}

interface Document {
  mozFullScreenElement?: Element
  msFullscreenElement?: Element
  webkitFullscreenElement?: Element
  msExitFullscreen?: () => void
  mozCancelFullScreen?: () => void
  webkitExitFullscreen?: () => void
}

interface HTMLElement {
  msRequestFullscreen?: () => void
  mozRequestFullScreen?: () => void
  webkitRequestFullscreen?: () => void
}

// Functions available in Jest testing environment, declared in setupTests.tsx

/**
 * Wraps component in provider of Emotion/Mui merged theme
 */
declare var withThemeProvider: typeof jestHelpers.withThemeProvider

/**
 * Wraps component in provider of Redux store
 */
declare var withStoreProvider: typeof jestHelpers.withStoreProvider

/**
 * Wraps component in Redux store and Emotion/Mui theme providers
 */
declare var withThemeAndStoreProvider: typeof jestHelpers.withThemeAndStoreProvider

declare namespace jestHelpers {
  import type { RootState } from './state'
  function withThemeProvider(arg: JSX.Element): React.Element
  function withStoreProvider(
    arg: JSX.Element,
    initialState?: RootState
  ): React.Element
  function withThemeAndStoreProvider(
    arg: JSX.Element,
    initialState?: RootState
  ): React.Element
}
