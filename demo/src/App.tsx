import styled from '@emotion/styled'
import { ThemeProvider, createTheme } from '@mui/material'
import { useCallback, useState } from 'react'
import { ButtonsConfig, Editor } from 'ketcher-react'
import { Ketcher } from 'ketcher-core'
import { StandaloneStructServiceProvider } from 'ketcher-standalone'
import 'ketcher-react/dist/index.css'

import './App.css'
import { Panel } from './components/Panel'
import { OutputArea } from './components/OutputArea'
import { initiallyHidden } from './constants/buttons'
import { defaultTheme } from './constants/defaultTheme'

const GridWrapper = styled('div')`
  height: 100vh;
  width: 100vw;
  max-height: 100vh;
  max-width: 100vw;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 270px 320px;
  grid-template-rows: 1fr;
  gap: 0px 0px;
  grid-template-areas: 'Ketcher Panel Output';
  & > div {
    border: 1px solid grey;
  }
`

const KetcherBox = styled('div')`
  grid-area: Ketcher;
  height: 100vh;
`

const OutputBox = styled('div')`
  grid-area: Output;
`

const PanelBox = styled('div')`
  grid-area: Panel;
  overflow: auto;
  padding-right: 8px;
  padding-left: 8px;
`

const theme = createTheme(defaultTheme)

const getHiddenButtonsConfig = (btnArr: string[]): ButtonsConfig => {
  return btnArr.reduce((acc, button) => {
    if (button) acc[button] = { hidden: true }

    return acc
  }, {})
}

const structServiceProvider = new StandaloneStructServiceProvider()

const getUniqueKey = (() => {
  let count = 0
  return () => {
    count += 1
    return `editor-key-${count}`
  }
})()

const App = () => {
  const [outputValue, setOutputValue] = useState('')
  const [hiddenButtons, setHiddenButtons] = useState(initiallyHidden)
  const [editorKey, setEditorKey] = useState('first-editor-key')

  const updateHiddenButtons = useCallback(
    (buttonsToHide: string[]) => {
      setHiddenButtons(buttonsToHide)
      setEditorKey(getUniqueKey())
    },
    [setHiddenButtons, setEditorKey]
  )

  return (
    <ThemeProvider theme={theme}>
      <GridWrapper>
        <KetcherBox>
          <Editor
            key={editorKey}
            staticResourcesUrl={process.env.PUBLIC_URL}
            buttons={getHiddenButtonsConfig(hiddenButtons)}
            structServiceProvider={structServiceProvider}
            errorHandler={(err) => console.log(err)}
            onInit={(ketcher: Ketcher) => {
              ;(global as any).ketcher = ketcher
              ;(global as any).KetcherFunctions = KetcherAPI(global.ketcher)
            }}
          />
        </KetcherBox>
        <PanelBox>
          <Panel
            printToTerminal={setOutputValue}
            hiddenButtons={hiddenButtons}
            buttonsHideHandler={updateHiddenButtons}
          />
        </PanelBox>
        <OutputBox>
          <OutputArea
            outputValue={outputValue}
            setOutputValue={setOutputValue}
          />
        </OutputBox>
      </GridWrapper>
    </ThemeProvider>
  )
}

export default App
