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
import React from 'react'

import { UiActionAction } from '../../../../action'
import { zoomList } from '../../../../action/zoom'

interface ZoomListProps {
  status: {
    zoom?: {
      selected?: number
    }
  }
}

interface ZoomListCallProps {
  onAction: (action: UiActionAction) => void
}

type Props = ZoomListProps & ZoomListCallProps

const ZoomList = (props: Props) => {
  const { status = {}, onAction } = props
  const zoom = status.zoom && status.zoom.selected // TMP

  const handleChange = event => {
    const parsedValue = parseFloat(event.target.value)
    onAction(editor => editor.zoom(parsedValue))
  }

  return (
    <select value={zoom} onChange={handleChange}>
      {zoomList.map(value => (
        <option key={value.toString()} value={value}>
          {`${(value * 100).toFixed()}%`}
        </option>
      ))}
    </select>
  )
}

export type { ZoomListProps, ZoomListCallProps }
export { ZoomList }
