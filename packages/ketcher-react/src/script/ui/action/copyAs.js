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

import { KetSerializer, MolSerializer } from 'ketcher-core'

export default function copyAs(type) {
  const state = global.currentState
  const editor = state.editor
  const struct = editor.structSelected()
  const errorHandler = editor.errorHandler
  let serializer
  try {
    switch (type) {
      case 'mol': {
        serializer = new MolSerializer()
        break
      }
      case 'ket': {
        serializer = new KetSerializer()
        break
      }
      default: {
        serializer = new KetSerializer()
        break
      }
    }

    const simpleObjectOrText = Boolean(
      struct.simpleObjects.size || struct.texts.size
    )

    if (simpleObjectOrText && serializer instanceof MolSerializer) {
      errorHandler(
        'This feature is not available for Simple objects and Text objects'
      )
      return null
    }

    const structData = serializer.serialize(struct)

    if (window.clipboardData) {
      window.clipboardData.setData('text', structData)
    } else {
      navigator.clipboard.writeText(structData)
    }
  } catch {
    errorHandler('This feature is not available in your browser')
  }
}
