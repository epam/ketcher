import 'ketcher-react/dist/index.css';

import { SyntheticEvent, useEffect, useState } from 'react';
import { ButtonsConfig, Editor, InfoModal } from 'ketcher-react';
import { Dialog } from '@mui/material';
import { Ketcher, StructServiceProvider } from 'ketcher-core';
import { getStructServiceProvider } from './utils';

const getHiddenButtonsConfig = (): ButtonsConfig => {
  const searchParams = new URLSearchParams(window.location.search);
  const hiddenButtons = searchParams.get('hiddenControls');

  if (!hiddenButtons) return {};

  return hiddenButtons.split(',').reduce((acc, button) => {
    if (button) acc[button] = { hidden: true };

    return acc;
  }, {});
};

const App = () => {
  const hiddenButtonsConfig = getHiddenButtonsConfig();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [moleculeInput, setMoleculeInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const [structServiceProvider, setStructServiceProvider] =
    useState<StructServiceProvider | null>(null);
  useEffect(() => {
    getStructServiceProvider().then(setStructServiceProvider);
  }, []);

  if (!structServiceProvider) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <textarea
        onInput={(e: SyntheticEvent<HTMLTextAreaElement>) =>
          setMoleculeInput(e.currentTarget.value)
        }
      />
      <button
        style={{
          position: 'relative',
          zIndex: 99999,
        }}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        Heelllooo
      </button>
      <Dialog open={isOpen} fullScreen={false} maxWidth="xl">
        <Editor
          errorHandler={(message: string) => {
            setHasError(true);
            setErrorMessage(message.toString());
          }}
          buttons={hiddenButtonsConfig}
          staticResourcesUrl={process.env.PUBLIC_URL}
          structServiceProvider={structServiceProvider}
          onInit={(ketcher: Ketcher) => {
            window.ketcher = ketcher;

            window.parent.postMessage(
              {
                eventType: 'init',
              },
              '*',
            );
            window.scrollTo(0, 0);
            ketcher.setMolecule(moleculeInput);
          }}
        />
        {hasError && (
          <InfoModal
            message={errorMessage}
            close={() => {
              setHasError(false);

              // Focus on editor after modal is closed
              const cliparea: HTMLElement | null =
                document.querySelector('.cliparea');
              cliparea?.focus();
            }}
          />
        )}
      </Dialog>
    </>
  );
};

export default App;
