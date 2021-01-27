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
import { isEqual } from 'lodash/fp'
import { Api } from './api'
import molfile, { MolfileFormat } from './chem/molfile'
import Struct from './chem/struct'
import Editor from './editor'
import { Graph } from './format/chemGraph'
import Render from './render'
import { StructureServiceFactory } from './services/structure'
import { SupportedFormat } from './ui/data/convert/struct.types'

interface UI {
  load: (structStr: string | null, options?: any) => undefined
  loadStruct: (struct: Struct) => any
}

interface BuildInfo {
  version: string
  buildDate: string
  buildNumber: string
}

class Ketcher {
  private origin = null

  constructor(
    readonly editor: Editor,
    readonly server: Api,
    readonly ui: UI,
    readonly buildInfo: BuildInfo,
    private readonly structureServiceFactory: StructureServiceFactory
  ) {}

  getStructureAsync(
    structureFormat: SupportedFormat = SupportedFormat.Rxn
  ): Promise<string> {
    const service = this.structureServiceFactory.create(structureFormat)
    return service.getStructureAsync()
  }

  getSmilesAsync(isExtended: boolean = false): Promise<string> {
    const format = isExtended
      ? SupportedFormat.SmilesExt
      : SupportedFormat.Smiles

    const service = this.structureServiceFactory.create(format)
    return service.getStructureAsync()
  }

  getMolfileAsync(molfileFormat: MolfileFormat = 'v2000'): Promise<string> {
    const format =
      molfileFormat === 'v3000' ? SupportedFormat.MolV3000 : SupportedFormat.Mol
    const service = this.structureServiceFactory.create(format)
    return service.getStructureAsync()
  }

  async getGraphAsync(): Promise<Graph> {
    const service = this.structureServiceFactory.create(SupportedFormat.Graph)
    return service.getStructureAsync()
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

  generatePng(...args: any): Promise<any> {
    return this.server.generatePngAsBase64
      .apply(null, args)
      .then(base64 =>
        fetch(`data:image/png;base64,${base64}`).then(response =>
          response.blob()
        )
      )
  }
}

export type { UI, BuildInfo }
export { Ketcher }
