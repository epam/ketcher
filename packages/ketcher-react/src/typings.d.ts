declare module '*.less' {
  const classes: { [className: string]: string }
  export default classes
}

declare module '*.sdf' {
  const content: string
  export default content
}

declare module '*.svg' {
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

declare module 'subscription' {
  export class Subscription<TDispatchValue = any> {
    handlers: Array<any>
    handlersForDispatch: () => typeof this.handlers
    add: (f: any, priority?: number) => void
    addOnce: (f: any, priority?: number) => void
    remove: (f: any) => void
    hasHandler: () => boolean
    dispatch: (value?: TDispatchValue) => void
  }

  export class PipelineSubscription<
    TDispatchValue = any
  > extends Subscription<TDispatchValue> {
    dispatch: (value: TDispatchValue) => any
  }

  export class StoppableSubscription<
    TDispatchValue = any
  > extends Subscription<TDispatchValue> {
    dispatch: (value?: TDispatchValue) => any
  }

  export class DOMSubscription<
    TDispatchEvent = any
  > extends Subscription<TDispatchEvent> {
    dispatch: (event: TDispatchEvent) => boolean
  }
}
