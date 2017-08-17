import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { atom as atomSchema } from '../structschema';
import { Form, Field } from '../component/form';
import Dialog from '../component/dialog';

import element from '../../chem/element';

function ElementNumber(props, {stateStore}) {
	let {stateForm} = stateStore.props;
	return (
		<label>Number:
		  <input className="number" type="text"
				 readonly="readonly"
				 value={element.map[stateForm.label] || ''}/>
		</label>
	);
}

function Atom(props) {
	let { stateForm, valid, errors, ...prop} = props;
	let formProps = { stateForm, errors };
	return (
		<Dialog title="Atom Properties" className="atom-props"
				result={() => stateForm} valid={() => valid} params={prop}>
			<Form storeName="atom" schema={atomSchema}
				  customValid={{ label: l => atomValid(l) }} init={prop} {...formProps}>
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

function capitalize(str) {
	return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

function atomValid(label) {
	return label && !!element.map[capitalize(label)];
}

export default connect((store) => {
	return {
		stateForm: store.atom.stateForm,
		valid: store.atom.valid,
		errors: store.atom.errors
	};
})(Atom);
