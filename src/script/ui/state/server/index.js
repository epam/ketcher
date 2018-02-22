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

import { omit, without } from 'lodash/fp';
import Pool from '../../../util/pool';

import molfile from '../../../chem/molfile';

import { setStruct, appUpdate } from '../options';
import { checkErrors } from '../modal/form';
import { load } from '../shared';

export function checkServer() {
	return (dispatch, getState) => {
		const server = getState().server;

		server.then(
			res => dispatch(appUpdate({
				indigoVersion: res.indigoVersion,
				imagoVersions: res.imagoVersions,
				server: true
			})),
			err => console.info(err)
			// TODO: notification info
		);
	};
}

export function recognize(file, version) {
	return (dispatch, getState) => {
		const rec = getState().server.recognize;

		const process = rec(file, version).then((res) => {
			dispatch(setStruct(res.struct));
		}, () => {
			dispatch(setStruct(null));
			// TODO: remove me...
			setTimeout(() => alert('Error! The picture isn\'t recognized.'), 200); // eslint-disable-line no-undef
		});
		dispatch(setStruct(process));
	};
}

function ketcherCheck(struct, checkParams) {
	const errors = {};

	if (checkParams.includes('chiral_flag') && struct.isChiral)
		errors['chiral_flag'] = 'Chiral flag is present on the canvas';

	if (checkParams.includes('valence')) {
		let badVal = 0;
		struct.atoms.forEach(atom => atom.badConn && badVal++);
		if (badVal > 0)
			errors['valence'] = `Structure contains ${badVal} atom${badVal !== 1 ? 's' : ''} with bad valence`;
	}

	return errors;
}

export function check(optsTypes) {
	return (dispatch, getState) => {
		const { editor, server } = getState();
		const ketcherErrors = ketcherCheck(editor.struct(), optsTypes);

		const options = getState().options.getServerSettings();
		options.data = { types: without(['valence', 'chiral_flag'], optsTypes) };

		return serverCall(editor, server, 'check', options)
			.then((res) => {
				res = Object.assign(res, ketcherErrors); // merge Indigo check with Ketcher check
				dispatch(checkErrors(res));
			})
			.catch((e) => { alert(`Failed check!\n${e.message}`); throw e; }); // eslint-disable-line no-undef
		// TODO: notification
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

		return serverCall(editor, server, 'calculate', options)
			.then(values => dispatch({
				type: 'CHANGE_ANALYSE',
				data: { values }
			}))
			.catch((e) => { alert(e.message); throw e; }); // eslint-disable-line no-undef
		// TODO: notification
	};
}

export function serverTransform(method, data, struct) {
	return (dispatch, getState) => {
		const state = getState();
		const opts = state.options.getServerSettings();
		opts.data = data;

		serverCall(state.editor, state.server, method, opts, struct)
			.then(res => dispatch(load(res.struct, {
				rescale: method === 'layout',
				reactionRelayout: method === 'clean'
			})))
			.catch(e => alert(e.message)); // eslint-disable-line no-undef
		// TODO: notification
	};
}

export function serverCall(editor, server, method, options, struct) {
	const selection = editor.selection();
	let selectedAtoms = [];

	if (selection)
		selectedAtoms = selection.atoms ? selection.atoms : editor.explicitSelected().atoms;

	if (!struct) {
		const aidMap = new Map();
		struct = editor.struct().clone(null, null, false, aidMap);

		const reindexMap = getReindexMap(struct.getComponents());

		selectedAtoms = selectedAtoms.map(aid => reindexMap.get(aidMap.get(aid)));
	}

	return server.then(() =>
		server[method](Object.assign({
			struct: molfile.stringify(struct, { ignoreErrors: true })
		}, selectedAtoms && selectedAtoms.length > 0 ? {
			selected: selectedAtoms
		} : null, options.data), omit('data', options)));
}

function getReindexMap(components) {
	return components.reactants
		.concat(components.products)
		.reduce((acc, item) => {
			Array.from(item).forEach((aid) => {
				acc.add(aid);
			});

			return acc;
		}, new Pool());
}
