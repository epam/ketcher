import { render, fireEvent, screen } from '@testing-library/react'
// import { Switcher } from './Switcher'

describe('Test RNA Switcher component', () => {
  const rnaHandleClick = jest.fn()
  render(<button onClick={rnaHandleClick}>test</button>)

  it('Test click event', () => {
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(rnaHandleClick.mock.calls.length).toEqual(1)
  })
})
