export const REQUEST_IS_FINISHED = 'REQUEST_IS_FINISHED'

/**
 * Emit event when request is finished
 * Used only for autotesters repository to prevent long delays
 */
export function emitEventRequestIsFinished(): void {
  window?.ketcher?.eventBus.emit(REQUEST_IS_FINISHED)
}
