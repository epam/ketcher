var { sgroupSpecialDialog } = require('./sgroup-special');

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
var settingsDialog = require('./settings2').default;
var helpDialog = require('./help').default;
var miewDialog = require('./miew').default;
var attachDialog = require('./attach').default;

// schemify dialogs
var bondDialog = require('./bond').default;
var atomDialog = require('./atom').default;
var attachmentPointsDialog = require('./attach-points').default;
var automapDialog = require('./automap').default;
var rgroupLogicDialog = require('./rgroup-logic').default;
var sgroupDialog = require('./sgroup').default;

templatesDialog.default.init = templatesDialog.init;

module.exports = {
	periodTable: periodTable,
	rgroup: rgroupDialog,
	genericGroups: genericGroups,
	attachmentPoints: attachmentPointsDialog,
	atomProps: atomDialog,
	bondProps: bondDialog,
	automap: automapDialog,
	rgroupLogic: rgroupLogicDialog,
	sgroup: sgroupDialog,
	sgroupSpecial: sgroupSpecialDialog,
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
