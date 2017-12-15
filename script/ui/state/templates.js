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

import { omit } from 'lodash/fp';
import sdf from '../../chem/sdf';
import molfile from '../../chem/molfile';
import { appUpdate } from './options';
import { openDialog } from './';
import { storage } from '../utils';

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

					openDialog(dispatch, 'templates');
				}, () => {
					openDialog(dispatch, 'templates');
				}
			);
	};
}

/* SAVE */
export function saveUserTmpl(structStr) {
	// TODO: structStr can be not in mol format => structformat.toString ...
	const tmpl = { struct: molfile.parse(structStr), props: {} };

	return (dispatch, getState) => {
		openDialog(dispatch, 'attach', { tmpl }).then(
			({ name, attach }) => {
				tmpl.struct.name = name;
				tmpl.props = { ...attach, group: 'User Templates' };

				const lib = getState().templates.lib.concat(tmpl);
				dispatch(initLib(lib));
				updateLocalStore(lib);
			}
		);
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
export const initTmplState = {
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

export function templatesReducer(state = initTmplState, action) {
	if (tmplActions.includes(action.type))
		return Object.assign({}, state, action.data);

	if (attachActions.includes(action.type)) {
		const attach = Object.assign({}, state.attach, action.data);
		return { ...state, attach };
	}

	return state;
}

/* INIT TEMPLATES LIBRARY */
function initLib(lib) {
	return {
		type: 'TMPL_INIT',
		data: { lib }
	};
}

export function initTmplLib(dispatch, baseUrl, cacheEl) {
	prefetchStatic(baseUrl + 'library.sdf').then((text) => {
		const tmpls = sdf.parse(text);
		const prefetch = prefetchRender(tmpls, baseUrl, cacheEl);

		return prefetch.then(cachedFiles => (
			tmpls.map((tmpl) => {
				const pr = prefetchSplit(tmpl);
				if (pr.file)
					tmpl.props.prerender = cachedFiles.indexOf(pr.file) !== -1 ? `#${pr.id}` : '';

				return tmpl;
			})
		));
	}).then((res) => {
		const lib = res.concat(userTmpls());
		dispatch(initLib(lib));
		dispatch(appUpdate({ templates: true }));
	});
}

function userTmpls() {
	const userLib = storage.getItem('ketcher-tmpls');
	if (!Array.isArray(userLib) || userLib.length === 0) return [];

	return userLib
		.map((tmpl) => {
			try {
				if (tmpl.props === '') tmpl.props = {};
				tmpl.props.group = 'User Templates';

				return {
					struct: molfile.parse(tmpl.struct),
					props: tmpl.props
				};
			} catch (ex) {
				return null;
			}
		})
		.filter(tmpl => tmpl !== null);
}

function prefetchStatic(url) {
	return fetch(url, { credentials: 'same-origin' }).then((resp) => {
		if (resp.ok)
			return resp.text();
		throw Error('Could not fetch ' + url);
	});
}

function prefetchSplit(tmpl) {
	const pr = tmpl.props.prerender;
	const res = pr && pr.split('#', 2);

	return {
		file: pr && res[0],
		id: pr && res[1]
	};
}

function prefetchRender(tmpls, baseUrl, cacheEl) {
	const files = tmpls.reduce((res, tmpl) => {
		const file = prefetchSplit(tmpl).file;

		if (file && res.indexOf(file) === -1)
			res.push(file);

		return res;
	}, []);

	const fetch = Promise.all(files.map(fn => (
		prefetchStatic(baseUrl + fn).catch(() => null)
	)));

	return fetch.then((svgs) => {
		svgs.forEach((svgContent) => {
			if (svgContent)
				cacheEl.innerHTML += svgContent;
		});

		return files.filter((file, i) => (
			!!svgs[i]
		));
	});
}
