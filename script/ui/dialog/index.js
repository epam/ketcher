import Open from './open';
import Save from './save';
import templatesDialog, { init as templateInit } from './template-lib';
import rgroupDialog from './rgroup';
import miewDialog from './miew';
import About from './about';
import Attach from './attach';
import Analyse from './analyse';
import Help from './help';
import PeriodTable from './period-table';
import Recognize from './recognize';

// schemify dialogs
import Atom from './atom';

import AttachPoints from './template-attach';
import Automap from './automap';
import Bond from './bond';
import Check from './check';
import LabelEdit from './labeledit';
import RgroupLogic from './rgroup-logic';
import Settings from './options';
import Sgroup from './sgroup';
import SgroupSpecial from './sdata';

templatesDialog.init = templateInit;

export default {
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
