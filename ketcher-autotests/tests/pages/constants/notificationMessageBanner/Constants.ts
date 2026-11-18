export enum ErrorMessage {
  emptyMandatoryFields = 'emptyMandatoryFields',
  invalidSymbol = 'invalidSymbol',
  symbolExists = 'symbolExists',
  editingIsNotAllowed = 'editingIsNotAllowed',
  noAttachmentPoints = 'noAttachmentPoints',
  incorrectAttachmentPointsOrder = 'incorrectAttachmentPointsOrder',
  notMinimalViableStructure = 'notMinimalViableStructure',
  invalidHELMAlias = 'invalidHELMAlias',
  notUniqueHELMAlias = 'notUniqueHELMAlias',
  invalidRnaPresetStructure = 'invalidRnaPresetStructure',
  rnaPresetAtomsOutsideComponents = 'rnaPresetAtomsOutsideComponents',
  incontinuousStructure = 'incontinuousStructure',
  rnaPresetInvalidSugarPhosphateConnectionAttachmentPoints = 'rnaPresetInvalidSugarPhosphateConnectionAttachmentPoints',
  invalidPhosphatePositionAttachmentPoints = 'invalidPhosphatePositionAttachmentPoints',
  invalidPresetCode = 'invalidPresetCode',
  notUniquePresetCode = 'notUniquePresetCode',
  rnaPresetInvalidSugarConnectionBonds = 'rnaPresetInvalidSugarConnectionBonds',
  editAllPresetError = 'editAllPresetError',
}

export enum InfoMessage {
  defaultAttachmentPoints = 'defaultAttachmentPoints',
  creationSuccessful = 'creationSuccessful',
}

export enum WarningMessage {
  editAllPresetWarning = 'editAllPresetWarning',
}

export type NotificationMessageType =
  ErrorMessage | InfoMessage | WarningMessage;
