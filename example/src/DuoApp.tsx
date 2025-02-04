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
  if (process.env.USE_SEPARATE_INDIGO_WASM === 'true') {
    // It is possible to use just 'ketcher-standalone' instead of ketcher-standalone/dist/binaryWasm
    // however, it will increase the size of the bundle more than two times because wasm will be
    // included in ketcher bundle as base64 string.
    // In case of usage ketcher-standalone/dist/binaryWasm additional build configuration required
    // to copy .wasm files in build folder. Please check /example/config/webpack.config.js.
    const {
      StandaloneStructServiceProvider,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
    } = require('ketcher-standalone/dist/binaryWasm');
    structServiceProvider =
      new StandaloneStructServiceProvider() as StructServiceProvider;
  } else {
    const {
      StandaloneStructServiceProvider,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
    } = require('ketcher-standalone');
    structServiceProvider =
      new StandaloneStructServiceProvider() as StructServiceProvider;
  }
}

const DuoApp = () => {
  const hiddenButtonsConfig = getHiddenButtonsConfig();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // setTimeout(() => {
  //   document
  //     .querySelector('.MuiPaper-root')
  //     ?.setAttribute('style', `min-width: 680px; min-height: 680px`);
  // }, 500);

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
        )}{' '}
      </div>
    </div>
  );
};

export default DuoApp;
