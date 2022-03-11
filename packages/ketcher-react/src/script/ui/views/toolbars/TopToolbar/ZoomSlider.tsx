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

import styles from './ZoomSlider.module.less'
import { ScaleTransformer } from './ScaleTransformer'

interface SliderProps {
  zoom: number
  onAction: (arg) => void
}

// MIN must stay 0, because it's assumed in calculations below
const INPUT_SCALE = {
  MIN: 0,
  MAX: 100
}

const scaleTransformer = new ScaleTransformer(INPUT_SCALE.MAX)

export const ZoomSlider = ({ zoom, onAction }: SliderProps) => {
  const handleChange = (event) => {
    const parsedValue = parseFloat(event.target.value)
    const zoomValue = scaleTransformer.getZoomValue(parsedValue)

    onAction((editor) => editor.zoom(zoomValue))
  }

  return (
    <input
      type="range"
      min={INPUT_SCALE.MIN}
      max={INPUT_SCALE.MAX}
      step="1"
      value={scaleTransformer.getSliderValue(zoom)}
      onChange={handleChange}
      className={styles.slider}
    />
  )
}
