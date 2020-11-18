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

import 'core-js/stable'
import 'regenerator-runtime/runtime'
import 'whatwg-fetch'

import api from './api'
import molfile from './chem/molfile'
import smiles from './chem/smiles'
import * as structformat from './ui/data/convert/structformat'

import ui from './ui'
import Render from './render'
import graph from './format/chemGraph'

function getSmiles() {
  return smiles.stringify(ketcher.editor.struct(), { ignoreErrors: true })
}

function saveSmiles() {
  const struct = ketcher.editor.struct()
  return structformat
    .toString(struct, 'smiles-ext', ketcher.server)
    .catch(() => smiles.stringify(struct))
}

function getMolfile() {
  return molfile.stringify(ketcher.editor.struct(), { ignoreErrors: true })
}

function setMolecule(molString) {
  if (!(typeof molString === 'string')) return
  ketcher.ui.load(molString, {
    rescale: true
  })
}

function addFragment(molString) {
  if (!(typeof molString === 'string')) return
  ketcher.ui.load(molString, {
    rescale: true,
    fragment: true
  })
}

function showMolfile(clientArea, molString, options) {
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

// TODO: replace window.onload with something like <https://github.com/ded/domready>
// to start early
export default function init(el, staticResourcesUrl, apiPath) {
  ketcher.apiPath = apiPath
  const params = new URLSearchParams(document.location.search)
  if (params.has('api_path')) ketcher.apiPath = params.get('api_path')
  ketcher.server = api(ketcher.apiPath, {
    'smart-layout': true,
    'ignore-stereochemistry-errors': true,
    'mass-skip-error-on-pseudoatoms': false,
    'gross-formula-add-rsites': true
  })
  ketcher.ui = ui(
    el,
    staticResourcesUrl,
    Object.assign({}, params, buildInfo),
    ketcher.server
  )
  ketcher.server.then(
    () => {
      if (params.mol) ketcher.ui.load(params.mol)
    },
    () => {
      document.title += ' (standalone)'
    }
  )
}

const buildInfo = {
  version: process.env.VERSION,
  buildDate: process.env.BUILD_DATE,
  buildNumber: process.env.BUILD_NUMBER || null
}

import validateGraphF from './format/graphValidator' // eslint-disable-line

const ketcher = Object.assign(
  {
    // eslint-disable-line no-multi-assign
    getSmiles,
    saveSmiles,
    getMolfile,
    setMolecule,
    addFragment,
    showMolfile,

    // TODO: remove it
    toGraph: () => {
      const j = graph.toGraph(ketcher.editor.render.ctab.molecule)
      validateGraphF(j)
      return j
    },
    fromGraph: () =>
      graph.fromGraph(graph.toGraph(ketcher.editor.render.ctab.molecule))
  },
  buildInfo
)

global.ketcher = ketcher
