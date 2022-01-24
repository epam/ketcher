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

import React from 'react'
import styled from '@emotion/styled'
import { Container } from 'components/shared/ui/Container'

interface LayoutProps {
  children: JSX.Element | Array<JSX.Element>
}

const LayoutContainer = styled.div({
  display: 'flex',
  justifyContent: 'space-between'
})

const CenterContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: 'calc(100vh - 70px)'
})

export const Layout = ({ children }: LayoutProps) => {
  const subcomponents = {
    Left: null,
    Main: null,
    Right: null,
    Top: null,
    Bottom: null
  }
  const subcomponentList = Object.keys(Layout)
  subcomponentList.forEach((key) => {
    React.Children.forEach(children, (child) => {
      if (child.type.name === key) {
        subcomponents[key] = child
      }
    })
  })

  return (
    <LayoutContainer>
      {subcomponents.Left}
      <Container margin="0 6px">
        <CenterContainer>
          {subcomponents.Top}
          <Container margin={subcomponents.Bottom ? '6px 0' : '6px 0 0 0'}>
            {subcomponents.Main}
          </Container>
          {subcomponents.Bottom}
        </CenterContainer>
      </Container>
      {subcomponents.Right}
    </LayoutContainer>
  )
}

const LeftContainer = styled.div({
  width: '32px',
  minWidth: '32px',
  height: 'calc(100vh - 70px)'
})

const Left = (props) => (
  <LeftContainer data-testid="left-container">{props.children}</LeftContainer>
)
Layout.Left = Left

const TopContainer = styled.div({
  height: '24px',
  width: '600px',
  alignSelf: 'flex-end',
  marginRight: '10%'
})

const Top = (props) => (
  <TopContainer data-testid="top-container">{props.children}</TopContainer>
)
Layout.Top = Top

const RightContainer = styled.div({
  width: '253px',
  height: `calc(100vh - 15px*2)`
})

const Right = (props) => (
  <RightContainer data-testid="right-container">
    {props.children}
  </RightContainer>
)
Layout.Right = Right

const MainContainer = styled.div({
  height: '100%'
})

const Main = (props) => (
  <MainContainer data-testid="main-container">{props.children}</MainContainer>
)
Layout.Main = Main

const BottomContainer = styled.div({
  height: '100px'
})

const Bottom = (props) => (
  <BottomContainer data-testid="bottom-container">
    {props.children}
  </BottomContainer>
)
Layout.Bottom = Bottom
