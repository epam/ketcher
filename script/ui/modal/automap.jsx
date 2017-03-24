import { h, render } from 'preact';
/** @jsx h */

import { automap as automapSchema } from '../structschema';
import { Form, Field } from '../component/form';
import Dialog from '../component/dialog';

function Automap (props) {
	return (
		<Form component={Dialog} title="Reaction Auto-Mapping" className="automap"
			  schema={automapSchema} init={props} params={props}>
			<Field name="mode"/>
		</Form>
	);
}

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<Automap {...params}/>
	), overlay);
};
