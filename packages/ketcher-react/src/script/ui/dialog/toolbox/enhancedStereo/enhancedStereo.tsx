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

import Form, { Field } from '../../../component/form/form/form'
import { StereoLabel, Struct } from 'ketcher-core'

import { Dialog } from '../../../views/components'
import { FC } from 'react'
import classes from './enhancedStereo.module.less'
import { connect } from 'react-redux'
import { range } from 'lodash'

interface EnhancedStereoResult {
  andNumber: number
  orNumber: number
  type: StereoLabel
}

interface EnhancedStereoFormState {
  result: EnhancedStereoResult
  valid: boolean
  errors: string[]
}

interface EnhancedStereoProps {
  className: string
  init: EnhancedStereoResult & { init?: true }
  formState: EnhancedStereoFormState
  struct: Struct
}

interface EnhancedStereoCallProps {
  onCancel: () => void
  onOk: (res: any) => void
}

type Props = EnhancedStereoProps & EnhancedStereoCallProps

const EnhancedStereo: FC<Props> = (props) => {
  const { struct, formState, init, ...rest } = props
  const { result, valid } = formState

  const stereoLabels: Array<string> = findStereLabels(
    struct,
    Array.from(struct.atoms.keys())
  )

  const maxAnd: number = maxOfAnds(stereoLabels)
  const maxOr: number = maxOfOrs(stereoLabels)

  const enhancedStereoSchema = {
    title: 'Enhanced Stereo',
    type: 'object',
    properties: {
      type: {
        type: 'string'
      },
      andNumber: {
        type: 'integer'
      },
      orNumber: {
        type: 'integer'
      }
    }
  }

  return (
    <Dialog
      title="Enhanced Stereochemistry"
      className={classes.enhancedStereo}
      params={rest}
      result={() => result}
      valid={() => valid}
      withDivider
      buttons={['Cancel', 'OK']}
      buttonsNameMap={{ OK: 'Apply' }}
    >
      <Form schema={enhancedStereoSchema} init={init} {...formState}>
        <fieldset>
          <label>
            <Field
              name="type"
              labelPos={false}
              type="radio"
              value={StereoLabel.Abs}
              checked={result.type === StereoLabel.Abs}
            />
            ABS
          </label>
          {maxAnd !== 0 && (
            <label>
              <Field
                name="type"
                labelPos={false}
                type="radio"
                value={StereoLabel.And}
                checked={result.type === StereoLabel.And}
              />
              Add to AND
              <Field
                name="andNumber"
                schema={range(1, maxAnd + 1)}
                type="text"
                className={classes.labelGroupSelect}
              />
              Group
            </label>
          )}
          {maxOr !== 0 && (
            <label>
              <Field
                name="type"
                labelPos={false}
                type="radio"
                value={StereoLabel.Or}
                checked={result.type === StereoLabel.Or}
              />
              Add to OR
              <Field
                name="orNumber"
                schema={range(1, maxOr + 1)}
                type="text"
                className={classes.labelGroupSelect}
              />
              Group
            </label>
          )}
          <label>
            <Field
              name="type"
              labelPos={false}
              type="radio"
              value={`${StereoLabel.And}${maxAnd + 1}`}
              checked={result.type === `${StereoLabel.And}${maxAnd + 1}`}
            />
            Create new AND Group
          </label>
          <label>
            <Field
              name="type"
              labelPos={false}
              type="radio"
              value={`${StereoLabel.Or}${maxOr + 1}`}
              checked={result.type === `${StereoLabel.Or}${maxOr + 1}`}
            />
            Create new OR Group
          </label>
        </fieldset>
      </Form>
    </Dialog>
  )
}

// TODO: Move the function below to Struct class
function findStereLabels(struct, aids): Array<string> {
  const stereoIds = aids.filter(
    (aid) => struct.atoms.get(aid).stereoLabel !== null
  )
  return stereoIds.map((aid) => struct.atoms.get(aid).stereoLabel)
}

function maxOfAnds(stereLabels): number {
  const numbers = stereLabels.map((label) => {
    return label.match(/&/) ? +label.match(/\d+/)?.join() : 0
  })
  return Math.max(...numbers)
}

function maxOfOrs(stereLabels): number {
  const numbers = stereLabels.map((label) => {
    return label.match(/or/) ? +label.match(/\d+/)?.join() : 0
  })
  return Math.max(...numbers)
}

export default connect((state) => ({
  formState: (state as any).modal.form || { result: {}, valid: false },
  struct: (state as any).editor.struct()
}))(EnhancedStereo)
