import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { attachmentPoints as attachmentPointsSchema } from '../structschema';
import { form as Form, Field } from '../component/form';
import Dialog from '../component/dialog';

function AttachmentPoints (props) {
	let { result, valid, ...prop} = props;
	return (
		<Dialog title="Attachment Points" className="attach-points"
				result={() => result} valid={() => valid} params={prop}>
			<Form storeName="attach-points" schema={attachmentPointsSchema} init={prop}>
				<Field name="primary"/>
				<Field name="secondary"/>
			</Form>
		</Dialog>
	);
}

export default connect((store) => {
	return {
		result: store['attach-points'].stateForm,
		valid: store['attach-points'].valid
	};
})(AttachmentPoints);
