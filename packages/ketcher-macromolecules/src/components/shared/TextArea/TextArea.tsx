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
import { scrollbarThin } from 'theming/mixins';
import { useEffect, useRef } from 'react';

export type TextEditorProps = {
  value: string;
  inputHandler?: (str: string) => void;
  readonly?: boolean;
  selectOnInit?: boolean;
  className?: string;
  testId?: string;
};

const StyledTextarea = styled.textarea`
  min-width: 430px;
  padding: 12px;
  width: 100%;
  height: 100%;
  overflow: auto;
  white-space: pre-wrap;
  resize: none;
  box-sizing: border-box;
  outline: transparent;
  border: none;
  color: ${({ theme }) => theme.ketcher.color.input.text.active};
  font-size: ${({ theme }) => theme.ketcher.font.size.regular};
  background-color: ${({ theme, readOnly }) =>
    readOnly
      ? theme.ketcher.color.input.background.disabled
      : theme.ketcher.color.input.background.primary};

  ${({ theme }) => scrollbarThin(theme)};
`;

export const TextArea = ({
  value,
  inputHandler,
  readonly = false,
  selectOnInit = false,
  className,
  testId,
}: TextEditorProps) => {
  const textArea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (selectOnInit) {
      textArea.current?.select();
    }
  }, [textArea, value, selectOnInit]);

  return (
    <StyledTextarea
      value={value}
      readOnly={readonly}
      onChange={inputHandler && ((event) => inputHandler(event.target.value))}
      ref={textArea}
      className={className}
      data-testid={testId}
    />
  );
};
