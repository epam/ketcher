import 'ketcher-react/dist/index.css';
import { useEffect, useState } from 'react';
import { ButtonsConfig, Editor, InfoModal } from 'ketcher-react';
import { Ketcher, StructServiceProvider } from 'ketcher-core';
import { getStructServiceProvider } from './utils';
import { safePostMessage } from './utils/safePostMessage';

const getHiddenButtonsConfig = (): ButtonsConfig => {
  const searchParams = new URLSearchParams(window.location.search);
  const hiddenButtons = searchParams.get('hiddenControls');

  if (!hiddenButtons) return {};

  return hiddenButtons.split(',').reduce((acc, button) => {
    if (button) acc[button] = { hidden: true };

    return acc;
  }, {} as { [val: string]: { hidden: boolean } });
};

const DuoApp = () => {
  const hiddenButtonsConfig = getHiddenButtonsConfig();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [structServiceProvider1, setStructServiceProvider1] =
    useState<StructServiceProvider | null>(null);
  useEffect(() => {
    getStructServiceProvider().then(setStructServiceProvider1);
  }, []);

  const [structServiceProvider2, setStructServiceProvider2] =
    useState<StructServiceProvider | null>(null);
  useEffect(() => {
    getStructServiceProvider().then(setStructServiceProvider2);
  }, []);

  if (!structServiceProvider1 || !structServiceProvider2) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <div className="box">
        {/* The first editor instance */}
        <Editor
          errorHandler={(message: string) => {
            setHasError(true);
            setErrorMessage(message.toString());
          }}
          buttons={hiddenButtonsConfig}
          staticResourcesUrl={process.env.PUBLIC_URL}
          structServiceProvider={structServiceProvider1}
          onInit={(ketcher: Ketcher) => {
            window.ketcher = ketcher;
            safePostMessage({
              eventType: 'init',
            });
            window.scrollTo(0, 0);
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
        )}{' '}
      </div>

      <div className="box">
        {/* The first editor instance */}
        <Editor
          errorHandler={(message: string) => {
            setHasError(true);
            setErrorMessage(message.toString());
          }}
          buttons={hiddenButtonsConfig}
          staticResourcesUrl={process.env.PUBLIC_URL}
          structServiceProvider={structServiceProvider2}
          onInit={(ketcher: Ketcher) => {
            window.ketcher = ketcher;
            safePostMessage({
              eventType: 'init',
            });
            window.scrollTo(0, 0);
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
        )}{' '}
      </div>
    </div>
  );
};

export default DuoApp;
