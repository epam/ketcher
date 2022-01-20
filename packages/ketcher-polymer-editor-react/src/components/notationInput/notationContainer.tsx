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

import { useState } from 'react'

import { NotationInput } from '.'

// @TODO don't use this component when business logic is ready
// This is a component for demonstration of NotationInput with mock data
export const NotationContainer = () => {
  const notationOptions = [
    { id: 1, label: 'HELM Notation' },
    { id: 2, label: 'RNA Sequence' },
    { id: 3, label: 'Peptide Sequence' },
    { id: 4, label: 'Black' }
  ]

  const [notationInputValue, setNotationInput] = useState<string>('')
  const [activeNotation, setActiveNotation] = useState(notationOptions[0].id)

  return (
    <NotationInput
      notationOptions={notationOptions}
      selectedNotationId={activeNotation}
      selectionHandler={setActiveNotation}
      inputValue={notationInputValue}
      inputHandler={setNotationInput}
      addButtonHandler={() => null}
    />
  )
}
