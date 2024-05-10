import { pasteErrorText, shortcut } from '../constants';

import styles from './PasteErrorModalBody.module.less';

export const PasteErrorModalBody = (): JSX.Element => {
  return (
    <div className={styles.pasteErrorModalBody}>
      <div>{pasteErrorText}</div>
      <div className={styles.shortcutsBlock}>
        <div className={styles.shortcuts}>
          <div
            className={styles.shortcut}
            data-testid="infoModal-shortcut-for-paste"
          >
            {shortcut.hotKey}
          </div>
          <div>{shortcut.label}</div>
        </div>
      </div>
    </div>
  );
};
