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
import SaveButton from '../component/savebutton';

class Save extends Component {
	constructor(props) {
		super(props);
		this.state = { type: props.struct.hasRxnArrow() ? 'rxn' : 'mol' };
		this.changeType()
			.catch(props.onCancel);
	}

	changeType(ev) {
		let { type } = this.state;
		if (ev) {
			type = ev.target.value;
			ev.preventDefault();
		}
		let converted = structFormat.toString(this.props.struct, type, this.props.server, this.props.options);
		return converted.then(structStr => this.setState({ type, structStr }), (e) => { alert(e); });
	}

	render() {
		// $('[value=inchi]').disabled = ui.standalone;
		let { type, structStr } = this.state;
		let format = structFormat.map[type];
		console.assert(format, 'Unknown chemical file type');

		return (
			<Dialog
				title="Save Structure"
				className="save"
				params={this.props}
				buttons={[(
					<SaveButton
						className="save"
						data={structStr}
						filename={'ketcher' + format.ext[0]}
						type={format.mime}
						server={this.props.server}
						onSave={() => this.props.onOk()}
					>
						Save To File…
					</SaveButton>
				), (
					<button
						className="save-tmpl"
						onClick={() => this.props.onTmplSave(structStr)}
					>
						Save to Templates
					</button>
				), 'Close']}
			>
				<label>Format:
					<select value={type} onChange={ev => this.changeType(ev)}>{
						[this.props.struct.hasRxnArrow() ? 'rxn' : 'mol', 'smiles', 'smarts', 'cml', 'inchi']
							.map(t => (<option value={t}>{structFormat.map[t].name}</option>))
					}
					</select>
				</label>
				<textarea
					className={type}
					value={structStr}
					readOnly
					ref={el => el && setTimeout(() => el.select(), 10)}
				/>
			</Dialog>
		);
	}
}

export default connect(
	store => ({
		server: store.server,
		struct: store.editor.struct(),
		options: store.options.getServerSettings()
	}),
	dispatch => ({
		onTmplSave: struct => dispatch(saveUserTmpl(struct))
	})
)(Save);
