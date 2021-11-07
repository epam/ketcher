import 'miew/dist/Miew.min.css'
import 'ketcher-react/dist/index.css'

import { Ketcher, RemoteStructServiceProvider } from 'ketcher-core'

import { Editor, ButtonsConfig } from 'ketcher-react'
// @ts-ignore
import Miew from 'miew'

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

const App = () => {
  const hiddenButtonsConfig = getHiddenButtonsConfig()

  return (
    <Editor
      errorHandler={(message: string) => alert(message)}
      staticResourcesUrl={process.env.PUBLIC_URL}
      buttons={hiddenButtonsConfig}
      structServiceProvider={structServiceProvider}
      onInit={(ketcher: Ketcher) => {
        ;(global as any).ketcher = ketcher
      }}
    />
  )
}

export default App
