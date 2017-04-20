import { h, Component } from 'preact';
/** @jsx h */

import Editor from '../../editor'

class StructEditor extends Component {
	shouldComponentUpdate() {
		return false;
	}
	componentDidMount() {
		let el = this.refs ? this.refs.base : this.base;
		console.assert(el, "No element");

		let { struct, tool, options } = this.props;
		let editor = new Editor(el, { ...options });
		if (struct)
			editor.struct(struct);
		if (tool)
			editor.tool(tool.name, Object.assign({}, tool.opts));

		for (let name in editor.event) {
			let eventName = `on${capitalize(name)}`;
			if (this.props[eventName])
				editor.event[name].add(this.props[eventName]);
		}
		this.instance = editor;
		if (this.props.onInit)
			this.props.onInit(editor);
	}
	render () {
		let { Tag="div", ...props } = this.props;
		return (
			<Tag /*ref="el"*/ {...props}/>
		);
	}
}

function capitalize(str) {
	return str[0].toUpperCase() + str.slice(1);
}

export default StructEditor;
