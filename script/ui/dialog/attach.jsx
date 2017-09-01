/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

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
			<Form schema={attachmentPointsSchema} init={prop} {...formState}>
				<Field name="primary"/>
				<Field name="secondary"/>
			</Form>
		</Dialog>
	);
}

export default connect(
	(store) => ({ formState: store.modal.form })
)(AttachmentPoints);
