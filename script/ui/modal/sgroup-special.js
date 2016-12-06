// TODO: exclude from no-groups build
var keyName = require('w3c-keyname');

var util = require('../../util');
var ui = global.ui;

function dialog (params) {
	var dlg = ui.showDialog('sgroupSpecial');
	var cache = {};

	function setContext(context, force) {
		console.info('set context:', context, cache);
		console.assert(cache.context || force, 'Field setup should be forced');
		if (force || context != cache.context.name) {
			cache.context = specialChoices.find(function (opt) {
				return opt.name == context;
			});
			console.assert(cache.context, 'Can\'t find such context');
			var str = cache.context.value.reduce(function (res, opt) {
				return res + '<option value="' + opt.name + '">' + opt.name + "</option>";
			}, '');
			$(dlg.fieldName).update(str);
			setField(cache.context.value[0].name, true);
			if (force)
				dlg.context.value = context;
		}
	}

	function setField(field, force) {
		console.info('set field:', field, cache);
		console.assert(cache.field || force, 'Field setup should be forced');
		if (field || field != cache.field.name) {
			cache.field = cache.context.value.find(function (opt) {
				return opt.name == field;
			});
			console.assert(cache.field, 'Can\'t find such field');
			if (!cache.field.value)
				dlg.fieldValue.outerHTML = '<textarea name="fieldValue"></textarea>';
			else {
				var str = cache.field.value.reduce(function (res, opt) {
					return res + '<option value="' + opt + '">' + opt + "</option>";
				}, '');
				dlg.fieldValue.outerHTML = '<select size="10" name="fieldValue">' + str + '</select>';
			}
			dlg.fieldName.value = field;
		}
	}

	console.assert(!params.type || params.type == 'DAT');

	var context = params.attrs.fieldName &&
	    matchContext(params.attrs.fieldName, params.attrs.fieldValue) ||
	    params.context || 'Fragment';

	setContext(context, true);
	if (params.attrs.fieldName)
		setField(params.attrs.fieldName, true);

	dlg.fieldValue.value = params.attrs.fieldValue;
	//  absolute by default
	var posValue = params.attrs.attached ? 'attached' :
	    params.attrs.absolute === false ? 'relative' : 'absolute';
	dlg.getInputs('radio', 'fieldPos').find(function(r) { return r.value == posValue; }).checked = true;

	var handlers = [];
	handlers[0] = dlg.on('click', 'input[type=button]', function (_, button) {
		exit(button.value);
	});

	handlers[1] = $(dlg.context).on('change', function () {
		setContext(dlg.context.value);
	});

	handlers[2] = $(dlg.fieldName).on('change', function () {
		setField(dlg.fieldName.value);
	});
	handlers[3] = dlg.on('keydown', function (ev) {
		var key = keyName(ev);
		if (key.startsWith('Esc') || key == 'Enter') {
			exit(key == 'Enter' ? 'OK': 'Cancel');
			ev.preventDefault();
		}
		ev.stopPropagation();
	});
	function exit(mode) {
		var key = mode == 'OK' ? 'onOk' : 'onCancel';
		var res = key != 'onOk' || getValidateAttrs(dlg);
		if (res) {
			handlers.forEach(function (h) { h.stop(); });
			ui.hideDialog('sgroupSpecial');
			if (key in params && res)
				params[key](res);
		}
	}
	dlg.select('button, select, textarea, input')[0].activate();
};

function getValidateAttrs(dlg) {
	var attrs = {
		mul: null,
		connectivity: '',
		name: '',
		subscript: ''
	};

	attrs.fieldName = dlg.fieldName.value.strip();
	attrs.fieldValue = dlg.fieldValue.value.strip();

	var posValue = dlg.getInputs('radio', 'fieldPos').find(function(r) { return r.checked; }).value;
	attrs.absolute = posValue == 'absolute';
	attrs.attached = posValue == 'attached';

	if (attrs.fieldValue == '') {
		alert('Please, specify data field value.');
		return null;
	}

	return { type: 'DAT',
			 attrs: attrs };
};

function matchContext(field, value) {
	console.info('search:', util.unicodeLiteral(field), util.unicodeLiteral(value));
	var c = specialChoices.find(function(c) {
		var f = c.value.find(function(f) {
			return f.name == field;
		});
		if (!f)
			return false;
		return !value || !f.value || !!f.value.find(function(v) {
			return v == value;
		});
	});
	return c && c.name;
}

var specialChoices = [
	{ name: 'Fragment',
	  value: [
		  { name: 'MDLBG_FRAGMENT_STEREO',
			value: [
			'abs',
			'(+)-enantiomer',
			'(-)-enantiomer',
			'racemate',
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

dialog.match = function (params) {
	return params.type == 'DAT' && (!params.attrs.fieldName ||
		!!matchContext(params.attrs.fieldName, params.attrs.fieldValue));
};

module.exports = dialog;
