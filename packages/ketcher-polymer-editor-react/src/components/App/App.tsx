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
import {
  selectEditorIsReady,
  fetchInitData,
  selectEditorActiveTool,
  selectTool
} from 'state/common'
import { Menu } from 'components/menu'
import { MonomerLibrary } from 'components/monomerLibrary'
import styled from '@emotion/styled'

export const fetchData = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve('some data'), 1000)
  })

export const App = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const isReady = useAppSelector(selectEditorIsReady)
  const activeTool = useAppSelector(selectEditorActiveTool)

  const menuProps = {
    activeItem: activeTool,
    onClick: (tool) => dispatch(selectTool(tool))
  }

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

  return (
    <AppContainer>
      <MonomerLibrary />
      <Menu>
        <Menu.Group>
          <Menu.Item {...menuProps}>select-lasso</Menu.Item>
          <Menu.Item {...menuProps}>help</Menu.Item>
          <Menu.Submenu vertical {...menuProps}>
            <Menu.Item {...menuProps}>open</Menu.Item>
            <Menu.Item {...menuProps}>setting</Menu.Item>
            <Menu.Item {...menuProps}>undo</Menu.Item>
          </Menu.Submenu>
        </Menu.Group>
        <Menu.Group>
          <Menu.Item {...menuProps}>single-bond</Menu.Item>
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
