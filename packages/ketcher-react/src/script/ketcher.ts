/****************************************************************************
 * Copyright 2018 EPAM Systems
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
import {
  FormatterFactory,
  StructService,
  SupportedFormat,
  Struct
} from 'ketcher-core'
import { isEqual } from 'lodash/fp'
import molfile, { MolfileFormat } from './chem/molfile'
import Editor from './editor'
import Render from './render'

interface UI {
  load: (structStr: string | null, options?: any) => undefined
  loadStruct: (struct: Struct) => any
}

function getStructureAsync(
  structureFormat: SupportedFormat = 'rxn',
  formatterFactory: FormatterFactory,
  struct: Struct
): Promise<string> {
  const formatter = formatterFactory.create(structureFormat)
  return formatter.getStructureFromStructAsync(struct)
}

class Ketcher {
  private origin = null

  constructor(
    readonly editor: Editor,
    readonly server: StructService, // todo: remove
    readonly ui: UI,
    private readonly formatterFactory: FormatterFactory
  ) {}

  getSmilesAsync(isExtended: boolean = false): Promise<string> {
    const format: SupportedFormat = isExtended ? 'smilesExt' : 'smiles'
    return getStructureAsync(
      format,
      this.formatterFactory,
      this.editor.struct()
    )
  }

  getMolfileAsync(molfileFormat: MolfileFormat = 'v2000'): Promise<string> {
    if (this.containsReaction()) {
      throw Error(
        'The structure cannot be saved as *.MOL due to reaction arrrows.'
      )
    }
    const format: SupportedFormat =
      molfileFormat === 'v3000' ? 'molV3000' : 'mol'
    return getStructureAsync(
      format,
      this.formatterFactory,
      this.editor.struct()
    )
  }

  getGraphAsync(): Promise<string> {
    return getStructureAsync(
      'graph',
      this.formatterFactory,
      this.editor.struct()
    )
  }

  containsReaction(): boolean {
    return this.editor.struct().hasRxnArrow()
  }

  getRxnAsync(molfileFormat: MolfileFormat = 'v2000'): Promise<string> {
    if (!this.containsReaction()) {
      throw Error(
        'The structure cannot be saved as *.RXN: there is no reaction arrows.'
      )
    }
    const format: SupportedFormat =
      molfileFormat === 'v3000' ? 'rxnV3000' : 'rxn'
    return getStructureAsync(
      format,
      this.formatterFactory,
      this.editor.struct()
    )
  }

  setMolecule(molString: string): void {
    if (typeof molString !== 'string') return
    this.ui.load(molString, {
      rescale: true
    })
  }

  addFragment(molString: string): void {
    if (typeof molString !== 'string') return
    this.ui.load(molString, {
      rescale: true,
      fragment: true
    })
  }

  showMolfile(clientArea: any, molString: string, options: any): Render {
    const render = new Render(
      clientArea,
      Object.assign(
        {
          scale: options.bondLength || 75
        },
        options
      )
    )
    if (molString) {
      const mol = molfile.parse(molString)
      render.setMolecule(mol)
    }
    render.update()
    // not sure we need to expose guts
    return render
  }

  isDirty(): boolean {
    const position = this.editor.historyPtr
    const length = this.editor.historyStack.length
    if (!length || !this.origin) {
      return false
    }
    return !isEqual(this.editor.historyStack[position - 1], this.origin)
  }

  setOrigin(): void {
    const position = this.editor.historyPtr
    this.origin = position ? this.editor.historyStack[position - 1] : null
  }

  generatePngAsync(...args: any): Promise<any> {
    return this.server.generatePngAsBase64
      .apply(null, args)
      .then(base64 =>
        fetch(`data:image/png;base64,${base64}`).then(response =>
          response.blob()
        )
      )
  }
}

export type { UI }
export { Ketcher }
