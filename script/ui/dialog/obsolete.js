var keymage = require('keymage');
var element = require('../../chem/element');
var Bond = require('../../chem/bond');
var util = require('../../util');
var Action = require('../../editor/action');
var inputDialog = require('./input');

var ui = global.ui;

function initDialogs () {
	// Label input events
	$('input_label').observe('blur', function () {
		keymage.setScope('editor');
		this.hide();
	});
	$('input_label').observe('keypress', onKeyPress_InputLabel);
	$('input_label').observe('keyup', onKeyUp_InputLabel);

	// Atom properties dialog events
	$('atom_label').observe('change', onChange_AtomLabel);
	$('atom_charge').observe('change', onChange_AtomCharge);
	$('atom_isotope').observe('change', onChange_AtomIsotope);
	$('atom_valence').observe('change', onChange_AtomValence);
	$('atom_prop_cancel').observe('click', function () {
		ui.hideDialog('atom_properties');
	});
	$('atom_prop_ok').observe('click', function () {
		applyAtomProperties();
	});
};

function showAtomAttachmentPoints (params) {
	inputDialog('atom_attpoints', params);
};

function showBondProperties (params) {
	inputDialog('bond_properties', params);
};

function showAutomapProperties (params) {
	inputDialog('automap_properties', params);
};

//
// Atom properties dialog
//
function showAtomProperties (params) {
	$('atom_properties').params = params;

	$('atom_label').value = params.label;
	$('atom_charge').value = params.charge;
	$('atom_isotope').value = params.isotope;
	$('atom_valence').value = params.explicitValence;
	$('atom_radical').value = params.radical;
	$('atom_inversion').value = params.invRet;
	$('atom_exactchange').value = params.exactChangeFlag;
	$('atom_ringcount').value = params.ringBondCount;
	$('atom_substitution').value = params.substitutionCount;
	$('atom_unsaturation').value = params.unsaturatedAtom;
	$('atom_hcount').value = params.hCount;

	onChange_AtomLabel.call($('atom_label'));
	ui.showDialog('atom_properties');
	$('atom_label').activate();
};

function applyAtomProperties () {
	ui.hideDialog('atom_properties');

	var params = $('atom_properties').params;
	params.onOk({
		label: $('atom_label').value,
		charge: $('atom_charge').value,
		isotope: $('atom_isotope').value,
		explicitValence: $('atom_valence').value,
		radical: $('atom_radical').value,
		// reaction flags
		invRet: $('atom_inversion').value,
		exactChangeFlag: $('atom_exactchange').value,
		// query flags
		ringBondCount: $('atom_ringcount').value,
		substitutionCount: $('atom_substitution').value,
		unsaturatedAtom: $('atom_unsaturation').value,
		hCount: $('atom_hcount').value
	});
	ui.render.update();
};

function onChange_AtomLabel () {
	this.value = this.value.strip().capitalize();

	var elem = element.getElementByLabel(this.value);
	var params = $('atom_properties').params;

	if (elem == null && this.value !== 'A' &&
	    this.value !== '*' && this.value !== 'Q' &&
	    this.value !== 'X' && this.value !== 'R') {

		this.value = params.label;

		if (this.value !== 'A' && this.value !== '*') {
			elem = element.getElementByLabel(this.value);
		}
	}

	if (this.value == 'A' || this.value == '*') {
		$('atom_number').value = 'any';
	} else if (!elem) {
		$('atom_number').value = '';
	} else {
		$('atom_number').value = elem.toString();
	}
};

function onChange_AtomCharge () {
	var params = $('atom_properties').params;
	if (this.value.strip() === '' || this.value == '0') {
		this.value = '';
	} else if (this.value.match(/^[1-9][0-9]{0,1}[-+]$/)) {
		this.value = (this.value.endsWith('-') ? '-' : '') + this.value.substr(0, this.value.length - 1);
	} else if (!this.value.match(/^[+-]?[1-9][0-9]{0,1}$/)) {
		this.value = params.charge;
	}
};

function onChange_AtomIsotope () {
	var params = $('atom_properties').params;
	if (this.value == util.getElementTextContent($('atom_number')) || this.value.strip() == '' || this.value == '0') {
		this.value = '';
	} else if (!this.value.match(/^[1-9][0-9]{0,2}$/)) {
		this.value = params.isotope;
	}
};

function onChange_AtomValence () {
	// var params = $('atom_properties').params;
	// if (this.value.strip() == '')
	// 	this.value = '';
	// else if (!this.value.match(/^[0-9]$/))
	// 	this.value = params.explicitValence;
};

function showRLogicTable (args) {
	var params = args || {};
	params.rlogic = params.rlogic || {};
	$('rlogic_occurrence').value = params.rlogic.occurrence || '>0';
	$('rlogic_resth').value = params.rlogic.resth ? '1' : '0';
	var ifOptHtml = '<option value="0">Always</option>';
	for (var r = 1; r <= 32; r++) {
		if (r != params.rgid && (params.rgmask & (1 << (r - 1))) != 0) {
			ifOptHtml += '<option value="' + r + '">IF R' + params.rgid + ' THEN R' + r + '</option>';
		}
	}
	$('rlogic_if').outerHTML = '<select id="rlogic_if">' + ifOptHtml + '</select>'; // [RB] thats tricky because IE8 fails to set innerHTML
	$('rlogic_if').value = params.rlogic.ifthen;
	ui.showDialog('rlogic_table');

	var _onOk = new Event.Handler('rlogic_ok', 'click', undefined, function () {
		var result = {
			'occurrence': $('rlogic_occurrence').value
			.replace(/\s*/g, '').replace(/,+/g, ',').replace(/^,/, '').replace(/,$/, ''),
			'resth': $('rlogic_resth').value == '1',
			'ifthen': parseInt($('rlogic_if').value, 10)
		};
		if (!params || !('onOk' in params) || params.onOk(result)) {
			_onOk.stop();
			_onCancel.stop();
			ui.hideDialog('rlogic_table');
		}
	}).start();
	var _onCancel = new Event.Handler('rlogic_cancel', 'click', undefined, function () {
		_onOk.stop();
		_onCancel.stop();
		ui.hideDialog('rlogic_table');
		if (params && 'onCancel' in params) params['onCancel']();
	}).start();

	$('rlogic_occurrence').activate();
};

function onKeyPress_Dialog (event)
{
	util.stopEventPropagation(event);
	if (event.keyCode === 27) {
		ui.hideDialog(this.id);
		return util.preventDefault(event);
	}
};

function onKeyPress_InputLabel (event)
{
	util.stopEventPropagation(event);
	if (event.keyCode == 13) {
		keymage.setScope('editor');
		this.hide();

		var label = '';
		var charge = 0;
		var value_arr = this.value.toArray();

		if (this.value == '*') {
			label = 'A';
		}
		else if (this.value.match(/^[*][1-9]?[+-]$/i)) {
			label = 'A';

			if (this.value.length == 2)
				charge = 1;
			else
				charge = parseInt(value_arr[1]);

			if (value_arr[2] == '-')
				charge *= -1;
		}
		else if (this.value.match(/^[A-Z]{1,2}$/i)) {
			label = this.value.capitalize();
		}
		else if (this.value.match(/^[A-Z]{1,2}[0][+-]?$/i)) {
			if (this.value.match(/^[A-Z]{2}/i))
				label = this.value.substr(0, 2).capitalize();
			else
				label = value_arr[0].capitalize();
		}
		else if (this.value.match(/^[A-Z]{1,2}[1-9]?[+-]$/i)) {
			if (this.value.match(/^[A-Z]{2}/i))
				label = this.value.substr(0, 2).capitalize();
			else
				label = value_arr[0].capitalize();

			var match = this.value.match(/[0-9]/i);

			if (match != null)
				charge = parseInt(match[0]);
			else
				charge = 1;

			if (value_arr[this.value.length - 1] == '-')
				charge *= -1;
		}

		if (label == 'A' || label == 'Q' || label == 'X' || label == 'R' || element.getElementByLabel(label) != null) {
			ui.addUndoAction(Action.fromAtomsAttrs(this.atom_id, {label: label, charge: charge}), true);
			ui.render.update();
		}
		return util.preventDefault(event);
	}
	if (event.keyCode == 27) {
		this.hide();
		keymage.setScope('editor');
		return util.preventDefault(event);
	}
};

function onKeyUp_InputLabel (event)
{
	util.stopEventPropagation(event);
	if (event.keyCode == 27) {
		this.hide();
		keymage.setScope('editor');
		return util.preventDefault(event);
	}
};

function showLabelEditor (aid)
{
	// TODO: RB: to be refactored later, need to attach/detach listeners here as anon-functions, not on global scope (onKeyPress_InputLabel, onBlur, etc)
	var input_el = $('input_label');
	keymage.setScope('label');

	var offset = Math.min(7 * ui.render.zoom, 16);

	input_el.atom_id = aid;
	input_el.value = ui.render.atomGetAttr(aid, 'label');
	input_el.style.fontSize = offset * 2 + 'px';

	input_el.show();

	var atom_pos = ui.render.obj2view(ui.render.atomGetPos(aid));
	// TODO: some other way to handle pos
	//var offset_client = ui.client_area.cumulativeOffset();
	var offset_client = {left: 0, top: 0};
	var offset_parent = Element.cumulativeOffset(input_el.offsetParent);
	var d = 0; // TODO: fix/Math.ceil(4 * ui.abl() / 100);
	input_el.style.left = (atom_pos.x + offset_client.left - offset_parent.left - offset - d) + 'px';
	input_el.style.top = (atom_pos.y + offset_client.top - offset_parent.top - offset - d) + 'px';

	input_el.activate();
};

module.exports = {
	initDialogs: initDialogs,
	showAtomAttachmentPoints: showAtomAttachmentPoints,
	showAtomProperties: showAtomProperties,
	showBondProperties: showBondProperties,
	showAutomapProperties: showAutomapProperties,
	showRLogicTable: showRLogicTable,
	showLabelEditor: showLabelEditor
};
