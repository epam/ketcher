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

import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from 'hooks'
import { selectEditorIsReady, fetchInitData, selectTool } from 'state/common'
import { MonomerLibrary } from 'components/monomerLibrary'
import styled from '@emotion/styled'
import { Menu } from 'components/menu'
import { NotationContainer } from 'components/notationInput/notationContainer'

export const fetchData = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve('some data'), 1000)
  })

export const App = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const isReady = useAppSelector(selectEditorIsReady)

  useEffect(() => {
    dispatch(fetchInitData())
  }, [dispatch])

  const AppContainer = styled.div(({ theme }) => ({
    height: '100%',
    width: '100%',
    position: 'relative',
    padding: '14px 11px 0 11px',
    backgroundColor: theme.color.background.canvas
  }))

  const Logo = styled.div(({ theme }) => ({
    fontFamily: theme.font.family.montserrat,
    fontSize: theme.font.size.medium,
    fontWeight: theme.font.weight.bold,
    color: theme.color.text.secondary,
    position: 'absolute',
    bottom: '18px',
    left: '13px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

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

  if (!isReady) {
    return <div>App is not ready</div>
  }

  const menuItemChanged = (name) => {
    dispatch(selectTool(name))
  }

  // @TODO fix app layout when key components are ready
  return (
    <AppContainer>
      <NotationContainer />
      <MonomerLibrary />
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
      <Logo>
        <span>Polymer Editor</span>
        <span>Ketcher</span>
        <span>EPAM</span>
      </Logo>
    </AppContainer>
  )
}
