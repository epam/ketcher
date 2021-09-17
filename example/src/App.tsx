import 'miew/dist/Miew.min.css'
import 'ketcher-react/dist/index.css'

import { Ketcher, RemoteStructServiceProvider } from 'ketcher-core'

;

import { Editor } from 'ketcher-react'
// @ts-ignore
import Miew from 'miew'

(global as any).Miew = Miew

let structServiceProvider: any = new RemoteStructServiceProvider(
  process.env.API_PATH || process.env.REACT_APP_API_PATH!
)
if (process.env.MODE === 'standalone') {
  const { StandaloneStructServiceProvider } = require('ketcher-standalone')
  structServiceProvider = new StandaloneStructServiceProvider()
}

const App = () => {
  return (
    <Editor
      errorHandler={(message: string) => alert(message)}
      staticResourcesUrl={process.env.PUBLIC_URL}
      structServiceProvider={structServiceProvider}
      onInit={(ketcher: Ketcher) => {
        ;(global as any).ketcher = ketcher
      }}
    />
  )
}

export default App
