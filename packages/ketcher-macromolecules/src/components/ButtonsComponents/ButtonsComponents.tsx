import { useEffect, useState } from 'react';
import { IconButton } from 'ketcher-react';
import { About } from '../modal/About/About';

export function ButtonsComponents() {
  const [aboutOpen, setAboutOpen] = useState(false);
  useEffect(() => {
    const handler = (e) => {
      // Shift + / is usually "?" on most keyboards
      if ((e.key === '?' || (e.key === '/' && e.shiftKey)) && !e.repeat) {
        window.open(
          'https://github.com/epam/ketcher/blob/master/documentation/help.md#ketcher-macromolecules-mode',
          '_blank',
        );
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const aboutProps = {
    isOpen: aboutOpen,
    onClose: () => setAboutOpen(false),
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          iconName="help"
          title="Help"
          onClick={() =>
            window.open(
              'https://github.com/epam/ketcher/blob/master/documentation/help.md#ketcher-macromolecules-mode',
              '_blank',
            )
          }
          data-testid="help-button"
        />
        <IconButton
          iconName="about"
          title="About"
          onClick={() => setAboutOpen(true)}
          data-testid="about-button"
        />
      </div>
      <About {...aboutProps} />
    </>
  );
}
