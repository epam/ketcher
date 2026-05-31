/**
 * Dispatch event when request is completed
 * Used only for QAs to prevent long delays in test cases
 * Triggers on Add to canvas / Aromatize / Dearomatize
 * Clean Up / Calculate CIP / Paste from clipboard
 * maybe somewhere else
 */
export function notifyRequestCompleted(): void {
  const event = new Event('requestCompleted');
  window.dispatchEvent(event);
}
