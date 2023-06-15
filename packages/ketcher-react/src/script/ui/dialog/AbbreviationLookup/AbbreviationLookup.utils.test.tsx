/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  filterOptions,
  getOptionLabel,
  getSimilarity,
  highlightOptionLabel
} from './AbbreviationLookup.utils'
import { AbbreviationOption } from './AbbreviationLookup.types'
import { FilterOptionsState } from '@mui/base/AutocompleteUnstyled/useAutocomplete'
import {
  createGenericOption,
  createOption
} from './AbbreviationLookup.test.utils'

describe('AbbreviationLookup Utils', () => {
  describe('highlightOptionLabel', () => {
    const option = createGenericOption('Very long test name', 'SHORTABBR')

    it('Should return the label if there is not match with lookup value', () => {
      expect(highlightOptionLabel(option, 'no-match-string')).toBe(option.label)
    })

    it('Should return marked name', () => {
      expect(highlightOptionLabel(option, 'long')).toMatchSnapshot()
    })

    it('Should return marked abbreviation', () => {
      expect(highlightOptionLabel(option, 'abbr')).toMatchSnapshot()
    })

    it('Should mark abbreviation because it shorter (bigger similarity)', () => {
      const newOption = createGenericOption('ShortNameForTemplate', 'SHORTABBR')
      expect(highlightOptionLabel(newOption, 'short')).toMatchSnapshot()
    })

    it('Should mark name because substring at the beginning', () => {
      const newOption = createGenericOption(
        'ShortNameForTemplate',
        'ASHORTABBR'
      )
      expect(highlightOptionLabel(newOption, 'short')).toMatchSnapshot()
    })
  })

  describe('getOptionLabel', () => {
    it('Should return the label field value from an option', () => {
      const option = createGenericOption('testName')
      expect(getOptionLabel(option)).toBe(option.label)
    })
  })

  describe('getSimilarity', () => {
    const testData: [string, string | undefined, string, number][] = [
      ['name', 'abbreviation', 'test', 0],
      ['name', undefined, 'test', 0],
      ['testName', 'testAbbreviation', 'testname', 1],
      ['testName', undefined, 'testname', 1],
      ['testName', 'testAbbreviation', 'testabbreviation', 1],
      ['testName', 'testAbbreviation', 'testa', 0.3125],
      ['testName', 'testAbbreviation', 'testn', 0.625],
      ['testAb', 'testAbbreviation', 'testa', 0.8333333333333334],
      ['testAb', 'testAbbreviation', '', 0]
    ]

    it.each(testData)(
      'Should calculate similarity based on name (%s) and abbreviation (%s) by lookup value (%s) to similarity %i',
      (name, abbreviation, lookupValue, similarity) => {
        const option = createGenericOption(name, abbreviation)
        expect(getSimilarity(option, lookupValue)).toBe(similarity)
      }
    )
  })

  describe('filterOptions', () => {
    const optionA = createOption('Argon', 'Ar')
    const optionB = createOption('Gold', 'Au')

    const optionD = createOption('Copernicium', 'Cn')
    const optionC = createOption('Cobalt', 'Co')
    const optionE = createOption('CO2H')
    const optionF = createOption('Silicon', 'Si')
    const optionG = createOption('benzyl alcohol')

    it('Should filter out Gold Element', () => {
      const lookupValue = 'Argon'
      const inputArray = [optionA, optionB]
      const resultArray = [optionA]
      expect(
        filterOptions(inputArray, {
          inputValue: lookupValue
        } as FilterOptionsState<AbbreviationOption>)
      ).toEqual(resultArray)
    })

    it('Should return an empty array for empty lookup value', () => {
      const lookupValue = ''
      const inputArray = [optionB, optionA]
      const resultArray = []
      expect(
        filterOptions(inputArray, {
          inputValue: lookupValue
        } as FilterOptionsState<AbbreviationOption>)
      ).toEqual(resultArray)
    })

    it('Should sort by checking if name or abbreviation is starts with lookup value', () => {
      const lookupValue = 'go'
      const inputArray = [optionB, optionA]
      const resultArray = [optionB, optionA]
      expect(
        filterOptions(inputArray, {
          inputValue: lookupValue
        } as FilterOptionsState<AbbreviationOption>)
      ).toEqual(resultArray)
    })

    it('Should correctly consider name or abbreviation while sorting', () => {
      const lookupValue = 'co'
      const inputArray = [optionF, optionG, optionD, optionC, optionE]
      const resultArray = [optionC, optionE, optionD, optionF, optionG]
      expect(
        filterOptions(inputArray, {
          inputValue: lookupValue
        } as FilterOptionsState<AbbreviationOption>)
      ).toEqual(resultArray)
    })
  })
})
