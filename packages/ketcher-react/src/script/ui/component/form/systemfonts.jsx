/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { useCallback, useEffect, useState } from 'react'

import FontFaceObserver from 'font-face-observer'
import Select from './Select'

const commonFonts = [
  'Arial',
  'Arial Black',
  'Comic Sans MS',
  'Courier New',
  'Georgia',
  'Impact',
  'Charcoal',
  'Lucida Console',
  'Monaco',
  'Palatino Linotype',
  'Book Antiqua',
  'Palatino',
  'Tahoma',
  'Geneva',
  'Times New Roman',
  'Times',
  'Verdana',
  'Symbol',
  'MS Serif',
  'MS Sans Serif',
  'New York',
  'Droid Sans',
  'Droid Serif',
  'Droid Sans Mono',
  'Roboto'
]

function checkInSystem() {
  const availableFontsPromises = commonFonts.map((fontName) => {
    const observer = new FontFaceObserver(fontName)
    return observer.check().then(
      () => fontName,
      () => null
    )
  })

  return Promise.all(availableFontsPromises)
}

function SystemFonts(props) {
  const [availableFonts, setAvailableFonts] = useState(null)
  const { value, onChange } = props
  const onChangeCallback = useCallback(
    (value) => {
      onChange(value)
    },
    [onChange]
  )

  useEffect(() => {
    let mounted = true
    checkInSystem().then((results) => {
      const fonts = results
        .filter((i) => i !== null)
        .map((font) => {
          return { value: `30px ${font}`, label: font }
        })
      if (mounted) {
        setAvailableFonts(fonts)
      }
    })

    return () => (mounted = false)
  }, [])

  return (
    <Select
      onChange={onChangeCallback}
      value={value}
      disabled={availableFonts === null}
      options={availableFonts}
    />
  )
}

export default SystemFonts
