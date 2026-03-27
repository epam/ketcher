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

import Ajv, { ErrorObject } from 'ajv';
import { ErrorPopover } from './errorPopover';
import {
  FormContext,
  FormContextValue,
  FormSchema,
  SchemaProperty,
} from '../../../../../contexts';
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

export interface FormOwnProps {
  children: React.ReactNode;
  schema: FormSchema;
  init?: Record<string, unknown> | null;
  customValid?: Record<string, (value: unknown) => boolean | string>;
  serialize?: Record<string, string>;
  deserialize?: Record<string, string>;
}

interface FormDispatchProps {
  onUpdate: (
    result: Record<string, unknown>,
    valid: boolean,
    errors: Record<string, string>,
  ) => void;
}

interface FormStateProps {
  result: Record<string, unknown>;
  errors?: Record<string, string>;
}

type FormProps = FormOwnProps & FormDispatchProps & FormStateProps;

// Keep backward-compatible export
export type { FormProps };

export interface FieldProps {
  title?: string;
  name?: string;
  component?: React.ComponentType<Record<string, unknown>> | string;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
  formName?: string;
  'data-testid'?: string;
  maxLength?: number;
  labelPos?: string | boolean;
  className?: string;
  extraName?: string;
  tooltip?: string;
  extraLabel?: string;
  schema?: SchemaProperty;
  extraSchema?: SchemaProperty;
  type?: string;
  value?: string | number | boolean;
  onChange?: (value: unknown) => void;
  placeholder?: string;
  checked?: boolean;
}

export interface FieldWithModalProps extends FieldProps {
  onEdit?: (onChange: (value: unknown) => void) => void;
  autoFocus?: boolean;
}

export type SelectOneOfProps = FieldProps;

export interface CustomQueryFieldProps extends FieldProps {
  name: string;
  labelPos: string;
  checkboxValue?: boolean;
  onCheckboxChange?: (
    value: boolean,
    formState: Record<string, unknown>,
    onChange: (value: unknown) => void,
    updateFormState: (settings: Record<string, unknown>) => void,
  ) => void;
}

type AjvErrorWithInvalidMessage = ErrorObject & {
  parentSchema?: { invalidMessage?: string | ((data: unknown) => string) };
};

class Form extends Component<FormProps> {
  schema: ReturnType<typeof propSchema>;
  private _cachedSchema: FormSchema;
  private _contextValue: FormContextValue;
  constructor(props: FormProps) {
    super(props);
    const { onUpdate, schema, init } = this.props;

    this.schema = propSchema(schema, props);

    if (init) {
      const { valid, errors } = this.schema.serialize(init);
      const errs = getErrorsObj(errors as AjvErrorWithInvalidMessage[]);
      const initialState = { ...init, init: true };
      onUpdate(initialState, valid, errs);
    }
    this.updateState = this.updateState.bind(this);

    this._cachedSchema = schema;
    this._contextValue = { schema, stateStore: this };
  }

  componentDidUpdate(prevProps: FormProps) {
    const { schema, result, customValid, serialize, deserialize } = this.props;
    if (
      (schema.key && schema.key !== prevProps.schema.key) ||
      (customValid !== prevProps.customValid &&
        (schema.title === 'Atom' || schema.title === 'Bond'))
    ) {
      this.schema = propSchema(schema, { customValid, serialize, deserialize });
      this.schema.serialize(result); // hack: valid first state
      this.updateState(result);
    }
  }

  updateState(newState: Record<string, unknown>) {
    const { onUpdate } = this.props;
    const { instance, valid, errors } = this.schema.serialize(newState);
    const errs = getErrorsObj(errors as AjvErrorWithInvalidMessage[]);
    onUpdate(instance as Record<string, unknown>, valid, errs);
  }

  field(name: string, onChange?: (value: unknown) => void, extraName?: string) {
    const { result, errors } = this.props;
    const value = result[name];
    const extraValue = extraName ? result[extraName] : null;

    const handleOnChange = (fieldName: string, fieldValue: unknown) => {
      const newState = { ...this.props.result, [fieldName]: fieldValue };
      this.updateState(newState);
      if (onChange) onChange(fieldValue);
    };

    return {
      dataError: errors?.[name],
      value,
      extraValue,
      onChange: (val: unknown) => handleOnChange(name, val),
      onExtraChange: (val: unknown) => handleOnChange(extraName ?? '', val),
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
        <FormContext.Provider value={this._contextValue}>
          {children}
        </FormContext.Provider>
      </form>
    );
  }
}

export default connect(null, (dispatch) => ({
  onUpdate: (
    result: Record<string, unknown>,
    valid: boolean,
    errors: Record<string, string>,
  ) => {
    dispatch(updateFormState({ result, valid, errors }));
  },
  // Workaround: @types/react version conflict — react-redux's types reference a different @types/react than what Ketcher uses.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}))(Form as any);

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  labelPos?: string | boolean;
  title?: string;
  tooltip?: string;
  error?: string;
  children?: React.ReactNode;
}

function renderLabelContent(
  title: string,
  tooltip: string | null,
): React.ReactNode {
  if (!title) {
    return '';
  }

  if (tooltip) {
    return (
      <div
        // TODO Here the condition is the literal true, so it always includes the class — clsx adds no value and just obscures intent.
        className={clsx({
          [classes.divWithTooltipAndAboutIcon]: true,
        })}
      >
        <span>{title}</span>
        <Tooltip title={tooltip}>
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
  title: string,
  tooltip: string | null,
): React.ReactNode {
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
        <Tooltip title={tooltip}>
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

function Label({
  labelPos,
  title,
  tooltip,
  error: _error,
  children,
  ...props
}: LabelProps) {
  return (
    <label {...props}>
      {labelPos !== 'after' && renderLabelContent(title ?? '', tooltip ?? null)}
      {children}
      {labelPos === 'after' &&
        renderLabelContentAfter(title ?? '', tooltip ?? null)}
    </label>
  );
}

function usePopoverAnchor() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const handleOpen = useCallback((event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget as HTMLElement);
  }, []);
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  return { anchorEl, handleOpen, handleClose };
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
  const {
    anchorEl,
    handleOpen: handlePopoverOpen,
    handleClose: handlePopoverClose,
  } = usePopoverAnchor();
  const { schema, stateStore } = useFormContext();
  const desc = rest.schema || schema.properties[name ?? ''];
  const { dataError, onExtraChange, extraValue, ...fieldOpts } =
    stateStore.field(name ?? '', onChange, extraName);

  const Component = component as React.ComponentType<Record<string, unknown>>;
  const formField = Component ? (
    <Component
      name={name}
      schema={desc}
      className={className}
      onExtraChange={onExtraChange}
      extraValue={extraValue}
      {...(extraName && {
        extraSchema: rest.extraSchema || schema.properties[extraName],
      })}
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
  // Separate Label/wrapper-only props from Input-compatible props
  const {
    title,
    tooltip,
    options: _options,
    formName: _formName,
    extraName: _extraName,
    extraLabel: _extraLabel,
    extraSchema: _extraSchema,
    component: _component,
    ...inputRest
  } = rest;
  const {
    anchorEl,
    handleOpen: handlePopoverOpen,
    handleClose: handlePopoverClose,
  } = usePopoverAnchor();
  const { schema, stateStore } = useFormContext();
  const desc = inputRest.schema || schema.properties[name ?? ''];
  const { dataError, ...fieldOpts } = stateStore.field(name ?? '', onChange);

  return (
    <Label
      className={className}
      error={dataError}
      title={title || desc.title}
      labelPos={labelPos}
      tooltip={tooltip}
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
        <Input name={name} schema={desc} {...fieldOpts} {...inputRest} />
        <IconButton
          onClick={() => {
            onEdit?.(fieldOpts.onChange);
          }}
          iconName="edit"
          className={classes.editButton}
          testId={`edit-button`}
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
    component: _component,
    title: _title,
    tooltip: _tooltip,
    options: _options,
    formName: _formName,
    extraLabel: _extraLabel,
    extraSchema: _extraSchema,
    ...rest
  } = props;
  const {
    anchorEl,
    handleOpen: handlePopoverOpen,
    handleClose: handlePopoverClose,
  } = usePopoverAnchor();
  const { schema, stateStore } = useFormContext();
  const desc = rest.schema || schema.properties[name ?? ''];
  const { dataError, ...fieldOpts } = stateStore.field(name ?? '', onChange);
  const handleCheckboxChange = (value: boolean) => {
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
          name="customQueryCheckBox"
          schema={{ default: false, type: 'boolean' }}
          value={checkboxValue ?? false}
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
        role="none"
      >
        <Input
          type="textarea"
          data-testid="custom-query-value"
          name={name}
          schema={desc}
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

const SelectOneOf = (props: SelectOneOfProps) => {
  const { title, name, schema, ...prop } = props;

  const selectDesc: {
    title?: string;
    enum: (string | number)[];
    enumNames: string[];
  } = {
    title,
    enum: [],
    enumNames: [],
  };

  if (schema) {
    Object.keys(schema).forEach((item) => {
      selectDesc.enum.push(item);
      selectDesc.enumNames.push(
        (schema as Record<string, SchemaProperty>)[item]?.title ?? item,
      );
    });
  }

  return (
    <Field
      name={name}
      options={getSelectOptionsFromSchema(selectDesc)}
      title={title}
      {...prop}
      component={
        Select as unknown as React.ComponentType<Record<string, unknown>>
      }
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
  }: {
    customValid?: Record<string, (value: unknown) => boolean | string>;
    serialize?: Record<string, string>;
    deserialize?: Record<string, string>;
  },
) {
  const ajv = new Ajv({ allErrors: true, verbose: true, strictSchema: false });
  const schemaCopy = cloneDeep(schema);

  if (customValid) {
    Object.entries(customValid).forEach(([formatName, formatValidator]) => {
      ajv.addFormat(formatName, formatValidator as (data: string) => boolean);

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
    serialize: (inst: Record<string, unknown>) => {
      const isValid = validate(inst);
      const errors = validate.errors || [];

      return {
        instance: serializeRewrite(serialize, inst, schemaCopy),
        valid: isValid,
        errors,
      };
    },
    deserialize: (inst: Record<string, unknown>) => {
      return deserializeRewrite(deserialize, inst);
    },
  };
}

function serializeRewrite(
  serializeMap: Record<string, string>,
  instance: unknown,
  schema: FormSchema,
): unknown {
  const res: Record<string, unknown> = {};
  if (typeof instance !== 'object' || instance === null || !schema.properties) {
    return instance !== undefined ? instance : schema.default;
  }

  const instanceObj = instance as Record<string, unknown>;
  Object.keys(schema.properties).forEach((p) => {
    if (p in instanceObj)
      res[p] = instanceObj[serializeMap[p]] ?? instanceObj[p];
  });

  return res;
}

function deserializeRewrite(
  _deserializeMap: Record<string, string>,
  instance: unknown,
): unknown {
  return instance;
}

function getInvalidMessage(item: AjvErrorWithInvalidMessage): string {
  if (!item.parentSchema?.invalidMessage) return item.message ?? '';
  return typeof item.parentSchema.invalidMessage === 'function'
    ? item.parentSchema.invalidMessage(item.data)
    : item.parentSchema.invalidMessage;
}

function getErrorsObj(
  errors: AjvErrorWithInvalidMessage[],
): Record<string, string> {
  const errs: Record<string, string> = {};

  errors.forEach((item) => {
    const field = item.instancePath.slice(1);
    if (!errs[field]) errs[field] = getInvalidMessage(item);
  });

  return errs;
}

export { Field, CustomQueryField, FieldWithModal, SelectOneOf };
