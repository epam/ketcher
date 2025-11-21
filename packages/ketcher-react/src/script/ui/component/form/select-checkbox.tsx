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

import { ComponentType } from 'react';
import Input from './Input/Input';

interface BooleanSchema {
  type: 'boolean';
  title?: string;
  default?: boolean;
}

interface EnumSchema {
  title?: string;
  enum: unknown[];
  enumNames?: string[];
  default?: unknown;
}

type Schema = BooleanSchema | EnumSchema;

interface SelectCheckboxProps {
  schema: Schema;
  type: string;
  value: number | string | boolean;
  onChange: (val: number | string | boolean) => void;
  component?: ComponentType;
  children?: React.ReactNode;
  className?: string;
  placeholder?: string;
  isFocused?: boolean;
  multiple?: boolean;
}

function SelectCheckbox({ schema, ...props }: SelectCheckboxProps) {
  let currentSchema: EnumSchema = schema as EnumSchema;
  if ('type' in schema && schema.type === 'boolean') {
    currentSchema = {
      title: schema.title,
      enum: [true, false],
      enumNames: ['on', 'off'],
      default: schema.default,
    };
  }

  return <Input schema={currentSchema} {...props} />;
}

export default SelectCheckbox;
