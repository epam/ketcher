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
import { editorOptions } from './constants'

import { RenderStruct } from 'ketcher-core'

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

import { Icon } from 'components/shared/icon'
import styled from '@emotion/styled'

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
  const mainElRef = useRef<HTMLDivElement>(null)

  const editorTheme: EditorTheme = theme
    ? merge(defaultTheme, theme)
    : defaultTheme

  const mergedTheme: MergedThemeType = merge(muiTheme, { ketcher: editorTheme })

  useEffect(() => {
    function renderTemplate({ struct }) {
      if (mainElRef.current) {
        mainElRef.current.innerHTML = ''
        struct.rescale()
        RenderStruct.render(mainElRef.current, struct, editorOptions)
      }
    }

    // @ts-ignore
    window.addEventListener('loadTemplate', renderTemplate)

    return () => {
      // @ts-ignore
      window.removeEventListener('loadTemplate', renderTemplate)
    }
  }, [])

  useEffect(() => {
    onInit?.()
  }, [onInit])

  return (
    <Provider store={store}>
      <ThemeProvider theme={mergedTheme}>
        <Global styles={getGlobalStyles} />

        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }} ref={rootElRef} className="Ketcher-polymer-editor-root">
          <div className='header'>
            <nav style={{
              padding: '8px 16px',
              display: 'flex',
              flexDirection: 'row',
              height: '42px',
              boxSizing: 'border-box'
            }}>
              <TopMenuComponent />
            </nav>
          </div>
          <Layout>
            <Layout.Left>
              <MenuComponent />
            </Layout.Left>

            <Layout.Top>
              {/* <NotationInput /> */}
            </Layout.Top>

            <Layout.Main ref={mainElRef}></Layout.Main>

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

const Separator = styled.div`
  height: 24px;
  width: 1px;
  margin: 0 10px;
  border-left: 1px solid #B4B9D6;
`

const IconButton = styled.span`
  margin-right: 5px;
  cursor: pointer;

  &:last-child {
    margin-left: 0;
  }
`

function TopMenuComponent() {
  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'row'
      }}>
        <IconButton><Icon name='open' /></IconButton>
        <IconButton><Icon name='save' /></IconButton>
        <IconButton><Icon name='copy' /></IconButton>
        <IconButton><Icon name='cut' /></IconButton>
        <Separator />
        <IconButton><Icon name='undo' /></IconButton>
        <IconButton><Icon name='redo' /></IconButton>
        <Separator />
        <IconButton><Icon name='layout' /></IconButton>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        marginLeft: 'auto'
      }}>
        <IconButton><Icon name='settings' /></IconButton>
        <IconButton><Icon name='help' /></IconButton>
        <IconButton><Icon name='about' /></IconButton>
        <IconButton><Icon name='fullscreen-enter' /></IconButton>
      </div>
    </>
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
        <Menu.Item itemId="select-rectangle" />
        <Menu.Item itemId="hand" />
        <Menu.Item itemId="erase" />
        <Menu.Item itemId="bond-single" />
      </Menu.Group>
    </Menu>
  )
}

export { Editor }
