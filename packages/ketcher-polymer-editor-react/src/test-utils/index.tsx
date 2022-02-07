import { createTheme } from '@mui/material/styles'
import {
  render as rtlRender,
  RenderOptions,
  RenderResult
} from '@testing-library/react'
import React, { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@emotion/react'
import { merge } from 'lodash'

import { configureAppStore, RootState } from 'state'
import { defaultTheme } from 'theming/defaultTheme'

const muiTheme = createTheme()

interface CustomRenderOptions {
  preloadedState?: RootState
  renderOptions?: Omit<RenderOptions, 'wrapper'>
}

function render(
  ui: ReactElement,
  { preloadedState = {}, ...renderOptions }: CustomRenderOptions = {}
): RenderResult {
  const Wrapper: React.FC = ({ children }) => {
    const store = configureAppStore(preloadedState)
    return (
      <ThemeProvider theme={merge(muiTheme, { ketcher: defaultTheme })}>
        <Provider store={store}>{children}</Provider>
      </ThemeProvider>
    )
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

// eslint-disable-next-line import/export
export * from '@testing-library/react'

// eslint-disable-next-line import/export
export { render }
