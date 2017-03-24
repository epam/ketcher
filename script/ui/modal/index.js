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
var atomDialog = require('./atom').default;
var attachmentPointsDialog = require('./attach-points').default;
var automapDialog = require('./automap').default;

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
	attachmentPoints: attachmentPointsDialog,
	atomProps: atomDialog,
	bondProps: bondDialog,
	automap: automapDialog,
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
