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
import _ from 'lodash';
import { escapeRegExp, filter as _filter, flow, reduce } from 'lodash/fp';
import type { Option } from '../component/form/Select';

interface LibraryItem {
  struct: {
    name: string;
  };
  props: {
    group?: string;
    abbreviation?: string;
    name?: string;
  };
}

type GroupedLibrary<T extends LibraryItem> = Record<string, T[]>;

interface SelectOptionsSchema {
  enum?: unknown[];
  enumNames?: string[];
}

const GREEK_SIMBOLS = {
  Alpha: 'A',
  alpha: 'α',
  Beta: 'B',
  beta: 'β',
  Gamma: 'Г',
  gamma: 'γ',
};

const greekRe = new RegExp(
  '\\b' + Object.keys(GREEK_SIMBOLS).join('\\b|\\b') + '\\b',
  'g',
);

export function greekify(str: string): string {
  return str.replace(greekRe, (sym) => GREEK_SIMBOLS[sym]);
}

export function filterLib<T extends LibraryItem>(
  lib: T[],
  filter: string,
): GroupedLibrary<T> {
  const trimmedFilter = filter.trim();
  const re = new RegExp(escapeRegExp(greekify(trimmedFilter)), 'i');
  return flow(
    _filter(
      (item: T) =>
        !trimmedFilter ||
        re.test(greekify(item.struct.name)) ||
        re.test(greekify(item.props.group || '')) ||
        re.test(greekify(item.props.abbreviation || '')),
    ),
    reduce((res: GroupedLibrary<T>, item: T) => {
      const group = item.props.group || '';
      if (!res[group]) res[group] = [item];
      else res[group].push(item);
      return res;
    }, {} as GroupedLibrary<T>),
  )(lib);
}

export function filterFGLib<T extends LibraryItem>(
  lib: T[],
  filter: string,
): GroupedLibrary<T> {
  const trimmedFilter = filter.trim();
  const re = new RegExp(escapeRegExp(greekify(trimmedFilter)), 'i');
  const searchFunction = (item: T): boolean => {
    const fields = [
      item.struct.name,
      item.props.abbreviation,
      item.props.name,
    ].filter((field): field is string => typeof field === 'string');
    return fields.some((field) => re.test(greekify(field)));
  };
  return flow(
    _filter((item: T) => !trimmedFilter || searchFunction(item)),
    reduce((res: GroupedLibrary<T>, item: T) => {
      const group = item.props.group || '';
      if (!res[group]) res[group] = [item];
      else res[group].push(item);
      return res;
    }, {} as GroupedLibrary<T>),
  )(lib);
}

export const getSelectOptionsFromSchema = (
  schema?: SelectOptionsSchema,
): Array<Option> => {
  const enumValues = Array.isArray(schema?.enum)
    ? schema.enum.filter(
        (value): value is string | number | boolean =>
          ['string', 'number', 'boolean'].includes(typeof value),
      )
    : [];

  return enumValues.reduce<Array<Option>>((options, value, index) => {
    options.push({
      value: String(value),
      label: schema?.enumNames?.[index] ?? String(value),
    });

    return options;
  }, []);
};

/**
 * Creates a function, which is not called if the current argument is the same as the last one
 * @param func function to be debounced
 * @param delay delay in ms
 * @param skipArguments indexes in arguments array to skip for comparison
 * @returns debounced function, which is not called with previous argument
 */
export function memoizedDebounce<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  delay = 0,
  skipArguments: number[] = [],
) {
  let lastArgs: TArgs | undefined;
  const debouncedFunction = _.debounce(func, delay);
  const getArgumentsToCompare = (args?: TArgs) =>
    args?.filter((_, index: number) => !skipArguments.includes(index)) || [];
  return function (...args: TArgs) {
    const lastArgsToCompare = getArgumentsToCompare(lastArgs);
    const argsToCompare = getArgumentsToCompare(args);
    if (lastArgs && _.isEqual(argsToCompare, lastArgsToCompare)) {
      return;
    }
    lastArgs = args;
    debouncedFunction(...args);
  };
}

export { fileOpener } from './fileOpener';
