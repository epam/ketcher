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

import { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { Button, Popover } from '@mui/material';
import { Icon } from 'ketcher-react';

interface IStyledIconProps {
  expanded?: boolean;
  hidden?: boolean;
}
const ElementAndDropdown = styled('div')`
  position: relative;
  width: 28px;
  padding: 2px;
  flexgrow: 1;
  display: flex;
  justifycontent: flex-end;

  @media only screen {
    @container (min-width: 900px) {
      width: 162px;
      padding: 6px 3px;
    }
  }
`;

const DropDownButton = styled(Button)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  color: '#000000',
  padding: '0px',
  width: '100%',
  minWidth: '0px',

  '& svg:first-of-type': {
    margin: '2px',
    width: '20px',
    height: '20px',
  },
}));

const StyledIcon = styled(Icon)<IStyledIconProps>`
  width: 16px;
  height: 16px;
  transform: ${({ expanded }) => (expanded ? 'rotate(180deg)' : 'none')};
  opacity: ${({ hidden }) => (hidden ? '0' : '100')};
`;

const StyledIconForMacromoleculesToggler = styled(StyledIcon)`
  display: none;
  @media only screen {
    @container (min-width: 900px) {
      display: flex;
    }
  }
`;

const CornerIcon = styled(Icon)`
  display: block;
  width: 7px;
  height: 7px;
  position: absolute;
  right: 0;
  bottom: 0;
  fill: @main-color;
  @media only screen {
    @container (min-width: 900px) {
      display: none;
    }
  }
`;

const ModeLabel = styled('span')`
  display: none;
  text-transform: none;
  font-size: 12px;
  text-align: left;
  flex-grow: 1;
  @media only screen {
    @container (min-width: 900px) {
      display: inline;
    }
  }
`;

const ModeControlButton = styled('div')`
  width: 162px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 3px;

  :hover {
    background-color: #f3f8f9;
  }
`;

const ModeButtonLable = styled('span')`
  font-size: 12px;
  flex-grow: 1;
  text-align: start;
  text-transform: none;
`;

const Dropdown = styled(Popover)`
  & .MuiPopover-paper {
    padding: 3px 0px;
    width: 162px;
    border: none;
    border-radius: 0px 0px 4px 4px;
    box-shadow: 0px 30px 48px -17px rgba(160, 165, 174, 0.3);
    box-sizing: border-box;
  }
`;

const DropDownContent = styled('div')`
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  word-break: keep-all;
  background: white;
  cursor: pointer;
`;

interface ModeProps {
  toggle: (isEnabled: boolean) => void;
  isPolymerEditor: boolean;
}

export const ModeControl = ({ toggle, isPolymerEditor }: ModeProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const onClose = () => {
    setIsExpanded(false);
  };

  const onExpand = () => {
    setIsExpanded(true);
  };

  const modeLabel = isPolymerEditor ? 'Macromolecules' : 'Molecules';
  const modeIcon = isPolymerEditor ? 'macromolecules-mode' : 'molecules-mode';
  const title = isPolymerEditor
    ? 'Switch to Ketcher mode'
    : 'Switch to Macromolecule mode';

  return (
    <ElementAndDropdown title={title}>
      <DropDownButton
        data-testid="polymer-toggler"
        onClick={onExpand}
        ref={btnRef}
      >
        <Icon name={modeIcon} />
        <>
          <ModeLabel>{modeLabel}</ModeLabel>
          <StyledIconForMacromoleculesToggler
            name="chevron"
            expanded={isExpanded}
          />
        </>
        <>
          <CornerIcon name="dropdown" />
        </>
      </DropDownButton>
      <Dropdown
        title=""
        open={isExpanded}
        onClose={onClose}
        anchorEl={btnRef.current}
        container={btnRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <DropDownContent>
          <ModeControlButton
            data-testid="molecules_mode"
            onClick={() => {
              toggle(false);
              onClose();
            }}
          >
            <Icon name="molecules-mode" />
            <ModeButtonLable>Molecules</ModeButtonLable>
            {!isPolymerEditor && <StyledIcon name="check-mark" />}
          </ModeControlButton>

          <ModeControlButton
            data-testid="macromolecules_mode"
            onClick={() => {
              toggle(true);
              onClose();
            }}
          >
            <Icon name="macromolecules-mode" />
            <ModeButtonLable>Macromolecules</ModeButtonLable>
            {isPolymerEditor && <StyledIcon name="check-mark" />}
          </ModeControlButton>
        </DropDownContent>
      </Dropdown>
    </ElementAndDropdown>
  );
};
