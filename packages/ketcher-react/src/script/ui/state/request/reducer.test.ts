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

import reducer from '.'
import { INDIGO_VERIFICATION, RequestActionTypes } from './request.types'

describe('requests reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as RequestActionTypes)).toEqual({
      indigoVerification: false
    })
  })

  it('should handle INDIGO_VERIFICATION', () => {
    expect(
      reducer(undefined, {
        type: INDIGO_VERIFICATION,
        data: true
      })
    ).toEqual({
      indigoVerification: true
    })

    expect(
      reducer(
        {
          indigoVerification: true
        },
        {
          type: INDIGO_VERIFICATION,
          data: false
        }
      )
    ).toEqual({
      indigoVerification: false
    })
  })
})
