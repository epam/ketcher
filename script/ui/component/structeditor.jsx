import { upperFirst } from 'lodash/fp';
import { h, Component } from 'preact';
/** @jsx h */

import Editor from '../../editor'

function setupEditor(editor, props, oldProps = {}) {
	let { struct, tool, toolOpts, options } = props;
	if (struct != oldProps.struct)
		editor.struct(struct);
	if (tool != oldProps.tool || toolOpts != oldProps.toolOpts)
		editor.tool(tool, toolOpts);
	if (oldProps.options && options != oldProps.options)
		editor.options(options);

	// update handlers
	for (let name in editor.event) {
		let eventName = `on${upperFirst(name)}`;
		if (props[eventName] != oldProps[eventName]) {
			console.info('update editor handler', eventName);
			if (oldProps[eventName])
				editor.event[name].remove(oldProps[eventName]);
			if (props[eventName])
				editor.event[name].add(props[eventName]);
		}
	}
}

class StructEditor extends Component {
	shouldComponentUpdate() {
		return false;
	}
	componentWillReceiveProps(props) {
		setupEditor(this.instance, props, this.props);
	}
	componentDidMount() {
		console.assert(this.base, "No backing element");
		this.instance = new Editor(this.base, { ...this.props.options });
		setupEditor(this.instance, this.props);
		if (this.props.onInit)
			this.props.onInit(this.instance);
	}
	render () {
		let { Tag="div", ...props } = this.props;
		return (
			<Tag {...props}/>
		);
	}
}

export default StructEditor;
