import jsonschema from 'jsonschema';
import { h, Component } from 'preact';
/** @jsx h */
import Input from './input';

class Form extends Component {
	constructor(props) {
		super(props);
		let {schema, init, stateStore=this} = this.props;
		if (init)
			stateStore.state = defaults(schema, init);
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

function Label({ labelPos, title, children }) {
	return (
		<label>{ labelPos != 'after' ? `${title}:` : '' }
		  {children}
		  { labelPos == 'after' ? title : '' }
		</label>
	);
}

class Field extends Component {
	render() {
		let { name, ...props} = this.props;
		let { schema, stateStore } = this.context;
		let desc = props.schema || schema.properties[name];

		console.info(jsonschema.validate(stateStore.state[name],
										 desc));
		return (
			<Label title={props.title || desc.title}>
			  <Input name={name} schema={desc}
					 {...inputargs(stateStore, name)} {...props}/>
			</Label>
		);
	}
}

function inputargs(comp, name) {
	return {
		value: comp.state[name],
		onChange: (value) => {
			comp.setState({ ...comp.state, [name]: value});
			console.info('onChange', comp.state);
		}
	};
}

////

function defaults(schema, instance) {
	var res = jsonschema.validate(instance, schema, {
		rewrite: function strip (instance, schema) {
			//console.info('ii', instance, schema);
			var res = {};
			if (typeof instance != 'object' || !schema.properties)
				return instance;
			for(var p in schema.properties){
				if (p in instance)
					res[p] = instance[p];
			}
			return res;
		}
	});
	return res.instance;
}

function constant(schema, prop) {
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

export { Form, Field };
