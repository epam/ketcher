import { Ketcher } from 'ketcher-core';

declare global {
  var ketcher: Ketcher;

  interface Window {
    ketcher: Ketcher;
    isPolymerEditorTurnedOn: boolean;
    _ketcher_isAutozoomDisabled?: boolean;
  }
}
