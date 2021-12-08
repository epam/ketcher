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

export class Pool<TValue = any> extends Map<number, TValue> {
  private nextId = 0

  add(item: TValue): number {
    const id = this.nextId++
    super.set(id, item)
    return id
  }

  newId(): number {
    return this.nextId++
  }

  keyOf(item: TValue): number | null {
    for (const [key, value] of this.entries()) {
      if (value === item) return key
    }

    return null
  }

  find(predicate: (key: number, value: TValue) => boolean): number | null {
    for (const [key, value] of this.entries()) {
      if (predicate(key, value)) return key
    }

    return null
  }

  filter(predicate: (key: number, value: TValue) => boolean): Pool<TValue> {
    return new Pool<TValue>(
      Array.from(this).filter(([key, value]) => predicate(key, value))
    )
  }

  some(predicate: (value: TValue) => boolean): boolean {
    for (const value of this.values()) {
      if (predicate(value)) {
        return true
      }
    }

    return false
  }
}
