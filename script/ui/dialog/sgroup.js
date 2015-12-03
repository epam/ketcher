// TODO: exclude from no-groups build
/*global module, global*/

/* eslint-disable */

var ui = global.ui;

function dialog (params) {
	var dlg = ui.showDialog('sgroup_properties');
	var type = params.type || 'GEN';

	$('sgroup_type').value = type;
	$('sgroup_type').activate();
	onChange_SGroupType.call($('sgroup_type'));

	switch (type) {
	case 'SRU':
		$('sgroup_connection').value = params.attrs.connectivity;
		$('sgroup_label').value = params.attrs.subscript;
		break;
	case 'MUL':
		$('sgroup_label').value = params.attrs.mul;
		break;
	case 'SUP':
		$('sgroup_label').value = params.attrs.name;
		break;
	case 'DAT':
		$('sgroup_field_name').value = params.attrs.fieldName;
		$('sgroup_field_value').value = params.attrs.fieldValue;
		if (params.attrs.attached)
			$('sgroup_pos_attached').checked = true;
		else if (params.attrs.absolute)
			$('sgroup_pos_absolute').checked = true;
		else
			$('sgroup_pos_relative').checked = true;
			break;
		default:
			break;
	}

	if (type != 'DAT') {
		$('sgroup_field_name').value = '';
		$('sgroup_field_value').value = '';
	}

	var handlers = [];
	handlers[0] = dlg.on('click', 'input[type=button]', function (_, button) {
		var key = 'on' + button.value.capitalize();
		var res = key != 'onOk' || getValidateAttrs();
		if (res) {
			handlers.forEach(function (h) { h.stop(); });
			ui.hideDialog('sgroup_properties');
			if (key in params && res)
				params[key](res);
		}
	});

	handlers[1] = $('sgroup_type').on('change', onChange_SGroupType);
	handlers[2] = $('sgroup_label').on('change', onChange_SGroupLabel);
};

function getValidateAttrs() {
	var type = $('sgroup_type').value;
	var attrs = {
		mul: null,
		connectivity: '',
		name: '',
		subscript: '',
		fieldName: '',
		fieldValue: '',
		attached: false,
		absolute: false
	};

	switch (type) {
	case 'SRU':
		attrs.connectivity = $('sgroup_connection').value.strip();
		attrs.subscript = $('sgroup_label').value.strip();
		if (attrs.subscript.length != 1 || !attrs.subscript.match(/^[a-zA-Z]$/)) {
			alert(attrs.subscript.length ? 'SRU subscript should consist of a single letter.' : 'Please provide an SRU subscript.');
			return null;
		}
		break;
	case 'MUL':
		attrs.mul = parseInt($('sgroup_label').value);
		break;
	case 'SUP':
		attrs.name = $('sgroup_label').value.strip();
		if (!attrs.name) {
			alert('Please provide a name for the superatom.');
			return null;
		}
		break;
	case 'DAT':
		attrs.fieldName = $('sgroup_field_name').value.strip();
		attrs.fieldValue = $('sgroup_field_value').value.strip();
		attrs.absolute = $('sgroup_pos_absolute').checked;
		attrs.attached = $('sgroup_pos_attached').checked;

		if (attrs.fieldName == '' || attrs.fieldValue == '') {
			alert('Please, specify data field name and value.');
			return null;
		}
		break;
	}
	return { type: type,
	         attrs: attrs };
};

function onChange_SGroupLabel ()
{
	if ($('sgroup_type').value == 'MUL' && !this.value.match(/^[1-9][0-9]{0,2}$/))
		this.value = '1';
};

function onChange_SGroupType ()
{
	var type = $('sgroup_type').value;
	if (type == 'DAT') {
		$$('#sgroup_properties .base')[0].hide();
		$$('#sgroup_properties .data')[0].show();
		return;
	}
	$$('#sgroup_properties .base')[0].show();
	$$('#sgroup_properties .data')[0].hide();

	$('sgroup_label').disabled = (type != 'SRU') && (type != 'MUL') && (type != 'SUP');
	$('sgroup_connection').disabled = (type != 'SRU');

	if (type == 'MUL' && !$('sgroup_label').value.match(/^[1-9][0-9]{0,2}$/))
		$('sgroup_label').value = '1';
	else if (type == 'SRU')
		$('sgroup_label').value = 'n';
	else if (type == 'GEN' || type == 'SUP')
		$('sgroup_label').value = '';
}

module.exports = dialog;
