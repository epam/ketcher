import { h, Component } from 'preact';
/** @jsx h */

import Struct from '../../chem/struct';
import molfile from '../../chem/molfile';
import Render from '../../render';

function renderStruct(el, struct, options={}) {
	if (el) {
		if (struct.prerender)           // Should it sit here?
			el.innerHTML = struct.prerender;
		else {
			var rnd = new Render(el, {
				autoScale: true,
				maxBondLength: 30,
				...options
			});
			rnd.setMolecule(struct);
			rnd.update();
			console.info('render!');//, el.innerHTML);
			//struct.prerender = el.innerHTML;
		}
	}
}

class StructRender extends Component {
	constructor(props) {
		super(props);
		if (!(props.struct instanceof Struct)) try {
			this.props.struct = molfile.parse(props.struct);
		} catch (e) {
			alert("Could not parse structure\n" + e);
			this.props.struct = null;
		}
	}
	shouldComponentUpdate() {
		return true;
	}
	render () {
		let { struct, Tag="div", options, ...props } = this.props;
		return struct ? (
			<Tag ref={ el => renderStruct(el, struct, options) } {...props}/>
		) : (
			<Tag>No molecule</Tag>
		);
	}
}

export default StructRender;
