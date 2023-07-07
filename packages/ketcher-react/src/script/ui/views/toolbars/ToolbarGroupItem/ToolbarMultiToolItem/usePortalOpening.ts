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

import { useEffect, useState } from 'react';

import { ToolbarItem } from '../../toolbar.types';

type HookParams = [string, string | null, ToolbarItem[]];

function usePortalOpening([id, opened, options]: HookParams): [boolean] {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const currentId = (options.length && options![0].id) || '';
    const newState = opened === id || opened === currentId;
    setIsOpen(newState);
  }, [opened, options]);

  return [isOpen];
}

export { usePortalOpening };
