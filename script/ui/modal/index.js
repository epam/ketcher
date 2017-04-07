var modal = require('./render-modal').default;
var sgroupSpecialDialog = require('./sgroup-special').sgroupSpecialDialog;

var openDialog = require('./open').default;
var saveDialog = require('./save').default;
var labelEdit = require('./labeledit').default;
var periodTable = require('./period-table').default;
var genericGroups = require('./generic-groups').default;
var templatesDialog = require('./template-lib');
var rgroupDialog = require('./rgroup').default;
var aboutDialog = require('./about').default;
var recognizeDialog = require('./recognize').default;
var analyseDialog = require('./analyse').default;
var helpDialog = require('./help').default;
var miewDialog = require('./miew').default;
var attachDialog = require('./attach').default;

// schemify dialogs
var Bond = require('./bond').default;
var Atom = require('./atom').default;
var AttachPoints = require('./attach-points').default;
var Automap = require('./automap').default;
var RgroupLogic = require('./rgroup-logic').default;
var Sgroup = require('./sgroup').default;
var Check = require('./check').default;
var Settings = require('./settings').default;

templatesDialog.default.init = templatesDialog.init;

module.exports = {
	periodTable: periodTable,
	rgroup: rgroupDialog,
	genericGroups: genericGroups,
	attachmentPoints: modal(AttachPoints),
	atomProps: modal(Atom),
	bondProps: modal(Bond),
	automap: modal(Automap),
	rgroupLogic: modal(RgroupLogic),
	sgroup: modal(Sgroup),
	sgroupSpecial: sgroupSpecialDialog,
	open: openDialog,
	save: saveDialog,
	templates: templatesDialog.default,
	labelEdit: labelEdit,
	about: aboutDialog,
	recognize: recognizeDialog,
	check: modal(Check),
	analyse: analyseDialog,
	settings: modal(Settings),
	help: helpDialog,
	miew: miewDialog,
	attach: attachDialog
};
