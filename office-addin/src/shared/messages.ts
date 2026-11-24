// PowerPoint upper-cases tag keys, so keep them upper case here.
export const KET_TAG = 'KETCHER_KET';
// Width PowerPoint gave the picture at insertion. Comparing it with the
// current width tells how much the user scaled the picture.
export const BASE_WIDTH_TAG = 'KETCHER_BASE_WIDTH';

export const EDITOR_PAGE = 'editor.html';
// Query flag the task pane adds so the editor knows it runs in an Office dialog.
export const OFFICE_DIALOG_FLAG = 'office';

export interface StructurePayload {
  ket: string;
  svg: string;
}

export type DialogToHostMessage =
  | { type: 'ready' }
  | ({ type: 'insert' } & StructurePayload)
  | { type: 'cancel' };

export interface HostToDialogMessage {
  type: 'load';
  ket: string | null;
}
