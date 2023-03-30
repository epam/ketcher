import { ButtonsConfig, Editor } from 'ketcher-react'
import {
  Ketcher,
  RemoteStructServiceProvider,
  StructServiceProvider
} from 'ketcher-core'
import { ErrorModal } from './ErrorModal'
import { PolymerToggler } from './PolymerToggler'
import { useState } from 'react'
import { Editor as PolymerEditorReact } from 'ketcher-polymer-editor-react'
import { StandaloneStructServiceProvider } from 'ketcher-standalone'

const getHiddenButtonsConfig = (): ButtonsConfig => {
  const searchParams = new URLSearchParams(window.location.search)
  const hiddenButtons = searchParams.get('hiddenControls')

  if (!hiddenButtons) return {}

  return hiddenButtons.split(',').reduce((acc, button) => {
    if (button) acc[button] = { hidden: true }

    return acc
  }, {})
}

let structServiceProvider: StructServiceProvider =
  new RemoteStructServiceProvider(
    process.env.VITE_API_PATH || process.env.VITE_REACT_APP_API_PATH!
  )
if (process.env.MODE === 'standalone') {
  structServiceProvider =
    new StandaloneStructServiceProvider() as StructServiceProvider
}

const enablePolymerEditor = process.env.VITE_ENABLE_POLYMER_EDITOR === 'true'

type PolymerType = () => JSX.Element | null

let PolymerEditor: PolymerType = () => null
if (enablePolymerEditor) {
  PolymerEditor = PolymerEditorReact as PolymerType
}

const App = () => {
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
        staticResourcesUrl={process.env.VITE_PUBLIC_URL!}
        structServiceProvider={structServiceProvider}
        onInit={(ketcher: Ketcher) => {
          ;(window as any).ketcher = ketcher
          window.parent.postMessage(
            {
              eventType: 'init'
            },
            '*'
          )
        }}
      />
      {enablePolymerEditor && <PolymerToggler toggle={setShowPolymerEditor} />}
      {hasError && (
        <ErrorModal
          message={errorMessage}
          close={() => {
            setHasError(false)

            // Focus on editor after modal is closed
            const cliparea: HTMLElement = document.querySelector('.cliparea')!
            cliparea?.focus()
          }}
        />
      )}
    </>
  )
}

export default App
