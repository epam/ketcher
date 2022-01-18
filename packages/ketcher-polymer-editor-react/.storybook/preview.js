import { defaultTheme } from '../src/styles/theme'
import { createTheme, ThemeProvider } from '@mui/material/styles'

const theme = createTheme(defaultTheme)

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  }
}
export const decorators = [
  (Story) => (
    <ThemeProvider theme={theme}>
      <Story />
    </ThemeProvider>
  )
]
