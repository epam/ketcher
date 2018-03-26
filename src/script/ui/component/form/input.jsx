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

import { h, Component } from 'preact';
import { omit } from 'lodash';

function GenericInput({ schema, value, onChange, type = 'text', ...props }) {
	return (
		<input type={type} value={value} onInput={onChange} {...props} />
	);
}

GenericInput.val = function (ev, schema) {
	const input = ev.target;
	const isNumber = (input.type === 'number' || input.type === 'range') ||
		(schema && (schema.type === 'number' || schema.type === 'integer'));
	const value = isNumber ? input.value.replace(/,/g, '.') : input.value;

	return (isNumber && !isNaN(value - 0)) ? value - 0 : value; // eslint-disable-line
};

function TextArea({ schema, value, onChange, ...props }) {
	return (
		<textarea value={value} onInput={onChange} {...props} />
	);
}

TextArea.val = ev => ev.target.value;

function CheckBox({ schema, value, onChange, ...props }) {
	return (
		<input type="checkbox" checked={value} onClick={onChange} {...props} />
	);
}

CheckBox.val = function (ev) {
	ev.stopPropagation();
	return !!ev.target.checked;
};

function Select({ schema, value, selected, onSelect, ...props }) {
	return (
		<select onChange={onSelect} {...props}>
			{
				enumSchema(schema, (title, val) => (
					<option
						selected={selected(val, value)}
						value={typeof val !== 'object' && val}
					>
						{title}
					</option>
				))
			}
		</select>
	);
}

Select.val = function (ev, schema) {
	const select = ev.target;
	if (!select.multiple)
		return enumSchema(schema, select.selectedIndex);

	return [].reduce.call(select.options, (res, o, i) => (!o.selected ? res :
		[enumSchema(schema, i), ...res]), []);
};

function FieldSet({ schema, value, selected, onSelect, type = 'radio', ...props }) {
	return (
		<fieldset onClick={onSelect} className="radio">
			{
				enumSchema(schema, (title, val) => (
					<li>
						<label>
							<input
								type={type}
								checked={selected(val, value)}
								value={typeof val !== 'object' && val}
								{...props}
							/>
							{title}
						</label>
					</li>
				))
			}
		</fieldset>
	);
}

FieldSet.val = function (ev, schema) {
	const input = ev.target;
	if (ev.target.tagName !== 'INPUT') {
		ev.stopPropagation();
		return undefined;
	}
	// Hm.. looks like premature optimization
	//      should we inline this?
	const fieldset = input.parentNode.parentNode.parentNode;
	const result = [].reduce.call(fieldset.querySelectorAll('input'),
		(res, inp, i) => (!inp.checked ? res :
			[enumSchema(schema, i), ...res]), []);
	return input.type === 'radio' ? result[0] : result;
};

function enumSchema(schema, cbOrIndex) {
	const isTypeValue = Array.isArray(schema);
	if (!isTypeValue && schema.items)
		schema = schema.items;

	if (typeof cbOrIndex === 'function') {
		return (isTypeValue ? schema : schema.enum).map((item, i) => {
			const title = isTypeValue ? item.title :
				schema.enumNames && schema.enumNames[i];
			return cbOrIndex(title !== undefined ? title : item,
				item.value !== undefined ? item.value : item);
		});
	}

	if (!isTypeValue)
		return schema.enum[cbOrIndex];

	const res = schema[cbOrIndex];
	return res.value !== undefined ? res.value : res;
}

function inputCtrl(component, schema, onChange) {
	let props = {};
	if (schema) {
		// TODO: infer maxLength, min, max, step, etc
		if (schema.type === 'number' || schema.type === 'integer')
			props = { type: 'text' };
	}

	return {
		onChange: (ev) => {
			const val = !component.val ? ev :
				component.val(ev, schema);
			onChange(val);
		},
		...props
	};
}

function singleSelectCtrl(component, schema, onChange) {
	return {
		selected: (testVal, value) => (value === testVal),
		onSelect: (ev) => {
			const val = !component.val ? ev :
				component.val(ev, schema);
			if (val !== undefined)
				onChange(val);
		}
	};
}

function multipleSelectCtrl(component, schema, onChange) {
	return {
		multiple: true,
		selected: (testVal, values) =>
			(values && values.indexOf(testVal) >= 0),
		onSelect: (ev, values) => {
			if (component.val) {
				const val = component.val(ev, schema);
				if (val !== undefined)
					onChange(val);
			} else {
				const i = values ? values.indexOf(ev) : -1;
				if (i < 0)
					onChange(values ? [ev, ...values] : [ev]);
				else
					onChange([...values.slice(0, i), ...values.slice(i + 1)]);
			}
		}
	};
}

function ctrlMap(component, { schema, multiple, onChange }) {
	if (!schema || !schema.enum && !schema.items && !Array.isArray(schema) || schema.type === 'string')
		return inputCtrl(component, schema, onChange);

	if (multiple || schema.type === 'array')
		return multipleSelectCtrl(component, schema, onChange);

	return singleSelectCtrl(component, schema, onChange);
}

function componentMap({ schema, type, multiple }) {
	if (!schema || !schema.enum && !schema.items && !Array.isArray(schema)) {
		if (type === 'checkbox' || schema && schema.type === 'boolean')
			return CheckBox;

		return (type === 'textarea') ? TextArea : GenericInput;
	}
	if (multiple || schema.type === 'array')
		return (type === 'checkbox') ? FieldSet : Select;

	return (type === 'radio') ? FieldSet : Select;
}

function shallowCompare(a, b) {
	for (const i in a) if (!(i in b)) return true;
	for (const i in b) if (a[i] !== b[i]) return true;
	return false;
}

export default class Input extends Component {
	constructor({ component, ...props }) {
		super(props);
		this.component = component || componentMap(props);
		this.ctrl = ctrlMap(this.component, props);
	}

	shouldComponentUpdate({ children, onChange, style, ...nextProps }) {
		const oldProps = omit(this.props, ['children', 'onChange', 'style']);
		return shallowCompare(oldProps, nextProps);
	}

	render() {
		const { children, onChange, ...props } = this.props;
		return h(this.component, { ...this.ctrl, ...props });
	}
}
