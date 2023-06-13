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
import { Global, ThemeProvider } from '@emotion/react'
import { createTheme } from '@mui/material/styles'
import { merge } from 'lodash'

import { store } from 'state'
import {
  defaultTheme,
  muiOverrides,
  EditorTheme,
  MergedThemeType
} from 'theming/defaultTheme'
import { getGlobalStyles } from 'theming/globalStyles'
import { Layout } from 'components/Layout'
import { MonomerLibrary } from 'components/monomerLibrary'
import { NotationInput } from 'components/notationInput'
import { Menu } from 'components/menu'
import { selectEditorActiveTool, selectTool } from 'state/common'
import { useAppDispatch, useAppSelector } from 'hooks'
import { Logo } from 'components/Logo'
import { openModal } from 'state/modal'
import {
  modalComponentList,
  ModalContainer
} from 'components/modal/modalContainer'
import { FullscreenButton } from 'components/FullscreenButton'

const muiTheme = createTheme(muiOverrides)

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

interface EditorProps {
  onInit?: () => void
  theme?: DeepPartial<EditorTheme>
}

function Editor({ onInit, theme }: EditorProps) {
  const rootElRef = useRef<HTMLDivElement>(null)

  const editorTheme: EditorTheme = theme
    ? merge(defaultTheme, theme)
    : defaultTheme

  const mergedTheme: MergedThemeType = merge(muiTheme, { ketcher: editorTheme })

  useEffect(() => {
    onInit?.()
  }, [onInit])

  return (
    <Provider store={store}>
      <ThemeProvider theme={mergedTheme}>
        <Global styles={getGlobalStyles} />

        <div ref={rootElRef} className="Ketcher-polymer-editor-root">
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
          <FullscreenButton />

          <ModalContainer />
        </div>
      </ThemeProvider>
    </Provider>
  )
}

function MenuComponent() {
  const dispatch = useAppDispatch()
  const activeTool = useAppSelector(selectEditorActiveTool)

  const menuItemChanged = (name) => {
    if (modalComponentList[name]) {
      dispatch(openModal(name))
    } else {
      dispatch(selectTool(name))
    }
  }

  return (
    <Menu onItemClick={menuItemChanged} activeMenuItem={activeTool}>
      <Menu.Group>
        <Menu.Submenu>
          <Menu.Item itemId="open" />
          <Menu.Item itemId="save" />
        </Menu.Submenu>
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
          <Menu.Item itemId="shape-rectangle" />
          <Menu.Item itemId="shape-ellipse" />
        </Menu.Submenu>
        <Menu.Submenu>
          <Menu.Item itemId="transform-flip-h" />
          <Menu.Item itemId="transform-flip-v" />
        </Menu.Submenu>
      </Menu.Group>
      <Menu.Group>
        <Menu.Item itemId="bond-single" />
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
