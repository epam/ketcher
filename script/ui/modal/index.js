var element = require('../../chem/element');

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
var rgroupLogic = require('./rgroup-logic').default;

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
