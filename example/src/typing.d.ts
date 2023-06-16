import { Ketcher } from 'ketcher-core'

declare global {
  export interface IMessage {
    eventType: string
    data?: unknown
  }
  export interface Window {
    postMessage(
      message: IMessage,
      targetOrigin: string,
      transfer?: Transferable[] | undefined
    ): void

    ketcher?: Ketcher
  }

  declare namespace NodeJS {
    export interface ProcessEnv {
      API_PATH?: string
      REACT_APP_API_PATH: string
      PUBLIC_URL: string
    }
  }
}
