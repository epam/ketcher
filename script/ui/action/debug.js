import molfile from '../../chem/molfile';

export default {
	// original: for dev purposes
	"force-update": {
		shortcut: "Ctrl+Shift+r",
		action: editor => {
			editor.update(true);
		}
	},
	"qs-serialize": {
		shortcut: "Alt+Shift+r",
		action: editor => {
			const molStr = molfile.stringify(editor.struct());
			const molQs = 'mol=' + encodeURIComponent(molStr).replace(/%20/g, '+');
			const qs = document.location.search;
			document.location.search = !qs ? '?' + molQs :
				qs.search('mol=') === -1 ? qs + '&' + molQs :
				qs.replace(/mol=[^&$]*/, molQs);
		}
	}
}
