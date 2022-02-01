import styles from './BoxWithLines.module.less'

export const BoxWithLines = ({ isLastSibling }) => {
  return (
    <div className={styles.nodeLines}>
      <div className={styles.upperLines} />
      {!isLastSibling && <div className={styles.lowerLine} />}
    </div>
  )
}
