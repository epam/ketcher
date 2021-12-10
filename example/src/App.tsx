import 'miew/dist/Miew.min.css'
import 'ketcher-react/dist/index.css'

import { ButtonsConfig, Editor } from 'ketcher-react'
import { Ketcher, RemoteStructServiceProvider } from 'ketcher-core'

import { ErrorModal } from './ErrorModal'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Miew from 'miew'
import { PeptidesToggler } from './PeptidesToggler'
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

const peptideEditor = process.env.ENABLE_PEPTIDES_EDITOR

const App = () => {
  const hiddenButtonsConfig = getHiddenButtonsConfig()
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showPeptides, setShowPeptides] = useState(false)

  return showPeptides ? (
    <>
      <div>Peptides Editor Enabled</div>
      <PeptidesToggler toggle={setShowPeptides} />
    </>
  ) : (
    <>
      <Editor
        errorHandler={(message: string) => {
          setHasError(true)
          setErrorMessage(message.toString())
        }}
        buttons={hiddenButtonsConfig}
        staticResourcesUrl={process.env.PUBLIC_URL}
        structServiceProvider={structServiceProvider}
        onInit={(ketcher: Ketcher) => {
          ;(global as any).ketcher = ketcher
        }}
      />
      {peptideEditor && <PeptidesToggler toggle={setShowPeptides} />}
      {hasError && (
        <ErrorModal message={errorMessage} close={() => setHasError(false)} />
      )}
    </>
  )
}

export default App
