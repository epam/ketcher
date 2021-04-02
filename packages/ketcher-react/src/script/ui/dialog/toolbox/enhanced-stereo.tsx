import React from 'react'
import { connect } from 'react-redux'

import { Dialog } from '../../views/components'
import Form, { Field } from '../../component/form/form'
import { DefaultStereoGroup, StereoLabel } from './stereo-label.enum'

const enhancedStereoSchema = {
  title: 'Enhanced Stereo',
  type: 'object',
  properties: {
    type: {
      title: 'Stereo Label',
      enum: [
        StereoLabel.abs,
        `${StereoLabel.and}${DefaultStereoGroup.One}`,
        `${StereoLabel.and}${DefaultStereoGroup.Two}`,
        StereoLabel.and,
        `${StereoLabel.or}${DefaultStereoGroup.One}`,
        `${StereoLabel.or}${DefaultStereoGroup.Two}`,
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

interface FieldSetProps {
  name: string
  schema: any
  value: string
  onChange: (value: string) => void
  type?: string
}

const FieldSet: React.FC<FieldSetProps> = props => {
  const { schema, value, onChange, type = 'radio', ...rest } = props

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
