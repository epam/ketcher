import styles from './Notification.module.less';
import { type IconName, Icon } from 'components';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import type {
  WizardNotificationId,
  WizardNotificationType,
} from '../../MonomerCreationWizard.types';

type Props = {
  id: WizardNotificationId;
  type: WizardNotificationType;
  message: string;
  onDismiss?: (id: WizardNotificationId) => void;
};

const iconMap: Record<WizardNotificationType, IconName> = {
  info: 'checkFilled',
  error: 'warningFilled',
  warning: 'warningFilled',
};

const Notification = ({ id, type, message, onDismiss }: Props) => {
  const { t } = useTranslation('common');
  const handleButtonClick = () => {
    onDismiss?.(id);
  };
  const isDismissible = type === 'info' && onDismiss;

  return (
    <div
      className={clsx(
        styles.notification,
        type === 'info' && styles.info,
        type === 'error' && styles.error,
        type === 'warning' && styles.warning,
      )}
      data-testid={`notification-${id}-message-banner`}
    >
      <div className={styles.notificationStrip} />
      <Icon name={iconMap[type]} className={styles.notificationIcon} />
      <p
        className={styles.notificationText}
        data-testid={`notification-message-body`}
      >
        {message}
      </p>
      {isDismissible && (
        <button
          className={styles.notificationButton}
          onClick={handleButtonClick}
          data-testid="notification-message-ok-button"
        >
          {t('button.ok')}
        </button>
      )}
    </div>
  );
};

export default Notification;
