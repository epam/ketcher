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

import { Component, useCallback, useState } from 'react'

import Ajv from 'ajv'
import { ErrorPopover } from './errorPopover'
import { FormContext } from '../../../../../contexts'
import Input from './Input/Input'
import Select from '../Select'
import classes from './form.module.less'
import clsx from 'clsx'
import { connect } from 'react-redux'
import { getSelectOptionsFromSchema } from '../../../utils'
import { updateFormState } from '../../../state/modal/form'
import { useFormContext } from '../../../../../hooks'
import { cloneDeep } from 'lodash'

class Form extends Component {
  constructor(props) {
    super(props)
    const { onUpdate, schema, init } = this.props

    this.schema = propSchema(schema, props)

    if (init) {
      const { valid, errors } = this.schema.serialize(init)
      const errs = getErrorsObj(errors)
      const initialState = { ...init, init: true }
      onUpdate(initialState, valid, errs)
    }
  }

  componentDidUpdate(prevProps) {
    const { schema, result, customValid, ...rest } = this.props
    if (schema.key && schema.key !== prevProps.schema.key) {
      this.schema = propSchema(schema, rest)
      this.schema.serialize(result) // hack: valid first state
      this.updateState(result)
    }
  }

  updateState(newState) {
    const { onUpdate } = this.props
    const { instance, valid, errors } = this.schema.serialize(newState)
    const errs = getErrorsObj(errors)
    onUpdate(instance, valid, errs)
  }

  field(name, onChange) {
    const { result, errors } = this.props
    const value = result[name]

    return {
      dataError: errors && errors[name],
      value,
      onChange: (val) => {
        const newState = Object.assign({}, this.props.result, { [name]: val })
        this.updateState(newState)
        if (onChange) onChange(val)
      }
    }
  }

  render() {
    const { schema, children } = this.props

    return (
      <form>
        <FormContext.Provider value={{ schema, stateStore: this }}>
          {children}
        </FormContext.Provider>
      </form>
    )
  }
}

export default connect(null, (dispatch) => ({
  onUpdate: (result, valid, errors) => {
    dispatch(updateFormState({ result, valid, errors }))
  }
}))(Form)

function Label({ labelPos, title, children, ...props }) {
  const tooltip = props.tooltip ? props.tooltip : null

  return (
    <label {...props}>
      {title && labelPos !== 'after' ? (
        <span title={tooltip}>{title}</span>
      ) : (
        ''
      )}
      {children}
      {title && labelPos === 'after' ? (
        <span title={tooltip}>{title}</span>
      ) : (
        ''
      )}
    </label>
  )
}

function Field(props) {
  const { name, onChange, component, labelPos, className, ...rest } = props
  const [anchorEl, setAnchorEl] = useState(null)
  const handlePopoverOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget)
  }, [])
  const handlePopoverClose = useCallback(() => {
    setAnchorEl(null)
  }, [])
  const { schema, stateStore } = useFormContext()
  const desc = rest.schema || schema.properties[name]
  const { dataError, ...fieldOpts } = stateStore.field(name, onChange)
  const Component = component
  const formField = component ? (
    <Component name={name} schema={desc} {...fieldOpts} {...rest} />
  ) : (
    <Input name={name} schema={desc} {...fieldOpts} {...rest} />
  )

  if (labelPos === false) return formField
  return (
    <Label
      className={clsx({ [classes.dataError]: dataError }, className)}
      error={dataError}
      title={rest.title || desc.title}
      labelPos={labelPos}
      tooltip={rest?.tooltip}
    >
      <span
        className={classes.inputWrapper}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        {formField}
      </span>
      {dataError && anchorEl && (
        <ErrorPopover
          anchorEl={anchorEl}
          open={!!anchorEl}
          error={dataError}
          onClose={handlePopoverClose}
        />
      )}
    </Label>
  )
}

const SelectOneOf = (props) => {
  const { title, name, schema, ...prop } = props

  const selectDesc = {
    title,
    enum: [],
    enumNames: []
  }

  Object.keys(schema).forEach((item) => {
    selectDesc.enum.push(item)
    selectDesc.enumNames.push(schema[item].title || item)
  })

  return (
    <Field
      name={name}
      options={getSelectOptionsFromSchema(selectDesc)}
      title={title}
      {...prop}
      component={Select}
    />
  )
}

//

function propSchema(schema, { customValid, serialize = {}, deserialize = {} }) {
  const ajv = new Ajv({ allErrors: true, verbose: true, strictSchema: false })
  const schemaCopy = cloneDeep(schema)

  if (customValid) {
    Object.entries(customValid).forEach(([formatName, formatValidator]) => {
      ajv.addFormat(formatName, formatValidator)
      const {
        pattern,
        maxLength,
        enum: enumIsReservedWord,
        enumNames,
        ...rest
      } = schemaCopy.properties[formatName]
      schemaCopy.properties[formatName] = {
        ...rest,
        format: formatName
      }
    })
  }

  const validate = ajv.compile(schemaCopy)

  return {
    key: schema.key || '',
    serialize: (inst) => {
      validate(inst)
      return {
        instance: serializeRewrite(serialize, inst, schemaCopy),
        valid: validate(inst),
        errors: validate.errors || []
      }
    },
    deserialize: (inst) => {
      validate(inst)
      return deserializeRewrite(deserialize, inst)
    }
  }
}

function serializeRewrite(serializeMap, instance, schema) {
  const res = {}
  if (typeof instance !== 'object' || !schema.properties) {
    return instance !== undefined ? instance : schema.default
  }

  Object.keys(schema.properties).forEach((p) => {
    if (p in instance) res[p] = instance[serializeMap[p]] || instance[p]
  })

  return res
}

function deserializeRewrite(deserializeMap, instance) {
  return instance
}

function getInvalidMessage(item) {
  if (!item.parentSchema.invalidMessage) return item.message
  return typeof item.parentSchema.invalidMessage === 'function'
    ? item.parentSchema.invalidMessage(item.data)
    : item.parentSchema.invalidMessage
}

function getErrorsObj(errors) {
  const errs = {}
  let field

  errors.forEach((item) => {
    field = item.instancePath.slice(1)
    if (!errs[field]) errs[field] = getInvalidMessage(item)
  })

  return errs
}

export { Field, SelectOneOf }
