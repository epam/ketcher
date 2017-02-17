import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';
import StructEditor from '../component/structeditor';
import Vec2 from '../../util/vec2'

class Attach extends Component {
	constructor(props) {
		super(props);
		this.tmpl = props.normTmpl;
		this.editorOpts = {
			selectionStyle: { fill: '#47b3ec', stroke: 'none' },
			highlightStyle: { 'stroke': '#304ff7', 'stroke-width': 1.2 }
		};

		this.setState( {
			attach: {
				atomid: +this.tmpl.props.atomid || 0,
				bondid: +this.tmpl.props.bondid || 0
			}
		});
	}

	result() {
		return this.state.attach;
	}

	onAttach(attachPoints) {
		this.setState({
			attach: attachPoints
		});
	}

	render() {
		let {attach} = this.state;
		let {userOpts} = this.props;
		return (
			<Dialog caption="Template Edit"
					name="attach" result={() => this.result() }
					params={this.props}
					buttons={["Cancel", "OK"]} className="attach">
				<label>Template Name:
					<input type="text" value={this.tmpl.struct.name || ''} placeholder="tmpl" disabled/>
				</label>
				<label>Choose attachment atom and bond:</label>
				<StructEditor className="struct-editor" struct={this.tmpl.struct} opts={userOpts}
							  onEvent={ (eName, ap) =>  (eName == 'attachEdit') ? this.onAttach(ap) : null }
							  /* tool = {name: .. , opts: ..} */ tool={{ name: 'attach', opts: attach }}
							  options={this.editorOpts}/>
				<label><b>&#123; atomid {attach.atomid || 0}; bondid: {attach.bondid || 0} &#125;</b></label>
			</Dialog>
		);
	}
}

function structNormalization(struct) {
	let offset = new Vec2(struct.atoms.get(0).pp);
	struct.atoms.each(function (aid, atom) {
		if (atom.pp.x < offset.x) offset.x = atom.pp.x;
		if (atom.pp.y < offset.y) offset.y = atom.pp.y;
	});
	struct.atoms.each(function (aid, atom) {
		atom.pp = Vec2.diff(atom.pp, offset);
	});
}

export default function dialog(params) {
	let overlay = $$('.overlay')[0];
	let normTmpl = {
		struct: params.tmpl.struct.clone(),
		props: params.tmpl.props
	};
	normTmpl.struct.name = params.tmpl.struct.name;
	structNormalization(normTmpl.struct);

	return render((
		<Attach normTmpl={normTmpl} {...params}/>
	), overlay);
};
