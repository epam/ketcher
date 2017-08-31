import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { attachmentPoints as attachmentPointsSchema } from '../structschema';
import { Form, Field } from '../component/form';
import Dialog from '../component/dialog';

function AttachmentPoints (props) {
	let { formState, ...prop} = props;
	return (
		<Dialog title="Attachment Points" className="attach-points"
				result={() => formState.result} valid={() => formState.valid} params={prop}>
			<Form storeName="attach-points" schema={attachmentPointsSchema} init={prop} {...formState}>
				<Field name="primary"/>
				<Field name="secondary"/>
			</Form>
		</Dialog>
	);
}

export default connect(
	(store) => ({ formState: store.modal.form })
)(AttachmentPoints);
