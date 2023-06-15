import { render, screen, fireEvent } from '@testing-library/react'
import { MonomerItem, MonomerItemType } from './MonomerItem'

describe('Test Monomer Item component', () => {
  it('Test click event', () => {
    const monomerItemHandleClick = jest.fn()
    const monomer: MonomerItemType = {
      label: 'for test',
      props: {
        MonomerNaturalAnalogCode: 'L'
      }
    }
    render(
      withThemeAndStoreProvider(
        <MonomerItem key={1} item={monomer} onClick={monomerItemHandleClick} />
      )
    )

    const div = screen.getByTestId(monomer.props.MonomerNaturalAnalogCode)
    fireEvent.click(div)

    expect(monomerItemHandleClick.mock.calls.length).toEqual(1)
  })
})
