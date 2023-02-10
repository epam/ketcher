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

import { formReducer, formsState } from './form'

export function openDialog(dispatch, dialogName, props) {
  return new Promise((resolve, reject) => {
    dispatch({
      type: 'MODAL_OPEN',
      data: {
        name: dialogName,
        prop: {
          ...props,
          onResult: resolve,
          onCancel: reject
        }
      }
    })
  })
}

function modalReducer(state = null, action) {
  const { type, data } = action

  if (type === 'UPDATE_FORM') {
    // Don't update if modal has already been closed
    // TODO: refactor actions and server functions in /src/script/ui/state/server/index.js to
    // not send 'UPDATE_FORM' action to a closed modal in the first place
    if (!state) {
      return null
    }

    const formState = formReducer(state.form, action)
    return { ...state, form: formState }
  }

  switch (type) {
    case 'MODAL_CLOSE':
      return null
    case 'MODAL_OPEN':
      return {
        name: data.name,
        form: formsState[data.name] || null,
        prop: data.prop || null
      }
    default:
      return state
  }
}

export default modalReducer
