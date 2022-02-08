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
import { useDropzone, DropzoneOptions } from 'react-dropzone'
import { Icon } from 'components/shared/icon'
import { DropButton } from 'components/modal/Open/DropButton'
import React, { useMemo } from 'react'

type FileDropProps = {
  buttonLabel: string
  textLabel: string
  iconName: string
  disabled?: boolean
  disabledText?: string
} & DropzoneOptions

const baseStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'space-between'
}

const activeStyle = {
  backgroundColor: '#F8FEFFFF'
}

const FileDrop = ({
  buttonLabel,
  textLabel,
  iconName,
  disabled,
  disabledText,
  ...rest
}: FileDropProps) => {
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    multiple: false,
    noClick: true,
    disabled,
    ...rest
  })

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {})
    }),
    [isDragActive]
  ) as React.CSSProperties

  return (
    <div {...getRootProps({ style })}>
      <input {...getInputProps()} />
      <DropButton
        label={buttonLabel}
        clickHandler={open}
        disabled={disabled}
        caption={textLabel}
      />
      {disabled ? <p>{disabledText}</p> : <Icon name={iconName} />}
    </div>
  )
}

export { FileDrop }
