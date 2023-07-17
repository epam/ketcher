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
import { Button, Icon } from 'ketcher-react';

export const RnaEditorContainer = styled.div((props) => ({
  borderRadius: props.theme.ketcher.border.radius.regular,
  backgroundColor: '#F7F9FA',
  boxShadow: props.theme.ketcher.shadow.regular,
  overflow: 'hidden',
  margin: '12px',
  flexShrink: 0,
}));

export const ExpandButton = styled(Button)({
  width: '100%',
  outline: 'none',
  borderRadius: '0',
  padding: '0',

  ':hover': {
    backgroundColor: '#E1E5EA',
  },
});

export const ExpandIcon = styled(Icon)<{ expanded?: boolean }>(
  {
    height: '16px',
    width: '16px',
  },
  ({ expanded }) => ({
    transform: expanded ? 'rotate(180deg)' : 'none',
  }),
);
