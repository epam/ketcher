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
import React, { useMemo } from 'react'
import { ActionButton } from 'components/shared/actionButton'
import styled from '@emotion/styled'
import { IconNameType } from 'components/shared/icon/icon'

export type FileDropProps = {
  buttonLabel: string
  textLabel: string
  iconName: IconNameType
  disabled?: boolean
  disabledText?: string
} & DropzoneOptions

const baseStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'space-around'
}

const activeStyle = {
  backgroundColor: '#F8FEFFFF'
}

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 8px;

  & > span {
    padding-top: 5px;
    font-size: ${({ theme }) => theme.ketcher.font.size.small};
  }
  & > svg {
    margin-bottom: 8px;
  }
`

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
      <ButtonContainer>
        <ActionButton
          label={buttonLabel}
          clickHandler={open}
          disabled={disabled}
        />
        {textLabel && <span>{textLabel}</span>}
      </ButtonContainer>
      {disabled ? <p>{disabledText}</p> : <Icon name={iconName} />}
    </div>
  )
}

export { FileDrop }
