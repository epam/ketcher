import { pick, omit } from 'lodash/fp';
import molfile from '../../chem/molfile';

export function serverCall(editor, server, method, options, struct) {
	if (!struct) {
		var aidMap = {};
		struct = editor.struct().clone(null, null, false, aidMap);
		var selectedAtoms = editor.explicitSelected().atoms || [];
		selectedAtoms = selectedAtoms.map(function (aid) {
			return aidMap[aid];
		});
	}

	var request = server.then(function () {
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

export function serverTransform(editor, server, method, options, struct) {
	let opts = options.getServerSettings();
	opts.data = options.data;
	return serverCall(editor, server, method, opts, struct).then(function (res) {
		return load(res.struct, {        // Let it be an exception
			rescale: method === 'layout' // for now as layout does not
		});                              // preserve bond lengths
	});
}

export default {
	"layout": {
		shortcut: "Mod+l",
		title: "Layout",
		action: (editor, server, options) => {
			serverTransform(editor, server, 'layout', options);
		}
	},
	"clean": {
		shortcut: "Mod+Shift+l",
		title: "Clean Up",
		action: (editor, server, options) => {
			serverTransform(editor, server, 'clean', options);
		}
	},
	"arom": {
		title: "Aromatize",
		action: (editor, server, options) => {
			serverTransform(editor, server, 'aromatize', options);
		}
	},
	"dearom": {
		title: "Dearomatize",
		action: (editor, server, options) => {
			serverTransform(editor, server, 'dearomatize', options);
		}
	},
	"cip": {
		shortcut: "Mod+p",
		title: "Calculate CIP",
		action: (editor, server, options) => {
			serverTransform(editor, server, 'calculateCip', options);
		}
	}
};
