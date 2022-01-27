import 'miew/dist/Miew.min.css'
import 'ketcher-react/dist/index.css'

import { ButtonsConfig, Editor } from 'ketcher-react'
import { Ketcher, RemoteStructServiceProvider } from 'ketcher-core'
import { Editor as PolymerEditor } from 'ketcher-polymer-editor-react'

import { ErrorModal } from './ErrorModal'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Miew from 'miew'
import { PolymerToggler } from './PolymerToggler'
import { useState } from 'react'

const getHiddenButtonsConfig = (): ButtonsConfig => {
  const searchParams = new URLSearchParams(window.location.search)
  const hiddenButtons = searchParams.get('hiddenControls')

  if (!hiddenButtons) return {}

  return hiddenButtons.split(',').reduce((acc, button) => {
    if (button) acc[button] = { hidden: true }

    return acc
  }, {})
}

;(global as any).Miew = Miew

let structServiceProvider: any = new RemoteStructServiceProvider(
  process.env.API_PATH || process.env.REACT_APP_API_PATH!
)
if (process.env.MODE === 'standalone') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { StandaloneStructServiceProvider } = require('ketcher-standalone')
  structServiceProvider = new StandaloneStructServiceProvider()
}

const polymerEditor = process.env.ENABLE_POLYMER_EDITOR

const App = () => {
  const defaultSettings = {
    resetToSelect: 'paste',
    rotationStep: 10,
    showValenceWarnings: true,
    atomColoring: true,
    showStereoFlags: true,
    stereoLabelStyle: 'Iupac',
    colorOfAbsoluteCenters: '#ff0000',
    colorOfAndCenters: '#0000cd',
    colorOfOrCenters: '#228b22',
    colorStereogenicCenters: 'LabelsOnly',
    autoFadeOfStereoLabels: true,
    absFlagLabel: 'ABS (Chiral)',
    andFlagLabel: 'AND Enantiomer',
    mixedFlagLabel: 'Mixed',
    orFlagLabel: 'OR Enantiomer',
    font: '30px Arial',
    fontsz: 32,
    fontszsub: 13,
    carbonExplicitly: false,
    showCharge: true,
    showValence: true,
    showHydrogenLabels: 'on',
    aromaticCircle: true,
    doubleBondWidth: 6,
    bondThickness: 2,
    stereoBondWidth: 6,
    'smart-layout': true,
    'ignore-stereochemistry-errors': true,
    'mass-skip-error-on-pseudoatoms': false,
    'gross-formula-add-rsites': true,
    'gross-formula-add-isotopes': true,
    showAtomIds: false,
    showBondIds: false,
    showHalfBondIds: false,
    showLoopIds: false,
    miewMode: 'LN',
    miewTheme: 'light',
    miewAtomLabel: 'bright',
    init: true
  }

  const hiddenButtonsConfig = getHiddenButtonsConfig()
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showPolymerEditor, setShowPolymerEditor] = useState(false)

  return showPolymerEditor ? (
    <>
      <PolymerEditor />
      <PolymerToggler toggle={setShowPolymerEditor} />
    </>
  ) : (
    <>
      <Editor
        errorHandler={(message: string) => {
          setHasError(true)
          setErrorMessage(message.toString())
        }}
        buttons={hiddenButtonsConfig}
        staticResourcesUrl={process.env.PUBLIC_URL!}
        structServiceProvider={structServiceProvider}
        onInit={(ketcher: Ketcher) => {
          ;(global as any).ketcher = ketcher
        }}
        settings={defaultSettings}
      />
      {polymerEditor && <PolymerToggler toggle={setShowPolymerEditor} />}
      {hasError && (
        <ErrorModal message={errorMessage} close={() => setHasError(false)} />
      )}
    </>
  )
}

export default App
