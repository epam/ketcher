import { render, screen } from '@testing-library/react'

import { ActionButton } from '..'

const mockClickHandler = jest.fn()
const MOCK_LABEL = 'Click Me!'

const mockProps = {
  label: MOCK_LABEL,
  clickHandler: mockClickHandler
}

describe('ActionButton component', () => {
  it('should render button element when props are provided', () => {
    render(<ActionButton {...mockProps} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should render button with specified label', () => {
    render(<ActionButton {...mockProps} />)
    expect(screen.getByRole('button')).toHaveTextContent(MOCK_LABEL)
  })
})
