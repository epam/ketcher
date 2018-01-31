/****************************************************************************
 * Copyright 2017 EPAM Systems
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

import { h } from 'preact';
import { connect } from 'preact-redux';
import { range } from 'lodash/fp';

import Dialog from '../../component/dialog';
import Form, { Field } from '../../component/form/form';
import ButtonList from '../../component/buttonlist';

const rgroupValuesNames = Array.from(new Array(32), (val, index) => 'R' + ++index);

const rgroupValues = range(1, 33);

const rgroupSchema = {
	title: 'R-group',
	type: 'object',
	properties: {
		rgroupValues: {
			type: 'array',
			items: {
				type: 'string',
				enum: rgroupValues,
				enumNames: rgroupValuesNames
			}
		}
	}
};

function RGroup({ disabledIds, rgroupValues, formState, type, ...props }) { // eslint-disable-line
	return (
		<Dialog
			title="R-Group"
			className="rgroup"
			params={props}
			result={() => formState.result}
		>
			<Form schema={rgroupSchema} init={{ rgroupValues }} {...formState} >
				<Field
					name="rgroupValues"
					multiple={type === 'fragment'}
					component={ButtonList}
					disabledIds={disabledIds}
				/>
			</Form>
		</Dialog>
	);
}

export default connect(
	store => ({ formState: store.modal.form })
)(RGroup);
