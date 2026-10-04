/* eslint-disable react-you-might-not-need-an-effect/no-event-handler */
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
  type HTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';

import Input from '../Input/Input';
import Select from '../Select';
import styles from './measure-input.module.less';
import formClasses from '../form/form.module.less';
import { ErrorPopover } from '../form/errorPopover';
import {
  getSelectOptionsFromSchema,
  resolveTranslatableText,
} from '../../../utils';
import { MeasurementUnits } from 'src/script/ui/data/schema/options-schema';
import { usePopoverAnchor } from '../../../../../hooks';
import { Icon } from 'components';
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface Schema {
  title?: string;
  type?: string;
  default?: number | string;
  minimum?: number;
  maximum?: number;
  properties?: Record<string, Schema>;
}

interface MeasureInputProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  schema: Schema;
  extraSchema?: Schema;
  value: number | string;
  extraValue: string;
  onChange: (value: number) => void;
  onExtraChange: (value: string) => void;
  name?: string;
  error?: string;
  tooltip?: string;
}

interface GetNewFloatResult {
  isNewFloat: boolean;
  float?: string;
}

const UNIT_ENUM_NAMES = [
  'settings:units.px',
  'settings:units.cm',
  'settings:units.pt',
  'settings:units.inch',
];

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
  tooltip,
  ...rest
}: MeasureInputProps) => {
  const stringifiedValue = String(value);
  const [internalValue, setInternalValue] = useState(stringifiedValue);
  const [prevPropValue, setPrevPropValue] = useState(stringifiedValue);

  const internalValueRef = useRef(internalValue);
  const {
    anchorEl,
    handleOpen: handlePopoverOpen,
    handleClose: handlePopoverClose,
  } = usePopoverAnchor();

  if (prevPropValue !== stringifiedValue) {
    setPrevPropValue(stringifiedValue);
    setInternalValue(stringifiedValue);
    internalValueRef.current = stringifiedValue;
  }

  useEffect(() => {
    if (internalValue !== stringifiedValue) {
      onChange(Number.parseFloat(internalValue));
    }
  }, [internalValue, stringifiedValue, onChange]);

  const handleChange = (value: unknown) => {
    const newStringifiedValue = String(value);
    const startsWithZero =
      newStringifiedValue !== '0' && newStringifiedValue.startsWith('0');
    const zeroWithDot = startsWithZero && newStringifiedValue.includes('.');

    const endorcedValue =
      startsWithZero && !zeroWithDot
        ? newStringifiedValue.replace(/^0/, '')
        : newStringifiedValue || '0';
    const isNumber = !Number.isNaN(Number(endorcedValue));

    if (!isNumber) {
      return;
    }

    const newInternalValue = getNewInternalValue(
      internalValueRef.current,
      endorcedValue,
    );
    internalValueRef.current = newInternalValue;
    setInternalValue(newInternalValue);
  };

  const desc = schema;
  const { t } = useTranslation();
  const title = resolveTranslatableText(rest.title || desc?.title, t);
  const selectOptions = useMemo(
    () =>
      getSelectOptionsFromSchema(
        { enum: Object.values(MeasurementUnits), enumNames: UNIT_ENUM_NAMES },
        t,
      ),
    [t],
  );

  return (
    <div className={clsx(styles.measureInput, className)} {...rest}>
      {tooltip ? (
        <div className={formClasses.divWithTooltipAndAboutIcon}>
          <span>{title}</span>
          <Tooltip title={tooltip}>
            <div>
              <Icon name="about"></Icon>
            </div>
          </Tooltip>
        </div>
      ) : (
        <span>{title}</span>
      )}
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
              data-testid={`${title}-value-input`}
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
          data-testid={`${title}-measure-input`}
        />
      </div>
    </div>
  );
};

export default MeasureInput;
