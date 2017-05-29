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
var AttachPoints = require('./template-attach').default;
var Automap = require('./automap').default;
var Bond = require('./bond').default;
var Check = require('./check').default;
var LabelEdit = require('./labeledit').default;
var RgroupLogic = require('./rgroup-logic').default;
var Settings = require('./options').default;
var Sgroup = require('./sgroup').default;
var SgroupSpecial = require('./sdata').default;

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
	// render-modal
	attachmentPoints: AttachPoints,
	atomProps: Atom,
	bondProps: Bond,
	automap: Automap,
	rgroupLogic: RgroupLogic,
	sgroup: Sgroup,
	sgroupSpecial: SgroupSpecial,
	templates: templatesDialog.default,
	labelEdit: LabelEdit,
	attach: Attach,
	miew: miewDialog
};
