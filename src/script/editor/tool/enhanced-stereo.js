import { fromStereoAtomMark } from '../actions/atom';

function EnhancedStereoTool(editor) {
	if (!(this instanceof EnhancedStereoTool)) {
		const selection = editor.selection();
		if (!selection) return null;

		const aid = editor.selection().atoms[0];

		const struct = editor.struct();
		const frid = struct.atoms.get(aid).fragment;

		const stereoCollection = struct.frags.get(frid).getStereoCollections();
		const atomStereo = struct.frags.get(frid).getStereoAtomMark(aid);

		const res = editor.event.enhancedStereoEdit.dispatch({
			stereoParity: struct.atoms.get(aid).stereoParity,
			stereoCollection,
			atomStereo
		});

		Promise.resolve(res).then((data) => {
			console.log('EnhancedStereoTool got it:', data);
			const stereoMark = data.newMark;

			const action = fromStereoAtomMark(aid, stereoMark).perform(editor.render.ctab);
			editor.update(action);
		});
	}
}

export default EnhancedStereoTool;
