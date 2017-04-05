import { h } from 'preact';
/** @jsx h */

import { bond as bondSchema } from '../structschema';
import { form as Form, Field } from '../component/form';
import Dialog from '../component/dialog';

function Bond (props) {
	return (
		<Form storeName="bond" component={Dialog} title="Bond Properties" className="bond"
			  schema={bondSchema} init={props} params={props}>
			<Field name="type"/>
			<Field name="topology"/>
			<Field name="center"/>
		</Form>
	);
}

export default Bond;
