import { render, screen } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'

import { ActionButton } from '..'

const mockClickHandler = jest.fn()
const MOCK_LABEL = 'Click Me!'

const mockProps = {
  label: MOCK_LABEL,
  clickHandler: mockClickHandler
}

describe('ActionButton component', () => {
  render(<ActionButton {...mockProps} />)

  it('should render button element when label is specified', () => {
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
