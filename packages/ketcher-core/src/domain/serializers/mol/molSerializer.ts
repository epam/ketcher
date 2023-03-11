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

import { MolSerializerOptions } from './mol.types'
import { Molfile } from './molfile'
import { Serializer } from '../serializers.types'
import { Struct } from 'domain/entities'

export class MolSerializer implements Serializer<Struct> {
  static DefaultOptions: MolSerializerOptions = {
    badHeaderRecover: false,
    ignoreErrors: false,
    noRgroups: false,
    preserveIndigoDesc: false,
    reactionRelayout: false
  }

  readonly options: MolSerializerOptions

  constructor(options?: Partial<MolSerializerOptions>) {
    this.options = { ...MolSerializer.DefaultOptions, ...options }
  }

  deserialize(content: string): Struct {
    const molfile = new Molfile()
    const lines = content?.split(/\r\n|[\n\r]/g)

    const parseCTFileParams = {
      molfileLines: lines,
      shouldReactionRelayout: this.options.reactionRelayout,
      ignoreChiralFlag: this.options.ignoreChiralFlag
    }

    try {
      return molfile.parseCTFile(parseCTFileParams)
    } catch (ex) {
      if (this.options.badHeaderRecover) {
        try {
          // check whether there's an extra empty line on top
          // this often happens when molfile text is pasted into the dialog window
          return molfile.parseCTFile({
            ...parseCTFileParams,
            molfileLines: lines.slice(1)
          })
        } catch (ex1) {
          //
        }
        try {
          // check for a missing first line
          // this sometimes happens when pasting
          return molfile.parseCTFile({
            ...parseCTFileParams,
            molfileLines: [''].concat(lines)
          })
        } catch (ex2) {
          //
        }
      }
      throw ex
    }
  }

  serialize(struct: Struct): string {
    return new Molfile().saveMolecule(
      struct,
      this.options.ignoreErrors,
      this.options.noRgroups,
      this.options.preserveIndigoDesc,
      this.options.ignoreChiralFlag
    )
  }
}
