/* eslint-disable @typescript-eslint/no-explicit-any */
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
import type { TFunction } from 'i18next';
import type { Option } from '../component/form/Select';

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

export function filterLib(lib, filter: string) {
  const trimmedFilter = filter.trim();
  const re = new RegExp(escapeRegExp(greekify(trimmedFilter)), 'i');
  return flow(
    _filter(
      (item: any) =>
        !trimmedFilter ||
        re.test(greekify(item.struct.name)) ||
        re.test(greekify(item.props.group)) ||
        (item.props.abbreviation && re.test(greekify(item.props.abbreviation))),
    ),
    reduce((res, item) => {
      if (!res[item.props.group]) res[item.props.group] = [item];
      else res[item.props.group].push(item);
      return res;
    }, {}),
  )(lib);
}

export function filterFGLib(lib, filter) {
  const trimmedFilter = filter.trim();
  const re = new RegExp(escapeRegExp(greekify(trimmedFilter)), 'i');
  const searchFunction = (item) => {
    const fields = [
      item.struct.name,
      item.props.abbreviation,
      item.props.name,
    ].filter(Boolean);
    return fields.some((field) => re.test(greekify(field)));
  };
  return flow(
    _filter((item: any) => !trimmedFilter || searchFunction(item)),
    reduce((res, item) => {
      if (!res[item.props.group]) res[item.props.group] = [item];
      else res[item.props.group].push(item);
      return res;
    }, {}),
  )(lib);
}

/**
 * Some schemas (e.g. options-schema.ts) store a translation key
 * ("namespace:key.path") in `title`/`enumNames` instead of literal display
 * text, so it can be resolved reactively at render time. Schemas sourced
 * from external/data-driven sources keep literal text with no namespace
 * prefix and are returned unchanged.
 */
export function resolveTranslatableText<T>(value: T, t?: TFunction): T {
  if (typeof value !== 'string' || !t || !value.includes(':')) {
    return value;
  }
  return t(value) as unknown as T;
}

export const getSelectOptionsFromSchema = (
  schema,
  t?: TFunction,
): Array<Option> => {
  return schema.enum.reduce((options, value, index) => {
    options.push({
      value,
      label: resolveTranslatableText(schema?.enumNames?.[index] ?? value, t),
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
export function memoizedDebounce(
  func,
  delay = 0,
  skipArguments: number[] = [],
) {
  let lastArgs;
  const debouncedFunction = _.debounce(func, delay);
  const getArgumentsToCompare = (args) =>
    args?.filter((_, index: number) => !skipArguments.includes(index)) || [];
  return function (...args) {
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
