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

import { omit } from 'lodash/fp';
import molfile from '../../../chem/molfile';
import { storage } from '../../storage-ext';

import { openDialog } from '../modal';
import initTmplLib, { initLib } from './init-lib';

export { initTmplLib };

/* TEMPLATES */
export function selectTmpl(tmpl) {
	return {
		type: 'TMPL_SELECT',
		data: { selected: tmpl }
	};
}

export function changeGroup(group) {
	return {
		type: 'TMPL_CHANGE_GROUP',
		data: { group, selected: null }
	};
}

export function changeFilter(filter) {
	return {
		type: 'TMPL_CHANGE_FILTER',
		data: { filter: filter.trim(), selected: null } // TODO: change this
	};
}

/* TEMPLATE-ATTACH-EDIT */
export function initAttach(name, attach) {
	return {
		type: 'INIT_ATTACH',
		data: {
			name,
			atomid: attach.atomid,
			bondid: attach.bondid
		}
	};
}

export function setAttachPoints(attach) {
	return {
		type: 'SET_ATTACH_POINTS',
		data: {
			atomid: attach.atomid,
			bondid: attach.bondid
		}
	};
}

export function setTmplName(name) {
	return {
		type: 'SET_TMPL_NAME',
		data: { name }
	};
}

export function editTmpl(tmpl) {
	return (dispatch, getState) => {
		openDialog(dispatch, 'attach', { tmpl })
			.then(
				({ name, attach }) => {
					tmpl.struct.name = name;
					tmpl.props = Object.assign({}, tmpl.props, attach);

					if (tmpl.props.group === 'User Templates')
						updateLocalStore(getState().templates.lib);
				},
				() => null
			)
			.then(() => openDialog(dispatch, 'templates').catch(() => null));
	};
}

/* SAVE */
export function saveUserTmpl(struct) {
	// TODO: structStr can be not in mol format => structformat.toString ...
	const tmpl = { struct: struct.clone(), props: {} };

	return (dispatch, getState) => {
		openDialog(dispatch, 'attach', { tmpl })
			.then(
				({ name, attach }) => {
					tmpl.struct.name = name;
					tmpl.props = { ...attach, group: 'User Templates' };

					const lib = getState().templates.lib.concat(tmpl);
					dispatch(initLib(lib));
					updateLocalStore(lib);
				}
			)
			.catch(() => null);
	};
}

function updateLocalStore(lib) {
	const userLib = lib
		.filter(item => item.props.group === 'User Templates')
		.map(item => ({
			struct: molfile.stringify(item.struct),
			props: Object.assign({}, omit(['group'], item.props))
		}));

	storage.setItem('ketcher-tmpls', userLib);
}

/* REDUCER */
export const initTmplsState = {
	lib: [],
	selected: null,
	filter: '',
	group: null,
	attach: {}
};

const tmplActions = [
	'TMPL_INIT',
	'TMPL_SELECT',
	'TMPL_CHANGE_GROUP',
	'TMPL_CHANGE_FILTER'
];

const attachActions = [
	'INIT_ATTACH',
	'SET_ATTACH_POINTS',
	'SET_TMPL_NAME'
];

function templatesReducer(state = initTmplsState, action) {
	if (tmplActions.includes(action.type))
		return Object.assign({}, state, action.data);

	if (attachActions.includes(action.type)) {
		const attach = Object.assign({}, state.attach, action.data);
		return { ...state, attach };
	}

	return state;
}

export default templatesReducer;
