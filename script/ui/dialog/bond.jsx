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
				result={() => result} valid={() => valid} params={prop} {...formProps}>
			<Form storeName="bond" schema={bondSchema} init={props}>
				<Field name="type"/>
				<Field name="topology"/>
				<Field name="center"/>
			</Form>
		</Dialog>
	);
}

export default connect((store) => ({
		stateForm: store.modal.form.stateForm,
		valid: store.modal.form.valid,
		errors: store.modal.form.errors
	})
)(Bond);
