import classes from '../toolbox/FG/RemoveFG.module.less';

type ConfirmProps = {
  onOk: () => void;
  onCancel: () => void;
  text?: string;
  title?: string;
  okButtonLabel?: string;
};

export const Confirm = ({
  onOk,
  onCancel,
  text,
  title,
  okButtonLabel,
}: ConfirmProps) => {
  return (
    <div className={classes.window}>
      <header className={classes.header} data-testid="confirm-header">
        {title || 'Warning!'}
      </header>
      <div className={classes.question} data-testid="confirm-question">
        {text ||
          'Unsupported S-group type found. Would you like to import structure without it?'}
      </div>
      <footer className={classes.footer}>
        <input
          type="button"
          value={'Cancel'}
          className={classes.buttonCancel}
          onClick={() => onCancel()}
          data-testid="cancel-button"
        />
        <input
          type="button"
          value={okButtonLabel || 'OK'}
          className={classes.buttonOk}
          onClick={() => onOk()}
          data-testid="ok-button"
        />
      </footer>
    </div>
  );
};
