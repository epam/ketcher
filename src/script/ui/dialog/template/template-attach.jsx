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

import Dialog from '../../component/dialog';
import Input from '../../component/form/input';
import StructEditor from '../../component/structeditor';
import { storage } from '../../storage-ext';

import { initAttach, setAttachPoints, setTmplName } from '../../state/templates';

const EDITOR_STYLES = {
	selectionStyle: { fill: '#47b3ec', stroke: 'none' },
	highlightStyle: { stroke: '#1a7090', 'stroke-width': 1.2 }
};

class Attach extends Component {
	constructor({ onInit, ...props }) {
		super();
		this.tmpl = initTmpl(props.tmpl);
		onInit(this.tmpl.struct.name, this.tmpl.props);
		this.onResult = this.onResult.bind(this);
	}

	onResult() {
		const { name, atomid, bondid } = this.props;
		return name && (
			name !== this.tmpl.struct.name ||
			atomid !== this.tmpl.props.atomid ||
			bondid !== this.tmpl.props.bondid
		) ? { name, attach: { atomid, bondid } } : null;
	}

	render() {
		const {
			name, atomid, bondid,
			onNameEdit, onAttachEdit, ...prop
		} = this.props;
		const struct = this.tmpl.struct;
		const options = Object.assign(EDITOR_STYLES, { scale: getScale(struct) });

		return (
			<Dialog
				title="Template Edit"
				className="attach"
				result={this.onResult}
				params={prop}
			>
				<label>Template name:
					<Input value={name} onChange={onNameEdit} />
				</label>
				<label>Choose attachment atom and bond:</label>
				<StructEditor
					className="editor"
					struct={struct}
					onAttachEdit={onAttachEdit}
					tool="attach"
					toolOpts={{ atomid, bondid }}
					options={options}
				/>
				{!storage.isAvailable() ? <div className="warning">{storage.warningMessage}</div> : null}
			</Dialog>
		);
	}
}

export default connect(
	store => ({ ...store.templates.attach }),
	dispatch => ({
		onInit: (name, ap) => dispatch(initAttach(name, ap)),
		onAttachEdit: ap => dispatch(setAttachPoints(ap)),
		onNameEdit: name => dispatch(setTmplName(name))
	})
)(Attach);

function initTmpl(tmpl) {
	const normTmpl = {
		struct: structNormalization(tmpl.struct),
		props: {
			atomid: +tmpl.props.atomid || 0,
			bondid: +tmpl.props.bondid || 0
		}
	};
	normTmpl.struct.name = tmpl.struct.name;
	return normTmpl;
}

function structNormalization(struct) {
	const normStruct = struct.clone();
	const cbb = normStruct.getCoordBoundingBox();

	normStruct.atoms.forEach((atom) => {
		atom.pp = atom.pp.sub(cbb.min);
	});

	normStruct.sgroups.forEach((sg) => {
		sg.pp = sg.pp ? sg.pp.sub(cbb.min) : cbb.min;
	});

	normStruct.rxnArrows.forEach((rxnArrow) => {
		rxnArrow.pp = rxnArrow.pp.sub(cbb.min);
	});

	normStruct.rxnPluses.forEach((rxnPlus) => {
		rxnPlus.pp = rxnPlus.pp.sub(cbb.min);
	});

	return normStruct;
}

function getScale(struct) {
	const cbb = struct.getCoordBoundingBox();
	const VIEW_SIZE = 220;
	let scale = VIEW_SIZE / Math.max(cbb.max.y - cbb.min.y, cbb.max.x - cbb.min.x);

	if (scale < 35) scale = 35;
	if (scale > 60) scale = 60;
	return scale;
}
