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
import molfile, { MolfileFormat } from './chem/molfile'
import smiles from './chem/smiles'
import Struct from './chem/struct'
import Editor from './editor'
import graph from './format/chemGraph'
import validateGraphF from './format/graphValidator'
import Render from './render'
import { SupportedFormat } from './ui/data/convert/struct.types'
import * as structConverter from './ui/data/convert/structConverter'
// @ts-ignore
import { ServiceMode } from 'ketcher-core'

export class Ketcher {
  // @ts-ignore
  editor: Editor
  server: any
  ui: any
  apiPath: any
  readonly buildInfo = {
    version: process.env.VERSION,
    buildDate: process.env.BUILD_DATE,
    buildNumber: process.env.BUILD_NUMBER
  }
  private origin = null
  private _editor: any

  static create(serviceMode: ServiceMode) {
    const ketcher = new Ketcher()
    ketcher[serviceMode] = true

    Object.defineProperty(ketcher, 'editor', {
      set: editor => {
        ketcher._editor = editor
        // todo: remove
        ;(global as any)._ui_editor = editor
      },
      get: () => {
        return ketcher._editor
      },
      enumerable: true,
      configurable: false
    })

    // todo: remove
    ;(global as any).ketcher = ketcher

    return ketcher
  }

  constructor() {
    Object.defineProperty(this, '_editor', {
      enumerable: false,
      configurable: false,
      writable: true
    })
  }

  getSmiles(): string {
    return smiles.stringify(this.editor.struct(), { ignoreErrors: true })
  }

  saveSmiles(): Promise<any> {
    const struct = this.editor.struct()
    return structConverter
      .toString(struct, SupportedFormat.SmilesExt, this.server)
      .catch(() => smiles.stringify(struct))
  }

  getMolfile(molfileFormat?: MolfileFormat): Promise<string> {
    const struct = this.editor.struct()
    const format =
      molfileFormat === 'v3000' ? SupportedFormat.MolV3000 : SupportedFormat.Mol

    return structConverter.toString(struct, format, this.server).catch(() => {
      throw new Error(
        `We can't create molfile with your format, because server is not available`
      )
    })
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

  toGraph(): any {
    const j = graph.toGraph(this.editor.render.ctab.molecule)
    validateGraphF(j)
    return j
  }

  fromGraph(): Struct {
    return graph.fromGraph(graph.toGraph(this.editor.render.ctab.molecule))
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
