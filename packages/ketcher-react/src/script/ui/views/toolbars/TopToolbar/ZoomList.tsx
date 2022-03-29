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

import { zoomList } from '../../../action/zoom'

function toPercent(value: number): string {
  const percentLimit = 100
  return (value * percentLimit).toFixed()
}

interface ZoomListProps {
  zoom: number
  setZoom: (zoom: number) => void
}

const ZoomList = ({ zoom, setZoom }: ZoomListProps) => {
  const handleChange = (event) => {
    const parsedValue = parseFloat(event.target.value)
    setZoom(parsedValue)
  }

  return (
    <select value={zoom} onChange={handleChange}>
      {zoomList.map((value) => (
        <option key={value.toString()} value={value}>
          {toPercent(value)}%
        </option>
      ))}
    </select>
  )
}

export type { ZoomListProps }
export { ZoomList }
