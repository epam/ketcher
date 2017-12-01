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

import molfile from '../chem/molfile';
import smiles from '../chem/smiles';

export const map = {
	mol: {
		name: 'MDL Molfile',
		mime: 'chemical/x-mdl-molfile',
		ext: ['.mol'],
		supportsCoords: true
	},
	rxn: {
		name: 'MDL Rxnfile',
		mime: 'chemical/x-mdl-rxnfile',
		ext: ['.rxn'],
		supportsCoords: true
	},
	cml: {
		name: 'CML',
		mime: 'chemical/x-cml',
		ext: ['.cml', '.mrv'],
		supportsCoords: true
	},
	smiles: {
		name: 'Daylight SMILES',
		mime: 'chemical/x-daylight-smiles',
		ext: ['.smi', '.smiles']
	},
	smarts: {
		name: 'Daylight SMARTS',
		mime: 'chemical/x-daylight-smarts',
		ext: ['.smarts']
	},
	inchi: {
		name: 'InChI String',
		mime: 'chemical/x-inchi',
		ext: ['.inchi']
	}
};

export function guess(structStr, strict) {
	// Mimic Indigo/molecule_auto_loader.cpp as much as possible
	const molStr = structStr.trim();

	if (molStr.indexOf('$RXN') !== -1)
		return 'rxn';

	const molMatch = molStr.match(/^(M {2}END|\$END MOL)$/m);

	if (molMatch) {
		const end = molMatch.index + molMatch[0].length;
		if (end === molStr.length ||
			molStr.slice(end, end + 20).search(/^\$(MOL|END CTAB)$/m) !== -1)
			return 'mol';
	}
	if (molStr[0] === '<' && molStr.indexOf('<molecule') !== -1)
		return 'cml';

	if (molStr.slice(0, 5) === 'InChI')
		return 'inchi';

	if (molStr.indexOf('\n') === -1) // TODO: smiles regexp
		return 'smiles';

	// Molfile by default as Indigo does
	return strict ? null : 'mol';
}

export function toString(struct, format, server, serverOpts) {
	console.assert(map[format], 'No such format');

	return new Promise((resolve) => {
		const moldata = molfile.stringify(struct);
		if (format === 'mol' || format === 'rxn') {
			resolve(moldata);
		} else {
			resolve(server.then(() => (
				server.convert({
					struct: moldata,
					output_format: map[format].mime
				}, serverOpts)
			), () => {
				if (format === 'smiles')
					return smiles.stringify(struct);
				throw Error(map[format].name + ' is not supported in the standalone mode');
			})
				.then(res => res.struct || res));
		}
	});
}

export function fromString(structStr, opts, server, serverOpts) {
	return new Promise((resolve) => {
		const format = guess(structStr);
		console.assert(map[format], 'No such format');

		if (format === 'mol' || format === 'rxn') {
			const struct = molfile.parse(structStr, opts);
			resolve(struct);
		} else {
			let withCoords = map[format].supportsCoords;
			resolve(server.then(() => (
				withCoords ? server.convert({
					struct: structStr,
					output_format: map['mol'].mime
				}, serverOpts) : server.layout({
					struct: structStr.trim(),
					output_format: map['mol'].mime
				}, serverOpts)
			), () => {
				throw Error(map[format].name + ' is not supported in the standalone mode');
			}).then((res) => {
				let struct = molfile.parse(res.struct);
				if (!withCoords)
					struct.rescale();
				return struct;
			}));
		}
	});
}

// Pretty stupid Inchi check (extract from save)
export function couldBeSaved(struct, format) {
	if (format === 'inchi') {
		if (struct.rgroups.size !== 0)
			throw new Error('R-group fragments are not supported and will be discarded');
		struct = struct.clone(); // need this: .getScaffold()
		struct.sgroups.forEach((sg) => {
			// ? Not sure we should check it client side
			if (sg.type !== 'MUL' && !/^INDIGO_.+_DESC$/i.test(sg.data.fieldName))
				throw Error('InChi data format doesn\'t support s-groups');
		});
	}
}
