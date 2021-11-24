import 'miew/dist/Miew.min.css'
import 'ketcher-react/dist/index.css'

import { Ketcher, RemoteStructServiceProvider } from 'ketcher-core'

import { Editor, ButtonsConfig } from 'ketcher-react'
// @ts-ignore
import Miew from 'miew'
import { useState } from 'react'
import ErrorModal from './ErrorModal/ErrorModal'
import { PeptidesToggler } from './PeptidesToggler/PeptidesToggler'

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
  const { StandaloneStructServiceProvider } = require('ketcher-standalone')
  structServiceProvider = new StandaloneStructServiceProvider()
}

const peptideEditor = JSON.parse(process.env.ENABLE_PEPTIDES_EDITOR!)

const App = () => {
  const hiddenButtonsConfig = getHiddenButtonsConfig()
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [peptides, enablePeptides] = useState(false)

  return peptides ? (
    <>
      <div>Peptide Editor Enabled</div>
      <PeptidesToggler toggle={enablePeptides} />
    </>
  ) : (
    <>
      <Editor
        errorHandler={(message: string) => {
          setHasError(true)
          setErrorMessage(message)
        }}
        buttons={hiddenButtonsConfig}
        staticResourcesUrl={process.env.PUBLIC_URL}
        structServiceProvider={structServiceProvider}
        onInit={(ketcher: Ketcher) => {
          ;(global as any).ketcher = ketcher
        }}
      />
      {peptideEditor && <PeptidesToggler toggle={enablePeptides} />}
      {hasError && <ErrorModal message={errorMessage} update={setHasError} />}
    </>
  )
}

export default App
