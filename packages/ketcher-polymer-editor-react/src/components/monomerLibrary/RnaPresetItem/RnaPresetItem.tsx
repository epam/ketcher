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
import { EmptyFunction } from 'helpers';
import { Card } from './styles';
import { IRnaPresetItemrops } from './types';
import { getPresetUniqueKey } from 'state/library';

const RnaPresetItem = ({
  preset,
  isSelected,
  onClick = EmptyFunction,
}: IRnaPresetItemrops) => {
  return (
    <Card
      data-testid={getPresetUniqueKey(preset)}
      onClick={onClick}
      selected={isSelected}
      code={preset.name}
      data-rna-preset-item-name={preset.name}
    >
      <span>{preset.name}</span>
    </Card>
  );
};

export { RnaPresetItem };
