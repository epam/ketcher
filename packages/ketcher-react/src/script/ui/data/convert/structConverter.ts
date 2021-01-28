/****************************************************************************
 * Copyright 2020 EPAM Systems
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
import { SupportedFormat, getPropertiesByFormat } from 'ketcher-core'

export function couldBeSaved(
  struct: any,
  format: SupportedFormat
): string | null {
  let warnings: Array<string> = []
  const formatName: string = getPropertiesByFormat(format).name
  if (
    ([
      'inChI',
      'inChIAuxInfo',
      'smiles',
      'smilesExt'
    ] as SupportedFormat[]).includes(format)
  ) {
    if (struct.rgroups.size !== 0)
      warnings.push(
        `In ${formatName} the structure will be saved without R-group fragments`
      )

    struct = struct.clone() // need this: .getScaffold()
    // @ts-ignore
    const isRg = struct.atoms.find((ind, atom) => atom.label === 'R#')
    if (isRg !== null)
      warnings.push(
        `In ${formatName} the structure will be saved without R-group members`
      )

    const isSg = struct.sgroups.find(
      // @ts-ignore
      (ind, sg) =>
        sg.type !== 'MUL' && !/^INDIGO_.+_DESC$/i.test(sg.data.fieldName)
    )
    if (isSg !== null)
      warnings.push(
        `In ${formatName} the structure will be saved without S-groups`
      )
  }

  if (
    ([
      'smiles',
      'smilesExt',
      'smarts',
      'inChI',
      'inChIAuxInfo',
      'cml'
    ] as SupportedFormat[]).includes(format)
  ) {
    // @ts-ignore
    const isVal = struct.atoms.find((ind, atom) => atom.explicitValence >= 0)
    if (isVal !== null)
      warnings.push(`In ${formatName} valence is not supported`)
  }

  if (warnings.length !== 0) return warnings.join('\n')

  return null
}
