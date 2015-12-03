// TODO: exclude from no-groups build
/*global module, global*/

/* eslint-disable */

var ui = global.ui;

function dialog (params) {
	var dlg = ui.showDialog('sgroup_special');
	var cache = {};

	console.assert(!params.type || params.type == 'DAT');

	setContext(params.context || 'Fragment', cache);
	if (params.attrs.fieldName)
		setField(params.attrs.fieldName, cache);

	$('sgroup_special_value').value = params.attrs.fieldValue;
	if (params.attrs.attached)
		$('sgroup_special_attached').checked = true;
	else if (params.attrs.absolute)
		$('sgroup_special_absolute').checked = true;
	else
		$('sgroup_special_relative').checked = true;

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

	handlers[1] = dlg.on('change', 'select', function (_, select) {
		if (select.id == 'sgroup_context')
			setContext($('sgroup_context').value, cache);
		if (select.id == 'sgroup_special_name')
			setField($('sgroup_special_name').value, cache);
	});
};

function getValidateAttrs() {
	var attrs = {
		mul: null,
		connectivity: '',
		name: '',
		subscript: ''
	};

	attrs.fieldName = $('sgroup_special_name').value.strip();
	attrs.fieldValue = $('sgroup_special_value').value.strip();
	attrs.absolute = $('sgroup_special_absolute').checked;
	attrs.attached = $('sgroup_special_attached').checked;

	if (attrs.fieldValue == '') {
		alert('Please, specify data field value.');
		return null;
	}

	return { type: 'DAT',
	         attrs: attrs };
};

function arrayFind(array, pred) {
	for (var i = 0; i < array.length; i++) {
		if (pred(array[i], i, array))
			return array[i];
	}
	return undefined;
}

function setContext(context, cache) {
	console.info('set', context, cache);
	if (!cache.context || context != cache.context.name) {
		var ctx = arrayFind(special_choices, function (opt) {
			return opt.name == context;
		});
		var str = ctx.value.reduce(function (res, opt) {
			return res + '<option value="' + opt.name + '">' + opt.name + "</option>";
		}, '');
		$('sgroup_special_name').update(str);
		cache.context = ctx; // assert
		setField(ctx.value[0].name, cache, true);
	}
}

function setField(field, cache, force) {
	console.info('set', field, cache);
	if (force || !cache.field || field != cache.field.name) {
		var ctx = arrayFind(cache.context.value, function (opt) {
			console.log(opt.name, field);
			return opt.name == field;
		});
		cache.field = ctx;
		if (!ctx.value)
			$('sgroup_special_value').outerHTML = '<textarea id="sgroup_special_value"></textarea>';
		else {
			var str = ctx.value.reduce(function (res, opt) {
				return res + '<option value="' + opt + '">' + opt + "</option>";
			}, '');
			$('sgroup_special_value').outerHTML = '<select size="10" id="sgroup_special_value">' + str + '</select>';
		}
	}
}

var special_choices = [
	{ name: 'Fragment',
	  value: [
		  { name: 'MDLBG_FRAGMENT_STEREO',
		    value: [
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
		  { name: 'MDLBG_FRAGMENT_COEFFICIENT',
		    value: null},
		  { name: 'MDLBG_FRAGMENT_CHARGE',
		    value: null },
		  { name: 'MDLBG_FRAGMENT_RADICALS',
		    value: null },
	]},
	{ name: 'Single Bond',
	  value: [
		  { name: 'MDLBG_STEREO_KEY',
		    value: [
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
		  { name: 'MDLBG_BOND_KEY',
		    value: [
			    'Value=4'
		    ]},
	]},
	{ name: 'Atom',
	  value: [
		  { name: 'MDLBG_STEREO_KEY',
		    value: [
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
	{ name: 'Group',
	  value: [
		  { name: 'MDLBG_STEREO_KEY',
		    value: [
			'cis',
			'trans'
		    ]}
	  ]}
];

module.exports = dialog;
