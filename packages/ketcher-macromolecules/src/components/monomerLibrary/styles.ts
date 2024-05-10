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
import { Input } from 'ketcher-react';

export const MONOMER_LIBRARY_WIDTH = '254px';

export const MonomerLibraryInput = styled(Input)({
  outline: 0,
  ':hover': {
    outline: 'none',
  },
});

export const MonomerLibraryContainer = styled.div(({ theme }) => ({
  width: MONOMER_LIBRARY_WIDTH,
  height: 'calc(100% - 16px)',
  backgroundColor: theme.ketcher.color.background.primary,
  boxShadow: '0px 2px 5px rgba(103, 104, 132, 0.15)',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '4px',
}));

export const MonomerLibraryTitle = styled.h3(({ theme }) => ({
  margin: 0,
  padding: 0,
  fontSize: theme.ketcher.font.size.regular,
  fontWeight: theme.ketcher.font.weight.regular,
}));

export const MonomerLibraryHeader = styled.div(() => ({
  padding: '12px',
  position: 'relative',
}));

export const MonomerLibrarySearch = styled.div(({ theme }) => ({
  padding: '12px 0',

  '& > div': {
    background: theme.ketcher.color.input.background.default,
    display: 'flex',
    height: '24px',
    flexDirection: 'row',
    border: '1px solid transparent',
    borderRadius: '4px',
    padding: '0 4px',

    '& > span': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    '&:has(input:focus)': {
      outline: `1px solid ${theme.ketcher.color.input.border.focus}`,
    },

    '& > input': {
      background: 'transparent',
      border: 'none',
      padding: '0 0 0 8px',
      margin: 0,
      flex: 1,

      '&:focus': {
        outline: 'none',
      },
    },
  },
}));
