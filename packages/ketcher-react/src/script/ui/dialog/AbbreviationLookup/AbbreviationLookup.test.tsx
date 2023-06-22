import { fireEvent, render, screen } from '@testing-library/react'

import { AbbreviationLookup } from './AbbreviationLookup'
import {
  ABBREVIATION_LOOKUP_TEST_ID,
  NO_MATCHING_RESULTS_LABEL,
  START_TYPING_NOTIFICATION_LABEL
} from './AbbreviationLookup.constants'
import {
  CLIP_AREA_TEST_ID,
  createOption,
  KetcherWrapper
} from './AbbreviationLookup.test.utils'
import { closeAbbreviationLookup } from '../../state/abbreviationLookup'
import { onAction } from '../../state'
import {
  AbbreviationElementOption,
  AbbreviationTemplateOption,
  AbbreviationType
} from './AbbreviationLookup.types'

const mockedDispatch = jest.fn()
jest.mock('react-redux', () => {
  return {
    useDispatch: () => mockedDispatch,
    useSelector: (fn) => fn()
  }
})

let mockedAbbreviationLookupValue = 'a'
jest.mock('../../state/abbreviationLookup/selectors', () => {
  return {
    selectAbbreviationLookupValue: () => mockedAbbreviationLookupValue
  }
})

jest.mock('../../state/common/selectors', () => {
  return {
    selectCursorPosition: () => ({ x: 100, y: 100 })
  }
})

describe('AbbreviationLookup', () => {
  const optionA = createOption('Argon', 'Ar') as AbbreviationElementOption
  const optionB = createOption('Gold', 'Au') as AbbreviationElementOption
  const optionC = createOption(
    'Methyl Ethyl Ketone',
    'MEK',
    AbbreviationType.Template
  ) as AbbreviationTemplateOption

  it('Should render abbreviation lookup input', () => {
    render(<AbbreviationLookup options={[]} />, { wrapper: KetcherWrapper })
    const field = screen.getByTestId(ABBREVIATION_LOOKUP_TEST_ID)
    expect(field).toBeInTheDocument()
  })

  it('Should render dropdown with items', () => {
    mockedAbbreviationLookupValue = 'a'
    render(<AbbreviationLookup options={[optionA, optionB]} />, {
      wrapper: KetcherWrapper
    })
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(2)
    expect(options[0]).toHaveTextContent('Ar (Argon)')
    expect(options[1]).toHaveTextContent('Au (Gold)')
  })

  it('Should render dropdown with no matching notification', () => {
    mockedAbbreviationLookupValue = 'aaaaa'
    render(<AbbreviationLookup options={[optionA, optionB]} />, {
      wrapper: KetcherWrapper
    })
    const notes = screen.getByText(NO_MATCHING_RESULTS_LABEL)
    expect(notes).toBeInTheDocument()
  })

  it('Should render dropdown with start typing notification', () => {
    mockedAbbreviationLookupValue = ''
    render(<AbbreviationLookup options={[optionA, optionB]} />, {
      wrapper: KetcherWrapper
    })
    const notes = screen.getByText(START_TYPING_NOTIFICATION_LABEL)
    expect(notes).toBeInTheDocument()
  })

  it('Should dispatch close action on blur', () => {
    mockedAbbreviationLookupValue = 'a'
    render(<AbbreviationLookup options={[optionA, optionB]} />, {
      wrapper: KetcherWrapper
    })
    const input = screen.getByRole('combobox')
    fireEvent.blur(input)

    expect(mockedDispatch).toHaveBeenCalledWith(closeAbbreviationLookup())
  })

  it('Should dispatch close on Escape key', () => {
    mockedAbbreviationLookupValue = 'a'
    render(<AbbreviationLookup options={[optionA, optionB]} />, {
      wrapper: KetcherWrapper
    })
    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, {
      keyCode: 27
    })

    expect(mockedDispatch).toHaveBeenCalledWith(closeAbbreviationLookup())
  })

  it('Should focus on cliparea after closing', async () => {
    mockedAbbreviationLookupValue = 'a'
    const { rerender } = render(
      <AbbreviationLookup options={[optionA, optionB]} />,
      {
        wrapper: KetcherWrapper
      }
    )

    rerender(<></>)
    const cliparea = screen.getByTestId(CLIP_AREA_TEST_ID)
    expect(cliparea).toHaveFocus()
  })

  it('Should dispatch atom tool action after option with an element is selected', () => {
    mockedAbbreviationLookupValue = 'a'
    render(<AbbreviationLookup options={[optionA, optionB]} />, {
      wrapper: KetcherWrapper
    })
    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, {
      keyCode: 13
    })

    expect(mockedDispatch).toHaveBeenNthCalledWith(
      1,
      onAction({ tool: 'atom', opts: optionA.element })
    )
    expect(mockedDispatch).toHaveBeenNthCalledWith(2, closeAbbreviationLookup())
  })

  it('Should dispatch template tool action after option with a tempalte is selected', () => {
    mockedAbbreviationLookupValue = 'MEK'
    render(<AbbreviationLookup options={[optionA, optionB, optionC]} />, {
      wrapper: KetcherWrapper
    })
    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, {
      keyCode: 13
    })

    expect(mockedDispatch).toHaveBeenNthCalledWith(
      1,
      onAction({ tool: 'template', opts: optionC.template })
    )
    expect(mockedDispatch).toHaveBeenNthCalledWith(2, closeAbbreviationLookup())
  })
})
