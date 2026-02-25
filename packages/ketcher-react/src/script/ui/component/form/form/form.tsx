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

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Component, useCallback, useState } from 'react';

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
import { cloneDeep, omit } from 'lodash';
import { Icon, IconButton } from 'components';
import { Tooltip } from '@mui/material';

type FormState = Record<string, any>;
type FormErrors = Record<string, string>;

interface FormSchema {
  key?: string;
  title?: string;
  default?: any;
  properties: Record<string, any>;
  [key: string]: any;
}

interface FormProps {
  children?: React.ReactNode;
  customValid?: Record<string, any>;
  deserialize?: Record<string, string>;
  errors?: Record<string, string>;
  init?: FormState | null;
  onUpdate: (result: FormState, valid: boolean, errors: FormErrors) => void;
  result: FormState;
  schema: FormSchema;
  serialize?: Record<string, string>;
}

interface FieldProps {
  className?: string;
  component?: any;
  extraLabel?: React.ReactNode;
  extraName?: string;
  labelPos?: string | boolean;
  name?: string;
  onChange?: (value: any) => void;
  schema?: Record<string, any>;
  title?: React.ReactNode;
  tooltip?: any;
  'data-testid'?: string;
  [key: string]: any;
}

interface FieldWithModalProps extends FieldProps {
  onEdit?: (onChange: (value: any) => void) => void;
}

interface CustomQueryFieldProps extends FieldProps {
  checkboxValue?: boolean;
  onCheckboxChange?: (
    value: any,
    formState: any,
    onFieldChange: any,
    onFormUpdate: any,
  ) => void;
}

interface SelectOneOfProps extends Omit<FieldProps, 'component'> {
  schema: Record<string, { title?: string; [key: string]: any }>;
}

interface FieldState {
  dataError?: string;
  extraValue: any;
  onChange: (value: any) => void;
  onExtraChange: (value: any) => void;
  value: any;
}

interface FormStateStore {
  field: (
    name: string,
    onChange?: (value: any) => void,
    extraName?: string,
  ) => FieldState;
  props: FormProps;
  updateState: (newState: FormState) => void;
}

class Form extends Component<FormProps> {
  schema: ReturnType<typeof propSchema>;

  _cachedSchema: FormSchema;

  _contextValue: { schema: FormSchema; stateStore: FormStateStore };

  constructor(props: FormProps) {
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

    this._cachedSchema = schema;
    this._contextValue = { schema, stateStore: this };
  }

  componentDidUpdate(prevProps: FormProps) {
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

  updateState(newState: FormState) {
    const { onUpdate } = this.props;
    const { instance, valid, errors } = this.schema.serialize(newState);
    const errs = getErrorsObj(errors);
    onUpdate(instance, valid, errs);
  }

  field(name: string, onChange?: (value: any) => void, extraName?: string) {
    const { result, errors } = this.props;
    const value = result[name];
    const extraValue = extraName ? result[extraName] : null;

    const handleOnChange = (name: string | undefined, value: any) => {
      if (!name) {
        return;
      }
      const newState = { ...this.props.result, [name]: value };
      this.updateState(newState);
      if (onChange) onChange(value);
    };

    return {
      dataError: errors?.[name],
      value,
      extraValue,
      onChange: (val) => handleOnChange(name, val),
      onExtraChange: (val) => handleOnChange(extraName, val),
    };
  }

  render() {
    const { schema, children } = this.props;

    // Update the cached context value only if schema has changed
    if (this._cachedSchema !== schema) {
      this._cachedSchema = schema;
      this._contextValue = { schema, stateStore: this };
    }

    return (
      <form>
        <FormContext.Provider value={this._contextValue as any}>
          {children}
        </FormContext.Provider>
      </form>
    );
  }
}

const ConnectedForm: any = connect(null, (dispatch) => ({
  onUpdate: (result, valid, errors) => {
    dispatch(updateFormState({ result, valid, errors }));
  },
}))(Form as any);

export default ConnectedForm;

function renderLabelContent(
  title?: React.ReactNode,
  tooltip?: React.ReactNode,
) {
  if (!title) {
    return '';
  }

  if (tooltip) {
    return (
      <div
        className={clsx({
          [classes.divWithTooltipAndAboutIcon]: true,
        })}
      >
        <span>{title}</span>
        <Tooltip title={tooltip as any}>
          <div>
            <Icon name="about"></Icon>
          </div>
        </Tooltip>
      </div>
    );
  }

  return <span>{title}</span>;
}

function renderLabelContentAfter(
  title?: React.ReactNode,
  tooltip?: React.ReactNode,
) {
  if (!title) {
    return '';
  }

  if (tooltip) {
    return (
      <div
        className={clsx({
          [classes.divWithTooltipAndAboutIcon]: true,
        })}
      >
        <Tooltip title={tooltip as any}>
          <div>
            <Icon name="about"></Icon>
          </div>
        </Tooltip>
        <span>{title}</span>
      </div>
    );
  }

  return <span>{title}</span>;
}

interface LabelProps {
  children?: React.ReactNode;
  className?: string;
  error?: string;
  'data-testid'?: string;
  [key: string]: any;
  labelPos?: string | boolean;
  title?: any;
  tooltip?: any;
}

function Label({ labelPos, title, children, ...props }: LabelProps) {
  const tooltip = props.tooltip ? props.tooltip : null;
  return (
    <label {...props}>
      {labelPos !== 'after' && renderLabelContent(title, tooltip)}
      {children}
      {labelPos === 'after' && renderLabelContentAfter(title, tooltip)}
    </label>
  );
}

function Field(props: FieldProps) {
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
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const fieldName = name as string;
  const handlePopoverOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [],
  );
  const handlePopoverClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  const { schema, stateStore } = useFormContext() as unknown as {
    schema: FormSchema;
    stateStore: FormStateStore;
  };
  const desc = rest.schema || schema.properties[fieldName];
  const { dataError, onExtraChange, extraValue, ...fieldOpts } =
    stateStore.field(fieldName, onChange, extraName);

  const getExtraSchema = () => {
    return rest.extraSchema || schema.properties[extraName as string];
  };

  const CustomComponent = component;
  const formField = CustomComponent ? (
    <CustomComponent
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
      {...(fieldOpts as any)}
      {...(rest as any)}
      data-testid={props['data-testid'] ?? `${name}-input`}
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
        role="none"
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

function FieldWithModal(props: FieldWithModalProps) {
  const { name, onChange, labelPos, className, onEdit, ...rest } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const fieldName = name as string;
  const { schema, stateStore } = useFormContext() as unknown as {
    schema: FormSchema;
    stateStore: FormStateStore;
  };
  const desc = rest.schema || schema.properties[fieldName];
  const { dataError, ...fieldOpts } = stateStore.field(fieldName, onChange);
  const handlePopoverOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [],
  );
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
        role="none"
      >
        <Input
          name={fieldName}
          schema={desc}
          {...(fieldOpts as any)}
          {...(rest as any)}
        />
        <IconButton
          {...({
            onClick: () => {
              onEdit?.(fieldOpts.onChange);
            },
            name: 'testname',
            iconName: 'edit',
            className: classes.editButton,
            testId: 'edit-button',
          } as any)}
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

function CustomQueryField(props: CustomQueryFieldProps) {
  const {
    name,
    onChange,
    labelPos,
    className,
    onCheckboxChange,
    checkboxValue,
    ...rest
  } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const fieldName = name as string;
  const { schema, stateStore } = useFormContext() as unknown as {
    schema: FormSchema;
    stateStore: FormStateStore;
  };
  const desc = rest.schema || schema.properties[fieldName];
  const { dataError, ...fieldOpts } = stateStore.field(fieldName, onChange);
  const handlePopoverOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [],
  );
  const handlePopoverClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  const handleCheckboxChange = (value: any) => {
    onCheckboxChange?.(
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
          {...({
            name: 'customQueryCheckBox',
            schema: { default: false, type: 'boolean' },
            value: checkboxValue as boolean,
            onChange: handleCheckboxChange,
            'data-testid': 'custom-query-checkbox',
          } as any)}
        />
      </Label>
      <span
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        className={clsx({
          [classes.dataError]: dataError,
          [classes.inputWrapper]: true,
        })}
        role="none"
      >
        <Input
          type="textarea"
          data-testid="custom-query-value"
          name={fieldName}
          schema={desc}
          {...(fieldOpts as any)}
          {...(rest as any)}
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

const SelectOneOf = (props: SelectOneOfProps) => {
  const { title, name, schema, ...prop } = props;

  const selectDesc: { title: any; enum: string[]; enumNames: string[] } = {
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

function propSchema(
  schema: FormSchema,
  {
    customValid,
    serialize = {},
    deserialize = {},
  }: Pick<FormProps, 'customValid' | 'serialize' | 'deserialize'>,
) {
  const ajv = new Ajv({ allErrors: true, verbose: true, strictSchema: false });
  const schemaCopy = cloneDeep(schema);

  if (customValid) {
    Object.entries(customValid).forEach(([formatName, formatValidator]) => {
      ajv.addFormat(formatName, formatValidator);

      const rest = omit(schemaCopy.properties[formatName], [
        'pattern',
        'maxLength',
        'enum',
        'enumNames',
      ]);

      schemaCopy.properties[formatName] = {
        ...rest,
        format: formatName,
      };
    });
  }

  const validate = ajv.compile(schemaCopy);

  return {
    key: schema.key || '',
    serialize: (inst: FormState) => {
      validate(inst);

      return {
        instance: serializeRewrite(serialize, inst, schemaCopy),
        valid: validate(inst),
        errors: validate.errors || [],
      };
    },
    deserialize: (inst: FormState) => {
      validate(inst);
      return deserializeRewrite(deserialize, inst);
    },
  };
}

function serializeRewrite(
  serializeMap: Record<string, string>,
  instance: FormState,
  schema: FormSchema,
) {
  const res: FormState = {};
  if (typeof instance !== 'object' || !schema.properties) {
    return instance !== undefined ? instance : schema.default;
  }

  Object.keys(schema.properties).forEach((p) => {
    if (p in instance)
      res[p] =
        (instance as Record<string, unknown>)[serializeMap[p]] || instance[p];
  });

  return res;
}

function deserializeRewrite(
  _deserializeMap: Record<string, string>,
  instance: FormState,
) {
  return instance;
}

function getInvalidMessage(item: any) {
  if (!item.parentSchema?.invalidMessage) return item.message;
  return typeof item.parentSchema.invalidMessage === 'function'
    ? item.parentSchema.invalidMessage(item.data)
    : item.parentSchema.invalidMessage;
}

function getErrorsObj(errors: any[]) {
  const errs: FormErrors = {};
  let field: string;

  errors.forEach((item) => {
    field = item.instancePath.slice(1);
    if (!errs[field]) errs[field] = getInvalidMessage(item);
  });

  return errs;
}

export { Field, CustomQueryField, FieldWithModal, SelectOneOf };
