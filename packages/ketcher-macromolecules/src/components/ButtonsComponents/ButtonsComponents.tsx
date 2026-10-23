import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'ketcher-react';
import { About } from '../modal/About/About';

export function ButtonsComponents() {
  const { t } = useTranslation('macromolecules');
  const [aboutOpen, setAboutOpen] = useState(false);

  const aboutProps = {
    isOpen: aboutOpen,
    onClose: () => setAboutOpen(false),
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          iconName="help"
          title={t('buttons.help')}
          onClick={() => {
            const HELP_LINK = (process.env.HELP_LINK as string) || 'master';
            window.open(
              `https://github.com/epam/ketcher/blob/${HELP_LINK}/documentation/help.md#ketcher-macromolecules-mode`,
              '_blank',
            );
          }}
          testId="help-button"
        />
        <IconButton
          iconName="about"
          title={t('buttons.about')}
          onClick={() => setAboutOpen(true)}
          testId="about-button"
        />
      </div>
      <About {...aboutProps} />
    </>
  );
}
