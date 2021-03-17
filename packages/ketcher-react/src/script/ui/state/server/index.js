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

import { omit, without } from 'lodash/fp'
import { Pool } from 'ketcher-core'

import molfile from '../../../chem/molfile'

import { setStruct, appUpdate } from '../options'
import { checkErrors } from '../modal/form'
import { load } from '../shared'
import { indigoVerification } from '../request'

export function checkServer() {
  return (dispatch, getState) => {
    const server = getState().server

    server.then(
      res =>
        dispatch(
          appUpdate({
            indigoVersion: res?.indigoVersion,
            imagoVersions: res?.imagoVersions,
            server: res?.isAvailable
          })
        ),
      err => console.info(err)
      // TODO: notification info
    )
  }
}

export function recognize(file, version) {
  return (dispatch, getState) => {
    const rec = getState().server.recognize

    const process = rec(file, version).then(
      res => {
        dispatch(setStruct(res.struct))
      },
      () => {
        dispatch(setStruct(null))
        //TODO: add error handler call
        //legacy message: The picture isn't recognized
      }
    )
    dispatch(setStruct(process))
  }
}

function ketcherCheck(struct, checkParams) {
  const errors = {}

  if (checkParams.includes('chiral_flag')) {
    const isAbs = Array.from(struct.frags.values()).some(fr =>
      fr ? fr.enhancedStereoFlag === 'abs' : false
    )
    if (isAbs) errors['chiral_flag'] = 'Chiral flag is present on the canvas'
  }

  if (checkParams.includes('valence')) {
    let badVal = 0
    struct.atoms.forEach(atom => atom.badConn && badVal++)
    if (badVal > 0)
      errors['valence'] = `Structure contains ${badVal} atom${
        badVal !== 1 ? 's' : ''
      } with bad valence`
  }

  return errors
}

export function check(optsTypes) {
  return (dispatch, getState) => {
    const { editor, server } = getState()
    const ketcherErrors = ketcherCheck(editor.struct(), optsTypes)

    const options = getState().options.getServerSettings()
    options.data = { types: without(['valence', 'chiral_flag'], optsTypes) }

    return serverCall(editor, server, 'check', options)
      .then(res => {
        res = Object.assign(res, ketcherErrors) // merge Indigo check with Ketcher check
        dispatch(checkErrors(res))
      })
      .catch(e => {
        //TODO: add error handler call
        //legacy message: Failed check
      })
    // TODO: notification
  }
}

export function automap(res) {
  return serverTransform('automap', res)
}

export function analyse() {
  return (dispatch, getState) => {
    const { editor, server } = getState()
    const options = getState().options.getServerSettings()
    options.data = {
      properties: [
        'molecular-weight',
        'most-abundant-mass',
        'monoisotopic-mass',
        'gross',
        'mass-composition'
      ]
    }

    return serverCall(editor, server, 'calculate', options)
      .then(values =>
        dispatch({
          type: 'CHANGE_ANALYSE',
          data: { values }
        })
      )
      .catch(e => {
        //TODO: add error handler call
        throw e
      }) // eslint-disable-line no-undef
    // TODO: notification
  }
}

export function serverTransform(method, data, struct) {
  return (dispatch, getState) => {
    const state = getState()
    const opts = state.options.getServerSettings()
    opts.data = data
    dispatch(indigoVerification(true))

    serverCall(state.editor, state.server, method, opts, struct)
      .then(res =>
        dispatch(
          load(res.struct, {
            rescale: method === 'layout',
            reactionRelayout: method === 'clean'
          })
        )
      )
      .catch(e => {
        //TODO: add error handler call
      })
      .finally(() => {
        dispatch(indigoVerification(false))
      })
    // TODO: notification
  }
}

export function serverCall(editor, server, method, options, struct) {
  const selection = editor.selection()
  let selectedAtoms = []
  const aidMap = new Map()
  const currentStruct = (struct || editor.struct()).clone(
    null,
    null,
    false,
    aidMap
  )
  if (selection) {
    selectedAtoms = (selection.atoms
      ? selection.atoms
      : editor.explicitSelected().atoms
    ).map(aid => aidMap.get(aid))

    if (currentStruct.hasRxnArrow()) {
      const components = currentStruct.getComponents()
      const reindexMap = getReindexMap(components)
      selectedAtoms = selectedAtoms.map(aid => reindexMap.get(aid))
    }
  }

  return server.then(() =>
    server[method](
      Object.assign(
        {
          struct: molfile.stringify(currentStruct, { ignoreErrors: true })
        },
        selectedAtoms && selectedAtoms.length > 0
          ? {
              selected: selectedAtoms
            }
          : null,
        options.data
      ),
      omit('data', options)
    )
  )
}

function getReindexMap(components) {
  const map = [...components.reactants, ...components.products]
    .reduce((acc, set) => {
      acc = [...acc, ...set]
      return acc
    }, [])
    .reduce((acc, aid, index) => {
      acc.set(aid, index)
      return acc
    }, new Map())

  return map
}
