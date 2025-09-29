export enum ErrorMessage {
  emptyMandatoryFields = 'emptyMandatoryFields',
  invalidSymbol = 'invalidSymbol',
  symbolExists = 'symbolExists',
  editingIsNotAllowed = 'editingIsNotAllowed',
  noAttachmentPoints = 'noAttachmentPoints',
  incorrectAttachmentPointsOrder = 'incorrectAttachmentPointsOrder',
}

export enum InfoMessage {
  defaultAttachmentPoints = 'defaultAttachmentPoints',
  creationSuccessful = 'creationSuccessful',
}

export type NotificationMessageType = ErrorMessage | InfoMessage;
