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
import { Icon, IconName } from 'ketcher-react';
import styled from '@emotion/styled';
import { FileDrop } from './FileDrop';

const ICON_NAMES: Record<string, IconName> = {
  PASTE: 'open-window-paste-icon',
  FILE: 'open-window-upload-icon',
  IMAGE: 'image-frame',
} as const;

export type OpenOptionsProps = {
  selectClipboard: () => void;
  errorHandler: (err: string) => void;
  fileLoadHandler: (files: File[]) => void;
};

export const OpenOptionText = styled.p`
  font-size: 10px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.ketcher.color.text.light};
  margin: 0;
  text-align: center;
  line-height: 12px;
`;

export const DisabledText = styled.p`
  font-size: 10px;
  margin: 0;
  text-align: center;
  color: ${({ theme }) => theme.ketcher.color.text.primary};
  opacity: 50%;
  line-height: 12px;
`;

const RootContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  & > * {
    margin-right: 18px;
  }

  & :last-child {
    margin-right: 0;
  }
`;

const DropContainer = styled.div`
  width: 128px;
  height: 134px;
  box-shadow: 0 4px 12px rgba(103, 104, 132, 0.18);
  padding: 16px;
  border-radius: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  position: relative;
  cursor: pointer;

  & > p {
    margin-top: 6px;
    text-align: center;
  }

  svg {
    fill: ${({ theme }) => theme.ketcher.color.button.primary.active};
  }
`;

const OpenOptions = ({
  selectClipboard,
  fileLoadHandler,
  errorHandler,
}: OpenOptionsProps) => {
  return (
    <RootContainer>
      <DropContainer
        data-testId="paste-from-clipboard-button"
        onClick={selectClipboard}
      >
        <Icon name={ICON_NAMES.PASTE} />
        <OpenOptionText>Paste from clipboard</OpenOptionText>
      </DropContainer>
      <DropContainer>
        <FileDrop
          onDropAccepted={fileLoadHandler}
          onDropRejected={(e) => errorHandler(`Unable to accept file(s). ${e}`)}
          buttonLabel="Open from file"
          textLabel="or drag file here"
          iconName={ICON_NAMES.FILE}
        />
      </DropContainer>
      <DropContainer>
        <FileDrop
          accept="image/*"
          onDropAccepted={fileLoadHandler}
          onDropRejected={(e) => errorHandler(`Unable to accept file(s). ${e}`)}
          buttonLabel="Open from image"
          textLabel="or drag file here"
          iconName={ICON_NAMES.IMAGE}
          disabled
          disabledText="Image Recognition service is not available"
        />
      </DropContainer>
    </RootContainer>
  );
};

export { OpenOptions };
