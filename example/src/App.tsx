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
    <div
      style={{
        display: 'grid',
        gridTemplateAreas: '"editor1 . editor2" ". . ." "editor3 . ."',
        gridTemplateRows: 'auto 80px auto',
        gridTemplateColumns: '1fr 40px 1fr',
        height: '100%',
        width: '100%'
      }}>
      <div
        style={{
          gridArea: 'editor1'
        }}>
        <Editor
          staticResourcesUrl={process.env.PUBLIC_URL}
          structServiceProvider={structServiceProvider}
        />
      </div>

      <div
        style={{
          gridArea: 'editor2'
        }}>
        <Editor
          staticResourcesUrl={process.env.PUBLIC_URL}
          structServiceProvider={structServiceProvider}
        />
      </div>

      <div
        style={{
          gridArea: 'editor3'
        }}>
        <Editor
          staticResourcesUrl={process.env.PUBLIC_URL}
          structServiceProvider={structServiceProvider}
        />
      </div>
    </div>
  )
}

export default App
