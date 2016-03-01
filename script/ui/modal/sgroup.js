// TODO: exclude from no-groups build

var ui = global.ui;

function dialog (params) {
	var dlg = ui.showDialog('sgroup_properties');
	var type = params.type || 'GEN';

	dlg.type.value = type;
	typeChange();

	switch (type) {
	case 'SRU':
		dlg.connectivity.value = params.attrs.connectivity;
		dlg.label.value = params.attrs.subscript;
		break;
	case 'MUL':
		dlg.label.value = params.attrs.mul;
		break;
	case 'SUP':
		dlg.label.value = params.attrs.name;
		break;
	case 'DAT':
		dlg.fieldName.value = params.attrs.fieldName;
		dlg.fieldValue.value = params.attrs.fieldValue;
		dlg.fieldPos.value = params.attrs.attached ? 'attached' :
			params.attrs.absolute ? 'absolute' : 'relative';
		break;
	default:
		break;
	}

	if (type != 'DAT') {
		dlg.fieldName.value = '';
		dlg.fieldValue.value = '';
	}

	function typeChange ()
	{
		var type = dlg.type.value;
		if (type == 'DAT') {
			dlg.select('.base')[0].hide();
			dlg.select('.data')[0].show();
			return;
		}
		dlg.select('.base')[0].show();
		dlg.select('.data')[0].hide();

		dlg.label.disabled = (type != 'SRU') && (type != 'MUL') && (type != 'SUP');
		dlg.connectivity.disabled = (type != 'SRU');

		if (type == 'MUL' && !dlg.label.value.match(/^[1-9][0-9]{0,2}$/))
			dlg.label.value = '1';
		else if (type == 'SRU')
			dlg.label.value = 'n';
		else if (type == 'GEN' || type == 'SUP')
			dlg.label.value = '';
	}

	var handlers = [];
	handlers[0] = dlg.on('click', 'input[type=button]', function (_, button) {
		var key = 'on' + button.value.capitalize();
		var res = key != 'onOk' || getValidateAttrs(dlg);
		if (res) {
			handlers.forEach(function (h) { h.stop(); });
			ui.hideDialog('sgroup_properties');
			if (key in params && res)
				params[key](res);
		}
	});
	handlers[1] = $(dlg.type).on('change', typeChange);
	handlers[2] = $(dlg.label).on('change', function () {
		if (dlg.type.value == 'MUL' &&
		    !dlg.label.value.match(/^[1-9][0-9]{0,2}$/))
			dlg.label.value = '1';
	});
};

function getValidateAttrs(dlg) {
	var type = dlg.type.value;
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
		attrs.connectivity = dlg.connectivity.value.strip();
		attrs.subscript = dlg.label.value.strip();
		if (attrs.subscript.length != 1 || !attrs.subscript.match(/^[a-zA-Z]$/)) {
			alert(attrs.subscript.length ?
			      'SRU subscript should consist of a single letter.' :
			      'Please provide an SRU subscript.');
			return null;
		}
		break;
	case 'MUL':
		attrs.mul = parseInt(dlg.label.value, 10);
		break;
	case 'SUP':
		attrs.name = dlg.label.value.strip();
		if (!attrs.name) {
			alert('Please provide a name for the superatom.');
			return null;
		}
		break;
	case 'DAT':
		attrs.fieldName = dlg.fieldName.value.strip();
		attrs.fieldValue = dlg.fieldValue.value.strip();
		attrs.absolute = dlg.fieldPos.value == 'absolute';
		attrs.attached = dlg.fieldPos.value == 'attached';

		if (attrs.fieldName == '' || attrs.fieldValue == '') {
			alert('Please, specify data field name and value.');
			return null;
		}
		break;
	}
	return { type: type,
	         attrs: attrs };
};

module.exports = dialog;
