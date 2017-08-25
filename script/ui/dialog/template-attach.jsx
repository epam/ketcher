import { h, Component } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import Dialog from '../component/dialog';
import Input from '../component/input';
import StructEditor from '../component/structeditor';
import Vec2 from '../../util/vec2';

import { initAttach, setAttachPoints, setTmplName } from '../state/templates';

const EDITOR_STYLES = {
	selectionStyle: { fill: '#47b3ec', stroke: 'none' },
	highlightStyle: { 'stroke': '#304ff7', 'stroke-width': 1.2 }
};

class Attach extends Component {
	constructor({onInit, ...props}) {
		super(props);

		this.tmpl = initTmpl(props.tmpl);
		onInit(this.tmpl.struct.name, this.tmpl.props);
	}

	render() {
		let { name, atomid, bondid, onNameEdit,
			  onAttachEdit, ...prop} = this.props;
		let editorOpts = Object.assign(EDITOR_STYLES, { scale: this.tmpl.scale });

		const result = () => (
			name && (
				name !== this.tmpl.struct.name ||
				atomid !== this.tmpl.props.atomid ||
				bondid !== this.tmpl.props.bondid
			)
		) ? { name, attach: { atomid, bondid } } : null;

		return (
			<Dialog title="Template Edit" className="attach"
					result={result} params={prop} buttons={['Cancel', 'OK']}>
				<label>Template Name:
				  <Input type="text" value={name}
						 onChange={onNameEdit} placeholder="tmpl"/>
				</label>
				<label>Choose attachment atom and bond:</label>
				<StructEditor className="editor"
							  struct={this.tmpl.struct}
							  onAttachEdit={onAttachEdit}
				              tool="attach" toolOpts={ { atomid, bondid } }
							  options={editorOpts}/>
				<label><b>&#123; atomid: {atomid}; bondid: {bondid} &#125;</b></label>
			</Dialog>
		);
	}
}

function initTmpl(tmpl) {
	let normTmpl = {
		struct: tmpl.struct.clone(),
		props: {
			atomid: +tmpl.props.atomid || 0,
			bondid: +tmpl.props.bondid || 0
		}
	};
	normTmpl.struct.name = tmpl.struct.name;

	let length = structNormalization(normTmpl.struct);
	let scale = (3.7 / (length + 5.4 / length)) * 100;

	return Object.assign(normTmpl, { scale });
}

function structNormalization(struct) {
	let min = new Vec2(struct.atoms.get(0).pp);
	let max = new Vec2(struct.atoms.get(0).pp);
	struct.atoms.each(function (aid, atom) {
		if (atom.pp.x < min.x) min.x = atom.pp.x;
		if (atom.pp.y < min.y) min.y = atom.pp.y;
		if (atom.pp.x > max.x) max.x = atom.pp.x;
		if (atom.pp.y > max.y) max.y = atom.pp.y;
	});
	struct.atoms.each(function (aid, atom) {
		atom.pp = Vec2.diff(atom.pp, min);
	});
	max = Vec2.diff(max, min);

	return (max.x > max.y) ? max.x : max.y;
}

export default connect(
	store => ({ ...store.templates.attach }),
	dispatch => ({
		onInit: (name, ap) => dispatch(initAttach(name, ap)),
		onAttachEdit: ap => dispatch(setAttachPoints(ap)),
		onNameEdit: name => dispatch(setTmplName(name))
	})
)(Attach);
