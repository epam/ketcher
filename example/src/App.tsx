import 'ketcher-react/dist/index.css';

import { useState } from 'react';
import { ButtonsConfig, Editor, InfoModal } from 'ketcher-react';
import { Dialog } from '@mui/material';
import {
  Ketcher,
  RemoteStructServiceProvider,
  StructServiceProvider,
} from 'ketcher-core';
import { ModeControl } from './ModeControl';
import classes from '../../packages/ketcher-react/src/script/ui/dialog/template/template-lib.module.less';
import { omit } from 'lodash/fp';
import DialogContent from '@mui/material/DialogContent';

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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { StandaloneStructServiceProvider } = require('ketcher-standalone');
  structServiceProvider =
    new StandaloneStructServiceProvider() as StructServiceProvider;
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

  const [maxWidth, setMaxWidth] = useState('600px');

  return showPolymerEditor ? (
    <>
      <PolymerEditor togglerComponent={togglerComponent} />
    </>
  ) : (
    <Dialog open={true} fullScreen={false} maxWidth="xl">
      <button
        onClick={() => {
          setMaxWidth(maxWidth === '600px' ? '1400px' : '600px');
          document
            .querySelector('.MuiPaper-root')
            .setAttribute('style', `min-width: ${maxWidth}; min-height: 600px`);
        }}
      >
        Heelllooo
      </button>
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
          ketcher.editor.setOptions(JSON.stringify({ bondThickness: 4 }));
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
    </Dialog>
  );
};

export default App;
