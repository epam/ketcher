import React from 'react'
import { connect } from 'react-redux'

import { Dialog } from '../../views/components'
import Form, { Field } from '../../component/form/form'
import { StereoLabel } from 'ketcher-core'

export const predefinedStereoGroups = {
  [StereoLabel.And]: {
    min: 1,
    max: 2
  },
  [StereoLabel.Or]: {
    min: 1,
    max: 2
  }
} as const

export function getPredefinedStereoLabels(stereoLabel: StereoLabel): string[] {
  const min = predefinedStereoGroups[stereoLabel].min
  const max = predefinedStereoGroups[stereoLabel].max

  return new Array(max - min + 1)
    .fill(null)
    .map((_, index) => stereoLabel + (min + index))
}

const enhancedStereoSchema = {
  title: 'Enhanced Stereo',
  type: 'object',
  properties: {
    type: {
      title: 'Stereo Label',
      enum: [
        StereoLabel.Abs,
        ...getPredefinedStereoLabels(StereoLabel.And),
        StereoLabel.And,
        ...getPredefinedStereoLabels(StereoLabel.Or),
        StereoLabel.Or
      ],
      enumNames: [
        'ABS',
        ...getPredefinedStereoLabels(StereoLabel.And).map(stereoLabel =>
          stereoLabel.replace(StereoLabel.And, 'AND')
        ),
        'AND...',
        ...getPredefinedStereoLabels(StereoLabel.Or).map(stereoLabel =>
          stereoLabel.toUpperCase()
        ),
        'OR...'
      ]
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
          {val === StereoLabel.And && (
            <Field
              name="andNumber"
              type="text"
              className="label-group-value"
              disabled={!value || value !== StereoLabel.And || value === null}
            />
          )}
          {val === StereoLabel.Or && (
            <Field
              name="orNumber"
              type="text"
              className="label-group-value"
              disabled={!value || value !== StereoLabel.Or || value === null}
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
