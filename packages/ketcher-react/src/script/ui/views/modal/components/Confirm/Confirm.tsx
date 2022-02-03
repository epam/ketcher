import classes from '../toolbox/FG/RemoveFG.module.less'

type ConfirmProps = {
  onOk: () => void
  onCancel: () => void
}

export const Confirm = ({ onOk, onCancel }: ConfirmProps) => {
  return (
    <div className={classes.window}>
      <header className={classes.header}>Warning!</header>
      <div className={classes.question}>
        Unsupported S-group type found. Would you like to import structure
        without it?
      </div>
      <footer className={classes.footer}>
        <input
          type="button"
          value={'Cancel'}
          className={classes.buttonCancel}
          onClick={() => onCancel()}
        />
        <input
          type="button"
          value={'OK'}
          className={classes.buttonOk}
          onClick={() => onOk()}
        />
      </footer>
    </div>
  )
}
