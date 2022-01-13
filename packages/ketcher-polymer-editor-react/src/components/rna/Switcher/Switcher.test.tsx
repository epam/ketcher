import { fireEvent, screen } from '@testing-library/react'
import { render } from 'test-utils'
import { Switcher } from './Switcher'

describe('Test RNA Switcher component', () => {
  const rnaHandleClick = jest.fn()

  it('Test buttons are in the DOM', () => {
    render(<Switcher />)
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
    render(<Switcher />)
    const buttonR = screen.getByText('R')
    buttonR.onclick = rnaHandleClick
    fireEvent.click(buttonR)
    expect(rnaHandleClick.mock.calls.length).toEqual(1)
  })
  it('renders correctly with RAP button selected by default', () => {
    const view = render(<Switcher />)
    expect(view).toMatchSnapshot()
  })
  it('renders correctly with R button selected', () => {
    const view = render(<Switcher />)
    const buttonR = screen.getByText('R')
    fireEvent.click(buttonR)
    expect(view).toMatchSnapshot()
  })
  it('renders correctly with A button selected', () => {
    const view = render(<Switcher />)
    const buttonA = screen.getByText('A')
    fireEvent.click(buttonA)
    expect(view).toMatchSnapshot()
  })
  it('renders correctly with P button selected', () => {
    const view = render(<Switcher />)
    const buttonP = screen.getByText('P')
    fireEvent.click(buttonP)
    expect(view).toMatchSnapshot()
  })
})
