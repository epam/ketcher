import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { bond as bondSchema } from '../structschema';
import { Form, Field } from '../component/form';
import Dialog from '../component/dialog';

function Bond(props) {
	let { formState, ...prop} = props;
	return (
		<Dialog title="Bond Properties" className="bond"
				result={() => formState.result} valid={() => formState.valid} params={prop} >
			<Form schema={bondSchema} init={prop} {...formState}>
				<Field name="type"/>
				<Field name="topology"/>
				<Field name="center"/>
			</Form>
		</Dialog>
	);
}

export default connect(
	(store) => ({ formState: store.modal.form })
)(Bond);
