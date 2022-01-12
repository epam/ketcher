import { render, fireEvent, screen } from '@testing-library/react'
import { Switcher } from './Switcher'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { defaultTheme } from 'styles/theme'

const theme = createTheme(defaultTheme)
const rnaHandleClick = jest.fn()
const setup = () =>
  render(
    <ThemeProvider theme={theme}>
      <Switcher />
    </ThemeProvider>
  )

describe('Test RNA Switcher component', () => {
  it('Test buttons are in the DOM', () => {
    setup()
    const buttonR = screen.getByText('R')
    const buttonA = screen.getByText('A')
    const buttonP = screen.getByText('P')
    const buttonRAP = screen.getByText('R(A)P')

    expect(buttonR).toBeInTheDocument()
    expect(buttonA).toBeInTheDocument()
    expect(buttonP).toBeInTheDocument()
    expect(buttonRAP).toBeInTheDocument()
  })
  it('Test click event on a button', () => {
    setup()
    const buttonR = screen.getByText('R')
    buttonR.onclick = rnaHandleClick
    fireEvent.click(buttonR)
    expect(rnaHandleClick.mock.calls.length).toEqual(1)
  })
  it('renders correctly with RAP button selected by default', () => {
    const view = setup()
    expect(view).toMatchSnapshot()
  })
  it('renders correctly with R button selected', () => {
    const view = setup()
    const buttonR = screen.getByText('R')
    fireEvent.click(buttonR)
    expect(view).toMatchSnapshot()
  })
  it('renders correctly with A button selected', () => {
    const view = setup()
    const buttonA = screen.getByText('A')
    fireEvent.click(buttonA)
    expect(view).toMatchSnapshot()
  })
  it('renders correctly with P button selected', () => {
    const view = setup()
    const buttonP = screen.getByText('P')
    fireEvent.click(buttonP)
    expect(view).toMatchSnapshot()
  })
})
