/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { Provider } from 'react-redux'
import { useEffect, useRef } from 'react'
import { Global } from '@emotion/react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import styled from '@emotion/styled'

import { store } from 'state'
import { defaultTheme } from 'styles/theme'
import globalStyles from './styles/globalStyles'
import { Layout } from 'components/Layout'

const theme = createTheme(defaultTheme)

interface EditorProps {
  onInit?: () => void
}

const RootContainer = styled.div({
  height: '100%',
  width: '100%',
  position: 'relative',
  minWidth: 1024,
  minHeight: 768
})

function Editor(props: EditorProps) {
  const rootElRef = useRef<HTMLDivElement>(null)
  const { onInit } = props

  useEffect(() => {
    onInit?.()
  }, [onInit])

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <RootContainer ref={rootElRef} className="Ketcher-polymer-editor-root">
          <Global styles={globalStyles} />
          <Layout />
        </RootContainer>
      </ThemeProvider>
    </Provider>
  )
}

export { Editor }
