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
  RequestState,
} from './request.types';

export function indigoVerification(data: boolean): RequestActionTypes {
  return {
    type: INDIGO_VERIFICATION,
    data,
  };
}

export function setAnalyzingFile(data: boolean): RequestActionTypes {
  return {
    type: ANALYZING_FILE,
    data,
  };
}

const initialState = {
  indigoVerification: false,
  isAnalyzingFile: false,
};

export default function (
  state = initialState,
  action: RequestActionTypes,
): RequestState {
  const { type, data } = action;

  switch (type) {
    case INDIGO_VERIFICATION: {
      return {
        ...state,
        indigoVerification: data,
      };
    }
    case ANALYZING_FILE: {
      return {
        ...state,
        isAnalyzingFile: data,
      };
    }
    default:
      return state;
  }
}
