import { h, render } from 'preact';
/** @jsx h */

import { bond as bondSchema } from '../structschema';
import { Form, Field } from '../component/form';
import Dialog from '../component/dialog';

function Bond (props) {
	return (
		<Form component={Dialog} title="Bond Properties" className="bond"
			  schema={bondSchema} init={props} params={props}>
			<Field name="type"/>
			<Field name="topology"/>
			<Field name="center"/>
		</Form>
	);
}

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<Bond {...params}/>
	), overlay);
};
