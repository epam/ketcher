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

import { h, Component } from 'preact';
import { connect } from 'preact-redux';
import * as structFormat from '../../data/convert/structformat';
import { saveUserTmpl } from '../../state/templates';
import { updateFormState } from '../../state/modal/form';

import Dialog from '../../component/dialog';
import Form, { Field } from '../../component/form/form';
import SaveButton from '../../component/view/savebutton';

const saveSchema = {
	title: 'Save',
	type: 'object',
	properties: {
		filename: {
			title: 'Filename',
			type: 'string',
			maxLength: 128,
			pattern: /^[^.<>:?"*|/\\][^<>:?"*|/\\]*$/,
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
		this.isRxn = this.props.struct.hasRxnArrow();

		const formats = [this.isRxn ? 'rxn' : 'mol', 'smiles'];
		if (this.props.server) formats.push('smiles-ext', 'smarts', 'inchi', 'inchi-aux', 'cml');

		this.saveSchema = saveSchema;
		this.saveSchema.properties.format = Object.assign(this.saveSchema.properties.format, {
			enum: formats,
			enumNames: formats.map(fmt => structFormat.map[fmt].name)
		});

		this.changeType(this.isRxn ? 'rxn' : 'mol')
			.then(res => (res instanceof Error ? props.onCancel() : null));
	}

	changeType(type) {
		const { struct, server, options, formState } = this.props;
		const converted = structFormat.toString(struct, type, server, options);
		return converted.then(
			(structStr) => {
				this.setState({ structStr });
				setTimeout(() => this.textarea.select(), 10); // TODO: remove hack
			},
			(e) => {
				alert(e.message); // eslint-disable-line no-undef
				this.props.onResetForm(formState);
				return e;
			}
		);
	}

	render() {
		const { structStr } = this.state;
		const formState = this.props.formState;
		const { filename, format } = formState.result;
		const warning = structFormat.couldBeSaved(this.props.struct, format);
		const isCleanStruct = this.props.struct.isBlank();

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
						disabled={!formState.valid || isCleanStruct}
					>
						Save To File…
					</SaveButton>,
					<button
						className="save-tmpl"
						disabled={isCleanStruct}
						onClick={() => this.props.onTmplSave(this.props.struct)}
					>
						Save to Templates
					</button>,
					'Close'
				]}
			>
				<Form
					schema={this.saveSchema}
					init={{ filename, format: this.isRxn ? 'rxn' : 'mol' }}
					{...formState}
				>
					<Field name="filename" />
					<Field name="format" onChange={value => this.changeType(value)} />
				</Form>
				<textarea
					value={structStr}
					readOnly
					ref={(el) => { this.textarea = el; }}
				/>
				{ warning && <div className="warning">{warning}</div> }
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
		onTmplSave: struct => dispatch(saveUserTmpl(struct)),
		onResetForm: prevState => dispatch(updateFormState(prevState))
	})
)(Save);
