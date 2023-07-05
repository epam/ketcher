import { pasteErrorText, shortcuts } from '../constants'

import styles from './PasteErrorModalBody.module.less'

export const PasteErrorModalBody = (): JSX.Element => {
  return (
    <div className={styles.pasteErrorModalBody}>
      <div>{pasteErrorText}</div>
      <div className={styles.shortcutsBlock}>
        {shortcuts.map(({ hotKey, label }) => {
          return (
            <div className={styles.shortcuts} key={hotKey}>
              <div className={styles.shortcut}>{hotKey}</div>
              <div>{label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
