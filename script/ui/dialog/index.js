import Open from './open';
import Save from './save';
import Analyse from './analyse';
import Recognize from './recognize';
import PeriodTable from './period-table';
import Rgroup from './rgroup';
import TemplateAttach from './template-attach';
import TemplatesLib from './template-lib';
import About from './about';
import Help from './help';
import Miew from './miew';

// schemify dialogs
import Atom from './atom';
import AttachPoints from './attach';
import Automap from './automap';
import Bond from './bond';
import Check from './check';
import LabelEdit from './labeledit';
import RgroupLogic from './rgroup-logic';
import Settings from './options';
import Sgroup from './sgroup';
import SgroupSpecial from './sdata';

export default {
	open: Open,
	save: Save,
	analyse: Analyse,
	recognize: Recognize,
	'period-table': PeriodTable,
	rgroup: Rgroup,
	attach: TemplateAttach,
	templates: TemplatesLib,
	about: About,
	help: Help,
	miew: Miew,

	atomProps: Atom,
	attachmentPoints: AttachPoints,
	automap: Automap,
	bondProps: Bond,
	check: Check,
	labelEdit: LabelEdit,
	rgroupLogic: RgroupLogic,
	settings: Settings,
	sgroup: Sgroup,
	sgroupSpecial: SgroupSpecial
};
