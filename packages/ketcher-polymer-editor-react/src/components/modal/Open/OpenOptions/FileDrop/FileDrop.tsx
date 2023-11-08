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
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { Icon, IconName } from 'ketcher-react';
import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { OpenOptionText, DisabledText } from '../OpenOptions';

export type FileDropProps = {
  buttonLabel: string;
  textLabel: string;
  iconName: IconName;
  disabled?: boolean;
  disabledText?: string;
} & DropzoneOptions;

const baseStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const StyledIcon = styled(Icon)`
  filter: ${({ disabled }) => (disabled ? 'grayscale(1)' : '')};
  opacity: ${({ disabled }) => (disabled ? '0.6' : '1')};
`;

const activeStyle = {
  backgroundColor: '#F8FEFFFF',
};

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  & > span {
    font-size: ${({ theme }) => theme.ketcher.font.size.small};
    color: ${({ theme }) => theme.ketcher.color.text.primary};
    opacity: 50%;
  }
  & > svg {
    margin-bottom: 8px;
  }
`;

const FileDrop = ({
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
    ...rest,
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
    }),
    [isDragActive],
  ) as React.CSSProperties;

  return (
    <div {...getRootProps({ style })} onClick={open}>
      <input {...getInputProps()} />
      <StyledIcon name={iconName} disabled={disabled} />
      {disabled ? (
        <DisabledText>{disabledText}</DisabledText>
      ) : (
        <>
          <ButtonContainer>
            {textLabel && <span>{textLabel}</span>}
          </ButtonContainer>
          <OpenOptionText>Open from file</OpenOptionText>
        </>
      )}
    </div>
  );
};

export { FileDrop };
