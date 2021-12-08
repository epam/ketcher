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

import classes from './Save.module.less'

const SaveImageTab = ({ changeImageFormat }) => {
  const formats = [
    { extension: 'svg', text: 'SVG Document' },
    { extension: 'png', text: 'PNG Image' }
  ]

  const renderOptions = (formats) => {
    return formats.map((format) => {
      const { extension, text } = format
      return (
        <option key={extension} value={extension}>
          {text}
        </option>
      )
    })
  }

  const handleChange = ({ target }) => {
    changeImageFormat(target.value)
  }

  return (
    <div className={classes.saveImageContainer}>
      <label>
        Image Format: &nbsp;
        <select onChange={handleChange}>{renderOptions(formats)}</select>
      </label>
    </div>
  )
}

export default SaveImageTab
