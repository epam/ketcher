var modal = require('./render-modal').default;

var openDialog = require('./open').default;
var saveDialog = require('./save').default;
var templatesDialog = require('./template-lib');
var rgroupDialog = require('./rgroup').default;
var miewDialog = require('./miew').default;

var About = require('./about').default;
var Attach = require('./attach').default;
var Analyse = require('./analyse').default;
var Help = require('./help').default;
var PeriodTable = require('./period-table').default;
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
var SgroupSpecial = require('./sgroup-special').default;

templatesDialog.default.init = templatesDialog.init;

module.exports = {
	periodTable: modal(PeriodTable),
	rgroup: rgroupDialog,
	attachmentPoints: modal(AttachPoints),
	atomProps: modal(Atom),
	bondProps: modal(Bond),
	automap: modal(Automap),
	rgroupLogic: modal(RgroupLogic),
	sgroup: modal(Sgroup),
	sgroupSpecial: modal(SgroupSpecial),
	open: openDialog,
	save: saveDialog,
	templates: templatesDialog.default,
	labelEdit: modal(LabelEdit),
	about: modal(About),
	recognize: modal(Recognize),
	check: modal(Check),
	analyse: modal(Analyse),
	settings: Settings,
	help: modal(Help),
	miew: miewDialog,
	attach: modal(Attach)
};
