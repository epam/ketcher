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

import { saveAs } from 'file-saver'

import { ActionButton } from 'components/shared/actionButton'
import { ChemicalMimeType } from 'helpers/formats'

type Props = {
  label: string
  data: string
  filename: string
  type: ChemicalMimeType
  onSave: () => void
}

export const SaveButton = ({
  label,
  data,
  filename,
  type,
  onSave,
  ...rest
}: Props) => {
  const handleSave = () => {
    const blob = new Blob([data], { type })
    saveAs(blob, filename)
    console.log('saved')
    onSave()
  }

  return (
    <ActionButton
      label={label}
      clickHandler={handleSave}
      type="submit"
      {...rest}
    />
  )
}
