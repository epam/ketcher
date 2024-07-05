import 'ketcher-react/dist/index.css';

import { useState } from 'react';
import { ButtonsConfig, Editor, InfoModal } from 'ketcher-react';
import {
  Ketcher,
  RemoteStructServiceProvider,
  StructServiceProvider,
} from 'ketcher-core';
import { ModeControl } from './ModeControl';
import { StandaloneStructServiceProvider } from 'ketcher-standalone/dist/binaryWasm';

const isProduction = process.env.NODE_ENV === 'production';

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
  if (isProduction) {
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

const enablePolymerEditor = process.env.ENABLE_POLYMER_EDITOR === 'true';

type PolymerType = ({
  togglerComponent,
}: {
  togglerComponent?: JSX.Element;
}) => JSX.Element | null;

let PolymerEditor: PolymerType = () => null;
if (enablePolymerEditor) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Editor } = require('ketcher-macromolecules');
  PolymerEditor = Editor as PolymerType;
}

const App = () => {
  const hiddenButtonsConfig = getHiddenButtonsConfig();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPolymerEditor, setShowPolymerEditor] = useState(false);

  const togglePolymerEditor = (toggleValue: boolean) => {
    setShowPolymerEditor(toggleValue);
    window.isPolymerEditorTurnedOn = toggleValue;
  };

  const togglerComponent = enablePolymerEditor ? (
    <ModeControl
      toggle={togglePolymerEditor}
      isPolymerEditor={showPolymerEditor}
    />
  ) : undefined;

  return showPolymerEditor ? (
    <>
      <PolymerEditor togglerComponent={togglerComponent} />
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
        togglerComponent={togglerComponent}
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
