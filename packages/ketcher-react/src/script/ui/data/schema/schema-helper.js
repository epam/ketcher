/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

/* schema utils */
function constant(schema, property) {
  const desc = schema.properties[property];
  return desc.constant || desc.enum[0]; // see https://git.io/v6hyP
}

export function mapOf(schema, property) {
  console.assert(schema.oneOf);
  return schema.oneOf.reduce((result, desc) => {
    result[constant(desc, property)] = desc;
    return result;
  }, {});
}

export function selectListOf(schema, property) {
  const desc = schema.properties?.[property];
  if (desc) {
    return desc.enum.map((value, index) => {
      const title = desc.enumNames?.[index];
      return title ? { title, value } : value;
    });
  }
  return schema.oneOf.map((ds) =>
    ds.title
      ? {
          title: ds.title,
          value: constant(ds, property),
        }
      : constant(ds, property),
  );
}
