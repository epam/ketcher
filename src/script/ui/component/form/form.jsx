/****************************************************************************
 * Copyright 2018 EPAM Systems
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
import { updateFormState } from '../../state/modal/form';

class Form extends Component {
	constructor({ onUpdate, schema, init, ...props }) {
		super();
		this.schema = propSchema(schema, props);

		if (init) {
			const { valid, errors } = this.schema.serialize(init);
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
			dataError: (errors && errors[name]) || false,
			value,
			onChange(val) {
				const newstate = Object.assign({}, self.props.result, { [name]: val });
				self.updateState(newstate);
				if (onChange) onChange(val);
			}
		};
	}

	render(props) {
		const { result, errors, init, children, schema, ...prop } = props;

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
		onUpdate: (result, valid, errors) => {
			dispatch(updateFormState({ result, valid, errors }));
		}
	})
)(Form);

function Label({ labelPos, title, children, ...props }) {
	return (
		<label {...props}>
			{ title && labelPos !== 'after' ? `${title}:` : '' }
			{children}
			{ title && labelPos === 'after' ? title : '' }
		</label>
	);
}

function Field(props) {
	const { name, onChange, className, component, labelPos, ...prop } = props;
	const { schema, stateStore } = this.context;
	const desc = prop.schema || schema.properties[name];
	const { dataError, ...fieldOpts } = stateStore.field(name, onChange);

	const formField = component ?
		h(component, { ...fieldOpts, ...prop, schema: desc }) :
		(<Input
			name={name}
			schema={desc}
			{...fieldOpts}
			{...prop}
		/>);

	if (labelPos === false) return formField;
	return (
		<Label
			className={className}
			data-error={dataError}
			title={prop.title || desc.title}
			labelPos={labelPos}
		>
			{ formField }
		</Label>
	);
}

const SelectOneOf = (props) => {
	const { title, name, schema, ...prop } = props;

	const selectDesc = {
		title,
		enum: [],
		enumNames: []
	};

	Object.keys(schema).forEach((item) => {
		selectDesc.enum.push(item);
		selectDesc.enumNames.push(schema[item].title || item);
	});

	return <Field name={name} schema={selectDesc} {...prop} />;
};

//

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

	Object.keys(schema.properties).forEach((p) => {
		if (p in instance)
			res[p] = instance[serializeMap[p]] || instance[p];
	});

	return res;
}

function deserializeRewrite(deserializeMap, instance) {
	return instance;
}

function getInvalidMessage(item) {
	if (!item.schema.invalidMessage) return item.message;
	return (typeof item.schema.invalidMessage === 'function') ?
		item.schema.invalidMessage(item.instance) :
		item.schema.invalidMessage;
}

function getErrorsObj(errors) {
	const errs = {};
	let field;

	errors.forEach((item) => {
		field = item.property.split('.')[1];
		if (!errs[field])
			errs[field] = getInvalidMessage(item);
	});

	return errs;
}

export { Field, SelectOneOf };
