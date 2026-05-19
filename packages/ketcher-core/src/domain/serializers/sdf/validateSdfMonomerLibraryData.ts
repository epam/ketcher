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

const FIELD_HEADER_RE = /^\s*>\s*</;
const TYPE_FIELD_RE = /^\s*>\s*<type>\s*$/;
const MODIFICATION_TYPES_FIELD_RE = /^\s*>\s*<modificationTypes>\s*$/;
const NAME_FIELD_RE = /^\s*>\s*<name>\s*$/;

type CollectingField = 'type' | 'modificationTypes' | 'name';

function sanitizeMonomerName(raw: string): string {
  return raw.slice(0, 64).replace(/[^\w.\-]/g, '_');
}

/**
 * Validates SDF monomer library data, ensuring that no monomerTemplate record
 * has an empty `modificationTypes` field.
 *
 * @throws {Error} If a monomerTemplate record has a defined but empty
 *   `modificationTypes` value.
 */
export function validateSdfMonomerLibraryData(sdfData: string): void {
  const records = sdfData.split(/\${4}/);

  for (const record of records) {
    if (!record.trim()) continue;

    const lines = record.split(/\r?\n/);

    // Single pass: collect 'type', 'modificationTypes', and 'name' field values
    let typeValue: string | undefined;
    let modificationTypesValue: string | undefined;
    let nameValue: string | undefined;
    let collecting: CollectingField | null = null;
    let valueLines: string[] = [];

    for (const line of lines) {
      if (collecting) {
        if (FIELD_HEADER_RE.test(line)) {
          const joined = valueLines.join('\n').trim();
          if (collecting === 'type') {
            typeValue = joined;
          } else if (collecting === 'modificationTypes') {
            modificationTypesValue = joined;
          } else {
            nameValue = joined;
          }
          // Check if this new header is one we care about
          if (typeValue === undefined && TYPE_FIELD_RE.test(line)) {
            collecting = 'type';
            valueLines = [];
          } else if (
            modificationTypesValue === undefined &&
            MODIFICATION_TYPES_FIELD_RE.test(line)
          ) {
            collecting = 'modificationTypes';
            valueLines = [];
          } else if (nameValue === undefined && NAME_FIELD_RE.test(line)) {
            collecting = 'name';
            valueLines = [];
          } else {
            collecting = null;
            valueLines = [];
          }
        } else {
          valueLines.push(line);
        }
      } else if (typeValue === undefined && TYPE_FIELD_RE.test(line)) {
        collecting = 'type';
        valueLines = [];
      } else if (
        modificationTypesValue === undefined &&
        MODIFICATION_TYPES_FIELD_RE.test(line)
      ) {
        collecting = 'modificationTypes';
        valueLines = [];
      } else if (nameValue === undefined && NAME_FIELD_RE.test(line)) {
        collecting = 'name';
        valueLines = [];
      }
      // Early exit if all fields are found
      if (
        typeValue !== undefined &&
        modificationTypesValue !== undefined &&
        nameValue !== undefined
      ) {
        break;
      }
    }

    // Flush any field still being collected at end of record
    if (collecting) {
      const joined = valueLines.join('\n').trim();
      if (collecting === 'type') {
        typeValue = joined;
      } else if (collecting === 'modificationTypes') {
        modificationTypesValue = joined;
      } else {
        nameValue = joined;
      }
    }

    if (typeValue !== 'monomerTemplate') continue;
    if (modificationTypesValue === undefined) continue;

    if (!modificationTypesValue) {
      const templateMatch = record.match(
        /M\s+V30\s+TEMPLATE\s+\d+\s+\S+\/([^/\s]+)\//,
      );
      const rawName =
        nameValue || (templateMatch ? templateMatch[1] : undefined);
      const monomerName = rawName ? sanitizeMonomerName(rawName) : 'unknown';
      throw new Error(
        `Load of "${monomerName}" monomer has failed, monomer definition contains invalid modificationTypes value. The modificationTypes couldn't be empty`,
      );
    }
  }
}
