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

import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { AttachmentPointName, MonomerOrAmbiguousType } from 'domain/types';

/**
 * Extracts attachment point names from a monomer library item.
 *
 * @param item - The library monomer item to extract attachment points from
 * @returns Array of attachment point names (e.g., ['R1', 'R2', 'R3'])
 */
export function getAttachmentPointNames(
  item: MonomerOrAmbiguousType,
): AttachmentPointName[] {
  if (!item) {
    return [];
  }

  const attachmentPoints: AttachmentPointName[] = [];

  // Method 1: Check top-level attachmentPoints array
  // Use same logic as BaseMonomer.getAttachmentPointDictFromMonomerDefinition
  if (
    'attachmentPoints' in item &&
    item.attachmentPoints &&
    Array.isArray(item.attachmentPoints)
  ) {
    const attachmentPointDictionary = {};
    item.attachmentPoints.forEach((attachmentPoint, attachmentPointIndex) => {
      const attachmentPointNumber = attachmentPointIndex + 1;
      let calculatedAttachmentPointNumber: number;

      if (attachmentPoint.type) {
        if (attachmentPoint.type === 'left') {
          calculatedAttachmentPointNumber = 1;
        } else if (attachmentPoint.type === 'right') {
          calculatedAttachmentPointNumber = 2;
        } else if (attachmentPoint.type === 'side') {
          calculatedAttachmentPointNumber =
            attachmentPointNumber +
            ('R1' in attachmentPointDictionary ? 0 : 1) +
            ('R2' in attachmentPointDictionary ? 0 : 1);
        } else {
          calculatedAttachmentPointNumber = attachmentPointNumber;
        }
      } else {
        calculatedAttachmentPointNumber = attachmentPointNumber;
      }

      const pointName =
        `R${calculatedAttachmentPointNumber}` as AttachmentPointName;
      attachmentPointDictionary[pointName] = null;
      if (!attachmentPoints.includes(pointName)) {
        attachmentPoints.push(pointName);
      }
    });
  }

  // Method 2: Check struct.rgroups (fallback for monomers without attachmentPoints array)
  if ('struct' in item && item.struct && 'rgroups' in item.struct) {
    const rgroups = item.struct.rgroups;
    if (rgroups) {
      // Handle both Map and plain object structures
      if (
        typeof rgroups.size === 'number' &&
        typeof rgroups.forEach === 'function'
      ) {
        // rgroups is a Map with keys like 1, 2, 3 corresponding to R1, R2, R3
        rgroups.forEach((_value: unknown, key: number) => {
          const pointName = `R${key}` as AttachmentPointName;
          if (!attachmentPoints.includes(pointName)) {
            attachmentPoints.push(pointName);
          }
        });
      } else if (typeof rgroups === 'object') {
        // rgroups is a plain object
        Object.keys(rgroups).forEach((key) => {
          const pointName = `R${key}` as AttachmentPointName;
          if (!attachmentPoints.includes(pointName)) {
            attachmentPoints.push(pointName);
          }
        });
      }
    }
  }

  return attachmentPoints;
}

/**
 * Validates whether a target monomer on the canvas can be replaced
 * by a library monomer item based on connection point compatibility.
 *
 * A replacement is valid if the replacement monomer has all the
 * attachment points that are currently connected (active) on the
 * target monomer. Unconnected attachment points on the target are ignored.
 *
 * @param targetMonomer - The existing monomer on canvas to be replaced
 * @param replacementItem - The library item to replace it with
 * @returns true if replacement is valid (all active attachment points match), false otherwise
 *
 * @example
 * // Target has R1, R2 active (connected), R3 unconnected
 * // Replacement has R1, R2, R4 available
 * // Result: true (all active points R1, R2 are available)
 *
 * @example
 * // Target has R1, R2 active
 * // Replacement has only R1 available
 * // Result: false (R2 is missing)
 *
 * @example
 * // Target has no active bonds (isolated monomer)
 * // Replacement has any attachment points
 * // Result: true (no constraints to validate)
 */
export function canReplaceMonomer(
  targetMonomer: BaseMonomer,
  replacementItem: MonomerOrAmbiguousType,
): boolean {
  // Step 1: Get active attachment points from target monomer
  // Active = attachment points that currently have bonds (not null)
  const activeAttachmentPoints = Object.entries(
    targetMonomer.attachmentPointsToBonds,
  )
    .filter(([_name, bond]) => bond !== null)
    .map(([name]) => name as AttachmentPointName);

  // Step 2: If no active bonds, any replacement is valid
  if (activeAttachmentPoints.length === 0) {
    return true;
  }

  // Step 3: Get available attachment points from replacement item
  const availableAttachmentPoints = getAttachmentPointNames(replacementItem);

  // Step 4: If we couldn't determine available attachment points,
  // REJECT the replacement (fail-safe: don't allow potentially invalid replacements)
  if (availableAttachmentPoints.length === 0) {
    return false;
  }

  // Step 5: Check that all active points are available in replacement
  return activeAttachmentPoints.every((point) =>
    availableAttachmentPoints.includes(point),
  );
}
