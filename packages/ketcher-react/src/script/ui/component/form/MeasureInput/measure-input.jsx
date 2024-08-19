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

import { useEffect, useState } from 'react';
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
  extraSchema,
  value,
  extraValue,
  onChange,
  onExtraChange,
  name,
  className,
  ...rest
}) => {
  const [measure, setMeasure] = useState(
    extraValue || extraSchema?.default || MeasurementUnits.Px,
  );
  const [cust, setCust] = useState(value || schema.default);

  useEffect(() => {
    if (measure === MeasurementUnits.Px && cust?.toFixed() - 0 !== value) {
      setMeasure(MeasurementUnits.Px);
      setCust(value);
    } // Hack: Set init value (RESET)
  }, []);

  useEffect(() => {
    setMeasure(extraValue);
  }, [extraValue]);

  const handleChange = (value) => {
    const convValue = convertValue(value, measure, MeasurementUnits.Px);
    setCust(value);
    onChange(convValue);
  };

  const handleMeasChange = (unit) => {
    setCust((prev) => {
      convertValue(prev, measure, unit);
    });
    setMeasure(unit);
    onExtraChange(unit);
  };

  useEffect(() => {
    setCust(convertValue(value, MeasurementUnits.Px, measure));
  }, [value, measure]);

  const desc = schema || schema.properties[name];

  return (
    <div className={clsx(styles.measureInput, className)} {...rest}>
      <span>{rest.title || desc.title}</span>
      <div style={{ display: 'flex' }}>
        <Input
          schema={schema}
          step={
            measure === MeasurementUnits.Px || measure === MeasurementUnits.Pt
              ? '1'
              : '0.001'
          }
          value={cust}
          onChange={handleChange}
        />
        <Select
          onChange={handleMeasChange}
          options={selectOptions}
          value={measure}
          className={styles.select}
        />
      </div>
    </div>
  );
};

const measureMap = {
  px: 1,
  cm: 37.795278,
  pt: 1.333333,
  inch: 96,
};

function convertValue(value, measureFrom, measureTo) {
  if ((!value && value !== 0) || isNaN(value)) return null; // eslint-disable-line

  return measureTo === MeasurementUnits.Px || measureTo === MeasurementUnits.Pt
    ? ((value * measureMap[measureFrom]) / measureMap[measureTo]).toFixed() - 0
    : ((value * measureMap[measureFrom]) / measureMap[measureTo]).toFixed(3) -
        0;
}

export default MeasureInput;
