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

interface WithResetInitiallySelected {
  resetInitiallySelected(shouldInvalidate?: boolean): void;
}

function hasResetInitiallySelected(
  value: unknown,
): value is WithResetInitiallySelected {
  return (
    value !== null &&
    typeof value === 'object' &&
    'resetInitiallySelected' in value &&
    typeof (value as WithResetInitiallySelected).resetInitiallySelected ===
      'function'
  );
}

export class Pool<TValue = unknown> extends Map<number, TValue> {
  private nextId = 0;

  add(item: TValue): number {
    const id = this.nextId++;
    super.set(id, item);
    return id;
  }

  newId(): number {
    return this.nextId++;
  }

  reserveId(id: number): void {
    this.nextId = Math.max(this.nextId, id + 1);
  }

  keyOf(item: TValue): number | null {
    for (const [key, value] of this.entries()) {
      if (value === item) return key;
    }

    return null;
  }

  find(
    isMatchingEntry: (key: number, value: TValue) => boolean,
  ): number | null {
    for (const [key, value] of this.entries()) {
      if (isMatchingEntry(key, value)) return key;
    }

    return null;
  }

  filter(
    isMatchingEntry: (key: number, value: TValue) => boolean,
  ): Pool<TValue> {
    return new Pool<TValue>(
      Array.from(this).filter(([key, value]) => isMatchingEntry(key, value)),
    );
  }

  some(isMatchingEntry: (value: TValue) => boolean): boolean {
    for (const value of this.values()) {
      if (isMatchingEntry(value)) {
        return true;
      }
    }

    return false;
  }

  changeInitiallySelectedPropertiesForPool(shouldInvalidate?: boolean): void {
    this.forEach((value, key) => {
      if (hasResetInitiallySelected(value)) {
        value.resetInitiallySelected(shouldInvalidate);
        this.set(key, value);
      }
    });
  }

  clone(): Pool<TValue> {
    const newPool = new Pool<TValue>(this);
    newPool.nextId = this.nextId;
    return newPool;
  }
}
