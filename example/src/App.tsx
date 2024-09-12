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

const App = () => {
  const hiddenButtonsConfig = getHiddenButtonsConfig();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPolymerEditor, setShowPolymerEditor] = useState(false);

  const togglePolymerEditor = (toggleValue: boolean) => {
    setShowPolymerEditor(toggleValue);
    window.isPolymerEditorTurnedOn = toggleValue;
  };

  setTimeout(() => {
    ketcher.setMode('flex');
    ketcher.setMolecule(`{
    "root": {
        "nodes": [
            {
                "$ref": "monomer194"
            },
            {
                "$ref": "mol0"
            }
        ],
        "connections": [],
        "templates": [
            {
                "$ref": "monomerTemplate-A___Alanine"
            }
        ]
    },
    "mol0": {
        "type": "molecule",
        "atoms": [
            {
                "label": "C",
                "location": [
                    15.534530774189404,
                    -6.831623632889918,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    16.757695757024653,
                    -5.607772490608435,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    15.793813274933457,
                    -5.865082282944578,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    17.46546922581059,
                    -6.315545959394387,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    16.24513465069106,
                    -7.5422275093915685,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    17.209617522297684,
                    -7.277798812800791,
                    0
                ]
            }
        ],
        "bonds": [
            {
                "type": 2,
                "atoms": [
                    2,
                    0
                ]
            },
            {
                "type": 1,
                "atoms": [
                    0,
                    4
                ]
            },
            {
                "type": 2,
                "atoms": [
                    4,
                    5
                ]
            },
            {
                "type": 1,
                "atoms": [
                    5,
                    3
                ]
            },
            {
                "type": 2,
                "atoms": [
                    3,
                    1
                ]
            },
            {
                "type": 1,
                "atoms": [
                    1,
                    2
                ]
            }
        ]
    },
    "monomer194": {
        "type": "monomer",
        "id": "194",
        "position": {
            "x": 13.525,
            "y": -6.300000000000001
        },
        "alias": "A",
        "templateId": "A___Alanine"
    },
    "monomerTemplate-A___Alanine": {
        "type": "monomerTemplate",
        "atoms": [
            {
                "label": "N",
                "location": [
                    -1.2549,
                    -0.392,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    -0.272,
                    0.2633,
                    0
                ],
                "stereoLabel": "abs"
            },
            {
                "label": "C",
                "location": [
                    -0.3103,
                    1.7393,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    1.0523,
                    -0.392,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    1.0829,
                    -1.5722,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    2.0353,
                    0.2633,
                    0
                ]
            },
            {
                "label": "H",
                "location": [
                    -2.3334,
                    0.0905,
                    0
                ]
            }
        ],
        "bonds": [
            {
                "type": 1,
                "atoms": [
                    1,
                    0
                ]
            },
            {
                "type": 1,
                "atoms": [
                    1,
                    2
                ],
                "stereo": 1
            },
            {
                "type": 1,
                "atoms": [
                    1,
                    3
                ]
            },
            {
                "type": 2,
                "atoms": [
                    3,
                    4
                ]
            },
            {
                "type": 1,
                "atoms": [
                    3,
                    5
                ]
            },
            {
                "type": 1,
                "atoms": [
                    0,
                    6
                ]
            }
        ],
        "class": "AminoAcid",
        "classHELM": "PEPTIDE",
        "id": "A___Alanine",
        "fullName": "Alanine",
        "alias": "A",
        "attachmentPoints": [
            {
                "attachmentAtom": 0,
                "leavingGroup": {
                    "atoms": [
                        6
                    ]
                },
                "type": "left"
            },
            {
                "attachmentAtom": 3,
                "leavingGroup": {
                    "atoms": [
                        5
                    ]
                },
                "type": "right"
            }
        ],
        "naturalAnalogShort": "A"
    }
}`);

    togglePolymerEditor(true);
  }, 10);

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
