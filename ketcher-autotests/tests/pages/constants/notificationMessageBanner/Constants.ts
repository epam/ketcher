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
  invalidPresetCode = 'invalidPresetCode',
}

export enum InfoMessage {
  defaultAttachmentPoints = 'defaultAttachmentPoints',
  creationSuccessful = 'creationSuccessful',
}

export type NotificationMessageType = ErrorMessage | InfoMessage;
