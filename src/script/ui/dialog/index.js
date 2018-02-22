/****************************************************************************
 * Copyright 2018 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import Open from './mainmenu/open';
import Analyse from './mainmenu/analyse';
import Recognize from './mainmenu/recognize';
import PeriodTable from './elements/period-table';
import Rgroup from './toolbox/rgroup';
import TemplateAttach from './template/template-attach';
import TemplatesLib from './template/template-lib';
import About from './mainmenu/about';
import Help from './mainmenu/help';
import Miew from './mainmenu/miew';

// schemify dialogs
import Atom from './toolbox/atom';
import AttachPoints from './toolbox/attach';
import Automap from './toolbox/automap';
import Bond from './toolbox/bond';
import Check from './mainmenu/check';
import LabelEdit from './toolbox/labeledit';
import RgroupLogic from './toolbox/rgroup-logic';
import Save from './mainmenu/save';
import Settings from './mainmenu/options';
import Sgroup from './toolbox/sgroup';
import Sdata from './toolbox/sdata';

export default {
	open: Open,
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
	save: Save,
	settings: Settings,
	sgroup: Sgroup,
	sdata: Sdata
};
