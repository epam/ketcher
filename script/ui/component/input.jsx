import { h, Component } from 'preact';
/** @jsx h */

function Generic({ value, onChange, type="text", ...props}) {
	// maxLength, min, max
	return (
		<input type={type} value={value} onInput={onChange} {...props} />
	);
}
Generic.val = (ev) => ev.target.value;

function TextArea({ value, onChange, ...props }) {
	return (
		<textarea value={value} onInput={onChange} {...props}/>
	);
}
TextArea.val = (ev) => ev.target.value;

function CheckBox({ value, onChange, ...props}) {
	return (
		<input type="checkbox" checked={value} onClick={onChange} {...props} />
	);
}
CheckBox.val = (ev) => !!ev.target.checked;

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

function FieldSet({ schema, value, selected, onSelect, type="radio", ...props}) {
	return (
		<fieldset onClick={onSelect}>
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
	if (ev.target.tagName != 'INPUT')
		return undefined;
	var input = ev.target;
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
			return cbOrIndex(title || item, item.value || item);
		});
	}
	return !isTypeValue ? schema.enum[cbOrIndex] :
		(schema[cbOrIndex].value ||  schema[cbOrIndex]);
}

function inputCtrl(component, schema, onChange) {
	return {
		onChange: function(ev) {
			var value =  ev;
			if (component.val) {
				ev.stopPropagation();
				value = component.val(ev, schema);
			}
			onChange(value);
		}
	};
}

function singleSelectCtrl(component, schema, onChange) {
	return {
		selected: (testVal, value) => (value === testVal),
		onSelect: function (ev, value) {
			var val =  ev;
			if (component.val) {
				ev.stopPropagation();
				val = component.val(ev, schema);
			}
			console.info(val);
			if (val !== undefined)
				onChange(val);
		}
	};
}

function multipleSelectCtrl(component, schema, onChange) {
	return {
		multiple: true,
		selected: (testVal, values) => (values.indexOf(testVal) >= 0),
		onSelect: function (ev, values) {
			if (component.val) {
				ev.stopPropagation();
				onChange(component.val(ev, schema));
			} else {
			}
		}
	};
}

function ctrlMap(component, {schema, value, multiple, onChange}) {
	if (!schema || !schema.enum && !Array.isArray(schema))
		return inputCtrl(component, schema, onChange);
	if (multiple || schema.type == 'array' || Array.isArray(value))
		return multipleSelectCtrl(component, schema, onChange);
	return singleSelectCtrl(component, schema, onChange);
}

function componentMap({schema, value, type, multiple}) {
	if (!schema || !schema.enum && !Array.isArray(schema)) {
		if (type == 'checkbox' || typeof value == 'boolean')
			return CheckBox;
		return (type == 'textarea') ? TextArea : Generic;
	}
	if (multiple || schema.type == 'array' || Array.isArray(value))
		return (type == 'checkbox') ? FieldSet : Select;
	return (type == 'radio') ? FieldSet : Select;
};

export default class Input extends Component {
	constructor({component, ...props}) {
		super(props);
		this.component = component || componentMap(props);
		this.ctrl = ctrlMap(this.component, props);
		console.info('initialized');
	}
	shouldComponentUpdate(props) {
		for (let key in props)
			if (props[key] !== this.props[key]) return true;
		for (let key in this.props)
			if (!(key in props)) return true;
		return false;
	}
	render() {
		var { children, onChange, ...props } = this.props;
		return h(this.component, {...this.ctrl, ...props});
	}
}
