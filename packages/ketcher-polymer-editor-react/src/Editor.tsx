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
import { MonomerLibrary } from 'components/monomerLibrary'

const theme = createTheme(defaultTheme)

interface EditorProps {
  onInit?: () => void
}

const Logo = styled.div(({ theme }) => ({
  fontFamily: theme.font.family.montserrat,
  fontSize: theme.font.size.medium,
  fontWeight: theme.font.weight.bold,
  color: theme.color.text.secondary,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'absolute',
  bottom: '15px',
  left: '13px',

  '> span:first-of-type, > span:last-of-type': {
    fontWeight: theme.font.weight.light,
    fontSize: theme.font.size.xsmall,
    textTransform: 'uppercase'
  },

  '> span:last-of-type': {
    fontWeight: theme.font.weight.regular
  },

  '> span:nth-of-type(2)': {
    color: theme.color.text.primary,

    '&:first-letter': {
      color: theme.color.text.secondary
    }
  }
}))

const TopElementExample = styled.div(({ theme }) => ({
  height: '100%',
  width: '100%',
  backgroundColor: theme.color.button.primary.clicked
}))

const LeftElementExample = styled.div(({ theme }) => ({
  height: '100%',
  width: '100%',
  backgroundColor: theme.color.button.primary.clicked
}))

const CenterElementExample = styled.div(({ theme }) => ({
  border: `1px dashed ${theme.color.input.border.regular}`,
  width: '100%',
  height: '100%'
}))

const BottomElementExample = styled.div(({ theme }) => ({
  height: '100%',
  width: '100%',
  backgroundColor: theme.color.button.primary.clicked
}))

function Editor(props: EditorProps) {
  const rootElRef = useRef<HTMLDivElement>(null)
  const { onInit } = props

  useEffect(() => {
    onInit?.()
  }, [onInit])

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <div ref={rootElRef} className="Ketcher-polymer-editor-root">
          <Global styles={globalStyles} />

          <Layout>
            <Layout.Left>
              <LeftElementExample />
            </Layout.Left>

            <Layout.Top>
              <TopElementExample />
            </Layout.Top>

            <Layout.Main>
              <CenterElementExample />
            </Layout.Main>

            <Layout.Bottom>
              <BottomElementExample />
            </Layout.Bottom>

            <Layout.Right>
              <MonomerLibrary />
            </Layout.Right>
          </Layout>

          <Logo>
            <span>Polymer Editor</span>
            <span>Ketcher</span>
            <span>EPAM</span>
          </Logo>
        </div>
      </ThemeProvider>
    </Provider>
  )
}

export { Editor }
