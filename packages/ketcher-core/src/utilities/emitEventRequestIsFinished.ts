const REQUEST_IS_FINISHED = 'REQUEST_IS_FINISHED'

/**
 * Emit event when request is finished
 * Used only for testers to prevent long delays in test cases
 * Triggers on Add to canvas / Aromatize / Dearomatize
 * Clean Up / Calculate CIP / Paste from clipboard
 * maybe somewhere else
 */
export function emitEventRequestIsFinished(): void {
  window?.ketcher?.eventBus.emit(REQUEST_IS_FINISHED)
}
