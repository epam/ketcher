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

import { type HTMLAttributes, useState, useEffect } from 'react';
import clsx from 'clsx';

import Input from '../Input/Input';
import Select from '../Select';
import styles from './measure-input.module.less';
import formClasses from '../form/form.module.less';
import { ErrorPopover } from '../form/errorPopover';
import { getSelectOptionsFromSchema } from '../../../utils';
import { MeasurementUnits } from 'src/script/ui/data/schema/options-schema';
import { usePopoverAnchor } from '../../../../../hooks';

interface Schema {
  title?: string;
  type?: string;
  default?: number | string;
  minimum?: number;
  maximum?: number;
  properties?: Record<string, Schema>;
}

interface MeasureInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  schema: Schema;
  extraSchema?: Schema;
  value: number | string;
  extraValue: string;
  onChange: (value: number) => void;
  onExtraChange: (value: string) => void;
  name?: string;
  error?: string;
}

interface GetNewFloatResult {
  isNewFloat: boolean;
  float?: string;
}

const selectOptions = getSelectOptionsFromSchema({
  enum: Object.values(MeasurementUnits),
});

const getNewFloat = (value: string): GetNewFloatResult => {
  const [int, float] = value.split('.');
  const isNewFloat = float?.length > 1;

  return {
    isNewFloat,
    ...(isNewFloat && { float: `${int}.${float[float.length - 1]}` }),
  };
};

const getNewInternalValue = (
  prevValue: string,
  endorcedValue: string,
): string => {
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
    return float as string;
  }

  return endorcedValue;
};

const MeasureInput = ({
  schema,
  extraSchema: _extraSchema,
  value,
  extraValue,
  onChange,
  onExtraChange,
  name: _name,
  error,
  className,
  ...rest
}: MeasureInputProps) => {
  const stringifiedValue = String(value);
  const [internalValue, setInternalValue] = useState(stringifiedValue);
  const [prevPropValue, setPrevPropValue] = useState(stringifiedValue);
  const {
    anchorEl,
    handleOpen: handlePopoverOpen,
    handleClose: handlePopoverClose,
  } = usePopoverAnchor();

  if (prevPropValue !== stringifiedValue) {
    setPrevPropValue(stringifiedValue);
    setInternalValue(stringifiedValue);
  }

  // Input binds onChange once in its constructor, so handleChange is stuck with
  // the first render's closure and cannot call the current onChange. This effect
  // is re-created every render, so it always holds the latest onChange/value —
  // hence the deliberate single-dep list.
  useEffect(() => {
    if (internalValue !== stringifiedValue) {
      onChange(parseFloat(internalValue));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalValue]);

  const handleChange = (value: unknown) => {
    const stringifiedValue = String(value);
    const startsWithZero =
      stringifiedValue !== '0' && stringifiedValue.startsWith('0');
    const zeroWithDot = startsWithZero && stringifiedValue.includes('.');

    const endorcedValue =
      startsWithZero && !zeroWithDot
        ? stringifiedValue.replace(/^0/, '')
        : stringifiedValue || '0';
    const isNumber = !isNaN(Number(endorcedValue));

    if (isNumber) {
      setInternalValue((prevValue) =>
        getNewInternalValue(prevValue, endorcedValue),
      );
    }
  };

  const desc = schema;

  return (
    <div className={clsx(styles.measureInput, className)} {...rest}>
      <span>{rest.title || desc?.title}</span>
      <div style={{ display: 'flex' }}>
        <div className={clsx(error && formClasses.dataError)}>
          <span
            className={clsx(formClasses.inputWrapper, styles.errorWrapper)}
            onMouseEnter={error ? handlePopoverOpen : undefined}
            onMouseLeave={error ? handlePopoverClose : undefined}
            role="none"
          >
            <Input
              schema={schema}
              value={internalValue}
              onChange={handleChange}
              type="text"
              data-testid={`${desc?.title}-value-input`}
            />
          </span>
          {error && anchorEl && (
            <ErrorPopover
              anchorEl={anchorEl}
              open={!!anchorEl}
              error={error}
              onClose={handlePopoverClose}
            />
          )}
        </div>
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
