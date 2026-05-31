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
  INDIGO_VERIFICATION,
  ANALYZING_FILE,
  RequestActionTypes,
} from './request.types';

import reducer from '.';

describe('requests reducer', () => {
  it('should return the initial state when action payload is empty', () => {
    expect(reducer(undefined, {} as RequestActionTypes)).toEqual({
      indigoVerification: false,
      isAnalyzingFile: false,
    });
  });

  it('should set indigoVerification to value provided in INDIGO_VERIFICATION action', () => {
    expect(
      reducer(undefined, {
        type: INDIGO_VERIFICATION,
        data: true,
      }),
    ).toEqual({
      indigoVerification: true,
      isAnalyzingFile: false,
    });

    expect(
      reducer(
        {
          indigoVerification: true,
          isAnalyzingFile: false,
        },
        {
          type: INDIGO_VERIFICATION,
          data: false,
        },
      ),
    ).toEqual({
      indigoVerification: false,
      isAnalyzingFile: false,
    });
  });

  it('should set isAnalyzingFile to value provided in ANALYZING_FILE action', () => {
    expect(
      reducer(undefined, {
        type: ANALYZING_FILE,
        data: true,
      }),
    ).toEqual({
      indigoVerification: false,
      isAnalyzingFile: true,
    });

    expect(
      reducer(
        {
          indigoVerification: false,
          isAnalyzingFile: true,
        },
        {
          type: ANALYZING_FILE,
          data: false,
        },
      ),
    ).toEqual({
      indigoVerification: false,
      isAnalyzingFile: false,
    });
  });
});
