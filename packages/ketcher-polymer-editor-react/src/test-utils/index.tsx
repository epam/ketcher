import { createTheme, ThemeProvider } from '@mui/material/styles'
import { defaultTheme } from 'styles/theme'
import React, { ReactElement } from 'react'
import { configureAppStore, RootState } from 'state'
import {
  render as rtlRender,
  RenderOptions,
  RenderResult
} from '@testing-library/react'
import { Provider } from 'react-redux'

const theme = createTheme(defaultTheme)

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
      <ThemeProvider theme={theme}>
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
