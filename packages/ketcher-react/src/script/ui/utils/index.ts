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
import type { Template } from '../dialog/template/TemplateTable';

const GREEK_SIMBOLS: Record<string, string> = {
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

/** Library items grouped by their `props.group` value. */
type TemplateGroups = Record<string, Template[]>;

/**
 * Loose JSON-schema shape consumed by {@link getSelectOptionsFromSchema}.
 * Callers pass a variety of schema-ish objects (form `SchemaProperty`,
 * jsonschema `Schema`, plain records), so `enum`/`enumNames` are validated at
 * runtime rather than relied on structurally.
 */
type EnumSchemaLike =
  | { enum?: unknown; enumNames?: unknown }
  | Record<string, unknown>;

export function greekify(str: string): string {
  return str.replace(greekRe, (sym) => GREEK_SIMBOLS[sym]);
}

export function filterLib(lib: Template[], filter: string): TemplateGroups {
  const trimmedFilter = filter.trim();
  const re = new RegExp(escapeRegExp(greekify(trimmedFilter)), 'i');
  return flow(
    _filter(
      (item: Template) =>
        !trimmedFilter ||
        re.test(greekify(item.struct.name)) ||
        re.test(greekify(item.props.group)) ||
        (!!item.props.abbreviation &&
          re.test(greekify(item.props.abbreviation))),
    ),
    reduce((res: TemplateGroups, item: Template) => {
      if (!res[item.props.group]) res[item.props.group] = [item];
      else res[item.props.group].push(item);
      return res;
    }, {} as TemplateGroups),
  )(lib);
}

export function filterFGLib(lib: Template[], filter: string): TemplateGroups {
  const trimmedFilter = filter.trim();
  const re = new RegExp(escapeRegExp(greekify(trimmedFilter)), 'i');
  const searchFunction = (item: Template) => {
    const fields = [
      item.struct.name,
      item.props.abbreviation,
      item.props.name,
    ].filter((field): field is string => Boolean(field));
    return fields.some((field) => re.test(greekify(field)));
  };
  return flow(
    _filter((item: Template) => !trimmedFilter || searchFunction(item)),
    reduce((res: TemplateGroups, item: Template) => {
      if (!res[item.props.group]) res[item.props.group] = [item];
      else res[item.props.group].push(item);
      return res;
    }, {} as TemplateGroups),
  )(lib);
}

export const getSelectOptionsFromSchema = (
  schema?: EnumSchemaLike | null,
): Array<Option> => {
  const values = Array.isArray(schema?.enum) ? schema.enum : [];
  const names = Array.isArray(schema?.enumNames) ? schema.enumNames : undefined;
  return values.reduce<Array<Option>>((options, value, index) => {
    const label = names?.[index];
    options.push({
      value: String(value),
      label: typeof label === 'string' ? label : String(value),
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
  func: (...args: TArgs) => unknown,
  delay = 0,
  skipArguments: number[] = [],
) {
  let lastArgs: TArgs | undefined;
  const debouncedFunction = _.debounce(func, delay);
  const getArgumentsToCompare = (args: TArgs | undefined): unknown[] =>
    args?.filter((_value, index) => !skipArguments.includes(index)) ?? [];
  return (...args: TArgs): void => {
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
