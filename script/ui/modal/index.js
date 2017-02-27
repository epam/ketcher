var element = require('../../chem/element');

var inputDialog = require('./input');

var sgroupDialog = require('./sgroup');
var sgroupSpecialDialog = require('./sgroup-special');

var openDialog = require('./open').default;
var saveDialog = require('./save').default;
var labelEdit = require('./labeledit').default;
var periodTable = require('./period-table').default;
var genericGroups = require('./generic-groups').default;
var templatesDialog = require('./template-lib');
var rgroupDialog = require('./rgroup').default;
var aboutDialog = require('./about').default;
var recognizeDialog = require('./recognize').default;
var checkDialog = require('./check').default;
var analyseDialog = require('./analyse').default;
var settingsDialog = require('./settings').default;
var helpDialog = require('./help').default;
var miewDialog = require('./miew').default;
var attachDialog = require('./attach').default;

var bondDialog = require('./bond').default;

function attachmentPoints (params) {
	inputDialog('attachmentPoints', Object.assign({
		onOk: function (res) { params.onOk({ap: res}); }
	}, params.ap));
};

function automap (params) {
	inputDialog('automap', params);
};

function atomProps (params) {
	var dlg = inputDialog('atomProps', Object.assign({}, params, {
		onOk: function (res) { res.label = atomChange(res.label); stopHandlers(); params.onOk(res); },
		onCancel: function (res) { stopHandlers(); }
	}));
	var numberInput = dlg.select('.number')[0];
	var handlers = [];

	function atomChange(val) {
		var change = (this == val.target);
		var label = !change ? val : this.value.trim()[0].toUpperCase()+this.value.trim().slice(1).toLowerCase();
		if (change)
			this.value = label;
		var elem = element.map[label];
		if (elem == null && label !== 'A' &&
		    label !== '*' && label !== 'Q' &&
		    label !== 'X' && label !== 'R') { // generics ?

			console.warn('Incorrect input params label:', label);
			label = this.value = params.label;

			if (label !== 'A' && label !== '*') {
				elem = element.map[label];
			}
		}

		if (label == 'A' || label == '*') {
			numberInput.value = 'any';
		} else if (!elem) {
			numberInput.value = '';
		} else {
			numberInput.value = elem.toString();
		}
		return label;
	}
	function stopHandlers() {
		handlers.forEach(function (h) { h.stop(); });
	}

	handlers[0] = $(dlg.charge).on('change', function () {
		if (this.value.trim() === '' || this.value == '0') {
			this.value = '';
		} else if (this.value.match(/^[1-9][0-9]{0,1}[-+]$/)) {
			this.value = (this.value.endsWith('-') ? '-' : '') + this.value.substr(0, this.value.length - 1);
		} else if (!this.value.match(/^[+-]?[1-9][0-9]{0,1}$/)) {
			this.value = params.charge;
		}
	});
	handlers[1] = $(dlg.isotope).on('change', function () {
		if (this.value == numberInput.value || this.value.trim() == '' || this.value == '0') {
			this.value = '';
		} else if (!this.value.match(/^[1-9][0-9]{0,2}$/)) {
			this.value = params.isotope;
		}
	});
	handlers[2] = $(dlg.label).on('change', atomChange);
	atomChange(params.label);
};

function rgroupLogic (params) {
	var dlg = inputDialog('rgroupLogic', Object.assign({}, params, {
		range: params.range || '>0',  // structConv
		onOk: function (res) {
			params.onOk({
				range: rangeConv(res.range),
				resth: res.resth == 1,
				ifthen: parseInt(res.ifthen, 10)
			});
		}
	}));
	function rangeConv(range) { // structConv
		var res = range.replace(/\s*/g, '').replace(/,+/g, ',')
		    .replace(/^,/, '').replace(/,$/, '');
		var isValid = res.split(',').all(function (s) {
			return s.match(/^[>,<,=]?[0-9]+$/g) ||
				   s.match(/^[0-9]+\-[0-9]+$/g);
		});
		if (!isValid)
			throw 'Bad occurrence value';
		return res;
	}
	var ifOpts = params.rgroupLabels.reduce(function (res, label) {
		if (params.label == label)
			return res;
		return res + '<option value="' + label + '">' +
			'IF R' + params.label + ' THEN R' + label + '</option>';
	}, '<option value="0">Always</option>');

	$(dlg.ifthen).update(ifOpts);
	dlg.ifthen.value = params.ifthen;
};

function sgroup(params) {
	if (sgroupSpecialDialog.match(params))
		return sgroupSpecialDialog(params);
	return sgroupDialog(params);
};

templatesDialog.default.init = templatesDialog.init;

module.exports = {
	periodTable: periodTable,
	rgroup: rgroupDialog,
	genericGroups: genericGroups,
	attachmentPoints: attachmentPoints,
	atomProps: atomProps,
	bondProps: bondDialog,
	automap: automap,
	rgroupLogic: rgroupLogic,
	sgroup: sgroup,
	open: openDialog,
	save: saveDialog,
	templates: templatesDialog.default,
	labelEdit: labelEdit,
	about: aboutDialog,
	recognize: recognizeDialog,
	check: checkDialog,
	analyse: analyseDialog,
	settings: settingsDialog,
	help: helpDialog,
	miew: miewDialog,
	attach: attachDialog
};
