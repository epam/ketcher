import { h, render } from 'preact';
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
	return (
		<Form storeName="automap" component={Dialog} title="Reaction Auto-Mapping" className="automap"
			  schema={automapSchema} params={props}>
			<Field name="mode"/>
		</Form>
	);
}

export default Automap;
