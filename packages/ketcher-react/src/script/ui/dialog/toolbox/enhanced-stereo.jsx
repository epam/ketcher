import React from 'react'
import { connect } from 'react-redux'

import { Dialog } from '../../views/components'
import Form, { Field } from '../../component/form/form'

const enhancedStereoSchema = {
  title: 'Enhanced Stereo',
  type: 'object',
  oneOf: [
    {
      // Fragment stereo edit
      properties: {
        stereoFlag: {
          title: 'Stereo Flag',
          enum: ['and', 'or', 'abs'],
          enumNames: ['AND Enantiomer', 'OR Enantiomer', 'ABS (Chiral)']
        }
      }
    },
    {
      // Atoms stereo edit
      properties: {
        type: {
          title: 'Stereo Label',
          enum: ['and', 'or', 'abs', null],
          enumNames: [
            'AND Enantiomer',
            'OR Enantiomer',
            'ABS (Chiral)',
            '< Clear label >'
          ]
        },
        number: {
          title: 'Stereo Group',
          type: 'integer',
          minimum: 1,
          invalidMessage: 'Only positive integer'
        }
      }
    }
  ]
}

/**
 * @param type - Type of dialog = 'fragment' or 'atoms'
 * @param formState - State of Form from redux-store
 * @param init - First State of Form
 * @param ...props
 */
function EnhancedStereo({ type, formState, init, ...props }) {
  const { result, valid } = formState

  // todo: need to update Form component to using real jsonschema
  const schema =
    type === 'fragment'
      ? enhancedStereoSchema.oneOf[0]
      : enhancedStereoSchema.oneOf[1]

  return (
    <Dialog
      title={`Enhanced Stereo ${type}`}
      className="enhancedStereo"
      params={props}
      result={() => result}
      valid={() => valid}
      buttons={['OK', 'Close']}>
      <Form schema={schema} init={init} {...formState}>
        {type === 'fragment' && [<Field name="stereoFlag" />]}
        {type === 'atoms' && [
          <Field name="type" />,
          <hr />,
          <Field
            name="number"
            disabled={!result || result.type === 'abs' || result.type === null}
          />
        ]}
      </Form>
    </Dialog>
  )
}

export default connect(store => ({
  formState: store.modal.form || { result: {}, valid: false }
}))(EnhancedStereo)
