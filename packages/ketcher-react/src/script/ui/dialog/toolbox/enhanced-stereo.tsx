import React from 'react'
import { connect } from 'react-redux'

import { Dialog } from '../../views/components'
import Form, { Field } from '../../component/form/form'

export enum StereoLabel {
  abs = 'abs',
  and = '&',
  or = 'or'
}

const enhancedStereoSchema = {
  title: 'Enhanced Stereo',
  type: 'object',
  properties: {
    type: {
      title: 'Stereo Label',
      enum: [
        StereoLabel.abs,
        `${StereoLabel.and}1`,
        `${StereoLabel.and}2`,
        StereoLabel.and,
        `${StereoLabel.or}1`,
        `${StereoLabel.or}2`,
        StereoLabel.or
      ],
      enumNames: ['ABS', 'AND1', 'AND2', 'AND...', 'OR1', 'OR2', 'OR...']
    },
    andNumber: {
      type: 'integer',
      minimum: 0,
      invalidMessage: 'Only positive integer'
    },
    orNumber: {
      type: 'integer',
      minimum: 0,
      invalidMessage: 'Only positive integer'
    }
  }
}

interface EnhancedStereoProps {
  className: string
  init: EnhancedStereoResult & { init?: true }
  formState: any
}

interface EnhancedStereoResult {
  andNumber: number
  orNumber: number
  type: StereoLabel
}

interface EnhancedStereoCallProps {
  onCancel: () => void
  onOk: (res: any) => void
}

type Props = EnhancedStereoProps & EnhancedStereoCallProps

const EnhancedStereo: React.FC<Props> = props => {
  const { formState, init, ...rest } = props
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
        <Field name="type" component={FieldSet} labelPos={false} />
      </Form>
    </Dialog>
  )
}

function FieldSet({ schema, value, onChange, type = 'radio', ...rest }) {
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
          {val === StereoLabel.and && (
            <Field
              name="andNumber"
              type="text"
              className="label-group-value"
              disabled={!value || value !== StereoLabel.and || value === null}
            />
          )}
          {val === StereoLabel.or && (
            <Field
              name="orNumber"
              type="text"
              className="label-group-value"
              disabled={!value || value !== StereoLabel.or || value === null}
            />
          )}
        </li>
      ))}
    </fieldset>
  )
}

export default connect(store => ({
  formState: store.modal.form || { result: {}, valid: false }
}))(EnhancedStereo)
