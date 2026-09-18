import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['common', 'dialogs']);
  return (
    <div className={classes.window}>
      <header className={classes.header} data-testid="confirm-header">
        {title || t('dialogs:confirm.warning')}
      </header>
      <div className={classes.question} data-testid="confirm-question">
        {text || t('dialogs:confirm.unsupportedSgroupQuestion')}
      </div>
      <footer className={classes.footer}>
        <input
          type="button"
          value={t('common:button.cancel')}
          className={classes.buttonCancel}
          onClick={() => onCancel()}
          data-testid="cancel-button"
        />
        <input
          type="button"
          value={okButtonLabel || t('common:button.ok')}
          className={classes.buttonOk}
          onClick={() => onOk()}
          data-testid="ok-button"
        />
      </footer>
    </div>
  );
};
