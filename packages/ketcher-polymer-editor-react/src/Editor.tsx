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
  OPEN = 'open',
  SAVE = 'save',
  UNDO = 'undo',
  ERASE = 'erase',
  SELECT_LASSO = 'select-lasso',
  SELECT_RECTANGLE = 'select-rectangle',
  SELECT_FRAGMENT = 'select-fragment',
  RECTANGLE = 'rectangle',
  ELLIPSE = 'ellipse',
  ROTATE = 'rotate',
  HORIZONTAL_FLIP = 'horizontal-flip',
  VERTICAL_FLIP = 'vertical-flip',
  SINGLE_BOND = 'single-bond',
  BRACKET = 'bracket',
  SETTINGS = 'settings',
  HELP = 'help',
  FULLSCREEN = 'fullscreen'
}

const defaultButtons = [
  ButtonsOptions.OPEN,
  ButtonsOptions.SAVE,
  ButtonsOptions.UNDO,
  ButtonsOptions.ERASE,
  ButtonsOptions.SELECT_LASSO,
  ButtonsOptions.SELECT_RECTANGLE,
  ButtonsOptions.SELECT_FRAGMENT,
  ButtonsOptions.RECTANGLE,
  ButtonsOptions.ELLIPSE,
  ButtonsOptions.ROTATE,
  ButtonsOptions.HORIZONTAL_FLIP,
  ButtonsOptions.VERTICAL_FLIP,
  ButtonsOptions.SINGLE_BOND,
  ButtonsOptions.BRACKET,
  ButtonsOptions.SETTINGS,
  ButtonsOptions.HELP,
  ButtonsOptions.FULLSCREEN
]

interface EditorProps {
  onInit?: () => void
  theme?: DeepPartial<EditorTheme>
  buttons?: ButtonsOptions[]
}

const getButton = (
  buttonName: ButtonsOptions,
  userButtons: ButtonsOptions[]
) => {
  return userButtons.includes(buttonName) && <Menu.Item itemId={buttonName} />
}

const getSubMenu = (
  defaultGroupButtons: ButtonsOptions[],
  userButtons: ButtonsOptions[],
  isVertical = false
) => {
  if (!userButtons.length) return
  const buttons = defaultGroupButtons
    .filter((button) => userButtons.includes(button))
    .map((button, id) => <Menu.Item itemId={button} key={id} />)
  if (!buttons.length) return
  if (buttons.length === 1) return buttons
  return <Menu.Submenu vertical={isVertical}>{buttons}</Menu.Submenu>
}

function Editor({ onInit, theme, buttons = defaultButtons }: EditorProps) {
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
              <MenuComponent buttons={...buttons} />
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
          {buttons.includes(ButtonsOptions.FULLSCREEN) && <FullscreenButton />}

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
        {getSubMenu([ButtonsOptions.OPEN, ButtonsOptions.SAVE], buttons)}
      </Menu.Group>
      <Menu.Group>{getSubMenu([ButtonsOptions.UNDO], buttons)}</Menu.Group>
      <Menu.Group>
        {getButton(ButtonsOptions.ERASE, buttons)}
        {getSubMenu(
          [
            ButtonsOptions.SELECT_LASSO,
            ButtonsOptions.SELECT_RECTANGLE,
            ButtonsOptions.SELECT_FRAGMENT
          ],
          buttons,
          true
        )}
        {getSubMenu(
          [ButtonsOptions.RECTANGLE, ButtonsOptions.ELLIPSE],
          buttons
        )}
        {getSubMenu(
          [
            ButtonsOptions.ROTATE,
            ButtonsOptions.HORIZONTAL_FLIP,
            ButtonsOptions.VERTICAL_FLIP
          ],
          buttons
        )}
      </Menu.Group>
      <Menu.Group>{getButton(ButtonsOptions.SINGLE_BOND, buttons)}</Menu.Group>
      <Menu.Group divider>
        {getButton(ButtonsOptions.BRACKET, buttons)}
      </Menu.Group>
      <Menu.Group>
        {getButton(ButtonsOptions.SETTINGS, buttons)}
        {getButton(ButtonsOptions.HELP, buttons)}
      </Menu.Group>
    </Menu>
  )
}

export { Editor, ButtonsOptions }
