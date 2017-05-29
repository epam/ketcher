import molfile from '../../chem/molfile';

function serverCall(editor, server, method, options, struct) {
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
		} : null, options));
	});
	//utils.loading('show');
	request.catch(function (err) {
		alert(err);
	}).then(function (er) {
		//utils.loading('hide');
	});
	return request;
}

function serverTransform(method, options, struct) {
	return serverCall(method, options, struct).then(function (res) {
		return load(res.struct, {       // Let it be an exception
			rescale: method == 'layout' // for now as layout does not
		});                             // preserve bond lengths
	});
}

export default {
	"layout": {
		shortcut: "Mod+l",
		title: "Layout"
	},
	"clean": {
		shortcut: "Mod+Shift+l",
		title: "Clean Up"
	},
	"arom": {
		title: "Aromatize"
	},
	"dearom": {
		title: "Dearomatize"
	},
	"cip": {
		shortcut: "Mod+p",
		title: "Calculate CIP"
	}
};
