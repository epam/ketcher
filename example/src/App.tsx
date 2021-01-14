import React from 'react'
//@ts-ignore
import Miew from 'miew'
import 'miew/dist/Miew.min.css'
//@ts-ignore
import { Editor } from 'ketcher-react'
import 'ketcher-react/dist/index.css'
;(global as any).Miew = Miew

let structServiceFn: any = undefined
if (process.env.MODE === 'standalone') {
  const { StandaloneStructService } = require('ketcher-standalone')
  //@ts-ignore
  structServiceFn = (baseUrl: string, options: any) => {
    return new StandaloneStructService(options)
  }
}

const App = () => {
  return (
    <div>
      <Editor
        staticResourcesUrl={process.env.PUBLIC_URL}
        apiPath={process.env.REACT_APP_API_PATH}
        //@ts-ignore
        structServiceFn={structServiceFn}
      />
    </div>
  )
}

export default App
