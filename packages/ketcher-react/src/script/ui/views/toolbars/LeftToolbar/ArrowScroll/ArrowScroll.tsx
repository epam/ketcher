import classes from './ArrowScroll.module.less'
import clsx from 'clsx'

interface ArrowScrollProps {
  startInView: boolean
  endInView: boolean
  scrollUp: any
  scrollDown: any
}

const ArrowScroll = (props: ArrowScrollProps) => {
  const { startInView, endInView, scrollUp, scrollDown } = props

  if (startInView && endInView) {
    return <div className={classes.scroll} />
  }
  if (startInView) {
    return (
      <div className={classes.scroll}>
        <button
          onClick={() => {
            scrollDown()
          }}
          className={clsx(classes.button, classes.down)}>
          ▼
        </button>
      </div>
    )
  }
  if (endInView) {
    return (
      <div className={classes.scroll}>
        <button
          onClick={() => {
            scrollUp()
          }}
          className={clsx(classes.button, classes.up)}>
          ▲
        </button>
      </div>
    )
  }
  return (
    <div className={classes.scroll}>
      <button
        onClick={() => {
          scrollUp()
        }}
        className={classes.button}>
        ▲
      </button>
      <button
        onClick={() => {
          scrollDown()
        }}
        className={classes.button}>
        ▼
      </button>
    </div>
  )
}

export { ArrowScroll }
