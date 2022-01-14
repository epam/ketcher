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
import { render, screen } from '@testing-library/react'

import { Icon } from '..'

const StyledIcon = styled(Icon)`
  stroke: green;
`

const MockComponent = () => <StyledIcon name="arrowDown" role="img" />

describe('Icon component', () => {
  it('should render SVG when name is provided', () => {
    render(<MockComponent />)
    const svg = screen.getByRole('img')

    expect(svg).toBeInTheDocument()
  })

  it('should allow styling with emotion/styled', () => {
    render(<MockComponent />)
    const svg = screen.getByRole('img')

    // Making sure some className was set by Emotion/styled
    expect(svg).toHaveAttribute('className')
  })
})
