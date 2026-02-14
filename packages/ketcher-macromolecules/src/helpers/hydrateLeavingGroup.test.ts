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

import { LeavingGroup } from 'ketcher-core';
import hydrateLeavingGroup from './hydrateLeavingGroup';

describe('hydrateLeavingGroup', () => {
  it('should convert O to OH', () => {
    const result = hydrateLeavingGroup('O' as LeavingGroup);
    expect(result).toBe('OH');
  });

  it('should convert N to NH2', () => {
    const result = hydrateLeavingGroup('N' as LeavingGroup);
    expect(result).toBe('NH2');
  });

  it('should return H unchanged', () => {
    const result = hydrateLeavingGroup('H' as LeavingGroup);
    expect(result).toBe('H');
  });

  it('should return OH unchanged', () => {
    const result = hydrateLeavingGroup('OH' as LeavingGroup);
    expect(result).toBe('OH');
  });

  it('should return NH2 unchanged', () => {
    const result = hydrateLeavingGroup('NH2' as LeavingGroup);
    expect(result).toBe('NH2');
  });
});
