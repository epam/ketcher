import 'ketcher-react/dist/index.css'

import {  Editor } from 'ketcher-react'
import {
  Ketcher,
  RemoteStructServiceProvider,
  StructServiceProvider
} from 'ketcher-core'

import { ErrorModal } from './ErrorModal'
import { PolymerToggler } from './PolymerToggler'
import { useState } from 'react'

// const getHiddenButtonsConfig = (): ButtonsConfig => {
//   const searchParams = new URLSearchParams(window.location.search)
//   const hiddenButtons = searchParams.get('hiddenControls')
//
//   if (!hiddenButtons) return {}
//
//   return hiddenButtons.split(',').reduce((acc, button) => {
//     if (button) acc[button] = { hidden: true }
//
//     return acc
//   }, {})
// }

// const hiddenButtonsConfig = "reaction-unmap,reaction-arrow-open-angle,reaction-arrow-filled-triangle,reaction-arrow-filled-bow,reaction-arrow-dashed-open-angle,reaction-arrow-failed,reaction-arrow-both-ends-filled-triangle,reaction-arrow-equilibrium-filled-half-bow,reaction-arrow-equilibrium-filled-triangle,reaction-arrow-equilibrium-open-angle,reaction-arrow-unbalanced-equilibrium-filled-half-bow,reaction-arrow-unbalanced-equilibrium-open-half-angle,reaction-arrow-unbalanced-equilibrium-large-filled-half-bow,reaction-arrow-unbalanced-equilibrium-filled-half-triangle,reaction-arrow-elliptical-arc-arrow-filled-bow,reaction-arrow-elliptical-arc-arrow-filled-triangle,reaction-arrow-elliptical-arc-arrow-open-angle,reaction-arrow-elliptical-arc-arrow-open-half-angle,reaction-plus,reaction-map".split(",").reduce((acc, c)=>{
//   acc[c] = { hidden: true };
//   return acc;
// }, {});


const hiddenButtonsConfig = ["arrows", "reaction-plus", "reaction-mapping-tools", "text"]
    .reduce((config, toolName) => {
        config[toolName] = { hidden: true };
        return config;
}, {});

// hiddenButtonsConfig
// {
//     arrows:  { hidden: true },
//     reaction-plus: { hidden: true },
//     reaction-mapping-tools: { hidden: true }
// }


// <Editor
//     ... some props
//     buttons={hiddenButtonsConfig}
// />

let structServiceProvider: StructServiceProvider =
  new RemoteStructServiceProvider(
    process.env.API_PATH || process.env.REACT_APP_API_PATH!
  )
if (process.env.MODE === 'standalone') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { StandaloneStructServiceProvider } = require('ketcher-standalone')
  structServiceProvider =
    new StandaloneStructServiceProvider() as StructServiceProvider
}

const enablePolymerEditor = process.env.ENABLE_POLYMER_EDITOR === 'true'

type PolymerType = () => JSX.Element | null

let PolymerEditor: PolymerType = () => null
if (enablePolymerEditor) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Editor } = require('ketcher-polymer-editor-react')
  PolymerEditor = Editor as PolymerType
}

const App = () => {
 // const hiddenButtonsConfig = getHiddenButtonsConfig()
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
