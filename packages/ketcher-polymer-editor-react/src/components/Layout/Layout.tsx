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

import styled from '@emotion/styled'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'hooks'

import { Container } from 'components/shared/ui/Container'
import { MonomerLibrary } from 'components/monomerLibrary'
import { fetchInitData, selectEditorIsReady } from 'state/common'

interface SubcomponentProps {
  children: JSX.Element
}

export const fetchData = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve('some data'), 1000)
  })

const PADDING = '15px'

const LayoutContainer = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  height: '100%',
  width: '100%',
  position: 'relative',
  padding: `${PADDING}`,
  backgroundColor: theme.color.background.canvas
}))

const CenterContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: `calc(100vh - 40px - ${PADDING} * 2)`
})

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

const Logo = styled.div(({ theme }) => ({
  fontFamily: theme.font.family.montserrat,
  fontSize: theme.font.size.medium,
  fontWeight: theme.font.weight.bold,
  color: theme.color.text.secondary,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'absolute',
  bottom: `${PADDING}`,
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

export const Layout = () => {
  const dispatch = useAppDispatch()
  const isReady = useAppSelector(selectEditorIsReady)

  useEffect(() => {
    dispatch(fetchInitData())
  }, [dispatch])

  if (!isReady) {
    return <div>App is not ready</div>
  }

  return (
    <LayoutContainer>
      <Layout.Left>
        <LeftElementExample />
      </Layout.Left>

      <Layout.Left>
        <div>hello</div>
      </Layout.Left>

      <Container margin="0 6px">
        <CenterContainer>
          <Layout.Top>
            <TopElementExample />
          </Layout.Top>

          <Container margin="6px 0">
            <Layout.Main>
              <CenterElementExample />
            </Layout.Main>
          </Container>

          <Layout.Bottom>
            <BottomElementExample />
          </Layout.Bottom>
        </CenterContainer>
      </Container>

      <Layout.Right>
        <MonomerLibrary />
      </Layout.Right>

      <Logo>
        <span>Polymer Editor</span>
        <span>Ketcher</span>
        <span>EPAM</span>
      </Logo>
    </LayoutContainer>
  )
}

const LeftContainer = styled.div({
  width: '32px',
  minWidth: '32px',
  height: `calc(100vh - 40px - ${PADDING} * 2)`
})

const Left = ({ children }: SubcomponentProps) => (
  <LeftContainer data-testid="left-container">{children}</LeftContainer>
)
Layout.Left = Left

const TopContainer = styled.div({
  height: '24px',
  width: '600px',
  alignSelf: 'flex-end',
  marginRight: '10%'
})

const Top = ({ children }: SubcomponentProps) => (
  <TopContainer data-testid="top-container">{children}</TopContainer>
)
Layout.Top = Top

const RightContainer = styled.div({
  width: '253px',
  height: `calc(100vh - ${PADDING} * 2)`
})

const Right = ({ children }: SubcomponentProps) => (
  <RightContainer data-testid="right-container">{children}</RightContainer>
)
Layout.Right = Right

const MainContainer = styled.div({
  height: '100%'
})

const Main = ({ children }: SubcomponentProps) => (
  <MainContainer data-testid="main-container">{children}</MainContainer>
)
Layout.Main = Main

const BottomContainer = styled.div({
  height: '100px'
})

const Bottom = ({ children }: SubcomponentProps) => (
  <BottomContainer data-testid="bottom-container">{children}</BottomContainer>
)
Layout.Bottom = Bottom
