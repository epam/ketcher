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

type PileSetLike<TValue> = {
  keys(): Iterator<TValue>;
  has(value: TValue): boolean;
  readonly size: number;
};

export class Pile<TValue = any> extends Set<TValue> {
  // TODO: it's used only in dfs.js in one place in some strange way.
  // Should be removed after dfs.js refactoring
  find(predicate: (item: TValue) => boolean) {
    for (const item of this) {
      if (predicate(item)) return item;
    }

    return null;
  }

  equals(setB: Pile): boolean {
    return this.isSuperset(setB) && setB.isSuperset(this);
  }

  isSuperset(subset: Pile): boolean {
    for (const item of subset) {
      if (!this.has(item)) return false;
    }

    return true;
  }

  filter(expression: (arg: TValue) => boolean): Pile<TValue> {
    return new Pile(Array.from(this).filter(expression));
  }

  union<U>(setB: PileSetLike<U>): Pile<TValue | U> {
    const union = new Pile<TValue | U>(this);
    const iterator = setB.keys();

    for (let result = iterator.next(); !result.done; result = iterator.next()) {
      union.add(result.value);
    }

    return union;
  }

  intersection<U>(setB: PileSetLike<U>): Pile<TValue & U> {
    const thisSet = new Pile(this);
    const isSharedValue = (item: TValue): item is TValue & U =>
      setB.has(item as unknown as U);
    return new Pile([...thisSet].filter(isSharedValue));
  }

  /**
   * Union multiple sets which have intersections
   * @example ```
   * const setA = new Pile([0, 1])
   * const setB = new Pile([1, 2])
   * const setC = new Pile([2, 3])
   * const setD = new Pile([4, 5])
   * console.log(Pile.unionMultiple([setA, setB, setC, setD]))
   * // [{0, 1, 2, 3}, {4, 5}]
   * ```
   */
  static unionIntersections<T>(sets: Array<Pile<T>>): Array<Pile<T>> {
    let unionized = false;

    // Union two of sets
    const setsToReturn = sets.reduce((prevSets, curSet) => {
      let isCurSetMerged = false;

      const newSets = prevSets.map((set) => {
        const intersec = set.intersection(curSet);
        if (intersec.size > 0) {
          unionized = true;
          isCurSetMerged = true;
          return set.union(curSet);
        }
        return set;
      });

      if (!isCurSetMerged) newSets.push(curSet);
      return newSets;
    }, new Array<Pile<T>>());

    // Recursively union two of sets === union all sets
    return unionized ? Pile.unionIntersections(setsToReturn) : setsToReturn;
  }
}
