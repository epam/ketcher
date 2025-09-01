import { MonomerCreationActions } from '../actions/monomerCreation';

const monomerCreationMiddleware = (store) => (next) => (action) => {
  const state = store.getState();

  if (!state || !state.editor) {
    return next(action);
  }

  const { editor } = state;

  switch (action.type) {
    case MonomerCreationActions.OpenWizard:
      editor.openMonomerCreationWizard();
      break;
    case MonomerCreationActions.CloseWizard:
      editor.closeMonomerCreationWizard();
      break;
    case MonomerCreationActions.SubmitMonomer:
      editor.saveNewMonomer(action.payload);
      break;
    case MonomerCreationActions.CloseAttachmentPointEditDialog:
      editor.render.monomerCreationRenderState.clickedRLabelAtomId = null;
      editor.update(true);
      break;
    case MonomerCreationActions.ReassignAttachmentPoint: {
      const { atomId, newRNumber } = action.payload;
      state.editor.reassignAttachmentPoint(atomId, newRNumber);
      break;
    }
    default:
      break;
  }

  return next(action);
};

export default monomerCreationMiddleware;
