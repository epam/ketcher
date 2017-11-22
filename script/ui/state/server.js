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

import molfile from '../../chem/molfile';

import { setStruct, appUpdate } from './options';
import { checkErrors } from './form';
import { load } from './';

export function checkServer() {
	return (dispatch, getState) => {
		const server = getState().server;

		server.then(
			res => dispatch(appUpdate({
				indigoVersion: res.indigoVersion,
				server: true
			})),
			err => alert(err)
		);
	};
}

export function recognize(file) {
	return (dispatch, getState) => {
		const rec = getState().server.recognize;

		let process = rec(file).then((res) => {
			dispatch(setStruct(res.struct));
		}, () => {
			dispatch(setStruct(null));
			setTimeout(() => alert('Error! The picture isn\'t recognized.'), 200); // TODO: remove me...
		});
		dispatch(setStruct(process));
	};
}

export function check(optsTypes) {
	return (dispatch, getState) => {
		const { editor, server } = getState();
		const options = getState().options.getServerSettings();
		options.data = { 'types': optsTypes };

		serverCall(editor, server, 'check', options)
			.then(res => dispatch(checkErrors(res)))
			.catch(console.error);
	};
}

export function automap(res) {
	return serverTransform('automap', res);
}

export function analyse() {
	return (dispatch, getState) => {
		const { editor, server } = getState();
		const options = getState().options.getServerSettings();
		options.data = {
			properties: ['molecular-weight', 'most-abundant-mass',
				'monoisotopic-mass', 'gross', 'mass-composition']
		};

		serverCall(editor, server, 'calculate', options).then((values) => {
			dispatch({
				type: 'CHANGE_ANALYSE',
				data: { values }
			});
		});
	};
}

export function serverTransform(method, data, struct) {
	return (dispatch, getState) => {
		const state = getState();
		let opts = state.options.getServerSettings();
		opts.data = data;

		serverCall(state.editor, state.server, method, opts, struct).then((res) => {
			dispatch(load(res.struct, { rescale: method === 'layout' }));
		});
	};
}

export function serverCall(editor, server, method, options, struct) {
	const selection = editor.selection();
	let selectedAtoms = [];

	if (selection)
		selectedAtoms = selection.atoms ? selection.atoms : editor.explicitSelected().atoms;

	if (!struct) {
		const aidMap = {};
		struct = editor.struct().clone(null, null, false, aidMap);
		const reindexMap = getReindexMap(struct.getComponents());

		selectedAtoms = selectedAtoms.map(aid => reindexMap[aidMap[aid]]);
	}

	let request = server.then(() => server[method](Object.assign({
			struct: molfile.stringify(struct, { ignoreErrors: true })
		}, selectedAtoms && selectedAtoms.length > 0 ? {
			selected: selectedAtoms
		} : null, options.data), omit('data', options)));
	//utils.loading('show');
	request.catch(() => {
		// alert(err);
	}).then(() => {
		//utils.loading('hide');
	});
	return request;
}

function getReindexMap(components) {
	return flatten(components.reactants)
		.concat(flatten(components.products))
		.reduce((acc, item, index) => {
			acc[item] = index;
			return acc;
		}, {});
}

/**
 * Flats passed object
 * Ex: [ [1, 2], [3, [4, 5] ] ] -> [1, 2, 3, 4, 5]
 *     { a: 1, b: { c: 2, d: 3 } } -> [1, 2, 3]
 * @param source { object }
 */
function flatten(source) {
	if (typeof source !== 'object')
		return source;

	return Object.keys(source).reduce((acc, key) => {
		const item = source[key];
		return acc.concat(flatten(item));
	}, []);
}
