/****************************************************************************
 * Copyright 2017 EPAM Systems
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
import Sdata from './sdata';

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
	sdata: Sdata
};
