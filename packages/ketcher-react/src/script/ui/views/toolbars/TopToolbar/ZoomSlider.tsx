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

import { Slider as UnstyledSlider } from '@mui/material'
import styled from '@emotion/styled'

import { ScaleTransformer } from './ScaleTransformer'
import { zoomList } from '../../../action/zoom'

interface SliderProps {
  zoom: number
  setZoom: (arg) => void
}

const Slider = styled(UnstyledSlider)`
  width: 100px;
  z-index: 1;

  & .MuiSlider-rail {
    background: #9ea8b3;
    border: none;
  }

  & .MuiSlider-thumb {
    background-color: #167782;
    border-radius: 50%;
    height: 12px;
    width: 12px;
    border: 2px solid white;
    filter: drop-shadow(0 1px 6px rgba(103, 104, 132, 0.5));
  }

  & .MuiSlider-mark {
    display: none;
  }
`

// MIN must stay 0, because it's assumed in ScaleTransformer calculations
const INPUT_SCALE = {
  MIN: 0,
  MAX: 100
}

const scaleTransformer = new ScaleTransformer(INPUT_SCALE.MAX)

const sliderMarks = zoomList.map((zoomValue) => {
  const sliderValueMark = scaleTransformer.getSliderValue(zoomValue)
  return {
    value: sliderValueMark
  }
})

export const ZoomSlider = ({ zoom, setZoom }: SliderProps) => {
  const handleChange = (event) => {
    const parsedValue = parseFloat(event.target.value)
    const zoomValue = scaleTransformer.getZoomValue(parsedValue)

    if (zoom !== zoomValue) {
      setZoom(zoomValue)
    }
  }

  return (
    <Slider
      track={false}
      min={INPUT_SCALE.MIN}
      max={INPUT_SCALE.MAX}
      step={null}
      value={scaleTransformer.getSliderValue(zoom)}
      onChange={handleChange}
      marks={sliderMarks}
      valueLabelDisplay="off"
    />
  )
}
