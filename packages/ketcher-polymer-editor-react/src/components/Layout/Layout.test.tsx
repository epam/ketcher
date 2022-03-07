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

import { Layout } from 'components/Layout'
import { render, screen } from '@testing-library/react'

const TopElementMock = () => {
  return <div>top element</div>
}

const LeftElementMock = () => {
  return <div>left element</div>
}

const MainElementMock = () => {
  return <div>main element</div>
}

const RightElementMock = () => {
  return <div>right element</div>
}

describe('Layout', () => {
  it('should render several subcomponents correctly', () => {
    render(
      withThemeProvider(
        <Layout>
          <Layout.Top>
            <TopElementMock />
          </Layout.Top>
          <Layout.Left>
            <LeftElementMock />
          </Layout.Left>
          <Layout.Main>
            <MainElementMock />
          </Layout.Main>
        </Layout>
      )
    )

    const topElement = screen.getByText('top element')
    const mainElement = screen.getByText('main element')
    const leftElement = screen.getByText('left element')

    expect(topElement).toBeVisible()
    expect(mainElement).toBeVisible()
    expect(leftElement).toBeVisible()
  })

  it('should render all subcomponents correctly', () => {
    render(
      withThemeProvider(
        <Layout>
          <Layout.Top>
            <TopElementMock />
          </Layout.Top>
          <Layout.Left>
            <LeftElementMock />
          </Layout.Left>
          <Layout.Main>
            <MainElementMock />
          </Layout.Main>
          <Layout.Right>
            <RightElementMock />
          </Layout.Right>
        </Layout>
      )
    )

    const topElement = screen.getByText('top element')
    const mainElement = screen.getByText('main element')
    const leftElement = screen.getByText('left element')
    const rightElement = screen.getByText('right element')

    expect(topElement).toBeVisible()
    expect(mainElement).toBeVisible()
    expect(leftElement).toBeVisible()
    expect(rightElement).toBeVisible()
  })
})
