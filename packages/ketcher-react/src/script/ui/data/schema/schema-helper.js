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

/* schema utils */
function constant(schema, prop) {
  const desc = schema.properties[prop];
  return desc.constant || desc.enum[0]; // see https://git.io/v6hyP
}

export function mapOf(schema, prop) {
  console.assert(schema.oneOf);
  return schema.oneOf.reduce((res, desc) => {
    res[constant(desc, prop)] = desc;
    return res;
  }, {});
}

export function selectListOf(schema, prop) {
  const desc = schema.properties && schema.properties[prop];
  if (desc) {
    return desc.enum.map((value, i) => {
      const title = desc.enumNames && desc.enumNames[i];
      return title ? { title, value } : value;
    });
  }
  return schema.oneOf.map((ds) =>
    !ds.title
      ? constant(ds, prop)
      : {
          title: ds.title,
          value: constant(ds, prop),
        },
  );
}
