import { useState } from 'react';
import { IconButton } from 'ketcher-react';
import { About } from '../modal/About/About';
import { useAppDispatch } from '../../hooks';
import { openModal } from '../../state/modal';

export function ButtonsComponents() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const dispatch = useAppDispatch();

  const aboutProps = {
    isOpen: aboutOpen,
    onClose: () => setAboutOpen(false),
  };

  const handleSettingsClick = () => {
    if (window.ketcher?.settingsService) {
      const allSettings = window.ketcher.settingsService.getSettings();
      console.log('[MACROMOLECULES] Settings button clicked');
      console.log('[MACROMOLECULES] Current settings:', allSettings);
      console.log(
        '[MACROMOLECULES] Settings JSON:',
        JSON.stringify(allSettings, null, 2),
      );
    } else {
      console.warn('[MACROMOLECULES] Settings service not available');
    }
    dispatch(openModal('settings'));
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          iconName="settings"
          title="Settings"
          onClick={handleSettingsClick}
          testId="settings-button"
        />
        <IconButton
          iconName="help"
          title="Help (?)"
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
          title="About"
          onClick={() => setAboutOpen(true)}
          testId="about-button"
        />
      </div>
      <About {...aboutProps} />
    </>
  );
}
