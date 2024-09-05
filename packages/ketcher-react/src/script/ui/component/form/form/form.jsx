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

import { Component, useCallback, useState } from 'react';

import Ajv from 'ajv';
import { ErrorPopover } from './errorPopover';
import { FormContext } from '../../../../../contexts';
import Input from '../Input/Input';
import Select from '../Select';
import classes from './form.module.less';
import clsx from 'clsx';
import { connect } from 'react-redux';
import { getSelectOptionsFromSchema } from '../../../utils';
import { updateFormState } from '../../../state/modal/form';
import { useFormContext } from '../../../../../hooks';
import { cloneDeep } from 'lodash';
import { IconButton } from 'components';

class Form extends Component {
  constructor(props) {
    super(props);
    const { onUpdate, schema, init } = this.props;

    this.schema = propSchema(schema, props);

    if (init) {
      const { valid, errors } = this.schema.serialize(init);
      const errs = getErrorsObj(errors);
      const initialState = { ...init, init: true };
      onUpdate(initialState, valid, errs);
    }
    this.updateState = this.updateState.bind(this);
  }

  componentDidUpdate(prevProps) {
    const {
      schema,
      result,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      ...rest
    } = this.props;
    if (
      (schema.key && schema.key !== prevProps.schema.key) ||
      (rest.customValid !== prevProps.customValid &&
        (schema.title === 'Atom' || schema.title === 'Bond'))
    ) {
      this.schema = propSchema(schema, rest);
      this.schema.serialize(result); // hack: valid first state
      this.updateState(result);
    }
  }

  updateState(newState) {
    const { onUpdate } = this.props;
    const { instance, valid, errors } = this.schema.serialize(newState);
    const errs = getErrorsObj(errors);
    onUpdate(instance, valid, errs);
  }

  field(name, onChange, extraName) {
    const { result, errors } = this.props;
    const value = result[name];
    const extraValue = extraName ? result[extraName] : null;

    const handleOnChange = (name, value) => {
      const newState = Object.assign({}, this.props.result, { [name]: value });
      this.updateState(newState);
      if (onChange) onChange(value);
    };

    return {
      dataError: errors && errors[name],
      value,
      extraValue,
      onChange: (val) => handleOnChange(name, val),
      onExtraChange: (val) => handleOnChange(extraName, val),
    };
  }

  render() {
    const { schema, children } = this.props;

    return (
      <form>
        <FormContext.Provider value={{ schema, stateStore: this }}>
          {children}
        </FormContext.Provider>
      </form>
    );
  }
}

export default connect(null, (dispatch) => ({
  onUpdate: (result, valid, errors) => {
    dispatch(updateFormState({ result, valid, errors }));
  },
}))(Form);

function Label({ labelPos, title, children, ...props }) {
  const tooltip = props.tooltip ? props.tooltip : null;

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
  );
}

function Field(props) {
  const {
    name,
    extraName,
    onChange,
    component,
    labelPos,
    className,
    extraLabel,
    ...rest
  } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const handlePopoverOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);
  const handlePopoverClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  const { schema, stateStore } = useFormContext();
  const desc = rest.schema || schema.properties[name];
  const { dataError, onExtraChange, extraValue, ...fieldOpts } =
    stateStore.field(name, onChange, extraName);

  const getExtraSchema = () => {
    return rest.extraSchema || schema.properties[extraName];
  };

  const Component = component;
  const formField = component ? (
    <Component
      name={name}
      schema={desc}
      className={className}
      onExtraChange={onExtraChange}
      extraValue={extraValue}
      {...(extraName && { extraSchema: getExtraSchema() })}
      {...fieldOpts}
      {...rest}
    />
  ) : (
    <Input
      {...(extraLabel && { className: classes.inputWithExtraLabel })}
      name={name}
      schema={desc}
      {...fieldOpts}
      {...rest}
      data-testid={`${name}-input`}
    />
  );

  if (labelPos === false) return formField;
  return (
    <Label
      className={clsx({ [classes.dataError]: dataError }, className)}
      error={dataError}
      title={rest.title || desc.title}
      labelPos={labelPos}
      tooltip={rest?.tooltip}
      data-testid={props['data-testid']}
    >
      <span
        className={classes.inputWrapper}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        data-testid={props['data-testid'] + '-input-span'}
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
      {extraLabel && <Label className={classes.extraLabel}>{extraLabel}</Label>}
    </Label>
  );
}

function FieldWithModal(props) {
  const { name, onChange, labelPos, className, onEdit, ...rest } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const { schema, stateStore } = useFormContext();
  const desc = rest.schema || schema.properties[name];
  const { dataError, ...fieldOpts } = stateStore.field(name, onChange);
  const handlePopoverOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);
  const handlePopoverClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  return (
    <Label
      className={className}
      error={dataError}
      title={rest.title || desc.title}
      labelPos={labelPos}
      tooltip={rest?.tooltip}
    >
      <span
        className={clsx({
          [classes.dataError]: dataError,
          [classes.inputWithEditButtonWrapper]: true,
          [classes.inputWrapper]: true,
        })}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        <Input name={name} schema={desc} {...fieldOpts} {...rest} />
        <IconButton
          onClick={() => {
            onEdit(fieldOpts.onChange);
          }}
          iconName="edit"
          className={classes.editButton}
        />
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
  );
}

function CustomQueryField(props) {
  const {
    name,
    onChange,
    labelPos,
    className,
    onCheckboxChange,
    checkboxValue,
    ...rest
  } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const { schema, stateStore } = useFormContext();
  const desc = rest.schema || schema.properties[name];
  const { dataError, ...fieldOpts } = stateStore.field(name, onChange);
  const handlePopoverOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);
  const handlePopoverClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  const handleCheckboxChange = (value) => {
    onCheckboxChange(
      value,
      stateStore.props.result,
      fieldOpts.onChange,
      stateStore.updateState,
    );
  };

  return (
    <>
      <Label className={className} title={desc.title} labelPos={labelPos}>
        <Input
          name="customQueryCheckBox"
          schema={{ default: false, type: 'boolean' }}
          value={checkboxValue}
          onChange={handleCheckboxChange}
          data-testid="custom-query-checkbox"
        />
      </Label>
      <span
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        className={clsx({
          [classes.dataError]: dataError,
          [classes.inputWrapper]: true,
        })}
      >
        <Input
          type="textarea"
          data-testid="atomCustomQuery"
          name={name}
          schema={desc}
          data-testId="custom-query-value"
          {...fieldOpts}
          {...rest}
        />
      </span>
      {dataError && anchorEl && (
        <ErrorPopover
          anchorEl={anchorEl}
          open={!!anchorEl}
          error={dataError}
          onClose={handlePopoverClose}
        />
      )}
    </>
  );
}

const SelectOneOf = (props) => {
  const { title, name, schema, ...prop } = props;

  const selectDesc = {
    title,
    enum: [],
    enumNames: [],
  };

  Object.keys(schema).forEach((item) => {
    selectDesc.enum.push(item);
    selectDesc.enumNames.push(schema[item].title || item);
  });

  return (
    <Field
      name={name}
      options={getSelectOptionsFromSchema(selectDesc)}
      title={title}
      {...prop}
      component={Select}
      data-testid={props['data-testid']}
    />
  );
};

function propSchema(schema, { customValid, serialize = {}, deserialize = {} }) {
  const ajv = new Ajv({ allErrors: true, verbose: true, strictSchema: false });
  const schemaCopy = cloneDeep(schema);

  if (customValid) {
    Object.entries(customValid).forEach(([formatName, formatValidator]) => {
      ajv.addFormat(formatName, formatValidator);
      const {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        pattern,
        maxLength,
        enum: enumIsReservedWord,
        enumNames,
        /* eslint-enable @typescript-eslint/no-unused-vars */
        ...rest
      } = schemaCopy.properties[formatName];
      schemaCopy.properties[formatName] = {
        ...rest,
        format: formatName,
      };
    });
  }

  const validate = ajv.compile(schemaCopy);

  return {
    key: schema.key || '',
    serialize: (inst) => {
      validate(inst);

      return {
        instance: serializeRewrite(serialize, inst, schemaCopy),
        valid: validate(inst),
        errors: validate.errors || [],
      };
    },
    deserialize: (inst) => {
      validate(inst);
      return deserializeRewrite(deserialize, inst);
    },
  };
}

function serializeRewrite(serializeMap, instance, schema) {
  const res = {};
  if (typeof instance !== 'object' || !schema.properties) {
    return instance !== undefined ? instance : schema.default;
  }

  Object.keys(schema.properties).forEach((p) => {
    if (p in instance) res[p] = instance[serializeMap[p]] || instance[p];
  });

  return res;
}

function deserializeRewrite(deserializeMap, instance) {
  return instance;
}

function getInvalidMessage(item) {
  if (!item.parentSchema.invalidMessage) return item.message;
  return typeof item.parentSchema.invalidMessage === 'function'
    ? item.parentSchema.invalidMessage(item.data)
    : item.parentSchema.invalidMessage;
}

function getErrorsObj(errors) {
  const errs = {};
  let field;

  errors.forEach((item) => {
    field = item.instancePath.slice(1);
    if (!errs[field]) errs[field] = getInvalidMessage(item);
  });

  return errs;
}

export { Field, CustomQueryField, FieldWithModal, SelectOneOf };
