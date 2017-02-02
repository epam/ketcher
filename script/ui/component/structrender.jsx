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
			console.info('render!', el.clientWidth, el.clientWidth);
			var rnd = new Render(el, {
				autoScale: true,
				...options
			});
			rnd.setMolecule(struct);
			rnd.update();
			// console.info('render!');//, el.innerHTML);
			// struct.prerender = el.innerHTML;
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
		return false;
	}
	componentDidMount() {
		let el = this.refs ? this.refs.base : this.base;
		let { struct, options } = this.props;
		renderStruct(el, struct, options);
	}
	render () {
		let { struct, Tag="div", ...props } = this.props;
		return (
			<Tag /*ref="el"*/ {...props}>{ struct ? null :  'No molecule' }</Tag>
		);
	}
}

export default StructRender;
