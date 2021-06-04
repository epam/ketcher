import Form, { Field } from '../../component/form/form'
import { StereoLabel, Struct } from 'ketcher-core'

import { Dialog } from '../../views/components'
import React from 'react'
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

const EnhancedStereo: React.FC<Props> = props => {
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
      className="enhanced-stereo"
      params={rest}
      result={() => result}
      valid={() => valid}
      buttons={['Cancel', 'OK']}>
      <Form schema={enhancedStereoSchema} init={init} {...formState}>
        <fieldset>
          <label className="stereo-label-item">
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
            <label className="stereo-label-item">
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
                className="label-group-select"
              />
              Group
            </label>
          )}
          {maxOr !== 0 && (
            <label className="stereo-label-item">
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
                className="label-group-select"
              />
              Group
            </label>
          )}
          <label className="stereo-label-item">
            <Field
              name="type"
              labelPos={false}
              type="radio"
              value={`&${maxOr + 1}`}
            />
            Create new AND Group
          </label>
          <label className="stereo-label-item">
            <Field
              name="type"
              labelPos={false}
              type="radio"
              value={`or${maxOr + 1}`}
            />
            Create new OR Group
          </label>
        </fieldset>
      </Form>
    </Dialog>
  )
}

function findStereLabels(struct, aids): Array<string> {
  const stereoIds = aids.filter(
    aid => struct.atoms.get(aid).stereoLabel !== null
  )
  return stereoIds.map(aid => struct.atoms.get(aid).stereoLabel)
}

function maxOfAnds(stereLabels): number {
  const numbers = stereLabels.map(label => {
    return label.match(/&/) ? +label.match(/\d+/)?.join() : 0
  })
  return Math.max(...numbers)
}

function maxOfOrs(stereLabels): number {
  const numbers = stereLabels.map(label => {
    return label.match(/or/) ? +label.match(/\d+/)?.join() : 0
  })
  return Math.max(...numbers)
}

export default connect(state => ({
  formState: state.modal.form || { result: {}, valid: false },
  struct: state.editor.struct()
}))(EnhancedStereo)
