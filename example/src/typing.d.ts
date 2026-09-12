import { Ketcher } from 'ketcher-core';

declare global {
  export interface IMessage {
    eventType: string;
    data?: unknown;
  }
  export interface Window {
    isPolymerEditorTurnedOn: boolean;
    postMessage(
      message: IMessage,
      targetOrigin: string,
      transfer?: Transferable[] | undefined,
    ): void;

    ketcher?: Ketcher;
    _ketcher_isAutozoomDisabled?: boolean;
  }

  var ketcher: Ketcher | undefined;
  var isPolymerEditorTurnedOn: boolean;
  var _ketcher_isAutozoomDisabled: boolean | undefined;

  declare namespace NodeJS {
    export interface ProcessEnv {
      API_PATH?: string;
      REACT_APP_API_PATH: string;
      PUBLIC_URL: string;
    }
  }
}
