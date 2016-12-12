import molfile from '../chem/molfile';

export const map = {
	'mol': {
		name: 'MDL Molfile',
		mime: 'chemical/x-mdl-molfile',
		ext: ['.mol'],
		supportsCoords: true
	},
	'rxn': {
		name: 'MDL Rxnfile',
		mime:'chemical/x-mdl-rxnfile',
		ext: ['.rxn'],
		supportsCoords: true
	},
	'smiles': {
		name: 'Daylight SMILES',
		mime: 'chemical/x-daylight-smiles',
		ext: ['.smi', '.smiles']
	},
	'smarts': {
		name: 'Daylight SMARTS',
		mime: 'chemical/x-daylight-smarts',
		ext: ['.smarts']
	},
	'cml': {
		name: 'CML',
		mime: 'chemical/x-cml',
		ext: ['.cml', '.mrv'],
		supportsCoords: true
	},
	'inchi': {
		name: 'InChI String',
		mime: 'chemical/x-inchi',
		ext: ['.inchi']
	}
};

export function guess (structStr, strict) {
	// Mimic Indigo/molecule_auto_loader.cpp as much as possible
	var molStr = structStr.trim();
	if (molStr.indexOf('$RXN') != -1)
		return 'rxn';
	var molMatch = molStr.match(/^(M  END|\$END MOL)$/m);
	if (molMatch) {
		var end = molMatch.index + molMatch[0].length;
		if (end == molStr.length ||
			molStr.slice(end, end + 20).search(/^\$(MOL|END CTAB)$/m) != -1)
			return 'mol';
	}
	if (molStr[0] == '<' && molStr.indexOf('<molecule') != -1)
		return 'cml';
	if (molStr.slice(0, 5) == 'InChI')
		return 'inchi';
	if (molStr.indexOf('\n') == -1) // TODO: smiles regexp
		return 'smiles';
	// Molfile by default as Indigo does
	return strict ? null : 'mol';
};

export function toString (struct, format, server) {
	console.assert(map[format], 'No such format');

	return new Promise((resolve, reject) => {
		var moldata = molfile.stringify(struct);
		if (format == 'mol' || format == 'rxn')
			resolve(moldata);
		else
			resolve(server.then(() => (
				server.convert({
					struct: moldata,
					output_format: map[format].mime
				})
			), () => {
				throw Error(map[format].name + ' is not supported in the standalone mode');
			}).then(res => res.struct));
	});
};

export function fromString (structStr, opts, server) {
	return new Promise(function (resolve, reject) {
		var format = guess(structStr);
		console.assert(map[format], 'No such format');

		if (format == 'mol' || format == 'rxn') {
			var struct = molfile.parse(structStr, opts);
			resolve(struct);
		} else {
			let withCoords = map[format].supportsCoords;
			resolve(server.then(() => (
				withCoords ? server.convert({
					struct: structStr,
					output_format: map['mol'].mime
				}) : server.layout({
					struct: structStr.trim(),
					output_format: map['mol'].mime
				})
			), () => {
				throw Error(map[format].name + ' is not supported in the standalone mode');
			}).then(res => {
				let struct = molfile.parse(res.struct);
				if (!withCoords)
					struct.rescale();
				return struct;
			}));
		}
	});
};

// Pretty stupid Inchi check (extract from save)
export function couldBeSaved(struct, format) {
	if (format == 'inchi') {
		if (struct.rgroups.count() !== 0)
			throw 'R-group fragments are not supported and will be discarded';
		struct = struct.clone(); // need this: .getScaffold()
		struct.sgroups.each((sgid, sg) => {
			// ? Not sure we should check it client side
			if (sg.type != 'MUL' && !/^INDIGO_.+_DESC$/i.test(sg.data.fieldName))
				throw Error('InChi data format doesn\'t support s-groups');
		});
	}
};
