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

import { render, screen } from '@testing-library/react'

import { Icon, IconNameType } from './icon'

describe('Icon component', () => {
  it('should render SVG when valid name is provided', () => {
    render(withThemeProvider(<Icon name="arrow-down" />))
    const svg = screen.getByRole('img')

    expect(svg).toMatchSnapshot()
  })

  it('should return null when invalid icon name is provided', () => {
    const invalidIconName = 'no-such -icon' as IconNameType

    render(withThemeProvider(<Icon name={invalidIconName} />))
    const svg = screen.queryByRole('img')

    expect(svg).toMatchSnapshot()
  })

  it('should pass className prop to SVG element', () => {
    const className = 'my-class-name'
    render(
      withThemeProvider(<Icon name="select-lasso" className={className} />)
    )
    const svg = screen.queryByRole('img')

    expect(svg).toHaveAttribute('className', className)
  })
})
