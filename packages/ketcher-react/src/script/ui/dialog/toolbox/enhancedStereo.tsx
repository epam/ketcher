import React from 'react'
import { connect } from 'react-redux'

import { Dialog } from '../../views/components'
import Form, { Field } from '../../component/form/form'
import { StereoLabel } from 'ketcher-core'

import { findStereoAtoms } from '../../../editor/actions/utils'

function findStereLabels(struct, aids): Array<string> {
  const stereoaids = findStereoAtoms(struct, aids)
  return stereoaids.map(aid => struct.atoms.get(aid).stereoLabel)
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

const enhancedStereoSchema = {
  title: 'Enhanced Stereo',
  type: 'object',
  properties: {
    type: {
      title: 'Stereo Label',
      enum: [StereoLabel.Abs, StereoLabel.And, StereoLabel.Or],
      enumNames: ['ABS', 'AND', 'OR']
    },
    andNumber: {
      type: 'integer'
    },
    orNumber: {
      type: 'integer'
    }
  }
}

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
  struct: any
}

interface EnhancedStereoCallProps {
  onCancel: () => void
  onOk: (res: any) => void
}

type Props = EnhancedStereoProps & EnhancedStereoCallProps

const EnhancedStereo: React.FC<Props> = props => {
  const { struct, formState, init, ...rest } = props
  const { result, valid } = formState

  return (
    <Dialog
      title="Enhanced Stereochemistry"
      className="enhanced-stereo"
      params={rest}
      result={() => result}
      valid={() => valid}
      buttons={['OK', 'Close']}>
      <Form schema={enhancedStereoSchema} init={init} {...formState}>
        <Field
          name="type"
          component={FieldSet}
          struct={struct}
          labelPos={false}
        />
      </Form>
    </Dialog>
  )
}

interface FieldSetProps {
  name: string
  schema: any
  value: StereoLabel
  onChange: (value: string) => void
  type?: string
  struct: any
}

const FieldSet: React.FC<FieldSetProps> = props => {
  const { struct, schema, value, onChange, type = 'radio', ...rest } = props

  const stereoLabels: Array<string> = findStereLabels(
    struct,
    Array.from(struct.atoms.keys())
  )

  const maxAnd: number = maxOfAnds(stereoLabels)
  const maxOr: number = maxOfOrs(stereoLabels)

  return (
    <fieldset>
      {schema.enum.map((val, index) => (
        <li key={schema.enumNames[index]} className="stereo-label-item">
          <label className="stereo-label-name">
            <input
              type={type}
              checked={val === value}
              value={val}
              onChange={() => onChange(val)}
              {...rest}
            />
            {schema.enumNames[index]}
          </label>
          {val === StereoLabel.And && (
            <Field
              name="andNumber"
              schema={[...Array(maxAnd + 1)].map((_e, i) => i + 1)}
              type="text"
              className="label-group-select"
            />
          )}
          {val === StereoLabel.Or && (
            <Field
              name="orNumber"
              schema={[...Array(maxOr + 1)].map((_e, i) => i + 1)}
              type="text"
              className="label-group-select"
            />
          )}
        </li>
      ))}
    </fieldset>
  )
}

export default connect(state => ({
  formState: state.modal.form || { result: {}, valid: false },
  struct: state.editor.struct()
}))(EnhancedStereo)
