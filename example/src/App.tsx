import React from 'react'

import Editor from '@ketcher/react'
import '@ketcher/react/dist/index.css'

const App = () => {
  return (
    <div>
      <Editor staticResourcesUrl={process.env.PUBLIC_URL} />
    </div>
  )
}

export default App
