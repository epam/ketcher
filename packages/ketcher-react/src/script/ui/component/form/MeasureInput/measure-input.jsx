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
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    const parsedInternalValue = parseFloat(internalValue);

    if (!isNaN(parsedInternalValue)) {
      onChange(parsedInternalValue);
    }
  }, [internalValue]);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (value) => {
    const endorcedValue = value || 0;
    const isNumber = !isNaN(parseFloat(endorcedValue));

    console.log(parseFloat(endorcedValue));

    if (isNumber) {
      setInternalValue(endorcedValue);
    }
  };

  const handleMeasChange = (unit) => {
    onExtraChange(unit);
  };

  const desc = schema || schema.properties[name];

  return (
    <div className={clsx(styles.measureInput, className)} {...rest}>
      <span>{rest.title || desc.title}</span>
      <div style={{ display: 'flex' }}>
        <Input schema={schema} value={internalValue} onChange={handleChange} />
        <Select
          onChange={handleMeasChange}
          options={selectOptions}
          value={extraValue}
          className={styles.select}
        />
      </div>
    </div>
  );
};

export default MeasureInput;
