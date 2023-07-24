import 'ketcher-react/dist/index.css';

import { useState } from 'react';
import { ButtonsConfig, Editor, InfoModal } from 'ketcher-react';
import {
  Ketcher,
  RemoteStructServiceProvider,
  StructServiceProvider,
} from 'ketcher-core';
import { PolymerToggler } from './PolymerToggler';

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
console.log('app tsx', process.env.MODE, process.env.KETCHER_URL);
if (process.env.MODE === 'standalone') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { StandaloneStructServiceProvider } = require('ketcher-standalone');
  structServiceProvider =
    new StandaloneStructServiceProvider() as StructServiceProvider;
}

const enablePolymerEditor = process.env.ENABLE_POLYMER_EDITOR === 'true';

type PolymerType = () => JSX.Element | null;

let PolymerEditor: PolymerType = () => null;
if (enablePolymerEditor) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Editor } = require('ketcher-polymer-editor-react');
  PolymerEditor = Editor as PolymerType;
}

const App = () => {
  console.log('run app', process.env.MODE, process.env.KETCHER_URL);
  const hiddenButtonsConfig = getHiddenButtonsConfig();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPolymerEditor, setShowPolymerEditor] = useState(false);

  return showPolymerEditor ? (
    <>
      <PolymerEditor />
      <PolymerToggler toggle={setShowPolymerEditor} />
    </>
  ) : (
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
        }}
      />
      {enablePolymerEditor && <PolymerToggler toggle={setShowPolymerEditor} />}
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
