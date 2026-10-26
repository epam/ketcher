declare module '*.less' {
  const classes: { [className: string]: string };
  export default classes;
}

declare namespace JSX {
  type Element = React.JSX.Element;
}

declare module '*.sdf' {
  const content: string;
  export default content;
}

declare module '*.ket' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  const src: ReactComponent;
  export default src;
}

declare namespace NodeJS {
  export interface ProcessEnv {
    VERSION: string;
    BUILD_DATE: string;
    BUILD_NUMBER: string;
  }
}

interface Document {
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  webkitFullscreenElement?: Element;
  msExitFullscreen?: () => void;
  mozCancelFullScreen?: () => void;
  webkitExitFullscreen?: () => void;
}

interface HTMLElement {
  msRequestFullscreen?: () => void;
  mozRequestFullScreen?: () => void;
  webkitRequestFullscreen?: () => void;
}

declare module 'subscription' {
  export type SubscriptionHandler<
    TDispatchValue = unknown,
    TDispatchResult = unknown,
  > = {
    bivarianceHack(value: TDispatchValue, ...rest: unknown[]): TDispatchResult;
  }['bivarianceHack'];

  export interface Handler<
    TDispatchValue = unknown,
    TDispatchResult = unknown,
  > {
    f: SubscriptionHandler<TDispatchValue, TDispatchResult>;
    once: boolean;
    priority: number;
  }

  export class Subscription<
    TDispatchValue = unknown,
    TDispatchResult = unknown,
  > {
    handlers: Array<Handler<TDispatchValue, TDispatchResult>>;
    handlersForDispatch(): typeof this.handlers;
    add(
      handler: SubscriptionHandler<TDispatchValue, TDispatchResult>,
      priority?: number,
    ): void;
    addOnce(
      handler: SubscriptionHandler<TDispatchValue, TDispatchResult>,
      priority?: number,
    ): void;
    remove(handler: SubscriptionHandler<TDispatchValue, TDispatchResult>): void;
    hasHandler(): boolean;
    dispatch(value?: TDispatchValue, ...rest: unknown[]): void;
  }

  export class PipelineSubscription<
    TDispatchValue = unknown,
    TDispatchResult = unknown,
  > extends Subscription<TDispatchValue, TDispatchResult> {
    dispatch(value?: TDispatchValue): TDispatchResult;
  }

  export class StoppableSubscription<
    TDispatchValue = unknown,
    TDispatchResult = unknown,
  > extends Subscription<TDispatchValue, TDispatchResult> {
    dispatch(
      value?: TDispatchValue,
      ...rest: unknown[]
    ): TDispatchResult | undefined;
  }

  export class DOMSubscription<
    TDispatchEvent = unknown,
  > extends Subscription<TDispatchEvent> {
    dispatch(event: TDispatchEvent): boolean;
  }
}

declare module 'ketcher-macromolecules' {
  import type * as React from 'react';
  interface MacromoleculesEditorProps {
    ketcherId: string;
    togglerComponent?: JSX.Element;
  }
  const MacromoleculesEditor: React.ComponentType<MacromoleculesEditorProps>;
  export default MacromoleculesEditor;
}

declare module 'redux-logger' {
  import type { Middleware } from 'redux';

  export const logger: Middleware;
}
