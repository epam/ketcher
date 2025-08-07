import { useEffect, useState } from 'react';
import { ButtonsConfig, Editor, InfoModal } from 'ketcher-react';
import { Ketcher, StructServiceProvider } from 'ketcher-core';

import 'ketcher-react/dist/index.css';

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

const App = () => {
  const hiddenButtonsConfig = getHiddenButtonsConfig();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVisisible, setIsVisisible] = useState(false);
  const [molecule, setMolecule] = useState('');

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
      {!isVisisible ? (
        <>
          <button onClick={() => setIsVisisible(true)}>Show empty</button>
          <button
            onClick={() => {
              setIsVisisible(true);
              setMolecule(`      
  -INDIGO-06182511572D

  0  0  0  0  0  0  0  0  0  0  0 V3000
M  V30 BEGIN CTAB
M  V30 COUNTS 12 12 0 0 0
M  V30 BEGIN ATOM
M  V30 1 O 17.1553 -10.0709 0.0 0
M  V30 2 O 17.1553 -12.073 0.0 0
M  V30 3 O 15.421 -13.0741 0.0 0
M  V30 4 O 13.6922 -12.0732 0.0 0
M  V30 5 O 15.4265 -10.0709 0.0 0
M  V30 6 O 12.9347 -10.7185 0.0 0
M  V30 7 C 16.2909 -10.5715 0.0 0 CFG=1
M  V30 8 C 16.2909 -11.5725 0.0 0 CFG=2
M  V30 9 C 15.4265 -12.0732 0.0 0 CFG=1
M  V30 10 C 14.5566 -11.5726 0.0 0 CFG=1
M  V30 11 C 14.5566 -10.5716 0.0 0 CFG=1
M  V30 12 C 13.6922 -10.0711 0.0 0
M  V30 END ATOM
M  V30 BEGIN BOND
M  V30 1 1 6 12
M  V30 2 1 11 5
M  V30 3 1 5 7
M  V30 4 1 7 8
M  V30 5 1 8 9
M  V30 6 1 9 10
M  V30 7 1 10 11
M  V30 8 1 11 12 CFG=1
M  V30 9 1 7 1 CFG=3
M  V30 10 1 8 2 CFG=1
M  V30 11 1 9 3 CFG=3
M  V30 12 1 10 4 CFG=3
M  V30 END BOND
M  V30 BEGIN COLLECTION
M  V30 MDLV30/STEABS ATOMS=(5 7 8 9 10 11)
M  V30 END COLLECTION
M  V30 END CTAB
M  END
`);
            }}
          >
            Show molecule
          </button>
        </>
      ) : (
        <button
          onClick={() => {
            setIsVisisible(false);
            setMolecule('');
          }}
        >
          Hide
        </button>
      )}
      {isVisisible && (
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
            safePostMessage({
              eventType: 'init',
            });
            window.scrollTo(0, 0);
            if (molecule) {
              ketcher.setMolecule(molecule);
            }
          }}
        />
      )}
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
