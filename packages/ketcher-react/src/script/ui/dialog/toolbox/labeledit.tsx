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

import Form, { Field } from '../../component/form/form/form';

import { Dialog } from 'components';
import { Elements } from 'ketcher-core';
import { capitalize } from 'lodash/fp';
import { connect } from 'react-redux';
import { labelEdit as labelEditSchema } from '../../data/schema/struct-schema';
import styles from './labelEdit.module.less';

interface AtomLabelData {
  label: string;
  charge: number | null;
  isotope: number | null;
  radical: number;
}

interface LabelEditFormState {
  errors: Record<string, string>;
  valid: boolean;
  result: {
    label: string;
  };
}

interface LabelEditProps extends AtomLabelData {
  letter?: string;
  formState: LabelEditFormState;
  onCancel: () => void;
  onOk: (result: unknown) => void;
}

export function serialize(lc: AtomLabelData): string {
  const charge = Math.abs(lc.charge ?? 0);
  const radical = ['', ':', '.', '^^'][lc.radical] || '';
  let sign = '';
  if (charge) {
    sign = (lc.charge ?? 0) < 0 ? '-' : '+';
  }
  return (
    (lc.isotope ?? '') + lc.label + radical + (charge > 1 ? charge : '') + sign
  );
}

const LABEL_REGEX = /^(\d+)?([a-z*]{1,3})(\.|:|\^\^)?(\d+[-+]|[-+])?$/i;
const VALID_GENERIC_LABELS = new Set(['A', 'Q', 'X', 'M']);

const isValidLabel = (value: string): boolean => deserialize(value) !== null;

function parseCharge(chargeStr: string): number {
  let charge = Number.parseInt(chargeStr, 10);
  if (Number.isNaN(charge)) {
    charge = 1;
  }
  if (chargeStr.endsWith('-')) {
    charge = -charge;
  }
  return charge;
}

export function deserialize(value: string): AtomLabelData | null {
  const match = LABEL_REGEX.exec(value);
  if (!match) {
    return null;
  }

  const label = match[2] === '*' ? 'A' : capitalize(match[2]);
  const isotope: number | null = match[1]
    ? Number.parseInt(match[1], 10)
    : null;
  const radical = match[3] ? { ':': 1, '.': 2, '^^': 3 }[match[3]] ?? 0 : 0;
  const charge: number | null = match[4] ? parseCharge(match[4]) : null;

  if (VALID_GENERIC_LABELS.has(label) || Elements.get(label)) {
    return { label, charge, isotope, radical };
  }

  return null;
}

function LabelEdit(props: Readonly<LabelEditProps>) {
  const init = { label: props.letter ?? serialize(props) };
  const { formState, ...prop } = props;
  const { result, valid } = formState;

  return (
    <Dialog
      title="Label Edit"
      valid={() => valid}
      withDivider={true}
      needMargin={false}
      result={() => deserialize(result.label)}
      className={styles.labelEdit}
      buttons={['Cancel', 'OK']}
      buttonsNameMap={{ OK: 'Apply' }}
      focusable={false}
      params={prop}
    >
      <Form
        schema={labelEditSchema}
        customValid={{ label: isValidLabel }}
        init={init}
        {...formState}
      >
        <Field
          name="label"
          maxLength={20}
          // @ts-expect-error FieldProps missing size and isFocused (passed through to Input)
          size="10"
          isFocused
          className={styles.labelEditInputField}
        />
      </Form>
    </Dialog>
  );
}

export default connect((store: { modal: { form: LabelEditFormState } }) => ({
  formState: store.modal.form,
}))(LabelEdit);
