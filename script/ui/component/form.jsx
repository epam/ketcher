import jsonschema from 'jsonschema';
import { h, Component } from 'preact';
/** @jsx h */
import Input from './input';

const noop = v => v;

class Form extends Component {
	constructor({schema, init, ...props}) {
		super();
		this.schema = propSchema(schema, props);
		this.state = this.schema.serialize(init || {}).instance;
		console.info(this.state);
	}
	getChildContext() {
		let {schema} = this.props;
		return {schema, stateStore: this};
	}
	field(name) {
		var value = this.state[name];
		var self = this;
		return {
			value: this.state[name],
			onChange(value) {
				self.setState({ ...self.state, [name]: value });
				console.info('onChange', self.state);
			}
		};
	}
	result() {
		return this.schema.serialize(this.state).instance;
	}
	render() {
		var {children, component, ...props} = this.props;
		let Component = component || 'form';
		console.info('validate', this.result());
		return (
			<Component {...props}
				result = {() => this.result()}
				valid  = {() => this.schema.serialize(this.state).valid} >
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

		return (
			<Label title={props.title || desc.title}>
			  <Input name={name} schema={desc}
					 {...stateStore.field(name, props)} {...props}/>
			</Label>
		);
	}
}

////

function propSchema(schema, {customValid, serialize={}, deserialize={}}) {
	var v = new jsonschema.Validator();
	if (customValid) {
		schema = Object.assign({}, schema); // copy
		schema.properties = Object.keys(customValid).reduce((res, prop) => {
			v.customFormats[prop] = customValid[prop];
			res[prop] = { format: prop, ...res[prop] };
			return res;
		}, schema.properties);
	}
	return {
		serialize: inst => v.validate(inst, schema, {
			rewrite: serializeRewrite.bind(null, serialize)
		}),
		deserialize: inst => v.validate(inst, schema, {
			rewrite: deserializeRewrite.bind(null, deserialize)
		})
	};
}

function serializeRewrite(serializeMap, instance, schema) {
	var res = {};
	if (typeof instance != 'object' || !schema.properties) {
		return instance !== undefined ? instance :
			schema.default;
	}

	for(var p in schema.properties){
		if (p in instance) {
			res[p] = instance[p];
		}
	}
	return res;
}

function deserializeRewrite(deserializeMap, instance, schema) {
	return instance;
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
