import 'ketcher-react/dist/index.css';

import { useState, StrictMode } from 'react';
import { ButtonsConfig, Editor, InfoModal } from 'ketcher-react';
import {
  CoreEditor,
  Ketcher,
  RemoteStructServiceProvider,
  StructServiceProvider,
} from 'ketcher-core';
import { ModeControl } from './ModeControl';

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

let alreadySwitched = 0;

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
    <StrictMode>
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
          alreadySwitched++;
          // ketcher.setMode('flex');
          if (alreadySwitched === 2) {
            // setTimeout(() => {
            ketcher.setMolecule(`{
    "root": {
        "nodes": [
            {
                "$ref": "mol0"
            }
        ],
        "connections": [],
        "templates": []
    },
    "mol0": {
        "type": "molecule",
        "atoms": [
            {
                "label": "O",
                "location": [
                    17.4873784618909,
                    -5.873923566249523,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    17.4873784618909,
                    -7.875180517611122,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    15.753695689312845,
                    -8.876076433750477,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    14.025495446135155,
                    -7.875314237840399,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    15.753561969083568,
                    -5.873923566249523,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    13.262621538109101,
                    -6.521263196180133,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    16.623278340302054,
                    -6.374170943975284,
                    0
                ],
                "stereoLabel": "abs"
            },
            {
                "label": "C",
                "location": [
                    16.623278340302054,
                    -7.3749331398853615,
                    0
                ],
                "stereoLabel": "abs"
            },
            {
                "label": "C",
                "location": [
                    15.753561969083568,
                    -7.875314237840399,
                    0
                ],
                "stereoLabel": "abs"
            },
            {
                "label": "C",
                "location": [
                    14.889595567724001,
                    -7.3750668601146385,
                    0
                ],
                "stereoLabel": "abs"
            },
            {
                "label": "C",
                "location": [
                    14.889595567724001,
                    -6.374304664204562,
                    0
                ],
                "stereoLabel": "abs"
            },
            {
                "label": "C",
                "location": [
                    14.025495446135155,
                    -5.874057286478801,
                    0
                ]
            }
        ],
        "bonds": [
            {
                "type": 1,
                "atoms": [
                    5,
                    11
                ]
            },
            {
                "type": 1,
                "atoms": [
                    10,
                    4
                ]
            },
            {
                "type": 1,
                "atoms": [
                    4,
                    6
                ]
            },
            {
                "type": 1,
                "atoms": [
                    6,
                    7
                ]
            },
            {
                "type": 1,
                "atoms": [
                    7,
                    8
                ]
            },
            {
                "type": 1,
                "atoms": [
                    8,
                    9
                ]
            },
            {
                "type": 1,
                "atoms": [
                    9,
                    10
                ]
            },
            {
                "type": 1,
                "atoms": [
                    10,
                    11
                ],
                "stereo": 1
            },
            {
                "type": 1,
                "atoms": [
                    6,
                    0
                ],
                "stereo": 1
            },
            {
                "type": 1,
                "atoms": [
                    7,
                    1
                ],
                "stereo": 6
            },
            {
                "type": 1,
                "atoms": [
                    8,
                    2
                ],
                "stereo": 1
            },
            {
                "type": 1,
                "atoms": [
                    9,
                    3
                ],
                "stereo": 1
            }
        ]
    }
}`);
            togglePolymerEditor(true);

            // }, 10)
          }
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
    </StrictMode>
  );
};

export default App;
