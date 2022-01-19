import { render } from '@testing-library/react'

import Select from './Select'

const mockProps = {
  schema: {
    title: 'Mock Title',
    enum: ['options1', 'options2', 'options3'],
    default: 'options1'
  },
  onChange: jest.fn()
}

describe('Select component should be rendered correctly', () => {
  it('should be rendered without crashing', () => {
    const { asFragment } = render(<Select {...mockProps} />)
    expect(asFragment).toMatchSnapshot()
  })
})
