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
import { ActionButton } from 'components/shared/actionButton';

const ICON_NAMES: Record<string, IconName> = {
  PASTE: 'capital-t',
  FILE: 'arrow-upward',
};

export type OpenOptionsProps = {
  selectClipboard: () => void;
  errorHandler: (err: string) => void;
  fileLoadHandler: (files: File[]) => void;
};

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
  width: 152px;
  height: 112px;
  border: 1px solid #aeaeae;
  border-radius: 4px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  box-sizing: border-box;
  position: relative;

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
      <DropContainer>
        <ActionButton
          clickHandler={selectClipboard}
          label="Paste from Clipboard"
        />
        <Icon name={ICON_NAMES.PASTE} />
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
    </RootContainer>
  );
};

export { OpenOptions };
