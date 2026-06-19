import { StrictMode, useEffect, useState } from 'react';
import { Editor, InfoModal } from 'ketcher-react';
import { Ketcher, StructServiceProvider } from 'ketcher-core';

import 'ketcher-react/dist/index.css';

import { getStructServiceProvider } from './utils';
import {
  getHiddenButtonsConfig,
  isMacromoleculesEditorDisabled,
} from './utils/editorUrlConfig';
import { safePostMessage } from './utils/safePostMessage';

const App = () => {
  const hiddenButtonsConfig = getHiddenButtonsConfig();
  const disableMacromoleculesEditor = isMacromoleculesEditorDisabled();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [structServiceProvider, setStructServiceProvider] =
    useState<StructServiceProvider | null>(null);
  useEffect(() => {
    getStructServiceProvider().then(setStructServiceProvider);
  }, []);

  if (!structServiceProvider) {
    return <div>Loading...</div>;
  }

  return (
    <StrictMode>
      <Editor
        errorHandler={(message: string) => {
          setHasError(true);
          setErrorMessage(message.toString());
        }}
        buttons={hiddenButtonsConfig}
        disableMacromoleculesEditor={disableMacromoleculesEditor}
        staticResourcesUrl={process.env.PUBLIC_URL}
        structServiceProvider={structServiceProvider}
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
      )}
    </StrictMode>
  );
};

export default App;
