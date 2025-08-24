import { MonomerCreationActions } from '../actions/monomerCreation';

const monomerCreationMiddleware = (store) => (next) => (action) => {
  const state = store.getState();
  if (!state || !state.editor) {
    return next(action);
  }

  if (action.type === MonomerCreationActions.OpenWizard) {
    state.editor.openMonomerCreationWizard();
  } else if (action.type === MonomerCreationActions.CloseWizard) {
    state.editor.closeMonomerCreationWizard();
  } else if (action.type === MonomerCreationActions.SubmitMonomer) {
    state.editor.saveNewMonomer(action.payload);
  }

  return next(action);
};

export default monomerCreationMiddleware;
