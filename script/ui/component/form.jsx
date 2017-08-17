import jsonschema from 'jsonschema';
import { h, Component } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */
import Input from './input';
import { updateFormState } from '../actions/form-action.es';

class Form extends Component {
	constructor({ onUpdate, schema, init, ...props }) {
		super();
		this.schema = propSchema(schema, props);

		let instance = this.schema.serialize(init).instance;
		instance = instance || Object.assign({}, instance, { init: true });

		if (init) onUpdate(instance, true, {});
	}
	updateState(newstate) {
		let { instance, valid, errors } = this.schema.serialize(newstate);
		let errs = getErrorsObj(errors);
		this.props.onUpdate(instance, valid, errs);
	}
	getChildContext() {
		let { schema } = this.props;
		return { schema, stateStore: this };
	}
	field(name, onChange) {
		let { stateForm, errors } = this.props;
		var value = stateForm[name];
		var self = this;

		return {
			dataError: errors && errors[name] || false,
			value: value,
			onChange(value) {
				let newstate = Object.assign({}, self.props.stateForm, { [name]: value });
				self.updateState(newstate);
				if (onChange) onChange(value);
			}
		};
	}
	render() {
		var { stateForm, children, schema, ...props } = this.props;

		if (schema.key && schema.key !== this.schema.key) {
			this.schema = propSchema(schema, props);
			this.schema.serialize(stateForm); // hack: valid first state
			this.updateState(stateForm);
		}

		return (
			<form {...props}>
			  	{children}
			</form>
		);
	}
}
Form = connect(
	null,
	(dispatch, props) => ({
		onUpdate: function (stateForm, valid, errors) {
			dispatch(updateFormState(props.storeName, { stateForm, valid, errors }));
		}
	})
)(Form);

function Label({ labelPos, title, children, ...props }) {
	return (
		<label {...props}>{ title && labelPos != 'after' ? `${title}:` : '' }
			{children}
			{ title && labelPos == 'after' ? title : '' }
		</label>
	);
}

class Field extends Component {
	render() {
		let { name, onChange, className, component, ...props } = this.props;
		let { schema, stateStore } = this.context;
		let desc = props.schema || schema.properties[name];

		let { dataError, ...fieldOpts } = stateStore.field(name, onChange);
		return (
			<Label className={className} data-error={dataError} title={props.title || desc.title} >
				{
					component ?
						h(component, { ...fieldOpts, ...props }) :
						<Input name={name} schema={desc}
							   {...fieldOpts} {...props}/>
				}
			</Label>
		);
	}
}

const SelectOneOf = (props) => {
	const { title, name, schema, ...prop } = props;

	const selectDesc = {
		title: title,
		enum: [],
		enumNames: []
	};

	Object.keys(schema).forEach(item => {
		selectDesc.enum.push(item);
		selectDesc.enumNames.push(schema[item].title || item);
	});

	return <Field name={name} schema={selectDesc} {...prop}/>;
};

////

function propSchema(schema, { customValid, serialize = {}, deserialize = {} }) {
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
		key: schema.key || '',
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
	if (typeof instance !== 'object' || !schema.properties) {
		return instance !== undefined ? instance :
			schema.default;
	}

	for (var p in schema.properties) {
		if (p in instance) {
			res[p] = instance[serializeMap[p]] || instance[p];
		}
	}

	return res;
}

function deserializeRewrite(deserializeMap, instance, schema) {
	return instance;
}

function getErrorsObj(errors) {
	let errs = {};
	let field;
	errors.forEach(item => {
		field = item.property.split('.')[1];
		if (!errs[field])
			errs[field] = item.schema.invalidMessage || item.message;
	});

	return errs;
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
			return title ? { title, value } : value;
		});
	return schema.oneOf.map(desc => (
		!desc.title ? constant(desc, prop) : {
			title: desc.title,
			value: constant(desc, prop)
		}
	));
}

export { Form, Field, SelectOneOf, mapOf };
