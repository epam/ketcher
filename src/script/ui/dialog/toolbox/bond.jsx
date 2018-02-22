/****************************************************************************
 * Copyright 2018 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { h } from 'preact';
import { connect } from 'preact-redux';

import { bond as bondSchema } from '../../data/schema/struct-schema';
import Form, { Field } from '../../component/form/form';
import Dialog from '../../component/dialog';

function Bond(props) {
	const { formState, ...prop } = props;
	return (
		<Dialog
			title="Bond Properties"
			className="bond"
			result={() => formState.result}
			valid={() => formState.valid}
			params={prop}
		>
			<Form schema={bondSchema} init={prop} {...formState}>
				<Field name="type" />
				<Field name="topology" />
				<Field name="center" />
			</Form>
		</Dialog>
	);
}

export default connect(
	store => ({ formState: store.modal.form })
)(Bond);
