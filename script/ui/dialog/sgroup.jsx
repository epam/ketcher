/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { sgroup as sgroupSchema } from '../structschema';
import { Form, Field, SelectOneOf } from '../component/form';
import { mapOf } from '../utils';
import Dialog from '../component/dialog';

const schemes = mapOf(sgroupSchema, 'type');

function Sgroup({ formState, ...prop }) {
	const { result, valid } = formState;

	const type = result.type;

	return (
		<Dialog title="S-Group Properties" className="sgroup"
				result={() => result} valid={() => valid} params={prop}>
			<Form schema={schemes[type]} init={prop} {...formState}>
				<SelectOneOf title="Type" name="type" schema={schemes}/>
				<fieldset className={type === 'DAT' ? 'data' : 'base'}>
					{ content(type) }
				</fieldset>
			</Form>
		</Dialog>
	);
}

const content = type => Object.keys(schemes[type].properties)
	.filter(prop => prop !== 'type')
	.map(prop => {
			let props = {};
			if (prop === 'name') props.maxlength = 15;
			if (prop === 'fieldName') props.maxlength = 30;
			if (prop === 'fieldValue') props.type = 'textarea';
			if (prop === 'radiobuttons') props.type = 'radio';

			return <Field name={prop} key={`${type}-${prop}`} {...props}/>;
		}
	);

export default connect(
	(store) => ({ formState: store.modal.form })
)(Sgroup);
