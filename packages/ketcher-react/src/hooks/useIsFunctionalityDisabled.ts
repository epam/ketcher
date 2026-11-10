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

import { type KetcherFunctionality, ketcherProvider } from 'ketcher-core';
import { useAppContext } from './useAppContext';

/**
 * Returns whether the given piece of Ketcher functionality was disabled via
 * the `disabledFunctionality` configuration option passed to the `Editor`
 * component.
 *
 * Use this hook in any UI entry point that can trigger the functionality
 * (context menu item, toolbar button, etc.) to hide/disable itself
 * accordingly, so a functionality disabled once has effect everywhere it
 * would otherwise be exposed.
 *
 * @example
 * ```typescript
 * const isExpandMonomersDisabled = useIsFunctionalityDisabled(
 *   KetcherFunctionality.ExpandMonomers,
 * );
 * ```
 */
export const useIsFunctionalityDisabled = (
  functionality: KetcherFunctionality,
): boolean => {
  const { ketcherId } = useAppContext();

  return Boolean(
    ketcherProvider
      .getKetcher(ketcherId)
      ?.isFunctionalityDisabled(functionality),
  );
};
