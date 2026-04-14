/*******************************************************************************
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
 ******************************************************************************/

import { IKetAttachmentPoint, IKetTemplateConnection, MonomerItemType } from 'ketcher-core';
import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';

/**
 * Given a monomer item returns its full list of attachment points.
 */
export function getMonomerAttachmentPoints(
  monomer: MonomerItemType | undefined | null,
): IKetAttachmentPoint[] {
  if (!monomer || !monomer.attachmentPoints) return [];
  return monomer.attachmentPoints;
}

/**
 * Returns the set of attachment-point labels that are already occupied
 * by preset internal connections (e.g. sugar-base or sugar-phosphate).
 *
 * A connection references: `{ firstMonomerRef, firstAttachmentPointRef,
 *                              secondMonomerRef, secondAttachmentPointRef }`
 * See IKetTemplateConnection for the full shape.
 */
function getOccupiedAttachmentPoints(
  connections: IKetTemplateConnection[] | undefined,
): Set<string> {
  const occupied = new Set<string>();
  if (!connections) return occupied;

  for (const conn of connections) {
    if (conn.firstAttachmentPointRef) {
      occupied.add(`${conn.firstMonomerRef}:${conn.firstAttachmentPointRef}`);
    }
    if (conn.secondAttachmentPointRef) {
      occupied.add(`${conn.secondMonomerRef}:${conn.secondAttachmentPointRef}`);
    }
  }

  return occupied;
}

/**
 * Collects all attachment points from the preset components that are
 * *not* already consumed by an internal preset connection.
 *
 * These are the APs that should appear on the *Preset* tab.
 */
export function getPresetFreeAttachmentPoints(
  preset: IRnaPreset | null | undefined,
): IKetAttachmentPoint[] {
  if (!preset) return [];

  const occupied = getOccupiedAttachmentPoints(preset.connections);
  const result: IKetAttachmentPoint[] = [];

  const components: Array<{ monomer: MonomerItemType | undefined; ref: string }> = [
    { monomer: preset.sugar, ref: 'sugar' },
    { monomer: preset.base, ref: 'base' },
    { monomer: preset.phosphate, ref: 'phosphate' },
  ];

  for (const { monomer, ref } of components) {
    if (!monomer || !monomer.attachmentPoints) continue;
    for (const ap of monomer.attachmentPoints) {
      const key = `${ref}:${ap.point}`;
      if (!occupied.has(key)) {
        result.push(ap);
      }
    }
  }

  return result;
}
