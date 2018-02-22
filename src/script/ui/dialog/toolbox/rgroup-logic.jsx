/****************************************************************************
 * Copyright 2018 EPAM Systems
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

import { rgroupLogic as rgroupSchema } from '../../data/schema/struct-schema';
import Form, { Field } from '../../component/form/form';
import Dialog from '../../component/dialog';

function IfThenSelect(props, { schema }) {
	const { name, rgids } = props;

	const desc = {
		title: schema.properties[name].title,
		enum: [0],
		enumNames: ['Always']
	};

	rgids.forEach((label) => {
		if (props.label !== label) {
			desc.enum.push(label);
			desc.enumNames.push(`IF R${props.label} THEN R${label}`);
		}
	});

	return <Field name={name} schema={desc} {...props} />;
}

function RgroupLogic(props) {
	const { formState, label, rgroupLabels, ...prop } = props;
	return (
		<Dialog
			title="R-Group Logic"
			className="rgroup-logic"
			result={() => formState.result}
			valid={() => formState.valid}
			params={prop}
		>
			<Form
				schema={rgroupSchema}
				customValid={{ range: r => rangeConv(r) }}
				init={prop}
				{...formState}
			>
				<Field name="range" />
				<Field name="resth" />
				<IfThenSelect name="ifthen" className="cond" label={label} rgids={rgroupLabels} />
			</Form>
		</Dialog>
	);
}

function rangeConv(range) { // structConv
	const res = range.replace(/\s*/g, '').replace(/,+/g, ',')
		.replace(/^,/, '').replace(/,$/, '');

	return res.split(',').every(s => s.match(/^[>,<=]?[0-9]+$/g) ||
			s.match(/^[0-9]+-[0-9]+$/g));
}

export default connect(
	store => ({ formState: store.modal.form })
)(RgroupLogic);
