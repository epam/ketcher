import React from 'react'
//@ts-ignore
import Miew from 'miew'
import 'miew/dist/Miew.min.css'
//@ts-ignore
import { Editor } from 'ketcher-react'
import 'ketcher-react/dist/index.css'
;(global as any).Miew = Miew

const App = () => {
  // let m = service.loadMolecule('C1=CC=CC=C1')
  // console.log('Aromatizing...')
  // m.aromatize()
  // console.log(m.smiles())
  return (
    <div>
      <Editor
        staticResourcesUrl={process.env.PUBLIC_URL}
        apiPath={process.env.REACT_APP_API_PATH}
      />
    </div>
  )
}

export default App
