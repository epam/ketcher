import { h, Component } from 'preact';
/** @jsx h */

function TextLine({ value, onChange, type="text", ...props}) {
	// maxLength
	return (
		<input type={type} value={value} onInput={onChange} {...props} />
	);
}
TextLine.val = (ev) => ev.target.value;

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

function Select({ items, value, selected, onSelect, ...props }) {
	return (
		<select onChange={onSelect} {...props}>
		  {
			  items.map(item => {
				  let title = item.title || item;
				  return (
					  <option>{title}</option>
				  );
			  })
		  }
		</select>
	);
}

Select.index = function (ev) {
	var select = ev.target;
	return !select.multiple ? select.selectedIndex :
		[].reduce.call(select.options, (res, o, i) =>
					   o.selected ? [i, ...res] : res, []);
};

function SetBox({ items, value, selected, onSelect, type="radio", ...props}) {
	return (
		<fieldset>
			{
				items.map(item => (
					<label>
					  <input type={type} value={item.value}
							 checked={selected(value, item.value)}
							 onClick={onSelect} {...props}/>
						{item.title}
					</label>
				))
			}
		</fieldset>
	);
}
SetBox.index = function (ev) {
	console.info(ev);
};

function enumMap(items, cb) {
	if (Array.isArray(items)) {
		items.map(function (item) {
		});
	}
	else {
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

function changeInput(component, onChange) {
	return {
		onChange: function(ev) {
			if (!component.val)
				onChange(ev);
			ev.stopPropagation();
			onChange(component.val(ev));
		}
	};
}

function selectInput(component, onChange, items) {
	return {
		selected: (value, testVal) => value == testVal,
		onSelect: function (ev) {
			if (!component.index)
				onChange(ev);
			ev.stopPropagation();
			onChange(items[component.index(ev)]);
		}
	};
}

function multipleInput(component, onChange, items) {
	return {
		multiple: true,
		selected: (value, testVal) => value.indexOf(testVal) >= 0,
		onSelect: function (ev) {
			var val = ev;
			if (component.index) {
				ev.stopPropagation();
				val = items[component.index(ev)];
			}
			console.info('val', val);
		}
	};
}

function mapInput(component, {value, items, multiple, onChange}) {
	if (!items)
		return changeInput(component, onChange);
	if (multiple || Array.isArray(value))
		return multipleInput(component, onChange, items);
	return selectInput(component, onChange, items);
}

function mapComponent({value, type, items, multiple}) {
	if (!items) {
		if (type == 'checkbox' || typeof value == 'boolean')
			return CheckBox;
		return (type == 'textarea') ? TextArea : TextLine;
	}
	if (multiple || Array.isArray(value))
		return (type == 'checkbox') ? SetBox : Select;
	return (type == 'radio') ? SetBox : Select;
};

export default class Input extends Component {
	constructor({component, ...props}) {
		super(props);
		this.component = component || mapComponent(props);
		this.input = mapInput(this.component, props);
		console.info('initialized');
	}
	render() {
		var { children, onChange, ...props } = this.props;
		return (<this.component {...this.input} {...props}/>);
	}
}
