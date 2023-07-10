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

import { Elements } from 'ketcher-core';
import { capitalize } from 'lodash/fp';

interface ElementNumberProps {
  label: string;
}

type Props = ElementNumberProps;

const ElementNumber = (props: Props) => {
  const { label } = props;
  const value = Elements.get(capitalize(label))?.number || '';

  return (
    <label>
      <span>Number</span>
      <input type="text" readOnly value={value} />
    </label>
  );
};

export default ElementNumber;
