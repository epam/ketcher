import i18n from 'src/i18n/i18n';

export const pasteErrorText = i18n.t('dialogs:infoModal.pasteErrorText');

// hotKey is a literal key-combo representation, not translatable UI copy
export const shortcut = {
  hotKey: 'CTRL/Cmd + V',
  label: i18n.t('dialogs:infoModal.shortcutForPaste'),
};

export const error = {
  message: i18n.t('dialogs:infoModal.errorMessage'),
  close: i18n.t('common:button.close'),
};
