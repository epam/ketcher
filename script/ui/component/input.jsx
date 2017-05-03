import { h, Component } from 'preact';
/** @jsx h */

function GenericInput({ value, onChange, type = "text", ...props }) {
	return (
		<input type={type} value={value} onInput={onChange} {...props} />
	);
}
GenericInput.val = function (ev, schema) {
	var input = ev.target;
	var isNumber = (input.type == 'number' || input.type == 'range') ||
		(schema && (schema.type == 'number' || schema.type == 'integer'));
	return (isNumber && !isNaN(input.value - 0)) ? input.value - 0 : input.value;
};

function TextArea({ value, onChange, ...props }) {
	return (
		<textarea value={value} onInput={onChange} {...props}/>
	);
}
TextArea.val = (ev) => ev.target.value;

function CheckBox({ value, onChange, ...props }) {
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
					<option selected={selected(val, value)}
							value={typeof val != 'object' && val}>
						{title}
					</option>
				))
			}
		</select>
	);
}

Select.val = function (ev, schema) {
	var select = ev.target;
	if (!select.multiple)
		return enumSchema(schema, select.selectedIndex);
	return [].reduce.call(select.options, function (res, o, i) {
		return !o.selected ? res :
			[enumSchema(schema, i), ...res];
	}, []);
};

function FieldSet({ schema, value, selected, onSelect, type = "radio", ...props }) {
	return (
		<fieldset onClick={onSelect} className="radio">
			{
				enumSchema(schema, (title, val) => (
					<label>
						<input type={type} checked={selected(val, value)}
							   value={typeof val != 'object' && val}
							   {...props}/>
						{title}
					</label>
				))
			}
		</fieldset>
	);
}

FieldSet.val = function (ev, schema) {
	var input = ev.target;
	// if (ev.target.tagName != 'INPUT') {
	// 	ev.preventDefault();
	// 	return undefined;
	// }
	// ev.stopPropagation();
	// TODO: do we need that?
	// Hm.. looks like premature optimization
	//      should we inline this?
	var fieldset = input.parentNode.parentNode;
	var res = [].reduce.call(fieldset.querySelectorAll('input'),
		function (res, inp, i) {
			return !inp.checked ? res :
				[enumSchema(schema, i), ...res];
		}, []);
	return input.type == 'radio' ? res[0] : res;
};

function enumSchema(schema, cbOrIndex) {
	var isTypeValue = Array.isArray(schema);
	if (typeof cbOrIndex == 'function') {
		return (isTypeValue ? schema : schema.enum).map((item, i) => {
			var title = isTypeValue ? item.title :
				schema.enumNames && schema.enumNames[i];
			return cbOrIndex(title !== undefined ? title : item,
				item.value !== undefined ? item.value : item);
		});
	}
	if (!isTypeValue)
		return schema.enum[cbOrIndex];
	var res = schema[cbOrIndex];
	return res.value !== undefined ? res.value : res;
}

function inputCtrl(component, schema, onChange) {
	var props = {};
	if (schema) {
		// TODO: infer maxLength, min, max, step, etc
		if (schema.type == 'number' || schema.type == 'integer')
			props = { type: 'number' };
	}
	return {
		onChange: function (ev) {
			var val = !component.val ? ev :
				component.val(ev, schema);
			onChange(val);
		},
		...props
	};
}

function singleSelectCtrl(component, schema, onChange) {
	return {
		selected: (testVal, value) => (value === testVal),
		onSelect: function (ev, value) {
			var val = !component.val ? ev :
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
		onSelect: function (ev, values) {
			if (component.val) {
				let val = component.val(ev, schema);
				if (val !== undefined)
					onChange(val);
			} else {
				var i = values ? values.indexOf(ev) : -1;
				if (i < 0)
					onChange(values ? [ev, ...values] : [ev]);
				else
					onChange([...values.slice(0, i),
						...values.slice(i + 1)]);
			}
		}
	};
}

function ctrlMap(component, { schema, multiple, onChange }) {
	if (!schema || !schema.enum && !Array.isArray(schema) || schema.type === 'string')
		return inputCtrl(component, schema, onChange);
	if (multiple || schema.type == 'array')
		return multipleSelectCtrl(component, schema, onChange);
	return singleSelectCtrl(component, schema, onChange);
}

function componentMap({ schema, type, multiple }) {
	if (!schema || !schema.enum && !Array.isArray(schema)) {
		if (type == 'checkbox' || schema && schema.type == 'boolean')
			return CheckBox;
		return (type == 'textarea') ? TextArea : GenericInput;
	}
	if (multiple || schema.type == 'array')
		return (type == 'checkbox') ? FieldSet : Select;
	return (type == 'radio') ? FieldSet : Select;
}

function shallowCompare(a, b) {
	for (let i in a) if (!(i in b)) return true;
	for (let i in b) if (a[i] !== b[i]) { return true; }
	return false;
}

export default class Input extends Component {
	constructor({ component, ...props }) {
		super(props);
		this.component = component || componentMap(props);
		this.ctrl = ctrlMap(this.component, props);
		console.info('initialized');
	}

	shouldComponentUpdate({ children, onChange, ...nextProps }) {
		var { children, onChange, ...oldProps } = this.props;
		return shallowCompare(oldProps, nextProps);
	}

	render() {
		var { children, onChange, ...props } = this.props;
		return h(this.component, { ...this.ctrl, ...props });
	}
}
