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

import PropTypes from 'prop-types';
import classes from './TypeChoice.module.less';
import { GenericInput } from 'src/script/ui/component/form/Input/Input';

const typeSchema = [
  { title: 'Single', value: 'atom', testId: 'single-radio-button' },
  { title: 'List', value: 'list', testId: 'list-radio-button' },
  { title: 'Not List', value: 'not-list', testId: 'not-list-radio-button' },
];

function TypeChoice({ value, onChange, disabled, ...props }) {
  return (
    <fieldset className={classes.fieldset} disabled={disabled}>
      {typeSchema.map((type) => (
        <label key={type.title}>
          {/* eslint-disable jsx-a11y/label-has-associated-control */}
          <GenericInput
            type="radio"
            value={type.value}
            data-testid={type.testId}
            checked={type.value === value}
            onChange={() => onChange(type.value)}
            disabled={disabled}
            {...props}
          />
          {/* eslint-enable jsx-a11y/label-has-associated-control */}
          {type.title}
        </label>
      ))}
    </fieldset>
  );
}

TypeChoice.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default TypeChoice;
