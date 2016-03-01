var util = require('../../util');
var element = require('../../chem/element');
var inputDialog = require('./input');
var selectDialog = require('./select');

function showElemTable (params) {
	params.required = true;
	selectDialog('elem-table', params);
};

function showRGroupTable (params) {
	selectDialog('rgroup-table', params);
};

function showReaGenericsTable (params) {
	params.required = true;
	selectDialog('generics-table', params);
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

function showAtomProperties (params) {
	var dlg = $('atom_properties');
	var numberInput = dlg.select('.number')[0];
	var handlers = [];

	function atomChange(val) {
		var change = (this == val.target);
		var label = !change ? val : this.value.strip().capitalize();
		if (change)
			this.value = label;
		var elem = element.getElementByLabel(label);
		if (elem == null && label !== 'A' &&
		    label !== '*' && label !== 'Q' &&
		    label !== 'X' && label !== 'R') {

			console.assert(change, 'Incorrect input params label');
			this.value = params.label;

			if (label !== 'A' && label !== '*') {
				elem = element.getElementByLabel(label);
			}
		}

		if (label == 'A' || label == '*') {
			numberInput.value = 'any';
		} else if (!elem) {
			numberInput.value = '';
		} else {
			numberInput.value = elem.toString();
		}
	}
	function stopHandlers() {
		handlers.forEach(function (h) { h.stop(); });
	}

	inputDialog('atom_properties', util.extend({}, params, {
		onOk: function (res) { stopHandlers(); params.onOk(res); },
		onCancel: function (res) { stopHandlers(); }
	}));

	handlers[0] = $(dlg.charge).on('change', function () {
		if (this.value.strip() === '' || this.value == '0') {
			this.value = '';
		} else if (this.value.match(/^[1-9][0-9]{0,1}[-+]$/)) {
			this.value = (this.value.endsWith('-') ? '-' : '') + this.value.substr(0, this.value.length - 1);
		} else if (!this.value.match(/^[+-]?[1-9][0-9]{0,1}$/)) {
			this.value = params.charge;
		}
	});
	handlers[1] = $(dlg.isotope).on('change', function () {
		if (this.value == numberInput.value || this.value.strip() == '' || this.value == '0') {
			this.value = '';
		} else if (!this.value.match(/^[1-9][0-9]{0,2}$/)) {
			this.value = params.isotope;
		}
	});
	handlers[2] = $(dlg.label).on('change', atomChange);
	atomChange(params.label);
};

function showRLogicTable (params) {
	inputDialog('rlogic_table', util.extend({}, params, {
		onOk: function (res) {
			params.onOk({
				range: res.range.replace(/\s*/g, '').replace(/,+/g, ',')
					.replace(/^,/, '').replace(/,$/, ''),
				resth: res.resth == 1,
				ifthen: parseInt(res.ifthen, 10)
			});
		}
	}));
	var ifOpts = params.rgroupLabels.reduce(function (res, label) {
		if (params.label == label)
			return res;
		return res + '<option value="' + label + '">' +
			'IF R' + params.label + ' THEN R' + label + '</option>';
	}, '<option value="0">Always</option>');

	var dlg = $('rlogic_table');
	$(dlg.ifthen).update(ifOpts);
	dlg.ifthen.value = params.ifthen;
};

module.exports = {
	showElemTable: showElemTable,
	showRGroupTable: showRGroupTable,
	showReaGenericsTable: showReaGenericsTable,
	showAtomAttachmentPoints: showAtomAttachmentPoints,
	showAtomProperties: showAtomProperties,
	showBondProperties: showBondProperties,
	showAutomapProperties: showAutomapProperties,
	showRLogicTable: showRLogicTable
};
