export const MonomerCreationActions = {
  OpenWizard: 'MonomerCreation/OpenWizard',
  CloseWizard: 'MonomerCreation/CloseWizard',
  SubmitMonomer: 'MonomerCreation/SubmitMonomer',
  CloseAttachmentPointEditDialog: 'MonomerCreation/CloseEditPointDialog',
  ReassignAttachmentPoint: 'MonomerCreation/ReassignAttachmentPoint',
} as const;

export const openMonomerCreationWizard = () => ({
  type: MonomerCreationActions.OpenWizard,
});

export const closeMonomerCreationWizard = () => ({
  type: MonomerCreationActions.CloseWizard,
});

// TODO: Define the type for monomerData
export const submitMonomerCreation = (payload) => ({
  type: MonomerCreationActions.SubmitMonomer,
  payload,
});

export const closeAttachmentPointEditDialog = () => ({
  type: MonomerCreationActions.CloseAttachmentPointEditDialog,
});

export const reassignAttachmentPoint = (atomId, newRNumber) => ({
  type: MonomerCreationActions.ReassignAttachmentPoint,
  payload: { atomId, newRNumber },
});
