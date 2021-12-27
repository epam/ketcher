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

import { FC, ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@emotion/react'
import { createTheme } from '@mui/material'
import { defaultTheme } from '../styles/variables'

const themeMui = createTheme()

const AllTheProviders: FC = ({ children }) => {
  return (
    <ThemeProvider theme={themeMui}>
      <ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>
    </ThemeProvider>
  )
}

const customRender: any = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// eslint-disable-next-line import/export
export * from '@testing-library/react'

// eslint-disable-next-line import/export
export { customRender as render }
