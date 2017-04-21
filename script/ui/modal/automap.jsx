import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { form as Form, Field } from '../component/form';
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
	let { result, valid, ...prop} = props;
	return (
		<Dialog title="Reaction Auto-Mapping" className="automap"
				result={() => result} valid={() => valid} params={prop}>
			<Form storeName="automap" schema={automapSchema} params={prop}>
				<Field name="mode"/>
			</Form>
		</Dialog>
	);
}

export default connect((store) => {
	return {
		result: store.automap.stateForm,
		valid: store.automap.valid
	};
})(Automap);
