import 'ketcher-react/dist/index.css';

import { useState } from 'react';
import { ButtonsConfig, Editor, InfoModal } from 'ketcher-react';
import {
  Ketcher,
  RemoteStructServiceProvider,
  StructServiceProvider,
} from 'ketcher-core';

const getHiddenButtonsConfig = (): ButtonsConfig => {
  const searchParams = new URLSearchParams(window.location.search);
  const hiddenButtons = searchParams.get('hiddenControls');

  if (!hiddenButtons) return {};

  return hiddenButtons.split(',').reduce((acc, button) => {
    if (button) acc[button] = { hidden: true };

    return acc;
  }, {});
};

let structServiceProvider: StructServiceProvider =
  new RemoteStructServiceProvider(
    process.env.API_PATH || process.env.REACT_APP_API_PATH,
  );

if (process.env.MODE === 'standalone') {
  const {
    StandaloneStructServiceProvider,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
  } = require('ketcher-standalone');
  structServiceProvider =
    new StandaloneStructServiceProvider() as StructServiceProvider;
}

const App = () => {
  const hiddenButtonsConfig = getHiddenButtonsConfig();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <>
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
    </>
  );
};

export default App;
