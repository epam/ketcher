/****************************************************************************
 * Copyright 2017 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import jsonschema from 'jsonschema';
import { h, Component } from 'preact';
import { connect } from 'preact-redux';

import Input from './input';
import { updateFormState } from '../state/form';

class Form extends Component {
	constructor({ onUpdate, schema, init, ...props }) {
		super();
		this.schema = propSchema(schema, props);

		if (init) {
			let { valid, errors } = this.schema.serialize(init);
			const errs = getErrorsObj(errors);

			init = Object.assign({}, init, { init: true });
			onUpdate(init, valid, errs);
		}
	}

	updateState(newstate) {
		const { instance, valid, errors } = this.schema.serialize(newstate);
		const errs = getErrorsObj(errors);
		this.props.onUpdate(instance, valid, errs);
	}

	getChildContext() {
		const { schema } = this.props;
		return { schema, stateStore: this };
	}

	field(name, onChange) {
		const { result, errors } = this.props;
		const value = result[name];
		const self = this;

		return {
			dataError: errors && errors[name] || false,
			value: value,
			onChange(val) {
				const newstate = Object.assign({}, self.props.result, { [name]: val });
				self.updateState(newstate);
				if (onChange) onChange(val);
			}
		};
	}

	render(props) {
		const { result, children, schema, ...prop } = props;

		if (schema.key && schema.key !== this.schema.key) {
			this.schema = propSchema(schema, prop);
			this.schema.serialize(result); // hack: valid first state
			this.updateState(result);
		}

		return (
			<form {...prop}>
				{children}
			</form>
		);
	}
}

export default connect(
	null,
	dispatch => ({
		onUpdate: function (result, valid, errors) {
			dispatch(updateFormState({ result, valid, errors }));
		}
	})
)(Form);

function Label({ labelPos, title, children, ...props }) {
	return (
		<label {...props}>{ title && labelPos !== 'after' ? `${title}:` : '' }
			{children}
			{ title && labelPos === 'after' ? title : '' }
		</label>
	);
}

function Field(props) {
	const { name, onChange, className, component, ...prop } = props;
	const { schema, stateStore } = this.context;

	const desc = prop.schema || schema.properties[name];
	const { dataError, ...fieldOpts } = stateStore.field(name, onChange);

	return (
		<Label className={className} data-error={dataError} title={prop.title || desc.title} >
			{
				component ?
					h(component, { ...fieldOpts, ...prop }) :
					<Input
						name={name}
						schema={desc}
						{...fieldOpts}
						{...prop}
					/>
			}
		</Label>
	);
}

const SelectOneOf = (props) => {
	const { title, name, schema, ...prop } = props;

	const selectDesc = {
		title: title,
		enum: [],
		enumNames: []
	};

	Object.keys(schema).forEach((item) => {
		selectDesc.enum.push(item);
		selectDesc.enumNames.push(schema[item].title || item);
	});

	return <Field name={name} schema={selectDesc} {...prop} />;
};

////

function propSchema(schema, { customValid, serialize = {}, deserialize = {} }) {
	const v = new jsonschema.Validator();

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
	const res = {};
	if (typeof instance !== 'object' || !schema.properties) {
		return instance !== undefined ? instance :
			schema.default;
	}

	for (let p in schema.properties) {
		if (schema.properties.hasOwnProperty(p) && (p in instance))
			res[p] = instance[serializeMap[p]] || instance[p];
	}

	return res;
}

function deserializeRewrite(deserializeMap, instance, schema) {
	return instance;
}

function getErrorsObj(errors) {
	let errs = {};
	let field;

	errors.forEach((item) => {
		field = item.property.split('.')[1];
		if (!errs[field])
			errs[field] = item.schema.invalidMessage || item.message;
	});

	return errs;
}

export { Field, SelectOneOf };
