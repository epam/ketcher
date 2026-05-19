import { useState } from 'react';
import { IconButton } from 'ketcher-react';
import { About } from '../modal/About/About';

export function ButtonsComponents() {
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
