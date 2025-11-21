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

import {
  Component,
  useCallback,
  useState,
  ComponentType,
  ReactNode,
} from 'react';

import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
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
import { Icon, IconButton } from 'components';
import { Tooltip } from '@mui/material';

// Type definitions
interface Schema {
  key?: string;
  title?: string;
  properties?: Record<string, SchemaProperty>;
  default?: any;
  type?: string;
}

interface SchemaProperty {
  title?: string;
  default?: any;
  type?: string;
  enum?: any[];
  enumNames?: string[];
  pattern?: string;
  maxLength?: number;
  format?: string;
  description?: string;
  invalidMessage?: string | ((data: any) => string);
}

interface CustomValid {
  [formatName: string]: (value: any) => boolean;
}

interface SerializeMap {
  [key: string]: string;
}

interface DeserializeMap {
  [key: string]: string;
}

interface FormProps {
  schema: Schema;
  init?: any;
  result: any;
  errors?: Record<string, string>;
  customValid?: CustomValid;
  serialize?: SerializeMap;
  deserialize?: DeserializeMap;
  onUpdate: (
    result: any,
    valid: boolean,
    errors: Record<string, string>,
  ) => void;
  children: ReactNode;
}

interface FormState {}

interface PropSchemaResult {
  key: string;
  serialize: (inst: any) => {
    instance: any;
    valid: boolean;
    errors: ErrorObject[];
  };
  deserialize: (inst: any) => any;
}

interface FieldOptions {
  dataError?: string;
  value: any;
  extraValue?: any;
  onChange: (val: any) => void;
  onExtraChange?: (val: any) => void;
}

interface FormContextValue {
  schema: Schema;
  stateStore: Form;
}

interface LabelProps {
  labelPos?: string | false;
  title?: string;
  children: ReactNode;
  className?: string;
  error?: string;
  tooltip?: string;
  'data-testid'?: string;
}

interface FieldProps {
  name: string;
  extraName?: string;
  onChange?: (value: any) => void;
  component?: ComponentType<any>;
  labelPos?: string | false;
  className?: string;
  extraLabel?: string;
  schema?: SchemaProperty;
  extraSchema?: SchemaProperty;
  title?: string;
  tooltip?: string;
  'data-testid'?: string;
  [key: string]: any;
}

interface FieldWithModalProps extends Omit<FieldProps, 'component'> {
  onEdit: (onChange: (value: any) => void) => void;
}

interface CustomQueryFieldProps extends Omit<FieldProps, 'component'> {
  onCheckboxChange: (
    value: boolean,
    formState: any,
    onChange: (value: any) => void,
    updateState: (state: any) => void,
  ) => void;
  checkboxValue?: boolean;
}

interface SelectOneOfProps extends FieldProps {
  schema: Record<string, SchemaProperty>;
}

class Form extends Component<FormProps, FormState> {
  schema: PropSchemaResult;

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
  }

  componentDidUpdate(prevProps: FormProps) {
    const {
      schema,
      result,
      /* eslint-disable @typescript-eslint/no-unused-vars */
      errors,
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

  updateState(newState: any) {
    const { onUpdate } = this.props;
    const { instance, valid, errors } = this.schema.serialize(newState);
    const errs = getErrorsObj(errors);
    onUpdate(instance, valid, errs);
  }

  field(
    name: string,
    onChange?: (value: any) => void,
    extraName?: string,
  ): FieldOptions {
    const { result, errors } = this.props;
    const value = result[name];
    const extraValue = extraName ? result[extraName] : null;

    const handleOnChange = (name: string, value: any) => {
      const newState = { ...this.props.result, [name]: value };
      this.updateState(newState);
      if (onChange) onChange(value);
    };

    return {
      dataError: errors?.[name],
      value,
      extraValue,
      onChange: (val: any) => handleOnChange(name, val),
      onExtraChange: (val: any) => handleOnChange(extraName!, val),
    };
  }

  render() {
    const { schema, children } = this.props;

    return (
      <form>
        <FormContext.Provider value={{ schema, stateStore: this } as any}>
          {children}
        </FormContext.Provider>
      </form>
    );
  }
}

export default connect(null, (dispatch) => ({
  onUpdate: (result: any, valid: boolean, errors: Record<string, string>) => {
    dispatch(updateFormState({ result, valid, errors }));
  },
}))(Form) as any;

function renderLabelContent(title?: string, tooltip?: string) {
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

function renderLabelContentAfter(title?: string, tooltip?: string) {
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

function Label({ labelPos, title, children, ...props }: LabelProps) {
  const tooltip = props.tooltip ? props.tooltip : undefined;
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
  const handlePopoverOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [],
  );
  const handlePopoverClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  const { schema, stateStore } =
    useFormContext() as unknown as FormContextValue;
  const desc = rest.schema || schema.properties?.[name];
  const { dataError, onExtraChange, extraValue, ...fieldOpts } =
    stateStore.field(name, onChange, extraName);

  const getExtraSchema = () => {
    return extraName
      ? rest.extraSchema || schema.properties?.[extraName]
      : undefined;
  };

  const Component = component as ComponentType<any>;
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
      schema={desc}
      type={rest.type || 'text'}
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
      title={rest.title || desc?.title}
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

function FieldWithModal(props: FieldWithModalProps) {
  const { name, onChange, labelPos, className, onEdit, ...rest } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { schema, stateStore } =
    useFormContext() as unknown as FormContextValue;
  const desc = rest.schema || schema.properties?.[name];
  const { dataError, ...fieldOpts } = stateStore.field(name, onChange);
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
      title={rest.title || desc?.title}
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
        <Input
          schema={desc}
          type={rest.type || 'text'}
          {...fieldOpts}
          {...rest}
        />
        <IconButton
          onClick={() => {
            onEdit(fieldOpts.onChange);
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
    ...rest
  } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { schema, stateStore } =
    useFormContext() as unknown as FormContextValue;
  const desc = rest.schema || schema.properties?.[name];
  const { dataError, ...fieldOpts } = stateStore.field(name, onChange);
  const handlePopoverOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [],
  );
  const handlePopoverClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  const handleCheckboxChange = (value: boolean) => {
    onCheckboxChange(
      value,
      stateStore.props.result,
      fieldOpts.onChange,
      stateStore.updateState.bind(stateStore),
    );
  };

  return (
    <>
      <Label className={className} title={desc?.title} labelPos={labelPos}>
        <Input
          schema={{ default: false, type: 'boolean' }}
          type="checkbox"
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
      >
        <Input
          type="textarea"
          data-testid="custom-query-value"
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

  const selectDesc: SchemaProperty = {
    title,
    enum: [],
    enumNames: [],
  };

  Object.keys(schema).forEach((item) => {
    selectDesc.enum!.push(item);
    selectDesc.enumNames!.push(schema[item].title || item);
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
  schema: Schema,
  { customValid, serialize = {}, deserialize = {} }: Partial<FormProps>,
): PropSchemaResult {
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
      } = schemaCopy.properties![formatName];
      schemaCopy.properties![formatName] = {
        ...rest,
        format: formatName,
      };
    });
  }

  const validate: ValidateFunction = ajv.compile(schemaCopy);

  return {
    key: schema.key || '',
    serialize: (inst: any) => {
      validate(inst);

      return {
        instance: serializeRewrite(serialize, inst, schemaCopy),
        valid: validate(inst) as boolean,
        errors: (validate.errors || []) as ErrorObject[],
      };
    },
    deserialize: (inst: any) => {
      validate(inst);
      return deserializeRewrite(deserialize, inst);
    },
  };
}

function serializeRewrite(
  serializeMap: SerializeMap,
  instance: any,
  schema: Schema,
): any {
  const res: Record<string, any> = {};
  if (typeof instance !== 'object' || !schema.properties) {
    return instance !== undefined ? instance : schema.default;
  }

  Object.keys(schema.properties).forEach((p) => {
    if (p in instance) res[p] = instance[serializeMap[p]] || instance[p];
  });

  return res;
}

function deserializeRewrite(
  _deserializeMap: DeserializeMap,
  instance: any,
): any {
  return instance;
}

function getInvalidMessage(
  item: ErrorObject & { parentSchema?: SchemaProperty },
): string {
  if (!item.parentSchema?.invalidMessage) return item.message || '';
  return typeof item.parentSchema.invalidMessage === 'function'
    ? item.parentSchema.invalidMessage(item.data)
    : item.parentSchema.invalidMessage;
}

function getErrorsObj(errors: ErrorObject[]): Record<string, string> {
  const errs: Record<string, string> = {};
  let field: string;

  errors.forEach((item) => {
    field = item.instancePath.slice(1);
    if (!errs[field]) errs[field] = getInvalidMessage(item as any);
  });

  return errs;
}

export { Field, CustomQueryField, FieldWithModal, SelectOneOf };
