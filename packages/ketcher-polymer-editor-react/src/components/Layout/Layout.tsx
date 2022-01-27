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

const Left = styled.div({
  width: '32px',
  minWidth: '32px',
  height: `calc(100vh - 40px - ${PADDING} * 2)`
})

const Right = styled.div({
  width: '253px',
  height: `calc(100vh - ${PADDING} * 2)`
})

const Top = styled.div({
  height: '24px',
  width: '670px',
  alignSelf: 'flex-end',
  margin: '0 10% 0 6px'
})

const Bottom = styled.div({
  height: '100px',
  margin: '6px 6px 0 6px'
})

const Main = styled.div({
  height: '100%',
  margin: '6px 6px 0 6px'
})

type LayoutSection = 'Left' | 'Right' | 'Main' | 'Top' | 'Bottom'

export const Layout = ({ children }: LayoutProps) => {
  const subcomponents: Record<LayoutSection, JSX.Element | null> = {
    Left: null,
    Main: null,
    Right: null,
    Top: null,
    Bottom: null
  }
  React.Children.forEach(children, (child) => {
    if (child.type === Left) {
      subcomponents.Left = child
    } else if (child.type === Right) {
      subcomponents.Right = child
    } else if (child.type === Top) {
      subcomponents.Top = child
    } else if (child.type === Bottom) {
      subcomponents.Bottom = child
    } else if (child.type === Main) {
      subcomponents.Main = child
    }
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

Layout.Left = Left
Layout.Top = Top
Layout.Right = Right
Layout.Main = Main
Layout.Bottom = Bottom
