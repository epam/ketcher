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

export const RnaAccordionContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  overflow: 'hidden',
  height: '100%',
});

export const StyledAccordion = styled(Accordion)({
  minHeight: '32px',
});

export const StyledAccordionWrapper = styled.div({
  flexGrow: 2,
  minHeight: '32px',
});

export const DetailsContainer = styled.div({
  position: 'relative',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  justifyContent: 'start',
  padding: '8px',
});

export const StyledButton = styled(Button)((props) => {
  return {
    backgroundColor: props.theme.ketcher.color.button.transparent.active,
    color: props.theme.ketcher.color.text.light,
    borderColor: props.theme.ketcher.color.text.light,
  };
});

export const DisabledArea = styled.div({
  width: '100%',
  height: '100%',
  backgroundColor: '#eff2f594',
  position: 'absolute',
  top: 0,
  left: 0,
});

export const RnaTabsContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 6px 8px 0;
`;

export const RnaTab = styled(Tab)`
  height: 24px;
  min-height: 24px;
  min-width: 24px;
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
  justify-content: center;
  padding: 4px;
  font-weight: 400;
  font-size: 10px;
  border-radius: 4px;
  background-color: white;
  opacity: 1;
  text-transform: none;

  > svg {
    height: 16px;
    width: 16px;
    color: #b4b9d6;

    &.MuiTab-iconWrapper {
      margin: 0;
    }
  }
`;
