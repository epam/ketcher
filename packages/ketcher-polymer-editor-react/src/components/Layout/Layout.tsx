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

export const Layout = ({ children }) => {
  const subcomponentList = Object.keys(Layout)
  const subcomponents = subcomponentList.map((key) => {
    return React.Children.map(children, (child) =>
      child.type.name === key ? child : null
    )
  })

  return <div>{subcomponents.map((subcomponent) => subcomponent)}</div>
}

const Left = (props) => {
  const LeftContainer = styled.div(({ theme }) => ({
    position: 'absolute',
    left: theme.padding.leftRight,
    top: theme.padding.topBottom
  }))

  return <LeftContainer>{props.children}</LeftContainer>
}
Layout.Left = Left

const Right = (props) => {
  const RightContainer = styled.div(({ theme }) => ({
    position: 'absolute',
    right: theme.padding.leftRight,
    top: theme.padding.topBottom
  }))

  return <RightContainer>{props.children}</RightContainer>
}
Layout.Right = Right

const Top = (props) => {
  const TopContainer = styled.div(({ theme }) => ({
    position: 'absolute',
    top: theme.padding.topBottom,
    left: '50%',
    transform: 'translateX(-50%)'
  }))

  return <TopContainer>{props.children}</TopContainer>
}
Layout.Top = Top

const Bottom = (props) => {
  const BottomContainer = styled.div(({ theme }) => ({
    position: 'absolute',
    left: theme.padding.leftRight,
    right: `calc(${theme.padding.leftRight} + ${theme.size.monomerLibrary.width} + ${theme.padding.canvas})`,
    bottom: theme.padding.topBottom
  }))

  return <BottomContainer>{props.children}</BottomContainer>
}
Layout.Bottom = Bottom

const Center = (props) => {
  const CenterContainer = styled.div(({ theme }) => ({
    position: 'absolute',
    left: `calc(${theme.padding.leftRight} + ${theme.size.menu.width} + ${theme.padding.canvas})`,
    right: `calc(${theme.padding.leftRight} + ${theme.size.monomerLibrary.width} + ${theme.padding.canvas})`,
    top: `calc(${theme.padding.topBottom} + ${theme.size.addToCanvas.height} + ${theme.padding.canvas})`,
    bottom: `calc(${theme.padding.topBottom} + ${theme.size.properties.height} + ${theme.padding.canvas})`
  }))

  return (
    <CenterContainer>
      {props.children}
      <Bottom />
    </CenterContainer>
  )
}
Layout.Center = Center

const Logo = (props) => {
  const LogoContainer = styled.div(({ theme }) => ({
    position: 'absolute',
    left: theme.padding.leftRight,
    bottom: `calc(${theme.padding.topBottom} + ${theme.size.properties.height} + ${theme.padding.canvas})`
  }))

  return <LogoContainer>{props.children}</LogoContainer>
}
Layout.Logo = Logo
