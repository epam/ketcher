// TODO: exclude from no-groups build
/*global module, global*/

/* eslint-disable */

var ui = global.ui;

function dialog (params) {
	var dlg = ui.showDialog('sgroup_special');

	console.assert(!params.type || params.type == 'DAT');

	$('sgroup_field_name').value = params.attrs.fieldName;
	$('sgroup_field_value').value = params.attrs.fieldValue;
	if (params.attrs.attached)
		$('sgroup_pos_attached').checked = true;
	else if (params.attrs.absolute)
		$('sgroup_pos_absolute').checked = true;
	else
		$('sgroup_pos_relative').checked = true;

	var handlers = [];
	handlers[0] = dlg.on('click', 'input[type=button]', function (_, button) {
		var key = 'on' + button.value.capitalize();
		var res = key != 'onOk' || getValidateAttrs();
		if (res) {
			handlers.forEach(function (h) { h.stop(); });
			ui.hideDialog('sgroup_special');
			if (key in params && res)
				params[key](res);
		}
	});

	// handlers[1] = $('sgroup_type').on('change', onChange_SGroupType);
	// handlers[2] = $('sgroup_label').on('change', onChange_SGroupLabel);
};

function getValidateAttrs() {
	var attrs = {
		mul: null,
		connectivity: '',
		name: '',
		subscript: ''
	};

	attrs.fieldName = $('sgroup_field_name').value.strip();
	attrs.fieldValue = $('sgroup_field_value').value.strip();
	attrs.absolute = $('sgroup_pos_absolute').checked;
	attrs.attached = $('sgroup_pos_attached').checked;

	if (attrs.fieldValue == '') {
		alert('Please, specify data field value.');
		return null;
	}

	return attrs;
};

var special_choices = [
	{ Fragment : [
		{ MDLBG_FRAGMENT_STEREO: [
			'abs',
			'(+)-enantiomer',
			'(-)-enantiomer',
			'steric',
			'rel',
			'R(a)',
			'S(a)',
			'R(p)',
			'S(p)'
		]},
		{ MDLBG_FRAGMENT_COEFFICIENT: null},
		{ MDLBG_FRAGMENT_CHARGE: null },
		{ MDLBG_FRAGMENT_RADICALS: null },
	]},
	{ 'Single Bond': [
		{ MDLBG_STEREO_KEY: [
			'erythro',
			'threo',
			'alpha',
			'beta',
			'endo',
			'exo',
			'anti',
			'syn',
			'ECL',
			'STG'
		]},
		{ MDLBG_BOND_KEY: [
			'Value=4'
		]},
	]},
	{ Atom: [
		{ MDLBG_STEREO_KEY: [
			'RS',
			'SR',
			'P-3',
			'P-3-PI',
			'SP-4',
			'SP-4-PI',
			'T-4',
			'T-4-PI',
			'SP-5',
			'SP-5-PI',
			'TB-5',
			'TB-5-PI',
			'OC-6',
			'TB-5-PI',
			'TP-6',
			'PB-7',
			'CU-8',
			'SA-8',
			'DD-8',
			'HB-9',
			'TPS-9',
			'HB-9'
		]}
	]},
	{ Group: [
		{ MDLBG_STEREO_KEY: [
			'cis',
			'trans'
		]}
	]}
];

module.exports = dialog;
