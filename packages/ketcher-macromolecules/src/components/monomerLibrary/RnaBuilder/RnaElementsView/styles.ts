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
import { Accordion, Button } from 'ketcher-react';
import { Tab } from '@mui/material';

export const RnaAccordionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
  height: 100%;
`;

export const StyledAccordion = styled(Accordion)`
  min-height: 32px;
`;

export const StyledAccordionWrapper = styled.div`
  flex-grow: 2;
  min-height: 32px;
`;

export const DetailsContainer = styled.div<{ compact?: boolean }>`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: start;
  padding: ${({ compact }) => (compact ? '4px' : '8px')};
  overflow: auto;
`;

export const RnaTabContent = styled.div`
  height: 100%;
  background-color: #f7f9fa;
  border-radius: 4px;
  margin: 4px 8px;
  padding: 4px;

  &.first-tab {
    border-radius: 0 4px 4px 4px;
  }

  &.last-tab {
    border-radius: 4px 0 4px 4px;
  }
`;

export const CompactDetailsContainer = styled.div`
  height: 100%;
  background-color: ${({ theme }) => theme.ketcher.color.tab.content};
  border-radius: 2px;
  overflow: auto;
`;

export const StyledButton = styled(Button)`
  background-color: ${({ theme }) =>
    theme.ketcher.color.button.transparent.active};
  color: ${({ theme }) => theme.ketcher.color.text.light};
  border-color: ${({ theme }) => theme.ketcher.color.text.light};
`;

export const DisabledArea = styled.div`
  width: 100%;
  height: 100%;
  background-color: #eff2f594;
  position: absolute;
  top: 0;
  left: 0;
`;

export const RnaTabsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px 0;
`;

export const RnaTabWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  &.rna-tab--selected {
    & button {
      border-radius: 4px 4px 0 0;
      background-color: #f7f9fa;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      right: 0;
      height: 8px;
      background-color: #f7f9fa;
    }
  }
`;

export const RnaTab = styled(Tab)<{ selected?: boolean }>`
  height: 24px;
  min-height: 24px;
  min-width: 24px;
  ${({ selected }) => (selected ? 'min-width: 104px;' : '')}
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
  justify-content: center;
  padding: 4px;
  ${({ selected }) => (selected ? 'margin-top: -8px;' : '')}
  font-weight: 400;
  font-size: 10px;
  border-radius: 4px;
  background-color: white;
  opacity: ${({ selected }) => (selected ? 1 : 0.6)};
  text-transform: none;

  &:hover {
    background-color: #f3f8f9;
  }

  > svg {
    height: 16px;
    width: 16px;
    color: #b4b9d6;

    &.MuiTab-iconWrapper {
      margin: 0;
    }
  }
`;
