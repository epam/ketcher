import { h } from 'preact';
/** @jsx h */

import { attachmentPoints as attachmentPointsSchema } from '../structschema';
import { form as Form, Field } from '../component/form';
import Dialog from '../component/dialog';

function AttachmentPoints (props) {
	return (
		<Form storeName="attach-points" component={Dialog} title="Attachment Points" className="attach-points"
			  schema={attachmentPointsSchema} init={props} params={props}>
			<Field name="primary"/>
			<Field name="secondary"/>
		</Form>
	);
}

export default AttachmentPoints;
