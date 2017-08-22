import { pick, omit } from 'lodash/fp';

import molfile from '../../chem/molfile';

import { setStruct, appUpdate } from './options';
import { checkErrors } from './form';
import { load } from './';

function serverCall(editor, server, method, options, struct) {
	if (!struct) {
		var aidMap = {};
		struct = editor.struct().clone(null, null, false, aidMap);
		var selectedAtoms = editor.explicitSelected().atoms || [];
		selectedAtoms = selectedAtoms.map(function (aid) {
			return aidMap[aid];
		});
	}

	let request = server.then(function () {
		return server[method](Object.assign({
			struct: molfile.stringify(struct, { ignoreErrors: true })
		}, selectedAtoms && selectedAtoms.length > 0 ? {
			selected: selectedAtoms
		} : null, options.data), omit('data', options));
	});
	//utils.loading('show');
	request.catch(function (err) {
		alert(err);
	}).then(function (er) {
		//utils.loading('hide');
	});
	return request;
}

export function serverTransform(method, data, struct) {
	return (dispatch, getState) => {
		const state = getState();
		let opts = state.options.getServerSettings();
		opts.data = data;

		serverCall(state.editor, state.server, method, opts, struct).then(function (res) {
			dispatch( load(res.struct, { rescale: method === 'layout' }) );
		});
	};
}

export function checkServer() {
	return (dispatch, getState) => {
		const server = getState().server;

		server.then(
			(res) => dispatch(appUpdate({
				indigoVersion: res.indigoVersion,
				server: true
			})),
			(err) => alert(err)
		);
	}
}

export function recognize(file) {
	return (dispatch, getState) => {
		const recognize = getState().server.recognize;

		let process = recognize(file).then(res => {
			dispatch(setStruct(res.struct));
		}, err => {
			dispatch(setStruct(null));
			setTimeout(() => alert("Error! The picture isn't recognized."), 200); // TODO: remove me...
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
	}
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

		serverCall(editor, server, 'calculate', options).then(function (values) {
			dispatch({
				type: 'CHANGE_ANALYSE',
				data: { values }
			});
		});
	}
}
