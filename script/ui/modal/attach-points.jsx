import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { attachmentPoints as attachmentPointsSchema } from '../structschema';
import { Form, Field } from '../component/form';
import Dialog from '../component/dialog';

function AttachmentPoints (props) {
	let { stateForm, valid, errors, ...prop} = props;
	let formProps = { stateForm, errors };
	return (
		<Dialog title="Attachment Points" className="attach-points"
				result={() => stateForm} valid={() => valid} params={prop}>
			<Form storeName="attach-points" schema={attachmentPointsSchema} init={prop} {...formProps}>
				<Field name="primary"/>
				<Field name="secondary"/>
			</Form>
		</Dialog>
	);
}

export default connect((store) => {
	return {
		stateForm: store['attach-points'].stateForm,
		valid: store['attach-points'].valid,
		errors: store['attach-points'].errors
	};
})(AttachmentPoints);
