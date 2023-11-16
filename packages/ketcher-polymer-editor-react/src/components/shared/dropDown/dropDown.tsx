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

import { useState, CSSProperties } from 'react';
import { Select, FormControl, MenuItem, ListItemText } from '@mui/material';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

import { ChevronIcon } from './styledIcons';

const StyledFormControl = styled(FormControl)`
  width: 100%;
  padding: 0 8px;

  & label {
    font-size: 12px;
    line-height: unset;
  }
`;

const DropDownSelect = styled(Select)`
  height: 24px;
  border: 1px solid #5b6077;
  border-radius: 4px;
  font-size: 14px;

  ${({ open }) =>
    open &&
    css`
      background-color: white;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    `}

  & .MuiSelect-select {
    padding: 0 24px 0 8px;
    height: 100%;
  }

  & span {
    ${({ theme }) => `font-size: ${theme.ketcher.font.size.medium}`}
  }

  & .MuiOutlinedInput-notchedOutline {
    border: 0;
  }
`;

const stylesForExpanded: CSSProperties = {
  width: '120px',
  backgroundColor: 'white',
  border: '1px solid #5B6077',
  borderTopWidth: '0',
  borderRadius: '0px 0px 2px 2px',
  boxShadow: '0 6px 10px rgba(103, 104, 132, 0.15)',
};

const DropDownItem = styled(MenuItem)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 8px;
  height: 28px;
  font-size: 14px;

  &.MuiButtonBase-root:hover {
    border-left: 2px solid #167782;
  }

  & .MuiTypography-root {
    ${({ theme }) => `font-size: ${theme.ketcher.font.size.medium}`}
  }
`;

export type Option = {
  id: string;
  label: string;
};

export type DropDownProps = {
  options: Array<Option>;
  currentSelection: Option['id'];
  selectionHandler: (value: Option['id']) => void;
  className?: string;
  customStylesForExpanded?: CSSProperties;
  label?: string;
};

export const DropDown = ({
  options,
  currentSelection,
  selectionHandler,
  className,
  label,
  customStylesForExpanded = {},
}: DropDownProps) => {
  const [expanded, setExpanded] = useState(false);

  const renderLabelById = (value: unknown) => {
    const selectedOption = options.filter(
      (option) => option.id === (value as typeof currentSelection),
    )[0];

    return <span>{selectedOption.label}</span>;
  };

  const handleSelection = (event) => {
    selectionHandler(event.target.value);
  };

  const handleExpand = () => {
    setExpanded(true);
  };

  const handleCollapse = () => {
    setExpanded(false);
  };

  return (
    <StyledFormControl className={className}>
      {label && <label htmlFor="fileformat">File format:</label>}
      <DropDownSelect
        value={currentSelection}
        onChange={handleSelection}
        open={expanded}
        onOpen={handleExpand}
        onClose={handleCollapse}
        renderValue={renderLabelById}
        IconComponent={ChevronIcon}
        fullWidth
        data-testid="dropdown-select"
        MenuProps={{
          PaperProps: {
            style: { ...stylesForExpanded, ...customStylesForExpanded },
          },
          MenuListProps: {
            style: { padding: '0' },
          },
        }}
      >
        {options.map((item: Option) => (
          <DropDownItem key={item.id} value={item.id}>
            <ListItemText primary={item.label} />
          </DropDownItem>
        ))}
      </DropDownSelect>
    </StyledFormControl>
  );
};
