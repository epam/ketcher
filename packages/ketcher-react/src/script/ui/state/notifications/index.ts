import { RootState } from 'ketcher-macromolecules/dist/state';

export const initNotificationsState = {
  snackbarNotificationText: '',
};

export function showSnackbarNotification(text: string) {
  return {
    type: 'SHOW_SNACKBAR_NOTIFICATION',
    data: text,
  };
}

export function hideSnackbarNotification() {
  return {
    type: 'HIDE_SNACKBAR_NOTIFICATION',
  };
}

export function selectSnackbarNotificationText(state: RootState) {
  return state.notifications.snackbarNotificationText;
}

function notificationsReducer(state = initNotificationsState, action) {
  if (action.type === 'SHOW_SNACKBAR_NOTIFICATION') {
    return { ...state, snackbarNotificationText: action.data };
  }

  if (action.type === 'HIDE_SNACKBAR_NOTIFICATION') {
    return { ...state, snackbarNotificationText: '' };
  }

  return state;
}

export default notificationsReducer;
