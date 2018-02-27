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

import Vec2 from '../../util/vec2';

import element from './../element';
import Struct, { Atom, AtomList, Bond, RGroup, SGroup } from './../struct/index';

import sGroup from './parseSGroup';
import utils from './utils';

function parseAtomLineV3000(line) { // eslint-disable-line max-statements
	/* reader */
	var split, subsplit, key, value, i;
	split = spaceparsplit(line);
	var params = {
		pp: new Vec2(parseFloat(split[2]), -parseFloat(split[3]), parseFloat(split[4])),
		aam: split[5].trim()
	};
	var label = split[1].trim();
	if (label.charAt(0) == '"' && label.charAt(label.length - 1) == '"')
		label = label.substr(1, label.length - 2); // strip qutation marks
	if (label.charAt(label.length - 1) == ']') { // assume atom list
		label = label.substr(0, label.length - 1); // remove ']'
		var atomListParams = {};
		atomListParams.notList = false;
		if (label.substr(0, 5) == 'NOT [') {
			atomListParams.notList = true;
			label = label.substr(5); // remove 'NOT ['
		} else if (label.charAt(0) != '[') {
			throw new Error('Error: atom list expected, found \'' + label + '\'');
		} else {
			label = label.substr(1); // remove '['
		}
		atomListParams.ids = labelsListToIds(label.split(','));
		params['atomList'] = new AtomList(atomListParams);
		params['label'] = 'L#';
	} else {
		params['label'] = label;
	}
	split.splice(0, 6);
	for (i = 0; i < split.length; ++i) {
		subsplit = splitonce(split[i], '=');
		key = subsplit[0];
		value = subsplit[1];
		if (key in utils.fmtInfo.v30atomPropMap) {
			var ival = utils.parseDecimalInt(value);
			if (key == 'VAL') {
				if (ival == 0)
					continue; // eslint-disable-line no-continue
				if (ival == -1)
					ival = 0;
			}
			params[utils.fmtInfo.v30atomPropMap[key]] = ival;
		} else if (key == 'RGROUPS') {
			value = value.trim().substr(1, value.length - 2);
			var rgrsplit = value.split(' ').slice(1);
			params.rglabel = 0;
			for (var j = 0; j < rgrsplit.length; ++j)
				params.rglabel |= 1 << (rgrsplit[j] - 1);
		} else if (key == 'ATTCHPT') {
			params.attpnt = value.trim() - 0;
		}
	}

	return new Atom(params);
}

function parseBondLineV3000(line) {
	/* reader */
	var split, subsplit, key, value, i;
	split = spaceparsplit(line);
	var params = {
		begin: utils.parseDecimalInt(split[2]) - 1,
		end: utils.parseDecimalInt(split[3]) - 1,
		type: utils.fmtInfo.bondTypeMap[utils.parseDecimalInt(split[1])]
	};
	split.splice(0, 4);
	for (i = 0; i < split.length; ++i) {
		subsplit = splitonce(split[i], '=');
		key = subsplit[0];
		value = subsplit[1];
		if (key == 'CFG') {
			params.stereo = utils.fmtInfo.v30bondStereoMap[utils.parseDecimalInt(value)];
			if (params.type == Bond.PATTERN.TYPE.DOUBLE && params.stereo == Bond.PATTERN.STEREO.EITHER)
				params.stereo = Bond.PATTERN.STEREO.CIS_TRANS;
		} else if (key == 'TOPO') {
			params.topology = utils.fmtInfo.bondTopologyMap[utils.parseDecimalInt(value)];
		} else if (key == 'RXCTR') {
			params.reactingCenterStatus = utils.parseDecimalInt(value);
		} else if (key == 'STBOX') {
			params.stereoCare = utils.parseDecimalInt(value);
		}
	}
	return new Bond(params);
}

function v3000parseCollection(ctab, ctabLines, shift) {
	/* reader */
	shift++;
	while (ctabLines[shift].trim() != 'M  V30 END COLLECTION')
		shift++;
	shift++;
	return shift;
}

function v3000parseSGroup(ctab, ctabLines, sgroups, atomMap, shift) { // eslint-disable-line max-params, max-statements
	/* reader */
	var line = '';
	shift++;
	while (shift < ctabLines.length) {
		line = stripV30(ctabLines[shift++]).trim();
		if (line.trim() == 'END SGROUP')
			return shift;
		while (line.charAt(line.length - 1) == '-')
			line = (line.substr(0, line.length - 1) + stripV30(ctabLines[shift++])).trim();
		var split = splitSGroupDef(line);
		var type = split[1];
		var sg = new SGroup(type);
		sg.number = split[0] - 0;
		sg.type = type;
		sg.label = split[2] - 0;
		sgroups[sg.number] = sg;
		var props = {};
		for (var i = 3; i < split.length; ++i) {
			var subsplit = splitonce(split[i], '=');
			if (subsplit.length != 2)
				throw new Error('A record of form AAA=BBB or AAA=(...) expected, got \'' + split[i] + '\'');
			var name = subsplit[0];
			if (!(name in props))
				props[name] = [];
			props[name].push(subsplit[1]);
		}
		sg.atoms = parseBracedNumberList(props['ATOMS'][0], -1);
		if (props['PATOMS'])
			sg.patoms = parseBracedNumberList(props['PATOMS'][0], -1);
		sg.bonds = props['BONDS'] ? parseBracedNumberList(props['BONDS'][0], -1) : [];
		var brkxyzStrs = props['BRKXYZ'];
		sg.brkxyz = [];
		if (brkxyzStrs) {
			for (var j = 0; j < brkxyzStrs.length; ++j)
				sg.brkxyz.push(parseBracedNumberList(brkxyzStrs[j]));
		}
		if (props['MULT'])
			sg.data.subscript = props['MULT'][0] - 0;
		if (props['LABEL'])
			sg.data.subscript = props['LABEL'][0].trim();
		if (props['CONNECT'])
			sg.data.connectivity = props['CONNECT'][0].toLowerCase();
		if (props['FIELDDISP'])
			sGroup.applyDataSGroupInfo(sg, stripQuotes(props['FIELDDISP'][0]));
		if (props['FIELDDATA'])
			sGroup.applyDataSGroupData(sg, props['FIELDDATA'][0], true);
		if (props['FIELDNAME'])
			sGroup.applyDataSGroupName(sg, props['FIELDNAME'][0]);
		if (props['QUERYTYPE'])
			sGroup.applyDataSGroupQuery(sg, props['QUERYTYPE'][0]);
		if (props['QUERYOP'])
			sGroup.applyDataSGroupQueryOp(sg, props['QUERYOP'][0]);
		sGroup.loadSGroup(ctab, sg, atomMap);
	}
	throw new Error('S-group declaration incomplete.');
}

function parseCTabV3000(ctabLines, norgroups) { // eslint-disable-line max-statements
	/* reader */
	var ctab = new Struct();

	var shift = 0;
	if (ctabLines[shift++].trim() != 'M  V30 BEGIN CTAB')
		throw Error('CTAB V3000 invalid');
	if (ctabLines[shift].slice(0, 13) != 'M  V30 COUNTS')
		throw Error('CTAB V3000 invalid');
	var vals = ctabLines[shift].slice(14).split(' ');
	ctab.isChiral = (utils.parseDecimalInt(vals[4]) == 1);
	shift++;

	if (ctabLines[shift].trim() == 'M  V30 BEGIN ATOM') {
		shift++;
		var line;
		while (shift < ctabLines.length) {
			line = stripV30(ctabLines[shift++]).trim();
			if (line == 'END ATOM')
				break;
			while (line.charAt(line.length - 1) == '-')
				line = (line.substring(0, line.length - 1) + stripV30(ctabLines[shift++])).trim();
			ctab.atoms.add(parseAtomLineV3000(line));
		}

		if (ctabLines[shift].trim() == 'M  V30 BEGIN BOND') {
			shift++;
			while (shift < ctabLines.length) {
				line = stripV30(ctabLines[shift++]).trim();
				if (line == 'END BOND')
					break;
				while (line.charAt(line.length - 1) == '-')
					line = (line.substring(0, line.length - 1) + stripV30(ctabLines[shift++])).trim();
				ctab.bonds.add(parseBondLineV3000(line));
			}
		}

		// TODO: let sections follow in arbitrary order
		var sgroups = {};
		var atomMap = {};

		while (ctabLines[shift].trim() != 'M  V30 END CTAB') {
			if (ctabLines[shift].trim() == 'M  V30 BEGIN COLLECTION')
			// TODO: read collection information
				shift = v3000parseCollection(ctab, ctabLines, shift);
			else if (ctabLines[shift].trim() == 'M  V30 BEGIN SGROUP')
				shift = v3000parseSGroup(ctab, ctabLines, sgroups, atomMap, shift);
			else
				throw Error('CTAB V3000 invalid');
		}
	}
	if (ctabLines[shift++].trim() != 'M  V30 END CTAB')
		throw Error('CTAB V3000 invalid');

	if (!norgroups)
		readRGroups3000(ctab, ctabLines.slice(shift));

	return ctab;
}

function readRGroups3000(ctab, /* string */ ctabLines) /* Struct */ { // eslint-disable-line max-statements
	/* reader */
	var rfrags = {};
	var rLogic = {};
	var shift = 0;
	while (shift < ctabLines.length && ctabLines[shift].search('M  V30 BEGIN RGROUP') == 0) {
		var id = ctabLines[shift++].split(' ').pop();
		rfrags[id] = [];
		rLogic[id] = {};
		while (true) { // eslint-disable-line no-constant-condition
			var line = ctabLines[shift].trim();
			if (line.search('M  V30 RLOGIC') == 0) {
				line = line.slice(13);
				var rlsplit = line.trim().split(/\s+/g);
				var iii = utils.parseDecimalInt(rlsplit[0]);
				var hhh = utils.parseDecimalInt(rlsplit[1]);
				var ooo = rlsplit.slice(2).join(' ');
				var logic = {};
				if (iii > 0)
					logic.ifthen = iii;
				logic.resth = hhh == 1;
				logic.range = ooo;
				rLogic[id] = logic;
				shift++;
				continue; // eslint-disable-line no-continue
			}
			if (line != 'M  V30 BEGIN CTAB')
				throw Error('CTAB V3000 invalid');
			for (var i = 0; i < ctabLines.length; ++i) {
				if (ctabLines[shift + i].trim() == 'M  V30 END CTAB')
					break;
			}
			var lines = ctabLines.slice(shift, shift + i + 1);
			var rfrag = parseCTabV3000(lines, true);
			rfrags[id].push(rfrag);
			shift = shift + i + 1;
			if (ctabLines[shift].trim() == 'M  V30 END RGROUP') {
				shift++;
				break;
			}
		}
	}

	Object.keys(rfrags).forEach((rgid) => {
		rfrags[rgid].forEach((rg) => {
			rg.rgroups.set(rgid, new RGroup(rLogic[rgid]));
			const frid = rg.frags.add({});
			rg.rgroups.get(rgid).frags.add(frid);
			rg.atoms.forEach((atom) => {
				atom.fragment = frid;
			});
			rg.mergeInto(ctab);
		});
	});
}

function parseRxn3000(/* string[] */ ctabLines, shouldReactionRelayout) /* Struct */ { // eslint-disable-line max-statements
	/* reader */
	ctabLines = ctabLines.slice(4);
	var countsSplit = ctabLines[0].split(/\s+/g).slice(3);
	var nReactants = countsSplit[0] - 0,
		nProducts = countsSplit[1] - 0,
		nAgents = countsSplit.length > 2 ? countsSplit[2] - 0 : 0;

	function findCtabEnd(i) {
		for (var j = i; j < ctabLines.length; ++j) {
			if (ctabLines[j].trim() == 'M  V30 END CTAB')
				return j;
		}

		return console.error('CTab format invalid');
	}

	function findRGroupEnd(i) {
		for (var j = i; j < ctabLines.length; ++j) {
			if (ctabLines[j].trim() == 'M  V30 END RGROUP')
				return j;
		}
		return console.error('CTab format invalid');
	}

	var molLinesReactants = [];
	var molLinesProducts = [];
	var current = null;
	var rGroups = [];
	for (var i = 0; i < ctabLines.length; ++i) {
		var line = ctabLines[i].trim();
		var j;

		if (line.startsWith('M  V30 COUNTS')) {
			// do nothing
		} else if (line == 'M  END') {
			break; // stop reading
		} else if (line == 'M  V30 BEGIN PRODUCT') {
			console.assert(current == null, 'CTab format invalid');
			current = molLinesProducts;
		} else if (line == 'M  V30 END PRODUCT') {
			console.assert(current === molLinesProducts, 'CTab format invalid');
			current = null;
		} else if (line == 'M  V30 BEGIN REACTANT') {
			console.assert(current == null, 'CTab format invalid');
			current = molLinesReactants;
		} else if (line == 'M  V30 END REACTANT') {
			console.assert(current === molLinesReactants, 'CTab format invalid');
			current = null;
		} else if (line.startsWith('M  V30 BEGIN RGROUP')) {
			console.assert(current == null, 'CTab format invalid');
			j = findRGroupEnd(i);
			rGroups.push(ctabLines.slice(i, j + 1));
			i = j;
		} else if (line == 'M  V30 BEGIN CTAB') {
			j = findCtabEnd(i);
			current.push(ctabLines.slice(i, j + 1));
			i = j;
		} else {
			throw new Error('line unrecognized: ' + line);
		}
	}
	var mols = [];
	var molLines = molLinesReactants.concat(molLinesProducts);
	for (j = 0; j < molLines.length; ++j) {
		var mol = parseCTabV3000(molLines[j], countsSplit);
		mols.push(mol);
	}
	var ctab = utils.rxnMerge(mols, nReactants, nProducts, nAgents, shouldReactionRelayout);

	readRGroups3000(ctab, (function (array) {
		var res = [];
		for (var k = 0; k < array.length; ++k)
			res = res.concat(array[k]);
		return res;
	}(rGroups)));

	return ctab;
}

// split a line by spaces outside parentheses
function spaceparsplit(line) { // eslint-disable-line max-statements
	/* reader */
	var split = [];
	var pc = 0;
	var c;
	var i;
	var i0 = -1;
	var quoted = false;

	for (i = 0; i < line.length; ++i) {
		c = line[i];
		if (c == '(')
			pc++;
		else if (c == ')')
			pc--;
		if (c == '"')
			quoted = !quoted;
		if (!quoted && line[i] == ' ' && pc == 0) {
			if (i > i0 + 1)
				split.push(line.slice(i0 + 1, i));
			i0 = i;
		}
	}
	if (i > i0 + 1)
		split.push(line.slice(i0 + 1, i));
	return split;
}

// utils
function stripQuotes(str) {
	if (str[0] === '"' && str[str.length - 1] === '"')
		return str.substr(1, str.length - 2);
	return str;
}

function splitonce(line, delim) {
	/* reader */
	var p = line.indexOf(delim);
	return [line.slice(0, p), line.slice(p + 1)];
}

function splitSGroupDef(line) { // eslint-disable-line max-statements
	/* reader */
	var split = [];
	var braceBalance = 0;
	var quoted = false;
	for (var i = 0; i < line.length; ++i) {
		var c = line.charAt(i);
		if (c == '"') {
			quoted = !quoted;
		} else if (!quoted) {
			if (c == '(') {
				braceBalance++;
			} else if (c == ')') {
				braceBalance--;
			} else if (c == ' ' && braceBalance == 0) {
				split.push(line.slice(0, i));
				line = line.slice(i + 1).trim();
				i = 0;
			}
		}
	}
	if (braceBalance != 0)
		throw new Error('Brace balance broken. S-group properies invalid!');
	if (line.length > 0)
		split.push(line.trim());
	return split;
}

function parseBracedNumberList(line, shift) {
	/* reader */
	if (!line)
		return null;
	var list = [];
	line = line.trim();
	line = line.substr(1, line.length - 2);
	var split = line.split(' ');
	shift = shift || 0;

	for (var i = 1; i < split.length; ++i) {
		var value = parseInt(split[i]);
		if (!isNaN(value)) // eslint-disable-line
			list.push(value + shift);
	}

	return list;
}

function stripV30(line) {
	/* reader */
	if (line.slice(0, 7) != 'M  V30 ')
		throw new Error('Prefix invalid');
	return line.slice(7);
}

function labelsListToIds(labels) {
	/* reader */
	var ids = [];
	for (var i = 0; i < labels.length; ++i)
		ids.push(element.map[labels[i].trim()]);
	return ids;
}

export default {
	parseCTabV3000,
	readRGroups3000,
	parseRxn3000
};
