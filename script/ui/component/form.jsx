import { h, Component } from 'preact';
/** @jsx h */

import Dialog from './dialog';

class Form extends Component {
	constructor(props) {
		super(props);
		let {schema, init, stateStore=this} = this.props;
		if (init)
			stateStore.state = Object.assign({}, init);
	}
	getChildContext() {
		let {schema, stateStore} = this.props;
		return {schema, stateStore: this};
	}
	render() {
		var {children, component, ...props} = this.props;
		let Component = component || 'form';
		return (
			<Component {...props}>
			  {children}
			</Component>
		);
	}
}

class Input extends Component {
	render() {
		let { prop, component, ...props} = this.props;
		let desc = this.props.desc ||
			       this.context.schema.properties[prop]; // oneOf, pointer
		var Component = (!component || component == 'string') ?
			mapWidget(desc, component) : component;
		return (
			<Component name={prop} desc={desc}
					   {...inputargs(this.context.stateStore, prop)} {...props}/>
		);
	}
}

function inputargs(ctrl, item) {
	return {
		value: ctrl.state[item],
		onChange: function (ev) {
			console.info('onChange', ctrl.state);
			ctrl.state[item] = ev.target.value;
			ctrl.setState(ctrl.state);
			ev.stopPropagation();
		}
	};
}

////

export function constant(schema, prop) {
	let desc = schema.properties[prop];
	return desc.constant || desc.enum[0]; // see https://git.io/v6hyP
}

function mapOf(schema, prop) {
	console.assert(schema.oneOf);
	return schema.oneOf.reduce((res, desc) => {
		res[constant(desc, prop)] = desc;
		return res;
	}, {});
}

function selectListOf(schema, prop) {
	let desc = schema.properties && schema.properties[prop];
	if (desc)
		return desc.enum.map((value, i) => {
			let title = desc.enumNames && desc.enumNames[i];
			return title ? {title, value} : value;
		});
	return schema.oneOf.map(desc => (
		!desc.title ? constant(desc, prop) : {
			title: desc.title,
			value: constant(desc, prop)
		}
	));
}

export { mapOf, selectListOf,
		 Form, Input };
