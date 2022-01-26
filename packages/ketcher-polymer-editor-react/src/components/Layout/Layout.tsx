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
import React from 'react'
import { css } from '@emotion/react'

interface SubcomponentProps {
  children: JSX.Element
  margin?: string
}

interface LayoutProps {
  children: JSX.Element | Array<JSX.Element>
}

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
      <CenterContainer>
        {subcomponents.Top}
        {subcomponents.Main}
        {subcomponents.Bottom}
      </CenterContainer>
      {subcomponents.Right}
    </LayoutContainer>
  )
}

const styleLeft = css({
  width: '32px',
  minWidth: '32px',
  height: `calc(100vh - 40px - ${PADDING} * 2)`
})

const Left = ({ children, margin }: SubcomponentProps) => {
  return (
    <div
      data-testid="left-container"
      css={styleLeft}
      style={{ margin: margin }}
    >
      {children}
    </div>
  )
}
Layout.Left = Left

const styleTop = css({
  height: '24px',
  width: '670px',
  alignSelf: 'flex-end',
  margin: '0 10% 0 6px'
})

const Top = ({ children, margin }: SubcomponentProps) => (
  <div data-testid="top-container" css={styleTop} style={{ margin: margin }}>
    {children}
  </div>
)
Layout.Top = Top

const styleRight = css({
  width: '253px',
  height: `calc(100vh - ${PADDING} * 2)`
})

const Right = ({ children, margin }: SubcomponentProps) => (
  <div
    data-testid="right-container"
    css={styleRight}
    style={{ margin: margin }}
  >
    {children}
  </div>
)
Layout.Right = Right

const styleMain = css({
  height: '100%',
  margin: '6px 6px 0 6px'
})

const Main = ({ children, margin }: SubcomponentProps) => (
  <div data-testid="main-container" css={styleMain} style={{ margin: margin }}>
    {children}
  </div>
)
Layout.Main = Main

const styleBottom = css({
  height: '100px',
  margin: '6px 6px 0 6px'
})

const Bottom = ({ children, margin }: SubcomponentProps) => (
  <div
    data-testid="bottom-container"
    css={styleBottom}
    style={{ margin: margin }}
  >
    {children}
  </div>
)
Layout.Bottom = Bottom
