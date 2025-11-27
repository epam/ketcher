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

// import classes from './select.module.less'

interface Schema {
  enum: string[];
  enumNames?: string[];
}

interface SelectListProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, 'onSelect'> {
  schema: Schema;
  value: string;
  onSelect: (opt: string, index: number) => void;
  splitIndexes?: number[];
  /* eslint-disable @typescript-eslint/no-unused-vars */
  selected?: string;
  component?: React.ComponentType<unknown>;
  /* eslint-enable @typescript-eslint/no-unused-vars */
  classes: {
    selected?: string;
    split?: string;
    [key: string]: string | undefined;
  };
}

function SelectList({
  schema,
  value,
  onSelect,
  splitIndexes,
  /* eslint-disable @typescript-eslint/no-unused-vars */
  selected,
  component,
  /* eslint-enable @typescript-eslint/no-unused-vars */
  classes,
  ...props
}: SelectListProps) {
  const handleKeyDown =
    (opt: string, index: number) =>
    (event: React.KeyboardEvent<HTMLLIElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect(opt, index);
      }
    };

  return (
    <ul {...props} role="listbox">
      {schema.enum.map((opt, index) => (
        <li
          key={opt}
          onClick={() => onSelect(opt, index)}
          onKeyDown={handleKeyDown(opt, index)}
          className={
            (opt === value ? `${classes.selected} ` : '') +
            (isSplitIndex(index, splitIndexes) ? ` ${classes.split}` : '')
          }
          role="option"
          tabIndex={0}
          aria-selected={opt === value}
        >
          {schema.enumNames ? schema.enumNames[index] : opt}
        </li>
      ))}
    </ul>
  );
}

function isSplitIndex(index: number, splitIndexes?: number[]): boolean {
  return index > 0 && splitIndexes?.includes(index) === true;
}

export default SelectList;
