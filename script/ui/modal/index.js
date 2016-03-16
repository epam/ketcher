var element = require('../../chem/element');

var inputDialog = require('./input');
var selectDialog = require('./select');

var openDialog = require('./open.js');
var saveDialog = require('./save.js');
var templatesDialog = require('./templates');
var sgroupDialog = require('./sgroup');
var sgroupSpecialDialog = require('./sgroup-special');

function periodTable (params) {
	params.required = true;
	selectDialog('elem-table', params);
};

function rgroup (params) {
	selectDialog('rgroup-table', params);
};

function genericGroups (params) {
	params.required = true;
	selectDialog('generics-table', params);
};

function about(el) {
	inputDialog('about_dialog');
}

function attachmentPoints (params) {
	inputDialog('atom_attpoints', params);
};

function bondProps (params) {
	inputDialog('bond_properties', params);
};

function automap (params) {
	inputDialog('automap_properties', params);
};

function atomProps (params) {
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
			label = this.value = params.label;

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

	inputDialog('atom_properties', Object.assign({}, params, {
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

function rgroupLogic (params) {
	inputDialog('rlogic_table', Object.assign({}, params, {
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

function sgroup(params) {
	if (sgroupSpecialDialog.match(params))
		return sgroupSpecialDialog(params);
	return sgroupDialog(params);
};

module.exports = {
	periodTable: periodTable,
	rgroup: rgroup,
	genericGroups: genericGroups,
	about: about,
	attachmentPoints: attachmentPoints,
	atomProps: atomProps,
	bondProps: bondProps,
	automap: automap,
	rgroupLogic: rgroupLogic,
	sgroup: sgroup,
	open: openDialog,
	save: saveDialog,
	templates: templatesDialog
};
