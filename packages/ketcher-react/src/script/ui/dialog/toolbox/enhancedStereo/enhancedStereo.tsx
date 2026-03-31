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

import { StereoLabel, Struct } from 'ketcher-core';

import { Dialog } from '../../../views/components';
import { ChangeEvent, FC, useState } from 'react';
import classes from './enhancedStereo.module.less';
import { connect } from 'react-redux';
import { range } from 'lodash';
import inputClasses from '../../../component/form/Input/Input.module.less';

interface EnhancedStereoResult {
  andNumber: number;
  orNumber: number;
  type: string;
}

interface EnhancedStereoProps {
  init: EnhancedStereoResult & { init?: true };
  struct: Struct;
}

interface EnhancedStereoCallProps {
  onCancel: () => void;
  onOk: (res: unknown) => void;
}

type Props = EnhancedStereoProps & EnhancedStereoCallProps;

const EnhancedStereo: FC<Props> = (props) => {
  const { struct, init, ...rest } = props;

  const stereoLabels: Array<string> = findStereLabels(
    struct,
    Array.from(struct.atoms.keys()),
  );

  const maxAnd: number = maxOfAnds(stereoLabels);
  const maxOr: number = maxOfOrs(stereoLabels);

  const [type, setType] = useState<string>(init?.type ?? StereoLabel.Abs);
  const [andNumber, setAndNumber] = useState<number>(init?.andNumber ?? 1);
  const [orNumber, setOrNumber] = useState<number>(init?.orNumber ?? 1);

  const result = {
    type,
    andNumber,
    orNumber,
  };
  const valid = Boolean(type);

  const onAndNumberChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setAndNumber(Number(event.target.value));
  };

  const onOrNumberChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setOrNumber(Number(event.target.value));
  };

  const isAbs = type === StereoLabel.Abs;
  const isAnd = type === StereoLabel.And;
  const isOr = type === StereoLabel.Or;
  const isNewAnd = type === `${StereoLabel.And}${maxAnd + 1}`;
  const isNewOr = type === `${StereoLabel.Or}${maxOr + 1}`;

  return (
    <Dialog
      title="Enhanced Stereochemistry"
      className={classes.enhancedStereo}
      params={rest}
      result={() => result}
      valid={() => valid}
      withDivider
      buttons={['Cancel', 'OK']}
      buttonsNameMap={{ OK: 'Apply' }}
    >
      <fieldset key={type}>
        <label className={inputClasses.fieldSetLabel}>
          <input
            type="radio"
            name="enhanced-stereo-type"
            value={StereoLabel.Abs}
            checked={isAbs}
            onChange={() => setType(StereoLabel.Abs)}
            onClick={() => setType(StereoLabel.Abs)}
            className={inputClasses.input}
            data-testid="abs-radio"
          />
          <span className={inputClasses.radioButton} />
          ABS
        </label>
        {maxAnd !== 0 && (
          <label className={inputClasses.fieldSetLabel}>
            <input
              type="radio"
              name="enhanced-stereo-type"
              value={StereoLabel.And}
              checked={isAnd}
              onChange={() => setType(StereoLabel.And)}
              onClick={() => setType(StereoLabel.And)}
              className={inputClasses.input}
              data-testid="add-to-and-group-radio"
            />
            <span className={inputClasses.radioButton} />
            Add to AND
            <select
              value={andNumber}
              onChange={onAndNumberChange}
              className={classes.labelGroupSelect}
              data-testid="add-to-and-group"
            >
              {range(1, maxAnd + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            Group
          </label>
        )}
        {maxOr !== 0 && (
          <label className={inputClasses.fieldSetLabel}>
            <input
              type="radio"
              name="enhanced-stereo-type"
              value={StereoLabel.Or}
              checked={isOr}
              onChange={() => setType(StereoLabel.Or)}
              onClick={() => setType(StereoLabel.Or)}
              className={inputClasses.input}
              data-testid="add-to-or-group-radio"
            />
            <span className={inputClasses.radioButton} />
            Add to OR
            <select
              value={orNumber}
              onChange={onOrNumberChange}
              className={classes.labelGroupSelect}
              data-testid="add-to-or-group"
            >
              {range(1, maxOr + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            Group
          </label>
        )}
        <label className={inputClasses.fieldSetLabel}>
          <input
            type="radio"
            name="enhanced-stereo-type"
            value={`${StereoLabel.And}${maxAnd + 1}`}
            checked={isNewAnd}
            onChange={() => setType(`${StereoLabel.And}${maxAnd + 1}`)}
            onClick={() => setType(`${StereoLabel.And}${maxAnd + 1}`)}
            className={inputClasses.input}
            data-testid="create-new-and-group-radio"
          />
          <span className={inputClasses.radioButton} />
          Create new AND Group
        </label>
        <label className={inputClasses.fieldSetLabel}>
          <input
            type="radio"
            name="enhanced-stereo-type"
            value={`${StereoLabel.Or}${maxOr + 1}`}
            checked={isNewOr}
            onChange={() => setType(`${StereoLabel.Or}${maxOr + 1}`)}
            onClick={() => setType(`${StereoLabel.Or}${maxOr + 1}`)}
            className={inputClasses.input}
            data-testid="create-new-or-group-radio"
          />
          <span className={inputClasses.radioButton} />
          Create new OR Group
        </label>
      </fieldset>
    </Dialog>
  );
};

// TODO: Move the function below to Struct class
function findStereLabels(struct, aids): Array<string> {
  const stereoIds = aids.filter(
    (aid) => struct.atoms.get(aid).stereoLabel !== null,
  );
  return stereoIds.map((aid) => struct.atoms.get(aid).stereoLabel);
}

function maxOfAnds(stereLabels): number {
  const numbers = stereLabels.map((label) => {
    return label.match(/&/) ? +label.match(/\d+/)?.join() : 0;
  });
  return numbers.length === 0 ? 0 : Math.max(...numbers);
}

function maxOfOrs(stereLabels): number {
  const numbers = stereLabels.map((label) => {
    return label.match(/or/) ? +label.match(/\d+/)?.join() : 0;
  });
  return numbers.length === 0 ? 0 : Math.max(...numbers);
}

export default connect((state: any) => ({
  struct: state.editor.struct(),
}))(EnhancedStereo as any);
