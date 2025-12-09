import { Reducer } from 'react';

export interface FloatingToolsState {
  visible: boolean;
  rotateHandlePosition: { x: number; y: number };
}

export type FloatingToolsPayload = Partial<FloatingToolsState>;

export interface FloatingToolsAction {
  type: 'UPDATE_FLOATING_TOOLS';
  payload: Partial<FloatingToolsState>;
}

const initialState: FloatingToolsState = {
  visible: false,
  rotateHandlePosition: { x: 0, y: 0 },
};

export const updateFloatingTools = (payload: FloatingToolsPayload) => {
  const action: FloatingToolsAction = {
    type: 'UPDATE_FLOATING_TOOLS',
    payload,
  };
  return action;
};

const floatingToolsReducer: Reducer<FloatingToolsState, FloatingToolsAction> = (
  state = initialState,
  action,
) => {
  const { type, payload } = action;
  if (type === 'UPDATE_FLOATING_TOOLS') {
    return { ...state, ...payload };
  }
  return state;
};

export default floatingToolsReducer;
