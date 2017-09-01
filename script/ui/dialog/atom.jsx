/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

import { capitalize } from 'lodash/fp';

import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { atom as atomSchema } from '../structschema';
import { Form, Field } from '../component/form';
import Dialog from '../component/dialog';

import element from '../../chem/element';

function ElementNumber(props, {stateStore}) {
	let { result } = stateStore.props;
	return (
		<label>Number:
		  <input className="number" type="text" readOnly={true}
				 value={element.map[capitalize(result.label)] || ''}/>
		</label>
	);
}

function Atom(props) {
	let { formState, ...prop } = props;
	return (
		<Dialog title="Atom Properties" className="atom-props"
				result={() => formState.result} valid={() => formState.valid} params={prop}>
			<Form schema={atomSchema} customValid={{ label: l => atomValid(l) }}
				  init={prop} {...formState}>
			  <fieldset className="main">
				<Field name="label"/>
				<Field name="alias"/>
				<ElementNumber/>
				<Field name="charge" maxlength="5"/>
				<Field name="explicitValence"/>
				<Field name="isotope"/>
				<Field name="radical"/>
			  </fieldset>
			  <fieldset className="query">
				<legend>Query specific</legend>
				<Field name="ringBondCount"/>
				<Field name="hCount"/>
				<Field name="substitutionCount"/>
				<Field name="unsaturatedAtom"/>
			  </fieldset>
			  <fieldset className="reaction">
				<legend>Reaction flags</legend>
				<Field name="invRet"/>
				<Field name="exactChangeFlag"/>
			  </fieldset>
			</Form>
		</Dialog>
	);
}

function atomValid(label) {
	return label && !!element.map[capitalize(label)];
}

export default connect(
	(store) => ({ formState: store.modal.form })
)(Atom);
