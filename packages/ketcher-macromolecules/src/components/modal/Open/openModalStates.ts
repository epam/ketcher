export const MODAL_STATES = {
  openOptions: 'openOptions',
  textEditor: 'textEditor',
} as const;

export type MODAL_STATES_VALUES =
  typeof MODAL_STATES[keyof typeof MODAL_STATES];
