var modal = require('./render-modal').default;
var sgroupSpecialDialog = require('./sgroup-special').sgroupSpecialDialog;

var openDialog = require('./open').default;
var saveDialog = require('./save').default;
var periodTable = require('./period-table').default;
var genericGroups = require('./generic-groups').default;
var templatesDialog = require('./template-lib');
var rgroupDialog = require('./rgroup').default;
var miewDialog = require('./miew').default;
var attachDialog = require('./attach').default;

var About = require('./about').default;
var Analyse = require('./analyse').default;
var Help = require('./help').default;
var Recognize = require('./recognize').default;

// schemify dialogs
var Atom = require('./atom').default;
var AttachPoints = require('./attach-points').default;
var Automap = require('./automap').default;
var Bond = require('./bond').default;
var Check = require('./check').default;
var LabelEdit = require('./labeledit').default;
var RgroupLogic = require('./rgroup-logic').default;
var Settings = require('./settings').default;
var Sgroup = require('./sgroup').default;

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
	labelEdit: modal(LabelEdit),
	about: modal(About),
	recognize: modal(Recognize),
	check: modal(Check),
	analyse: modal(Analyse),
	settings: modal(Settings),
	help: modal(Help),
	miew: miewDialog,
	attach: attachDialog
};
