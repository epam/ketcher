import styles from './Notification.module.less';
import { Icon, IconName } from 'components';
import clsx from 'clsx';
import {
  WizardAction,
  WizardNotificationId,
  WizardNotificationType,
} from '../../MonomerCreationWizard.types';
import { Dispatch } from 'react';

type Props = {
  id: WizardNotificationId;
  type: WizardNotificationType;
  message: string;
  wizardStateDispatch: Dispatch<WizardAction>;
};

const iconMap: Record<WizardNotificationType, IconName> = {
  info: 'checkFilled',
  error: 'warningFilled',
};

const Notification = ({ id, type, message, wizardStateDispatch }: Props) => {
  const handleButtonClick = () => {
    wizardStateDispatch({
      type: 'RemoveNotification',
      id,
    });
  };

  return (
    <div
      className={clsx(
        styles.notification,
        type === 'info' && styles.info,
        type === 'error' && styles.error,
      )}
    >
      <div className={styles.notificationStrip} />
      <Icon name={iconMap[type]} className={styles.notificationIcon} />
      <p className={styles.notificationText}>{message}</p>
      <button className={styles.notificationButton} onClick={handleButtonClick}>
        OK
      </button>
    </div>
  );
};

export default Notification;
