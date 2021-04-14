import React from 'react'

import classes from './Save.module.less'

const SaveImageTab = ({ changeImageFormat }) => {
  const formats = [
    { extension: 'svg', text: 'SVG Document' },
    { extension: 'png', text: 'PNG Image' }
  ]

  const renderOptions = formats => {
    return formats.map(format => {
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
