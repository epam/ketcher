import { fireEvent, screen } from '@testing-library/react'
import { render } from 'test-utils'
import { Switcher } from './'

describe('RNA Switcher component', () => {
  const mockSetActiveMonomerType = jest.fn()
  const buttons = ['R(A)P', 'R', 'A', 'P']

  it('should call click event handler on each button when clicked', () => {
    render(
      <Switcher
        selectedMonomers={['R', 'A', 'P']}
        setActiveMonomerType={mockSetActiveMonomerType}
      />
    )
    buttons.forEach((button, index) => {
      const buttonR = screen.getByText(button)
      fireEvent.click(buttonR)
      expect(mockSetActiveMonomerType.mock.calls.length).toEqual(index + 1)
    })
  })

  it('should render correctly with each button selected', () => {
    const view = render(
      <Switcher
        selectedMonomers={['R', 'A', 'P']}
        setActiveMonomerType={mockSetActiveMonomerType}
      />
    )
    buttons.forEach((button) => {
      const buttonR = screen.getByText(button)
      fireEvent.click(buttonR)
      expect(view).toMatchSnapshot()
    })
  })
})
