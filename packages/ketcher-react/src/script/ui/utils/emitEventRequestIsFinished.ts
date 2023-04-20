import { Ketcher } from 'ketcher-core'

const REQUEST_IS_FINISHED = 'REQUEST_IS_FINISHED'

declare global {
  interface Window {
    ketcher: Ketcher
  }
}

/**
 * Emit event when request is finished
 * Used only for testers to prevent long delays in test cases
 */
export function emitEventRequestIsFinished(): void {
  window?.ketcher?.eventBus.emit(REQUEST_IS_FINISHED)
}
