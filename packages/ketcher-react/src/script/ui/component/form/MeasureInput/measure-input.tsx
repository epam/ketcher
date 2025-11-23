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
import Select, { Option } from '../Select';
import styles from './measure-input.module.less';
import { getSelectOptionsFromSchema } from '../../../utils';
import { MeasurementUnits } from 'src/script/ui/data/schema/options-schema';

const selectOptions: Array<Option> = getSelectOptionsFromSchema({
  enum: Object.values(MeasurementUnits),
});

interface FloatResult {
  isNewFloat: boolean;
  float?: string;
}

/**
 * @param {string} value
 * @returns {FloatResult}
 * */
const getNewFloat = (value: string): FloatResult => {
  const [int, float] = value.split('.');
  const isNewFloat = float?.length > 1;

  return {
    isNewFloat,
    ...(isNewFloat && { float: `${int}.${float[float.length - 1]}` }),
  };
};

/**
 * @param {string} prevValue
 * @param {string} enforcedValue
 * @returns {string}
 * */
const getNewInternalValue = (
  prevValue: string,
  enforcedValue: string,
): string => {
  const newValueEndsWithDot = enforcedValue?.endsWith('.');
  const prevValueHasDot = prevValue?.includes('.');
  const isDotDeleted = prevValueHasDot && newValueEndsWithDot;
  const isDotAdded = !prevValueHasDot && newValueEndsWithDot;

  if (isDotDeleted) {
    return enforcedValue.replace(/\.$/, '');
  }

  if (isDotAdded) {
    return enforcedValue + '0';
  }

  const { isNewFloat, float } = getNewFloat(enforcedValue);

  if (isNewFloat && float) {
    return float;
  }

  return enforcedValue;
};

interface SchemaProperties {
  [key: string]: {
    title?: string;
    type?: string;
    [key: string]: unknown;
  };
}

interface Schema {
  title?: string;
  type?: string;
  properties?: SchemaProperties;
  [key: string]: unknown;
}

interface MeasureInputProps {
  schema?: Schema;
  extraSchema?: Schema;
  value: number | string;
  extraValue: string;
  onChange: (value: number) => void;
  onExtraChange: (value: string) => void;
  name: string;
  className?: string;
  title?: string;
  'data-testid'?: string;
}

const MeasureInput = ({
  schema,
  extraSchema: _,
  value,
  extraValue,
  onChange,
  onExtraChange,
  name: _name,
  className,
  ...rest
}: MeasureInputProps) => {
  const [internalValue, setInternalValue] = useState(String(value));

  // NOTE: onChange handler in the Input component (packages/ketcher-react/src/script/ui/component/form/Input/Input.tsx)
  // is mapped to the internal function via constructor
  // therefore the references to the MeasureInput's state are not updated
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalValue]);

  const handleChange = (value: number | string | boolean) => {
    const stringifiedValue = String(value);
    const startsWithZero =
      stringifiedValue !== '0' && stringifiedValue.startsWith('0');
    const zeroWithDot = startsWithZero && stringifiedValue.includes('.');

    const enforcedValue =
      startsWithZero && !zeroWithDot
        ? stringifiedValue.replace(/^0/, '')
        : stringifiedValue || '0';
    const isNumber = !isNaN(Number(enforcedValue));

    if (isNumber) {
      setInternalValue((prevValue) =>
        getNewInternalValue(prevValue, enforcedValue),
      );
    }
  };

  const desc = schema;

  return (
    <div className={clsx(styles.measureInput, className)} {...rest}>
      <span>{rest.title || desc?.title}</span>
      <div style={{ display: 'flex' }}>
        <Input
          schema={schema}
          type="text"
          value={internalValue}
          onChange={handleChange}
          data-testid={`${desc?.title}-value-input`}
        />
        <Select
          onChange={onExtraChange}
          options={selectOptions}
          value={extraValue}
          className={styles.select}
          data-testid={`${desc?.title}-measure-input`}
        />
      </div>
    </div>
  );
};

export default MeasureInput;
