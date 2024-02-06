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

import styled from '@emotion/styled';

interface Props {
  value: string;
  id: string;
  onChange: (value: string) => void;
  label?: string;
}

const Label = styled.label(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginRight: '8px',
  color: theme.ketcher.color.text.primary,
  fontSize: '12px',
}));

const Input = styled.input(({ theme }) => ({
  height: '24px',
  padding: '3px 7px',
  border: `1px solid ${theme.ketcher.color.input.border.regular}`,
  fontSize: '14px',
  borderRadius: '4px',
  backgroundColor: theme.ketcher.color.input.background.primary,
  color: theme.ketcher.color.text.primary,
  outline: 'transparent',
  width: '164px',
  letterSpacing: 'normal',

  '&:active, &:focus': {
    color: theme.ketcher.color.input.text.active,
  },

  '&:hover': {
    border: `1px solid ${theme.ketcher.color.input.border.hover}`,
  },
}));

export const TextInputField = ({
  value,
  id,
  onChange,
  label,
  ...rest
}: Props) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <>
      <Label htmlFor={id}>
        {label && <span>{label}</span>}
        <Input
          type="text"
          id={id}
          value={value}
          onChange={handleChange}
          {...rest}
        />
      </Label>
    </>
  );
};
