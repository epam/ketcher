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

function ErrorsCheck(props) {
  const { moleculeErrors, checkSchema } = props;
  const moleculeErrorsTypes = Object.keys(moleculeErrors);

  const getOptionName = (option) => {
    const { items } = checkSchema.properties.checkOptions;
    const nameIndex = items.enum.indexOf(option);
    return items.enumNames[nameIndex];
  };

  return (
    <>
      <fieldset>
        {moleculeErrorsTypes.length === 0 ? (
          <div>
            <dd>No errors detected</dd>
          </div>
        ) : (
          moleculeErrorsTypes.map((type, key) => (
            <div key={key} data-testid={`${key}-warning`}>
              <dt>{getOptionName(type)} warning:</dt>
              <dd>{moleculeErrors[type]}</dd>
            </div>
          ))
        )}
      </fieldset>
    </>
  );
}

ErrorsCheck.propTypes = {
  moleculeErrors: PropTypes.object,
  checkSchema: PropTypes.shape({
    properties: PropTypes.shape({
      checkOptions: PropTypes.shape({
        items: PropTypes.shape({
          enum: PropTypes.arrayOf(PropTypes.string),
          enumNames: PropTypes.arrayOf(PropTypes.string),
        }),
      }),
    }),
  }),
};

export default ErrorsCheck;
