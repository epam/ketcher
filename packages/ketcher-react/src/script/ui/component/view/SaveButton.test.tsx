import { render, screen } from '@testing-library/react'
import { SaveButton } from './savebutton'

jest.mock('../../../../hooks', () => {
  return {
    ...jest.requireActual('../../../../hooks'),
    useAppContext: () => ({
      getKetcherInstance: () => null
    })
  }
})

jest.mock('ketcher-core')

describe('SaveButton', () => {
  const defaultProps = {
    filename: 'test.mol',
    data: ''
  }

  describe('Disabled state', () => {
    it('Should be enabled by default', () => {
      render(<SaveButton {...defaultProps}>Save</SaveButton>)
      const btn = screen.getByRole('button')
      expect(btn).toBeEnabled()
    })

    it('Should be disabled', () => {
      render(
        <SaveButton {...defaultProps} disabled>
          Save
        </SaveButton>
      )
      const btn = screen.getByRole('button')
      expect(btn).toBeDisabled()
    })
  })
})
