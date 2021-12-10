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

function ErrorsCheck(props) {
  const { moleculeErrors, checkSchema } = props
  const moleculeErrorsTypes = Object.keys(moleculeErrors)

  const getOptionName = (option) => {
    const { items } = checkSchema.properties.checkOptions
    const nameIndex = items.enum.indexOf(option)
    return items.enumNames[nameIndex]
  }

  return (
    <>
      <label>Warnings</label>
      <fieldset>
        {moleculeErrorsTypes.length === 0 ? (
          <div>
            <dd>No errors found</dd>
          </div>
        ) : (
          moleculeErrorsTypes.map((type, key) => (
            <div key={key}>
              <dt>{getOptionName(type)} warning:</dt>
              <dd>{moleculeErrors[type]}</dd>
            </div>
          ))
        )}
      </fieldset>
    </>
  )
}

export default ErrorsCheck
