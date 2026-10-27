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

import { KetcherLogger } from 'ketcher-core';
import type { IStorage } from './types';

/* local storage */
export const storage: IStorage = {
  warningMessage:
    'Your changes will be lost after the tab closing. See Help (Note 2).',
  isAvailable(): Storage | false {
    try {
      const localStorageRef: Storage = globalThis.localStorage;
      return localStorageRef;
    } catch (e: unknown) {
      KetcherLogger.error('storage-ext.ts::storage::isAvailable', e);
      return false;
    }
  },
  getItem(key: string): unknown | null {
    let item: unknown | null = null;
    try {
      const stored = globalThis.localStorage.getItem(key);
      if (stored !== null) {
        item = JSON.parse(stored);
      }
    } catch (e: unknown) {
      KetcherLogger.error('storage-ext.ts::storage::getItem', e);
      const error = e as Error;
      console.info('LocalStorage:', error.name);
    }
    return item;
  },
  setItem(key: string, data: unknown): boolean {
    let isSet: boolean;
    try {
      globalThis.localStorage.setItem(key, JSON.stringify(data));
      isSet = true;
    } catch (e: unknown) {
      KetcherLogger.error('storage-ext.ts::storage::setItem', e);
      const error = e as Error;
      console.info('LocalStorage:', error.name);
      isSet = false;
    }
    return isSet;
  },
};
