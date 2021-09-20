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

  return (
    <div className={classes.scroll}>
      {endInView ? (
        <></>
      ) : (
        <button
          onClick={() => scrollDown()}
          className={clsx(classes.button, classes.down)}>
          ▼
        </button>
      )}
      {startInView ? (
        <></>
      ) : (
        <button
          onClick={() => scrollUp()}
          className={clsx(classes.button, classes.up)}>
          ▲
        </button>
      )}
    </div>
  )
}

export { ArrowScroll }
