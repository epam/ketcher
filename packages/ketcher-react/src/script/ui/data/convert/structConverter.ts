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

import molfile from '../../../chem/molfile'
import smiles from '../../../chem/smiles'
import graph from '../../../format/chemGraph'
import { getPropertiesByFormat, SupportedFormat } from './struct.types'

function guess(structStr: string): SupportedFormat {
  // Mimic Indigo/molecule_auto_loader.cpp as much as possible
  const molStr = structStr.trim()

  try {
    if (JSON.parse(molStr)) return SupportedFormat.Graph
  } catch (er) {} // eslint-disable-line

  if (molStr.indexOf('$RXN') !== -1) return SupportedFormat.Rxn

  const molMatch = molStr.match(/^(M {2}END|\$END MOL)$/m)

  if (molMatch) {
    const end = (molMatch.index || 0) + molMatch[0].length
    if (
      end === molStr.length ||
      molStr.slice(end, end + 20).search(/^\$(MOL|END CTAB)$/m) !== -1
    )
      return SupportedFormat.Mol
  }
  if (molStr[0] === '<' && molStr.indexOf('<molecule') !== -1)
    return SupportedFormat.CML

  if (molStr.slice(0, 5) === 'InChI') return SupportedFormat.InChI

  if (molStr.indexOf('\n') === -1)
    // TODO: smiles regexp
    return SupportedFormat.Smiles

  // Molfile by default as Indigo does
  return SupportedFormat.Mol
}

export function toString(
  struct: any,
  format: SupportedFormat,
  server: any,
  serverOpts?: any
) {
  let formatProperties = getPropertiesByFormat(format)
  console.assert(formatProperties, 'No such format')
  if (format === SupportedFormat.Graph) {
    const res = graph.toGraph(struct)
    return Promise.resolve(JSON.stringify(res, null, 4))
  }

  return new Promise(resolve => {
    const moldata = molfile.stringify(struct)
    switch (format) {
      case SupportedFormat.Mol:
      case SupportedFormat.Rxn:
        resolve(moldata)
        break
      case SupportedFormat.Smiles:
        resolve(smiles.stringify(struct))
        break
      default:
        const converting = server
          .then(() =>
            server.convert(
              {
                struct: moldata,
                output_format: formatProperties.mime
              },
              { ...serverOpts, ...formatProperties.options }
            )
          )
          .catch(err => {
            throw err.message === 'Server is not compatible'
              ? Error(
                  `${formatProperties.name} is not supported in standalone mode.`
                )
              : Error(`Convert error!\n${err.message}`)
          })
          .then(res => res.struct)
        resolve(converting)
    }
  })
}

export function fromString(
  struct: string,
  opts: any,
  server: any,
  serverOpts: any
): Promise<any> {
  return new Promise(resolve => {
    const format = guess(struct)
    const formatProperties = getPropertiesByFormat(format)
    console.assert(formatProperties, 'No such format')
    if (format === SupportedFormat.Graph) {
      resolve(graph.fromGraph(JSON.parse(struct)))
    } else if (
      (format === SupportedFormat.Mol && molfile.version(struct) === 'V2000') ||
      format === SupportedFormat.Rxn
    ) {
      resolve(molfile.parse(struct, opts))
    } else {
      const withCoords = getPropertiesByFormat(format).supportsCoords
      const converting = server
        .then(() =>
          withCoords
            ? server.convert(
                {
                  struct: struct,
                  output_format: getPropertiesByFormat(SupportedFormat.Mol).mime
                },
                serverOpts
              )
            : server.layout(
                {
                  struct: struct.trim(),
                  output_format: getPropertiesByFormat(SupportedFormat.Mol).mime
                },
                serverOpts
              )
        )
        .catch(err => {
          if (err.message === 'Server is not compatible') {
            const formatError =
              format === SupportedFormat.Smiles
                ? `${
                    getPropertiesByFormat(SupportedFormat.SmilesExt).name
                  } and opening of ${
                    getPropertiesByFormat(SupportedFormat.Smiles).name
                  }`
                : getPropertiesByFormat(format).name
            throw Error(`${formatError} is not supported in standalone mode.`)
          } else {
            throw Error(`Convert error!\n${err.message}`)
          }
        })
        .then(res => {
          const parsedStruct = molfile.parse(res.struct)
          if (!withCoords) parsedStruct.rescale()
          return parsedStruct
        })
      resolve(converting)
    }
  })
}

export function couldBeSaved(
  struct: any,
  format: SupportedFormat
): string | null {
  let warnings: Array<string> = []
  const formatName: string = getPropertiesByFormat(format).name
  if (
    [
      SupportedFormat.InChI,
      SupportedFormat.InChIAuxInfo,
      SupportedFormat.Smiles,
      SupportedFormat.SmilesExt
    ].includes(format)
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
    [
      SupportedFormat.Smiles,
      SupportedFormat.SmilesExt,
      SupportedFormat.Smarts,
      SupportedFormat.InChI,
      SupportedFormat.InChIAuxInfo,
      SupportedFormat.CML
    ].includes(format)
  ) {
    // @ts-ignore
    const isVal = struct.atoms.find((ind, atom) => atom.explicitValence >= 0)
    if (isVal !== null)
      warnings.push(`In ${formatName} valence is not supported`)
  }

  if (warnings.length !== 0) return warnings.join('\n')

  return null
}
