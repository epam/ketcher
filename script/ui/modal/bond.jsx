import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { bond as bondSchema } from '../structschema';
import { form as Form, Field } from '../component/form';
import Dialog from '../component/dialog';

function Bond(props) {
	let { result, valid, ...prop} = props;
	return (
		<Dialog title="Bond Properties" className="bond"
				result={() => result} valid={() => valid} params={prop}>
			<Form storeName="bond" schema={bondSchema} init={props}>
				<Field name="type"/>
				<Field name="topology"/>
				<Field name="center"/>
			</Form>
		</Dialog>
	);
}

export default connect((store) => {
	return {
		result: store.bond.stateForm,
		valid: store.bond.valid
	};
})(Bond);
