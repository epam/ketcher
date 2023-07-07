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

import React, { PureComponent, ComponentType, useRef, useEffect } from 'react';

import classes from './Input.module.less';
import clsx from 'clsx';

type Props = {
  component?: ComponentType;
  children?: React.ReactNode;
  className?: string;
  type: string;
  value: number | string | boolean;
  onChange: (val: any) => void;
  placeholder?: string;
  isFocused?: boolean;
  innerRef?: React.Ref<any>;
  schema?: any;
  multiple?: boolean;
};

export function GenericInput({
  /* eslint-disable @typescript-eslint/no-unused-vars */
  schema,
  /* eslint-enable @typescript-eslint/no-unused-vars */
  value,
  onChange,
  innerRef,
  type = 'text',
  isFocused = false,
  ...props
}) {
  const inputRef = useRef<HTMLInputElement>(innerRef);

  useEffect(() => {
    if (innerRef && inputRef.current) {
      innerRef.current = inputRef.current;
    }
  }, [innerRef]);

  useEffect(() => {
    if (inputRef.current && isFocused) {
      inputRef.current.focus();
    }
  }, [inputRef, isFocused]);

  return (
    <>
      <input
        type={type}
        value={value ?? ''}
        onInput={onChange}
        onChange={onChange}
        className={clsx(classes.input, classes.genericInput)}
        ref={inputRef}
        {...props}
      />
      {type === 'checkbox' && <span className={classes.checkbox} />}
      {type === 'radio' && <span className={classes.radioButton} />}
    </>
  );
}

GenericInput.val = function (ev, schema) {
  const input = ev.target;
  const isNumber =
    input.type === 'number' ||
    input.type === 'range' ||
    (schema && (schema.type === 'number' || schema.type === 'integer'));
  const value = isNumber ? input.value.replace(/,/g, '.') : input.value;

  return isNumber && !isNaN(value - 0) ? value - 0 : value; // eslint-disable-line
};

function TextArea({
  /* eslint-disable @typescript-eslint/no-unused-vars */
  schema,
  /* eslint-enable @typescript-eslint/no-unused-vars */
  value,
  onChange,
  innerRef,
  ...rest
}) {
  return <textarea value={value} ref={innerRef} onInput={onChange} {...rest} />;
}

TextArea.val = (ev) => ev.target.value;

function CheckBox({
  /* eslint-disable @typescript-eslint/no-unused-vars */
  schema,
  /* eslint-enable @typescript-eslint/no-unused-vars */
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

CheckBox.val = function (ev) {
  ev.stopPropagation();
  return !!ev.target.checked;
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
      {enumSchema(schema, (title, val) => (
        <option key={val} value={val}>
          {title}
        </option>
      ))}
    </select>
  );
}

Select.val = function (ev, schema) {
  const select = ev.target as HTMLSelectElement;
  if (!select.multiple) return enumSchema(schema, select.selectedIndex);

  const options = select.options;

  return Array.from(options).reduce(
    (res, o: HTMLOptionElement, i) =>
      !o.selected ? res : [enumSchema(schema, i), ...res],
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
  ...rest
}) {
  return (
    <fieldset onClick={onSelect}>
      {enumSchema(schema, (title, val) => (
        <li key={title} className={classes.fieldSetItem}>
          <label className={classes.fieldSetLabel}>
            <input
              type={type}
              defaultChecked={
                type === 'radio' ? selected(val, checked) : selected(val, value)
              }
              value={typeof val !== 'object' && val}
              className={classes.input}
              {...rest}
            />
            {type === 'checkbox' && <span className={classes.checkbox} />}
            {type === 'radio' && <span className={classes.radioButton} />}
            {title}
          </label>
        </li>
      ))}
    </fieldset>
  );
}

FieldSet.val = function (ev, schema) {
  const input = ev.target as HTMLInputElement;

  if (ev.target.tagName !== 'INPUT') {
    ev.stopPropagation();
    return undefined;
  }

  // Hm.. looks like premature optimization
  //      should we inline this?

  const fieldset = input?.parentNode?.parentNode?.parentNode;
  const inputCollection = fieldset?.querySelectorAll('input');
  let result;

  if (inputCollection?.length) {
    result = Array.from(inputCollection).reduce(
      (res, inp: HTMLInputElement, i) =>
        !inp.checked ? res : [enumSchema(schema, i), ...res],

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

Slider.val = function (ev) {
  ev.stopPropagation();
  return !!ev.target.checked;
};

function enumSchema(schema, cbOrIndex) {
  const isTypeValue = Array.isArray(schema);
  if (!isTypeValue && schema.items) schema = schema.items;

  if (typeof cbOrIndex === 'function') {
    return (isTypeValue ? schema : schema.enum).map((item, i) => {
      const title = isTypeValue
        ? item.title
        : schema.enumNames && schema.enumNames[i];
      return cbOrIndex(
        title !== undefined ? title : item,
        item && item.value !== undefined ? item.value : item,
      );
    });
  }

  if (!isTypeValue) return schema.enum[cbOrIndex];

  const res = schema[cbOrIndex];
  return res.value !== undefined ? res.value : res;
}

function inputCtrl(component, schema, onChange) {
  let props = {};
  if (schema) {
    // TODO: infer maxLength, min, max, step, etc
    if (schema.type === 'number' || schema.type === 'integer')
      props = { type: 'text' };
  }

  return {
    onChange: (ev) => {
      const val = !component.val ? ev : component.val(ev, schema);
      onChange(val);
    },
    ...props,
  };
}

function singleSelectCtrl(component, schema, onChange) {
  return {
    selected: (testVal, value) => value === testVal,
    onSelect: (ev) => {
      const val = !component.val ? ev : component.val(ev, schema);
      if (val !== undefined) onChange(val);
    },
  };
}

function multipleSelectCtrl(component, schema, onChange) {
  return {
    multiple: true,
    selected: (testVal, values) => values && values.indexOf(testVal) >= 0,
    onSelect: (ev, values) => {
      if (component.val) {
        const val = component.val(ev, schema);
        if (val !== undefined) onChange(val);
      } else {
        const i = values ? values.indexOf(ev) : -1;
        if (i < 0) onChange(values ? [ev, ...values] : [ev]);
        else onChange([...values.slice(0, i), ...values.slice(i + 1)]);
      }
    },
  };
}

function ctrlMap(component, props: Props) {
  const { schema, multiple, onChange } = props;
  if (
    !schema ||
    (!schema.enum && !schema.items && !Array.isArray(schema)) ||
    schema.type === 'string'
  )
    return inputCtrl(component, schema, onChange);

  if (multiple || schema.type === 'array')
    return multipleSelectCtrl(component, schema, onChange);

  return singleSelectCtrl(component, schema, onChange);
}

function componentMap(props: Props) {
  const { schema, type, multiple } = props;

  if (schema?.type === 'boolean' && schema?.description === 'slider') {
    return Slider;
  }

  if (!schema || (!schema.enum && !schema.items && !Array.isArray(schema))) {
    if (type === 'checkbox' || (schema && schema.type === 'boolean')) {
      return CheckBox;
    }

    return type === 'textarea' ? TextArea : GenericInput;
  }

  if (multiple || schema.type === 'array')
    return type === 'checkbox' ? FieldSet : Select;

  return type === 'radio' ? FieldSet : Select;
}

const AnyComponentWithRef = React.forwardRef(
  ({ Component, ...props }: any, ref) => (
    <Component {...props} innerRef={ref} />
  ),
);

class Input extends PureComponent<
  Props & { innerRef: React.Ref<HTMLInputElement> }
> {
  component: any;
  ctrl: {
    type?: string;
    onChange?: (val: any) => void;
    onSelect?: (ev, values) => void;
    selected?: (testVal: any, value: any) => boolean;
    multiple?: boolean;
  };

  constructor(props: Props & { innerRef: React.Ref<HTMLInputElement> }) {
    super(props);
    this.component = props.component || componentMap(props);
    this.ctrl = ctrlMap(this.component, props);
  }

  render() {
    const {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      children,
      onChange,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      innerRef,
      ...restProps
    } = this.props;
    return (
      <AnyComponentWithRef
        Component={this.component}
        ref={innerRef}
        {...this.ctrl}
        {...restProps}
      />
    );
  }
}

export default React.forwardRef(
  (props: Props, ref: React.Ref<HTMLInputElement>) => {
    return <Input innerRef={ref} {...props} />;
  },
);
