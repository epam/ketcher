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
import { Struct } from 'chemistry/entities'
import { Molfile } from '../Molfile'
import { Serializer } from './../serializers.types'
import { MolSerializerOptions } from './mol.types'

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
    try {
      return molfile.parseCTFile(lines, this.options.reactionRelayout)
    } catch (ex) {
      if (this.options.badHeaderRecover) {
        try {
          // check whether there's an extra empty line on top
          // this often happens when molfile text is pasted into the dialog window
          return molfile.parseCTFile(
            lines.slice(1),
            this.options.reactionRelayout
          )
        } catch (ex1) {
          //
        }
        try {
          // check for a missing first line
          // this sometimes happens when pasting
          return molfile.parseCTFile(
            [''].concat(lines),
            this.options.reactionRelayout
          )
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
      this.options.preserveIndigoDesc
    )
  }
}
