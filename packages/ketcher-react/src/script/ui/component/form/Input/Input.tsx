/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import React, { type ComponentType, PureComponent } from 'react';

import classes from './Input.module.less';
import clsx from 'clsx';
import { type SchemaProperty } from '../../../../../contexts';

export type InputSchema = SchemaProperty | unknown[];

type InputComponentProperties = {
  schema?: InputSchema;
  value?: unknown;
  onChange?: (value: unknown) => void;
  onSelect?: (event_: React.SyntheticEvent, values?: unknown[]) => void;
  selected?: (testValue: unknown, value: unknown) => boolean;
  multiple?: boolean;
  innerRef?: React.Ref<HTMLInputElement>;
  name?: string;
  className?: string;
  type?: string;
  [key: string]: unknown;
};

type Properties = {
  name?: string;
  component?: ComponentType<InputComponentProperties>;
  children?: React.ReactNode;
  className?: string;
  type?: string;
  value?: unknown;
  onChange: (value: unknown) => void;
  placeholder?: string;
  isFocused?: boolean;
  innerRef?: React.Ref<HTMLInputElement>;
  schema?: InputSchema;
  multiple?: boolean;
};

export function GenericInput({
  schema: _schema,
  value,
  onChange,
  innerRef,
  type = 'text',
  isFocused = false,
  ...properties
}) {
  return (
    <>
      <input
        type={type}
        value={value ?? ''}
        onChange={onChange}
        className={clsx(classes.input, classes.genericInput)}
        ref={innerRef}
        autoFocus={isFocused}
        {...properties}
      />
      {type === 'checkbox' && <span className={classes.checkbox} />}
      {type === 'radio' && <span className={classes.radioButton} />}
    </>
  );
}

GenericInput.val = function (event_, schema) {
  const input = event_.target;
  const isInteger = schema?.type === 'integer';
  const isFloat = schema?.type === 'number';

  const isNumber =
    input.type === 'number' || input.type === 'range' || isInteger || isFloat;

  const value = isNumber ? input.value.replace(/,/g, '.') : input.value;

  if (isInteger) {
    return Number(value) || 0;
  }

  // When the value can be a float the validation is passed to the parent component
  // because it's more complicated
  return value;
};

function TextArea({ schema: _schema, value, onChange, innerRef, ...rest }) {
  return (
    <textarea value={value ?? ''} ref={innerRef} onInput={onChange} {...rest} />
  );
}

TextArea.val = (event_) => event_.target.value;

function CheckBox({
  schema: _schema,
  value = '',
  onChange,
  innerRef,
  ...rest
}) {
  return (
    <div className={classes.fieldSetItem}>
      <input
        type="checkbox"
        checked={Boolean(value)}
        onClick={onChange}
        onChange={onChange}
        className={classes.input}
        ref={innerRef}
        {...rest}
      />
      <span className={classes.checkbox} />
    </div>
  );
}

CheckBox.val = function (event_) {
  event_.stopPropagation();
  return !!event_.target.checked;
};

function Select({
  schema,
  value,
  name,
  onSelect,
  className,
  multiple = false,
}) {
  return (
    <select
      onChange={onSelect}
      value={value}
      name={name}
      multiple={multiple}
      className={clsx(classes.select, className)}
    >
      {enumSchema(schema, (title, value_) => (
        <option key={value_} value={value_}>
          {title}
        </option>
      ))}
    </select>
  );
}

Select.val = function (event_, schema) {
  const select = event_.target as HTMLSelectElement;
  if (!select.multiple) return enumSchema(schema, select.selectedIndex);

  const options = select.options;

  return [...options].reduce(
    (result, o: HTMLOptionElement, index) =>
      !o.selected ? result : [enumSchema(schema, index), ...result],
    [] as HTMLOptionElement[],
  );
};

function FieldSet({
  schema,
  value,
  selected,
  onSelect,
  type = 'radio',
  checked,
  innerRef,
  ...rest
}) {
  return (
    <fieldset>
      {enumSchema(schema, (title, value_) => (
        <li key={title} className={classes.fieldSetItem}>
          <label className={classes.fieldSetLabel}>
            <input
              ref={innerRef}
              type={type}
              defaultChecked={
                type === 'radio'
                  ? selected(value_, checked)
                  : selected(value_, value)
              }
              value={typeof value_ !== 'object' && value_}
              className={classes.input}
              {...rest}
              data-testid={
                rest['data-testid']
                  ? rest['data-testid'] + '-' + value_
                  : undefined
              }
              onClick={onSelect}
            />
            {type === 'checkbox' && <span className={classes.checkbox} />}
            {type === 'radio' && <span className={classes.radioButton} />}
            {title}
            {}
          </label>
        </li>
      ))}
    </fieldset>
  );
}

FieldSet.val = function (event_, schema) {
  const input = event_.target as HTMLInputElement;

  if (event_.target.tagName !== 'INPUT') {
    event_.stopPropagation();
    return undefined;
  }

  // Hm.. looks like premature optimization
  //      should we inline this?

  const fieldset = input?.parentNode?.parentNode?.parentNode;
  const inputCollection = fieldset?.querySelectorAll('input');
  let result;

  if (inputCollection?.length) {
    result = [...inputCollection].reduce(
      (result, inp: HTMLInputElement, index) =>
        !inp.checked ? result : [enumSchema(schema, index), ...result],

      [] as HTMLInputElement[],
    );
  }

  return input.type === 'radio' ? result[0] : result;
};

function Slider({ value, onChange, name, innerRef, ...rest }) {
  return (
    <div className={classes.slider} key={name}>
      <input
        ref={innerRef}
        type="checkbox"
        checked={value}
        onClick={onChange}
        onChange={onChange}
        name={name}
        {...rest}
      />
      <span />
    </div>
  );
}

Slider.val = function (event_) {
  event_.stopPropagation();
  return !!event_.target.checked;
};

function enumSchema(schema, callbackOrIndex) {
  const isTypeValue = Array.isArray(schema);
  if (!isTypeValue && schema.items) schema = schema.items;

  if (typeof callbackOrIndex === 'function') {
    return (isTypeValue ? schema : schema.enum).map((item, index) => {
      const title = isTypeValue ? item.title : schema.enumNames?.[index];
      return callbackOrIndex(
        title !== undefined ? title : item,
        item?.value !== undefined ? item.value : item,
      );
    });
  }

  if (!isTypeValue) return schema.enum[callbackOrIndex];

  const result = schema[callbackOrIndex];
  return result.value !== undefined ? result.value : result;
}

function inputCtrl(component, schema, onChange) {
  let properties = {};
  if (schema) {
    // TODO: infer maxLength, min, max, step, etc
    if (schema.type === 'number' || schema.type === 'integer')
      properties = { type: 'text' };
  }

  return {
    onChange: (event_) => {
      const value = !component.val ? event_ : component.val(event_, schema);
      onChange(value);
    },
    ...properties,
  };
}

function singleSelectCtrl(component, schema, onChange) {
  return {
    selected: (testValue, value) => value === testValue,
    onSelect: (event_) => {
      const value = !component.val ? event_ : component.val(event_, schema);
      if (value !== undefined) onChange(value);
    },
  };
}

function multipleSelectCtrl(component, schema, onChange) {
  return {
    multiple: true,
    selected: (testValue, values) => values?.indexOf(testValue) >= 0,
    onSelect: (event_, values) => {
      if (component.val) {
        const value = component.val(event_, schema);
        if (value !== undefined) onChange(value);
      } else {
        const index = values ? values.indexOf(event_) : -1;
        if (index < 0) onChange(values ? [event_, ...values] : [event_]);
        else onChange([...values.slice(0, index), ...values.slice(index + 1)]);
      }
    },
  };
}

function ctrlMap(component, properties: Properties) {
  const { schema, multiple, onChange } = properties;

  if (!schema) {
    return inputCtrl(component, schema, onChange);
  }

  if (!Array.isArray(schema)) {
    // schema is SchemaProperty here
    if ((!schema.enum && !schema.items) || schema.type === 'string') {
      return inputCtrl(component, schema, onChange);
    }
    if (multiple || schema.type === 'array') {
      return multipleSelectCtrl(component, schema, onChange);
    }
    return singleSelectCtrl(component, schema, onChange);
  }

  // schema is an array
  if (multiple) {
    return multipleSelectCtrl(component, schema, onChange);
  }
  return singleSelectCtrl(component, schema, onChange);
}

function componentMap(properties: Properties) {
  const { schema, type, multiple } = properties;

  if (!Array.isArray(schema)) {
    // schema is SchemaProperty | undefined here
    if (schema?.type === 'boolean' && schema?.description === 'slider') {
      return Slider;
    }

    if (!schema || (!schema.enum && !schema.items)) {
      if (type === 'checkbox' || schema?.type === 'boolean') {
        return CheckBox;
      }
      return type === 'textarea' ? TextArea : GenericInput;
    }

    // schema has enum or items (SchemaProperty with options)
    if (multiple || schema.type === 'array') {
      return type === 'checkbox' ? FieldSet : Select;
    }
    return type === 'radio' ? FieldSet : Select;
  }

  // schema is an array
  if (multiple) {
    return type === 'checkbox' ? FieldSet : Select;
  }
  return type === 'radio' ? FieldSet : Select;
}

type AnyComponentWithReferenceProperties = {
  Component: ComponentType<InputComponentProperties>;
  schema?: InputSchema;
  value?: unknown;
  onChange?: (value: unknown) => void;
  onSelect?: (event_: React.SyntheticEvent, values?: unknown[]) => void;
  selected?: (testValue: unknown, value: unknown) => boolean;
  multiple?: boolean;
  innerRef?: React.Ref<HTMLInputElement>;
  name?: string;
  className?: string;
  type?: string;
  placeholder?: string;
  isFocused?: boolean;
  checked?: boolean;
  'data-testid'?: string;
};

const AnyComponentWithReference = React.forwardRef(
  (
    { Component, ...properties }: AnyComponentWithReferenceProperties,
    reference: React.Ref<HTMLInputElement>,
  ) => <Component {...properties} innerRef={reference} />,
);

class Input extends PureComponent<
  Properties & { innerRef: React.Ref<HTMLInputElement> }
> {
  component: ComponentType<InputComponentProperties>;

  constructor(
    properties: Properties & { innerRef: React.Ref<HTMLInputElement> },
  ) {
    super(properties);
    this.component = (properties.component ||
      componentMap(properties)) as ComponentType<InputComponentProperties>;
  }

  render() {
    const {
      children: _children,
      onChange: _onChange,
      innerRef,
      ...restProperties
    } = this.props;
    const ctrl = ctrlMap(this.component, this.props);
    return (
      <AnyComponentWithReference
        Component={this.component}
        ref={innerRef}
        {...ctrl}
        {...restProperties}
      />
    );
  }
}

export default React.forwardRef(
  (properties: Properties, reference: React.Ref<HTMLInputElement>) => {
    return <Input innerRef={reference} {...properties} />;
  },
);
