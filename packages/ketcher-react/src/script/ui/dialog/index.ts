/****************************************************************************
 * Copyright 2021 EPAM Systems
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

import { About, Settings } from '../views/modal/components/meta';
import {
  Analyse,
  Check,
  Miew,
  Recognize,
} from '../views/modal/components/process';
// schemify dialogs
import {
  Atom,
  AttachPoints,
  Automap,
  Bond,
  RgroupLogic,
} from '../views/modal/components/toolbox';
import { Open, Save } from '../views/modal/components/document';

import EnhancedStereo from './toolbox/enhancedStereo/enhancedStereo';
import LabelEdit from './toolbox/labeledit';
import PeriodTable from '../views/modal/components/PeriodTable';
import ExtendedTable from '../views/modal/components/ExtendedTable';
import { RemoveFG } from '../views/modal/components/toolbox/FG/RemoveFG';
import Rgroup from './toolbox/rgroup/rgroup';
import SGroup from './toolbox/sgroup';
import TemplateAttach from './template/template-attach';
import TemplatesDialog from './template/TemplateDialog';
import Text from '../views/modal/components/Text';
import { Confirm } from '../views/modal/components/Confirm';
import InfoModal from '../views/modal/components/InfoModal';

export default {
  open: Open,
  analyse: Analyse,
  recognize: Recognize,
  'period-table': PeriodTable,
  'extended-table': ExtendedTable,
  rgroup: Rgroup,
  attach: TemplateAttach,
  templates: TemplatesDialog,
  about: About,
  miew: Miew,
  atomProps: Atom,
  attachmentPoints: AttachPoints,
  automap: Automap,
  bondProps: Bond,
  check: Check,
  enhancedStereo: EnhancedStereo,
  labelEdit: LabelEdit,
  rgroupLogic: RgroupLogic,
  removeFG: RemoveFG,
  save: Save,
  settings: Settings,
  sgroup: SGroup,
  text: Text,
  confirm: Confirm,
  'info-modal': InfoModal,
} as any;
