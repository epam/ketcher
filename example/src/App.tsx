import React from 'react'

import { Editor } from '@ketcher/react'
import '@ketcher/react/dist/index.css'

const App = () => {
  return (
    <div>
      <Editor staticResourcesUrl={process.env.PUBLIC_URL} apiPath={process.env.REACT_APP_API_PATH} />
    </div>
  )
}

export default App
