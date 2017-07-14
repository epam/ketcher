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
	let { formState, ...prop} = props;
	return (
		<Dialog title="Reaction Auto-Mapping" className="automap"
				result={() => formState.result} valid={() => formState.valid} params={prop}>
			<Form storeName="automap" schema={automapSchema} {...formState}>
				<Field name="mode"/>
			</Form>
		</Dialog>
	);
}

export default connect(
	(store) => ({ formState: store.modal.form })
)(Automap);
