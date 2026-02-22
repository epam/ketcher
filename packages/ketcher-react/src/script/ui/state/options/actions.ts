import { AnyAction, Dispatch } from 'redux';

export const APP_OPTIONS_ACTION = 'APP_OPTIONS';
export const OPTIONS_UPDATE_ACTION = 'UPDATE';

export function appUpdate(data: Record<string, unknown>) {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch({ type: APP_OPTIONS_ACTION, data });
    dispatch({ type: OPTIONS_UPDATE_ACTION });
  };
}
