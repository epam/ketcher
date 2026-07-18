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

import type { Action, Struct, Vec2 } from 'ketcher-core';
import type { ClosestItemWithMap } from '../shared/closest.types';

/**
 * The processed internal template object built by TemplateTool from the raw input.
 * Contains pre-computed attachment ids, geometry, and the molecule fragment.
 */
export interface InternalTemplate {
  aid: number;
  bid: number;
  molecule?: Struct;
  xy0?: Vec2;
  angle0?: number;
  /** Sign of the template relative to its attachment bond (+1 or -1). 0 when no bond is present. */
  sign: 0 | 1 | -1;
}

/**
 * The raw template input received by TemplateTool as the `opts` argument.
 * This covers all callers: TemplateDialog, AbbreviationLookup, TemplatesList, etc.
 *
 * Only properties accessed inside template.ts are declared here; additional
 * properties on the passed object are ignored (TypeScript structural typing
 * allows callers to pass richer objects such as `Template` from TemplateTable).
 */
export interface TemplateToolInput {
  struct: Struct;
  /** Attachment-atom id override (string or number from SDF; falls back to SGroup attachment). */
  aid?: string | number;
  /** Attachment-bond id override (string or number from SDF). */
  bid?: string | number;
  mode?: string;
  props?: {
    /** Template group name (e.g. "Functional Groups", "Salts and Solvents"). */
    group?: string;
  };
}

/**
 * Merge-items map returned by `getItemsToFuse` / `closestToMerge`.
 */
export type MergeItems = {
  atoms: Map<number, number>;
  bonds: Map<number, number>;
  atomToFunctionalGroup: Map<number, number>;
} | null;

/**
 * Drag context stored during a mouse-drag sequence in TemplateTool.
 */
export interface DragContext {
  xy0: Vec2;
  item?: ClosestItemWithMap | null;
  /** Sign of the bond relative to the molecule (+1 or -1). 0 until set in mousedown. */
  sign1: 0 | 1 | -1;
  /** Sign of the bond relative to the template (+1 or -1). 0 until set in mousedown. */
  sign2: 0 | 1 | -1;
  action?: Action | null;
  mergeItems?: MergeItems;
  angle?: number;
  extra_bond?: boolean | null;
}
