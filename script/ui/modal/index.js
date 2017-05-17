var modal = require('./render-modal').default;

var Open = require('./open').default;
var Save = require('./save').default;
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
	about: About,
	analyse: Analyse,
	cip: Check,
	help: Help,
	'period-table': PeriodTable,
	recognize: Recognize,
	settings: Settings,
	open: Open,
	save: Save,

	rgroup: rgroupDialog,
	attachmentPoints: modal(AttachPoints),
	atomProps: modal(Atom),
	bondProps: modal(Bond),
	automap: modal(Automap),
	rgroupLogic: modal(RgroupLogic),
	sgroup: modal(Sgroup),
	sgroupSpecial: modal(SgroupSpecial),
	templates: templatesDialog.default,
	labelEdit: modal(LabelEdit),
	miew: miewDialog,
	attach: modal(Attach)
};
