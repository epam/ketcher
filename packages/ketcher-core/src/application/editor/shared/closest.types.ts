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

import type { ReStruct } from 'application/render';
import type { Vec2 } from 'domain/entities/vec2';

/**
 * Represents the result of finding the closest atom.
 * Contains the atom ID and the distance to it.
 */
export interface ClosestAtom {
  id: number;
  dist: number;
}

/**
 * Represents an item to skip when searching for the closest element.
 * Used to exclude a specific atom from the closest search.
 */
export interface ClosestSkipItem {
  map: 'atoms';
  id: number;
}

/**
 * Function type for finding the closest atom to a given position.
 * @param restruct - The render structure containing atoms and their positions
 * @param pos - The position to search from
 * @param skip - Optional atom to skip during the search
 * @param minDist - Optional minimum distance threshold
 * @returns The closest atom with its distance, or null if none found
 */
export type FindClosestAtom = (
  restruct: ReStruct,
  pos: Vec2,
  skip: ClosestSkipItem | null,
  minDist: number | null,
) => ClosestAtom | null;

/**
 * Default export interface for the closest module.
 */
export interface ClosestModule {
  atom: FindClosestAtom;
}
