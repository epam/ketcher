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
import styled from '@emotion/styled'
import { useAppDispatch, useAppSelector } from 'hooks'

import { selectEditorIsReady, fetchInitData } from 'state/common'
import { MonomerLibrary } from 'components/monomerLibrary'
import { Layout } from 'components/Layout'

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
    padding: `${theme.padding.topBottom} ${theme.padding.leftRight}`,
    backgroundColor: theme.color.background.canvas
  }))

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

  if (!isReady) {
    return <div>App is not ready</div>
  }

  return (
    <>
      <AppContainer>
        <Layout>
          <Layout.Top>
            <TopElementExample />
          </Layout.Top>

          <Layout.Right>
            <MonomerLibrary />
          </Layout.Right>

          <Layout.Left>
            <LeftElementExample />
          </Layout.Left>

          <Layout.Main>
            <CenterElementExample />
          </Layout.Main>

          <Layout.Bottom>
            <BottomElementExample />
          </Layout.Bottom>
        </Layout>

        <Logo>
          <span>Polymer Editor</span>
          <span>Ketcher</span>
          <span>EPAM</span>
        </Logo>
      </AppContainer>
    </>
  )
}
