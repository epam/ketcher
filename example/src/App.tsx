import React from 'react'
// @ts-ignore
import Miew from 'miew'
import 'miew/dist/Miew.min.css'
// @ts-ignore
import { Editor } from 'ketcher-react'
// @ts-ignore
import { RemoteStructServiceProvider } from 'ketcher-core'
import 'ketcher-react/dist/index.css'
;(global as any).Miew = Miew

let structServiceProvider: any = new RemoteStructServiceProvider(
  process.env.REACT_APP_API_PATH!
)
if (process.env.MODE === 'standalone') {
  const { StandaloneStructServiceProvider } = require('ketcher-standalone')
  structServiceProvider = new StandaloneStructServiceProvider()
}

const App = () => {
  return (
    <Editor
      staticResourcesUrl={process.env.PUBLIC_URL}
      structServiceProvider={structServiceProvider}
    />
  )
}

export default App
