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

import molfile from '../../../chem/molfile';
import smiles from '../../../chem/smiles';

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
	smiles: {
		name: 'Daylight SMILES',
		mime: 'chemical/x-daylight-smiles',
		ext: ['.smi', '.smiles']
	},
	'smiles-ext': {
		name: 'Extended SMILES',
		mime: 'chemical/x-chemaxon-cxsmiles',
		ext: ['.cxsmi', '.cxsmiles']
	},
	smarts: {
		name: 'Daylight SMARTS',
		mime: 'chemical/x-daylight-smarts',
		ext: ['.smarts']
	},
	inchi: {
		name: 'InChI',
		mime: 'chemical/x-inchi',
		ext: ['.inchi']
	},
	'inchi-aux': {
		name: 'InChI AuxInfo',
		mime: 'chemical/x-inchi-aux',
		ext: ['.inchi']
	},
	cml: {
		name: 'CML',
		mime: 'chemical/x-cml',
		ext: ['.cml', '.mrv'],
		supportsCoords: true
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
		} else if (format === 'smiles') {
			resolve(smiles.stringify(struct));
		} else {
			const converting = server
				.then(() => server.convert({
					struct: moldata,
					output_format: map[format].mime
				}, serverOpts))
				.catch((err) => {
					throw (err.message === 'Server is not compatible') ?
						Error(`${map[format].name} is not supported in standalone mode.`) :
						Error(`Convert error!\n${err.message}`);
				})
				.then(res => res.struct);
			resolve(converting);
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
			const withCoords = map[format].supportsCoords;
			const converting = server
				.then(() => (
					withCoords ? server.convert({
						struct: structStr,
						output_format: map['mol'].mime
					}, serverOpts) : server.layout({
						struct: structStr.trim(),
						output_format: map['mol'].mime
					}, serverOpts)
				))
				.catch((err) => {
					if (err.message === 'Server is not compatible') {
						const formatError = (format === 'smiles') ?
							`${map['smiles-ext'].name} and opening of ${map['smiles'].name}` :
							map[format].name;
						throw Error(`${formatError} is not supported in standalone mode.`);
					} else {
						throw Error(`Convert error!\n${err.message}`);
					}
				})
				.then((res) => {
					const struct = molfile.parse(res.struct);
					if (!withCoords) struct.rescale();
					return struct;
				});
			resolve(converting);
		}
	});
}

export function couldBeSaved(struct, format) {
	if (format === 'inchi' || format === 'smiles') {
		if (struct.rgroups.size !== 0)
			return `In ${map[format].name} the structure will be saved without R-group fragments`;
		struct = struct.clone(); // need this: .getScaffold()
		const isRg = struct.atoms
			.find((ind, atom) => atom.label === 'R#');
		if (isRg !== null) return `In ${map[format].name} the structure will be saved without R-group members`;

		const isSg = struct.sgroups
			.find((ind, sg) => (sg.type !== 'MUL' && !/^INDIGO_.+_DESC$/i.test(sg.data.fieldName)));
		if (isSg !== null) return `In ${map[format].name} the structure will be saved without S-groups`;
	}
	return null;
}
