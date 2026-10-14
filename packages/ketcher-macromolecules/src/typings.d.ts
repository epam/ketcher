// <reference types="react-scripts" />

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.less';

declare namespace JSX {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Element = React.ReactElement<any, any>;
}

declare namespace NodeJS {
  export interface ProcessEnv {
    VERSION: string;
    BUILD_DATE: string;
    BUILD_NUMBER: string;
  }
}

declare module '*.svg' {
  import * as React from 'react';

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  const src: ReactComponent;
  export default src;
}

declare global {
  interface Element {
    __data__?: BaseRenderer;
  }

  interface EventTarget {
    __data__?: BaseRenderer;
  }
}

interface EventTarget {
  __data__?: BaseRenderer;
}

interface Document {
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  webkitFullscreenElement?: Element;
  msExitFullscreen?: () => void;
  mozCancelFullScreen?: () => void;
  webkitExitFullscreen?: () => void;
}

interface Window {
  isPolymerEditorTurnedOn: boolean;
  ketcher?: {
    settingsService?: import('ketcher-core').ISettingsService;
  };
  _ketcher_isChainLengthRulerDisabled?: boolean;
}

interface HTMLElement {
  msRequestFullscreen?: () => void;
  mozRequestFullScreen?: () => void;
  webkitRequestFullscreen?: () => void;
}
