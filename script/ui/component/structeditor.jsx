import { h, Component } from 'preact';
/** @jsx h */

import Struct from '../../chem/struct';
import molfile from '../../chem/molfile';
import Editor from '../../editor'

function createEditor(el, tool, struct, options = {}) {
	if (el) {
		let editor = new Editor(el, { ...options });

		if (struct.prerender)
			el.innerHTML = struct.prerender;
		else {
			let rnd = editor.render;

			rnd.setMolecule(struct);
			rnd.update();
		}

		editor.tool(tool.name, Object.assign({}, tool.opts));
		return editor;
	} else
		return null;
}

class StructEditor extends Component {
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
		let { struct, tool, options } = this.props;
		this.editor = createEditor(el, tool, struct, options);

		for (let event in this.editor.event) {
			this.editor.on(event, (opts) => this.props.onEvent(event, opts));
		}
	}
	render () {
		let { struct, Tag="div", ...props } = this.props;
		return (
			<Tag /*ref="el"*/ {...props}>{ struct ? null :  'No molecule' }</Tag>
		);
	}
}

export default StructEditor;
