declare global {
  export interface IMessage {
    eventType: string
    data?: any
  }
  export interface Window {
    postMessage(
      message: IMessage,
      targetOrigin: string,
      transfer?: Transferable[] | undefined
    ): void
  }
}
