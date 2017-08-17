import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { bond as bondSchema } from '../structschema';
import { Form, Field } from '../component/form';
import Dialog from '../component/dialog';

function Bond(props) {
	let { stateForm, valid, errors, ...prop} = props;
	let formProps = { stateForm, errors };
	return (
		<Dialog title="Bond Properties" className="bond"
				result={() => stateForm} valid={() => valid} params={prop}>
			<Form storeName="bond" schema={bondSchema} init={props} {...formProps}>
				<Field name="type"/>
				<Field name="topology"/>
				<Field name="center"/>
			</Form>
		</Dialog>
	);
}

export default connect((store) => {
	return {
		stateForm: store.bond.stateForm,
		valid: store.bond.valid,
		errors: store.bond.errors
	};
})(Bond);
