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
			maxLength: 128,
			pattern: '^[^\.<>:?"*|/\\\\]{1}[^<>:?"*|/\\\\]*$',
			invalidMessage: (res) => {
				if (!res) return 'Filename should contain at least one character';
				if (res.length > 128) return 'Filename is too long';
				return "A filename cannot contain characters: \\ / : * ? \" < > | and cannot start with '.'";
			}
		},
		format: {
			title: 'Format',
			enum: Object.keys(structFormat.map),
			enumNames: Object.keys(structFormat.map).map(fmt => structFormat.map[fmt].name)
		}
	}
};

class Save extends Component {
	constructor(props) {
		super(props);

		const formats = [this.props.struct.hasRxnArrow() ? 'rxn' : 'mol', 'smiles'];
		if (this.props.server) formats.push('smiles-ext', 'smarts', 'inchi', 'inchi-aux', 'cml');

		this.saveSchema = saveSchema;
		this.saveSchema.properties.format = Object.assign(this.saveSchema.properties.format, {
			enum: formats,
			enumNames: formats.map(fmt => structFormat.map[fmt].name)
		});

		this.changeType(this.props.struct.hasRxnArrow() ? 'rxn' : 'mol')
			.catch(props.onCancel);
	}

	changeType(type) {
		const { struct, server, options } = this.props;
		const converted = structFormat.toString(struct, type, server, options);
		return converted.then(
			structStr => this.setState({ structStr }),
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
		const { structStr } = this.state;
		const formState = this.props.formState;
		const { filename, format } = formState.result;

		return (
			<Dialog
				title="Save Structure"
				className="save"
				params={this.props}
				buttons={[
					<SaveButton
						data={structStr}
						filename={filename + structFormat.map[format].ext[0]}
						type={format.mime}
						server={this.props.server}
						onSave={() => this.props.onOk()}
						disabled={!formState.valid}
					>
						Save To File…
					</SaveButton>,
					<button
						className="save-tmpl"
						disabled={this.props.struct.isBlank()}
						onClick={() => this.props.onTmplSave(structStr)}
					>
						Save to Templates
					</button>,
					'Close'
				]}
			>
				<Form schema={this.saveSchema} {...formState}>
					<Field name="filename" />
					<Field name="format" onChange={value => this.changeType(value)} />
				</Form>
				<textarea
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
