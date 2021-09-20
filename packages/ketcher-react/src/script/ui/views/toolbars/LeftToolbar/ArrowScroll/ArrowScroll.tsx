import classes from './ArrowScroll.module.less'
import clsx from 'clsx'

interface ArrowScrollProps {
  inView1: boolean
  inView2: boolean
  scrollRef: any
}

const ArrowScroll = (props: ArrowScrollProps) => {
  const { inView1, inView2, scrollRef } = props

  if (inView1 && inView2) {
    return <div className={classes.scroll} />
  }
  if (inView1) {
    return (
      <div className={classes.scroll}>
        <button
          onClick={() => {
            scrollRef.current.scrollTop += 50
          }}
          className={clsx(classes.button, classes.down)}>
          ▼
        </button>
      </div>
    )
  }
  if (inView2) {
    return (
      <div className={classes.scroll}>
        <button
          onClick={() => {
            scrollRef.current.scrollTop -= 50
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
          scrollRef.current.scrollTop -= 50
        }}
        className={classes.button}>
        ▲
      </button>
      <button
        onClick={() => {
          scrollRef.current.scrollTop += 50
        }}
        className={classes.button}>
        ▼
      </button>
    </div>
  )
}

export { ArrowScroll }
