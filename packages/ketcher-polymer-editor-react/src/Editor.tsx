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

import { store } from 'state'
import { defaultTheme } from 'styles/theme'
import globalStyles from './styles/globalStyles'
import { Layout } from 'components/Layout'
import { MonomerLibrary } from 'components/monomerLibrary'
import { NotationInput } from 'components/notationInput'
import { Menu } from 'components/menu'
import { selectTool } from 'state/common'
import { useAppDispatch } from 'hooks'
import { Logo } from 'components/Logo'

const theme = createTheme(defaultTheme)

interface EditorProps {
  onInit?: () => void
}

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
              <MenuComponent />
            </Layout.Left>

            <Layout.Top>
              <NotationInput />
            </Layout.Top>

            <Layout.Main></Layout.Main>

            <Layout.Right>
              <MonomerLibrary />
            </Layout.Right>
          </Layout>

          <Logo />
        </div>
      </ThemeProvider>
    </Provider>
  )
}

function MenuComponent() {
  const dispatch = useAppDispatch()

  const menuItemChanged = (name) => {
    dispatch(selectTool(name))
  }

  return (
    <Menu onItemClick={menuItemChanged}>
      <Menu.Group>
        <Menu.Item itemId="open" />
      </Menu.Group>
      <Menu.Group>
        <Menu.Item itemId="undo" />
      </Menu.Group>
      <Menu.Group>
        <Menu.Item itemId="erase" />
        <Menu.Submenu vertical>
          <Menu.Item itemId="select-lasso" />
          <Menu.Item itemId="select-rectangle" />
          <Menu.Item itemId="select-fragment" />
        </Menu.Submenu>
        <Menu.Submenu>
          <Menu.Item itemId="rectangle" />
          <Menu.Item itemId="ellipse" />
        </Menu.Submenu>
        <Menu.Submenu>
          <Menu.Item itemId="rotate" />
          <Menu.Item itemId="horizontal-flip" />
          <Menu.Item itemId="vertical-flip" />
        </Menu.Submenu>
      </Menu.Group>
      <Menu.Group>
        <Menu.Item itemId="single-bond" />
      </Menu.Group>
      <Menu.Group divider>
        <Menu.Item itemId="bracket" />
      </Menu.Group>
      <Menu.Group>
        <Menu.Item itemId="settings" />
        <Menu.Item itemId="help" />
      </Menu.Group>
    </Menu>
  )
}

export { Editor }
