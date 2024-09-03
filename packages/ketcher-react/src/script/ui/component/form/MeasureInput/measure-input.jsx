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

import { useState, useEffect } from 'react';
import clsx from 'clsx';

import Input from '../Input/Input';
import Select from '../Select';
import styles from './measure-input.module.less';
import { getSelectOptionsFromSchema } from '../../../utils';
import { MeasurementUnits } from 'src/script/ui/data/schema/options-schema';

const selectOptions = getSelectOptionsFromSchema({
  enum: Object.values(MeasurementUnits),
});

/**
 * @param {string} value
 * @returns {isNewFloat: boolean, float: string}
 * */
const getNewFloat = (value) => {
  const [int, float] = value.split('.');
  const isNewFloat = float?.length > 1;

  return {
    isNewFloat,
    ...(isNewFloat && { float: `${int}.${float[float.length - 1]}` }),
  };
};

/**
 * @param {string} prevValue
 * @param {string} endorcedValue
 * @returns {string}
 * */
const getNewInternalValue = (prevValue, endorcedValue) => {
  const newValueEndsWithDot = endorcedValue?.endsWith('.');
  const prevValueHasDot = prevValue?.includes('.');
  const isDotDeleted = prevValueHasDot && newValueEndsWithDot;
  const isDotAdded = !prevValueHasDot && newValueEndsWithDot;

  if (isDotDeleted) {
    return endorcedValue.replace(/\.$/, '');
  }

  if (isDotAdded) {
    return endorcedValue + '0';
  }

  const { isNewFloat, float } = getNewFloat(endorcedValue);

  if (isNewFloat) {
    return float;
  }

  return endorcedValue;
};

const MeasureInput = ({
  schema,
  extraSchema: _,
  value,
  extraValue,
  onChange,
  onExtraChange,
  name,
  className,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState(String(value));

  // NOTE: onChange handler in the Input comopnent (packages/ketcher-react/src/script/ui/component/form/Input/Input.tsx)
  // is mapped to the internal function via constructor
  // therefore the referencies to the MeasureInput's state are not updated
  // so we need to sync the props and the internal value through useEffects and use callbacks with
  // previous state to have the latest value

  useEffect(() => {
    setInternalValue((prevValue) => {
      if (prevValue !== String(value)) {
        return String(value);
      }

      return prevValue;
    });
  }, [value]);

  useEffect(() => {
    if (internalValue !== String(value)) {
      const isNewInternalValueValid = !isNaN(parseFloat(internalValue));

      if (isNewInternalValueValid) {
        onChange(parseFloat(internalValue));
      }
    }
  }, [internalValue]);

  const handleChange = (value) => {
    const stringifiedValue = String(value);
    const startsWithZero =
      stringifiedValue !== '0' && stringifiedValue.startsWith('0');

    const endorcedValue = startsWithZero
      ? stringifiedValue.replace(/^0+/, '')
      : stringifiedValue || '0';
    const isNumber = !isNaN(endorcedValue);

    if (isNumber) {
      setInternalValue((prevValue) =>
        getNewInternalValue(prevValue, endorcedValue),
      );
    }
  };

  const desc = schema || schema.properties[name];

  return (
    <div className={clsx(styles.measureInput, className)} {...rest}>
      <span>{rest.title || desc.title}</span>
      <div style={{ display: 'flex' }}>
        <Input schema={schema} value={internalValue} onChange={handleChange} />
        <Select
          onChange={onExtraChange}
          options={selectOptions}
          value={extraValue}
          className={styles.select}
        />
      </div>
    </div>
  );
};

export default MeasureInput;
