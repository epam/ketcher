import { fireEvent, screen } from '@testing-library/react'
import { render } from 'test-utils'
import { Switcher } from './'

describe('RNA Switcher component', () => {
  const rnaHandleClick = jest.fn()

  it('should call click event handler on a button when clicked', () => {
    render(
      <Switcher
        selectedMonomers={['R', 'A', 'P']}
        active={0}
        handleSetActive={rnaHandleClick}
      />
    )
    const buttonR = screen.getByText('R')
    fireEvent.click(buttonR)
    expect(rnaHandleClick.mock.calls.length).toEqual(1)
  })

  it('should render correctly with RAP button selected by default', () => {
    const view = render(
      <Switcher
        selectedMonomers={['R', 'A', 'P']}
        active={0}
        handleSetActive={rnaHandleClick}
      />
    )
    expect(view).toMatchSnapshot()
  })

  it('should render correctly with R button selected', () => {
    const view = render(
      <Switcher
        selectedMonomers={['R', 'A', 'P']}
        active={1}
        handleSetActive={rnaHandleClick}
      />
    )
    expect(view).toMatchSnapshot()
  })

  it('should render correctly with A button selected', () => {
    const view = render(
      <Switcher
        selectedMonomers={['R', 'A', 'P']}
        active={2}
        handleSetActive={rnaHandleClick}
      />
    )
    expect(view).toMatchSnapshot()
  })

  it('should render correctly with P button selected', () => {
    const view = render(
      <Switcher
        selectedMonomers={['R', 'A', 'P']}
        active={3}
        handleSetActive={rnaHandleClick}
      />
    )
    expect(view).toMatchSnapshot()
  })
})
