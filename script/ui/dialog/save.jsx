/****************************************************************************
 * Copyright 2017 EPAM Systems
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

import { h, Component } from 'preact';
import { connect } from 'preact-redux';
import * as structFormat from '../structformat';
import { saveUserTmpl } from '../state/templates';

import Dialog from '../component/dialog';
import Form, { Field } from '../component/form';
import SaveButton from '../component/savebutton';

const saveSchema = {
	title: 'Save',
	type: 'object',
	properties: {
		filename: {
			title: 'Filename',
			type: 'string',
			pattern: '^[^<>:,?"*|/]+$',
			invalidMessage: 'A filename cannot contain any of the following characters: \\ / : * ? " < > |'
		}
		// TODO: extension and textarea to Form !!!
	}
};

class Save extends Component {
	constructor(props) {
		super(props);
		this.state = {
			type: props.struct.hasRxnArrow() ? 'rxn' : 'mol'
		};
		this.changeType()
			.catch(props.onCancel);
	}

	changeType(ev) {
		let { type } = this.state;
		const { struct, server, options } = this.props;
		if (ev) {
			type = ev.target.value;
			ev.preventDefault();
		}
		const converted = structFormat.toString(struct, type, server, options);
		return converted.then(
			structStr => this.setState({ type, structStr }),
			(e) => {
				this.setState(null);
				alert(e); // eslint-disable-line no-undef
			}
		);
	}

	componentDidMount() {
		setTimeout(() => this.textarea.select(), 10);
	}

	render() {
		const { type, structStr } = this.state;
		const { formState } = this.props;
		const format = structFormat.map[type];
		console.assert(format, 'Unknown chemical file type');

		return (
			<Dialog
				title="Save Structure"
				className="save"
				params={this.props}
				buttons={[
					<SaveButton
						data={structStr}
						filename={formState.result.filename + format.ext[0]}
						type={format.mime}
						server={this.props.server}
						onSave={() => this.props.onOk()}
						disabled={!formState.valid}
					>
						Save To File…
					</SaveButton>,
					<button
						className="save-tmpl"
						onClick={() => this.props.onTmplSave(structStr)}
					>
						Save to Templates
					</button>,
					'Close'
				]}
			>
				<Form schema={saveSchema} {...formState}>
					<Field name="filename" />
				</Form>
				<label>Format:
					<select value={type} onChange={ev => this.changeType(ev)}>
						{
							[this.props.struct.hasRxnArrow() ? 'rxn' : 'mol', 'smiles']
								.map(t => (<option value={t}>{structFormat.map[t].name}</option>))
						}
						{
							['smiles-ext', 'smarts', 'cml', 'inchi']
								.map(t => (<option disabled={!this.props.server} value={t}>{structFormat.map[t].name}</option>))
						}
					</select>
				</label>
				<textarea
					className={type}
					value={structStr}
					readOnly
					ref={(el) => { this.textarea = el; }}
				/>
			</Dialog>
		);
	}
}

export default connect(
	store => ({
		server: store.options.app.server ? store.server : null,
		struct: store.editor.struct(),
		options: store.options.getServerSettings(),
		formState: store.modal.form
	}),
	dispatch => ({
		onTmplSave: struct => dispatch(saveUserTmpl(struct))
	})
)(Save);
