import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { Form, Field } from '../component/form';
import Dialog from '../component/dialog';

export const automapSchema = {
	title: "Reaction Auto-Mapping",
	type: "object",
	required: ["mode"],
	properties: {
		mode: {
			title: "Mode",
			enum: ["discard", "keep", "alter", "clear"],
			enumNames: ["Discard", "Keep", "Alter", "Clear"],
			default: "discard"
		}
	}
};

function Automap (props) {
	let { stateForm, valid, errors, ...prop} = props;
	let formProps = { stateForm, errors };
	return (
		<Dialog title="Reaction Auto-Mapping" className="automap"
				result={() => stateForm} valid={() => valid} params={prop}>
			<Form storeName="automap" schema={automapSchema} {...formProps}>
				<Field name="mode"/>
			</Form>
		</Dialog>
	);
}

export default connect((store) => ({
		stateForm: store.modal.form.stateForm,
		valid: store.modal.form.valid,
		errors: store.modal.form.errors
	})
)(Automap);
