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

enum ButtonsOptions {
  Open = 'open',
  Save = 'save',
  Undo = 'undo',
  Erase = 'erase',
  SelectLasso = 'select-lasso',
  SelectRectangle = 'select-rectangle',
  SelectFragment = 'select-fragment',
  Rectangle = 'rectangle',
  Ellipse = 'ellipse',
  Rotate = 'rotate',
  HorizontalFlip = 'horizontal-flip',
  VerticalFlip = 'vertical-flip',
  SingleBond = 'single-bond',
  Bracket = 'bracket',
  Settings = 'settings',
  Help = 'help',
  Fullscreen = 'fullscreen'
}

type ButtonsConfig = {
  [key in ButtonsOptions]?: {
    hidden?: boolean
  }
}

interface EditorProps {
  onInit?: () => void
  theme?: DeepPartial<EditorTheme>
  buttons?: ButtonsConfig
}

const renderMenuItem = (
  buttonName: ButtonsOptions,
  buttonsConfig: ButtonsConfig
) => !buttonsConfig[buttonName]?.hidden && <Menu.Item itemId={buttonName} />

const renderSubmenu = (
  defaultSubmenuItems: ButtonsOptions[],
  buttonsConfig: ButtonsConfig,
  isVertical = false
) => {
  const menuItemsToRender = defaultSubmenuItems
    .filter((buttonName) => !buttonsConfig[buttonName]?.hidden)
    .map((buttonName, id) => <Menu.Item itemId={buttonName} key={id} />)
  if (!menuItemsToRender.length) return
  if (menuItemsToRender.length === 1) return menuItemsToRender
  return <Menu.Submenu vertical={isVertical}>{menuItemsToRender}</Menu.Submenu>
}

function Editor({ onInit, theme, buttons = {} }: EditorProps) {
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
              <MenuComponent buttons={buttons} />
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
          {!buttons[ButtonsOptions.Fullscreen]?.hidden && <FullscreenButton />}

          <ModalContainer />
        </div>
      </ThemeProvider>
    </Provider>
  )
}

function MenuComponent({ buttons }) {
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
        {renderSubmenu([ButtonsOptions.Open, ButtonsOptions.Save], buttons)}
      </Menu.Group>
      <Menu.Group>{renderSubmenu([ButtonsOptions.Undo], buttons)}</Menu.Group>
      <Menu.Group>
        {renderMenuItem(ButtonsOptions.Erase, buttons)}
        {renderSubmenu(
          [
            ButtonsOptions.SelectLasso,
            ButtonsOptions.SelectRectangle,
            ButtonsOptions.SelectFragment
          ],
          buttons,
          true
        )}
        {renderSubmenu(
          [ButtonsOptions.Rectangle, ButtonsOptions.Ellipse],
          buttons
        )}
        {renderSubmenu(
          [
            ButtonsOptions.Rotate,
            ButtonsOptions.HorizontalFlip,
            ButtonsOptions.VerticalFlip
          ],
          buttons
        )}
      </Menu.Group>
      <Menu.Group>
        {renderMenuItem(ButtonsOptions.SingleBond, buttons)}
      </Menu.Group>
      <Menu.Group divider>
        {renderMenuItem(ButtonsOptions.Bracket, buttons)}
      </Menu.Group>
      <Menu.Group>
        {renderMenuItem(ButtonsOptions.Settings, buttons)}
        {renderMenuItem(ButtonsOptions.Help, buttons)}
      </Menu.Group>
    </Menu>
  )
}

export { Editor, ButtonsOptions }
