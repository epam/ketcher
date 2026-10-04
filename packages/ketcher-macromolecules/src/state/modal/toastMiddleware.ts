import { Middleware } from '@reduxjs/toolkit';
import { closeErrorTooltip, openErrorTooltip } from './modalSlice';

const TOAST_DURATION_MS = 6000;

export const toastMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  if (openErrorTooltip.match(action)) {
    setTimeout(() => {
      store.dispatch(closeErrorTooltip(action.payload));
    }, TOAST_DURATION_MS);
  }
  return result;
};
