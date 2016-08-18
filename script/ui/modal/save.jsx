import { h, Component, render } from 'preact';
/** @jsx h */
import fs from 'filesaver.js';

import Dialog from './dialog';
import molfile from '../../chem/molfile';
import smiles from '../../chem/smiles';

var ui = global.ui;

const typeMap = {
	'mol': {
		name: 'MDL/Symyx Molfile',
		mime: 'chemical/x-mdl-molfile'
	},
	'rxn': {
		name: 'MDL/Symyx Rxnfile',
		mime:'chemical/x-mdl-rxnfile'
	},
	'smi': {
		name: 'Daylight SMILES',
		mime: 'chemical/x-daylight-smiles'
	},
	'cml': {
		name: 'CML',
		mime: 'chemical/x-cml'
	},
	'inchi': {
		name: 'InChI String',
		mime: 'chemical/x-inchi'
	}
};

class Save extends Component {
	constructor(props) {
		super(props);
		this.molStr = molfile.stringify(props.struct); // cache stub for convert
		this.state = {
			type: 'mol',
			structStr: this.molStr,
			fileSaver: null
		};
		fileSaver(props.server).then(f => {
			this.setState({
				fileSaver: f
			});
		});
	}

	changeType(ev) {
		var type = ev.target.value;
		convertMolecule(this.props.server, this.props.struct, type).then(res => {
			this.setState({
				type: type,
				structStr: res.struct
			});
		}, ui.echo);
	}

	save(ev) {
		if (this.state.fileSaver) {
			this.state.fileSaver(this.state.structStr,
								 this.state.type);
			//dlg.select('input[type=button]')[0].click();
		}
		ev.preventDefault();
	}
	render () {
	    // formatInput.select('[value=inchi]')[0].disabled = ui.standalone;
		return (
			<Dialog caption="Save Structure"
					name="save" params={this.props.params}
					buttons={[(
						<a className={!this.state.fileSaver ? "disabled save" : "save"} onClick={ev => this.save(ev)} download>Save To File…</a>
					), "Close"]}>
				<label>Format:
				<select value={this.state.type} onChange={ev => this.changeType(ev)}>{
					['mol', 'smi', 'cml', 'inchi'].map(type => (
						<option value={type}>{typeMap[type].name}</option>
					))
				}</select>
				</label>
				<textarea className={this.state.type} readonly
			              value={this.state.structStr} />
			</Dialog>
		);
	}
};

function fileSaver (/*server*/) {
	return new Promise((resolve, reject) => {
		if (global.Blob && fs.saveAs)
			resolve((data, type) => {
				if (type == 'mol' && data.indexOf('$RXN') == 0)
					type = 'rxn';
				console.assert(typeMap[type], 'Unknown chemical file type');
				var blob = new Blob([data], {type: typeMap[type] });
				fs.saveAs(blob, 'ketcher.' + type);
			});
		else if (ui.standalone)
			reject('Standalone mode!');
		else
			reject(new Error("Server doesn't support echo method"));
	});
}

function convertMolecule (server, molecule, format) {
	return new Promise((resolve, reject) => {
		var moldata = molfile.stringify(molecule);
		if (format == 'mol') {
			resolve({ struct: moldata });
		}
		else if (ui.standalone)
			// TODO: 'InChI'
			throw Error(format.capitalize() + ' is not supported in the standalone mode');
		else if (format == 'smi') {
			resolve(server.convert({ struct: moldata, output_format: 'chemical/x-daylight-smiles' }));
		}
		else if (format == 'cml') {
			resolve(server.convert({ struct: moldata, output_format: 'chemical/x-cml'}));
		}
		else if (format == 'inchi') {
			if (molecule.rgroups.count() !== 0)
				ui.echo('R-group fragments are not supported and will be discarded');
			molecule = molecule.getScaffold();
			if (molecule.atoms.count() === 0)
				resolve('');
			else {
				molecule = molecule.clone();
				molecule.sgroups.each((sgid, sg) => {
					// ? Not sure we should check it client side
					if (sg.type != 'MUL' && !/^INDIGO_.+_DESC$/i.test(sg.data.fieldName))
						throw Error('InChi data format doesn\'t support s-groups');
				});

				resolve(server.convert({ struct: moldata, output_format: 'chemical/x-inchi' }));
			}
		}
	});
}

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<Save {...params} />
	), overlay);
};
