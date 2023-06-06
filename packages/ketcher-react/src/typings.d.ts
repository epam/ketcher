declare module '*.less' {
  const classes: { [className: string]: string }
  export default classes
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

declare namespace NodeJS {
  export interface ProcessEnv {
    VERSION: string
    BUILD_DATE: string
    BUILD_NUMBER: string
  }
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
