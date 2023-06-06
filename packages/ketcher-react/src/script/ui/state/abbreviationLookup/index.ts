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
import { AbbreviationLookupState } from './abbreviationLookup.types'

const initialState: AbbreviationLookupState = {
  isOpen: false
}

const ABBREVIATION_LOOKUP_ACTIONS = {
  ABBR_LOOKUP_INIT: 'ABBR_LOOKUP_INIT',
  ABBR_LOOKUP_SHOW: 'ABBR_LOOKUP_SHOW',
  ABBR_LOOKUP_CLOSE: 'ABBR_LOOKUP_CLOSE'
} as const

export const initAbbreviationLookup = (key: string) => ({
  type: ABBREVIATION_LOOKUP_ACTIONS.ABBR_LOOKUP_INIT,
  data: key
})

export const showAbbreviationLookup = (key: string) => ({
  type: ABBREVIATION_LOOKUP_ACTIONS.ABBR_LOOKUP_SHOW,
  data: key
})

export const closeAbbreviationLookup = () => ({
  type: ABBREVIATION_LOOKUP_ACTIONS.ABBR_LOOKUP_CLOSE
})

type AbbrLookupAction =
  | ReturnType<typeof initAbbreviationLookup>
  | ReturnType<typeof showAbbreviationLookup>
  | ReturnType<typeof closeAbbreviationLookup>

function abbreviationLookupReducer(
  state: AbbreviationLookupState = initialState,
  action: AbbrLookupAction
): AbbreviationLookupState {
  switch (action.type) {
    case ABBREVIATION_LOOKUP_ACTIONS.ABBR_LOOKUP_INIT: {
      return {
        isOpen: false,
        lookupValue: action.data
      }
    }

    case ABBREVIATION_LOOKUP_ACTIONS.ABBR_LOOKUP_SHOW: {
      return {
        isOpen: true,
        lookupValue: `${state.lookupValue}${action.data}`
      }
    }

    case ABBREVIATION_LOOKUP_ACTIONS.ABBR_LOOKUP_CLOSE: {
      return {
        isOpen: false,
        lookupValue: undefined
      }
    }

    default:
      return state
  }
}

export default abbreviationLookupReducer
