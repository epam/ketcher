import { h, render } from 'preact';
/** @jsx h */

import { attachmentPoints as attachmentPointsSchema } from '../structschema';
import { Form, Field } from '../component/form';
import Dialog from '../component/dialog';

function AttachmentPoints (props) {
	return (
		<Form component={Dialog} title="Attachment Points" className="attach-points"
			  schema={attachmentPointsSchema} init={props} params={props}>
			<Field name="primary"/>
			<Field name="secondary"/>
		</Form>
	);
}

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<AttachmentPoints {...params}/>
	), overlay);
};
