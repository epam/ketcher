var Vec2 = require('../../util/vec2');
var Map = require('../../util/map');

var element = require('./../element');
var Struct = require('./../struct/index');

var sGroup = require('./parseSGroup');
var utils = require('./utils');

var loadRGroupFragments = true; // TODO: set to load the fragments

function parseAtomLine(atomLine) {
	/* reader */
	var atomSplit = utils.partitionLine(atomLine, utils.fmtInfo.atomLinePartition);
	var params =
		{
			// generic
			pp: new Vec2(parseFloat(atomSplit[0]), -parseFloat(atomSplit[1]), parseFloat(atomSplit[2])),
			label: atomSplit[4].strip(),
			explicitValence: utils.fmtInfo.valenceMap[utils.parseDecimalInt(atomSplit[10])],

			// obsolete
			massDifference: utils.parseDecimalInt(atomSplit[5]),
			charge: utils.fmtInfo.chargeMap[utils.parseDecimalInt(atomSplit[6])],

			// query
			hCount: utils.parseDecimalInt(utils.parseDecimalInt(atomSplit[8])),
			stereoCare: utils.parseDecimalInt(atomSplit[9]) != 0,

			// reaction
			aam: utils.parseDecimalInt(atomSplit[14]),
			invRet: utils.parseDecimalInt(atomSplit[15]),

			// reaction query
			exactChangeFlag: utils.parseDecimalInt(atomSplit[16]) != 0
		};
	return new Struct.Atom(params);
}

function parseBondLine(bondLine) {
	/* reader */
	var bondSplit = utils.partitionLine(bondLine, utils.fmtInfo.bondLinePartition);
	var params =
		{
			begin: utils.parseDecimalInt(bondSplit[0]) - 1,
			end: utils.parseDecimalInt(bondSplit[1]) - 1,
			type: utils.fmtInfo.bondTypeMap[utils.parseDecimalInt(bondSplit[2])],
			stereo: utils.fmtInfo.bondStereoMap[utils.parseDecimalInt(bondSplit[3])],
			topology: utils.fmtInfo.bondTopologyMap[utils.parseDecimalInt(bondSplit[5])],
			reactingCenterStatus: utils.parseDecimalInt(bondSplit[6])
		};

	return new Struct.Bond(params);
}

function parseAtomListLine(/* string */atomListLine) {
	/* reader */
	var split = utils.partitionLine(atomListLine, utils.fmtInfo.atomListHeaderPartition);

	var number = utils.parseDecimalInt(split[0]) - 1;
	var notList = (split[2].strip() == 'T');
	var count = utils.parseDecimalInt(split[4].strip());

	var ids = atomListLine.slice(utils.fmtInfo.atomListHeaderLength);
	var list = [];
	var itemLength = utils.fmtInfo.atomListHeaderItemLength;
	for (var i = 0; i < count; ++i)
		list[i] = utils.parseDecimalInt(ids.slice(i * itemLength, ((i + 1) * itemLength) - 1));

	return {
		aid: number,
		atomList: new Struct.AtomList({
			notList: notList,
			ids: list
		})
	};
}

function parsePropertyLines(ctab, ctabLines, shift, end, sGroups, rLogic) { // eslint-disable-line max-statements, max-params
	/* reader */
	var props = new Map();
	while (shift < end) {
		var line = ctabLines[shift];
		if (line.charAt(0) == 'A') {
			if (!props.get('label'))
				props.set('label', new Map());
			props.get('label').set(utils.parseDecimalInt(line.slice(3, 6)) - 1, ctabLines[++shift]);
		} else if (line.charAt(0) == 'M') {
			var type = line.slice(3, 6);
			var propertyData = line.slice(6);
			if (type == 'END') {
				break;
			} else if (type == 'CHG') {
				if (!props.get('charge'))
					props.set('charge', new Map());
				props.get('charge').update(sGroup.readKeyValuePairs(propertyData));
			} else if (type == 'RAD') {
				if (!props.get('radical'))
					props.set('radical', new Map());
				props.get('radical').update(sGroup.readKeyValuePairs(propertyData));
			} else if (type == 'ISO') {
				if (!props.get('isotope'))
					props.set('isotope', new Map());
				props.get('isotope').update(sGroup.readKeyValuePairs(propertyData));
			} else if (type == 'RBC') {
				if (!props.get('ringBondCount'))
					props.set('ringBondCount', new Map());
				props.get('ringBondCount').update(sGroup.readKeyValuePairs(propertyData));
			} else if (type == 'SUB') {
				if (!props.get('substitutionCount'))
					props.set('substitutionCount', new Map());
				props.get('substitutionCount').update(sGroup.readKeyValuePairs(propertyData));
			} else if (type == 'UNS') {
				if (!props.get('unsaturatedAtom'))
					props.set('unsaturatedAtom', new Map());
				props.get('unsaturatedAtom').update(sGroup.readKeyValuePairs(propertyData));
				// else if (type == "LIN") // link atom
			} else if (type == 'RGP') { // rgroup atom
				if (!props.get('rglabel'))
					props.set('rglabel', new Map());
				var rglabels = props.get('rglabel');
				var a2rs = sGroup.readKeyMultiValuePairs(propertyData);
				for (var a2ri = 0; a2ri < a2rs.length; a2ri++) {
					var a2r = a2rs[a2ri];
					rglabels.set(a2r[0], (rglabels.get(a2r[0]) || 0) | (1 << (a2r[1] - 1)));
				}
			} else if (type == 'LOG') { // rgroup atom
				propertyData = propertyData.slice(4);
				var rgid = utils.parseDecimalInt(propertyData.slice(0, 3).strip());
				var iii = utils.parseDecimalInt(propertyData.slice(4, 7).strip());
				var hhh = utils.parseDecimalInt(propertyData.slice(8, 11).strip());
				var ooo = propertyData.slice(12).strip();
				var logic = {};
				if (iii > 0)
					logic.ifthen = iii;
				logic.resth = hhh == 1;
				logic.range = ooo;
				rLogic[rgid] = logic;
			} else if (type == 'APO') {
				if (!props.get('attpnt'))
					props.set('attpnt', new Map());
				props.get('attpnt').update(sGroup.readKeyValuePairs(propertyData));
			} else if (type == 'ALS') { // atom list
				if (!props.get('atomList'))
					props.set('atomList', new Map());
				var list = parsePropertyLineAtomList(
					utils.partitionLine(propertyData, [1, 3, 3, 1, 1, 1]),
					utils.partitionLineFixed(propertyData.slice(10), 4, false));
				props.get('atomList').update(
					list);
				if (!props.get('label'))
					props.set('label', new Map());
				for (var aid in list) props.get('label').set(aid, 'L#');
			} else if (type == 'STY') { // introduce s-group
				sGroup.initSGroup(sGroups, propertyData);
			} else if (type == 'SST') {
				sGroup.applySGroupProp(sGroups, 'subtype', propertyData);
			} else if (type == 'SLB') {
				sGroup.applySGroupProp(sGroups, 'label', propertyData, true);
			} else if (type == 'SPL') {
				sGroup.applySGroupProp(sGroups, 'parent', propertyData, true, true);
			} else if (type == 'SCN') {
				sGroup.applySGroupProp(sGroups, 'connectivity', propertyData);
			} else if (type == 'SAL') {
				sGroup.applySGroupArrayProp(sGroups, 'atoms', propertyData, -1);
			} else if (type == 'SBL') {
				sGroup.applySGroupArrayProp(sGroups, 'bonds', propertyData, -1);
			} else if (type == 'SPA') {
				sGroup.applySGroupArrayProp(sGroups, 'patoms', propertyData, -1);
			} else if (type == 'SMT') {
				var sid = utils.parseDecimalInt(propertyData.slice(0, 4)) - 1;
				sGroups[sid].data.subscript = propertyData.slice(4).strip();
			} else if (type == 'SDT') {
				sGroup.applyDataSGroupDesc(sGroups, propertyData);
			} else if (type == 'SDD') {
				sGroup.applyDataSGroupInfoLine(sGroups, propertyData);
			} else if (type == 'SCD') {
				sGroup.applyDataSGroupDataLine(sGroups, propertyData, false);
			} else if (type == 'SED') {
				sGroup.applyDataSGroupDataLine(sGroups, propertyData, true);
			}
		}
		++shift;
	}
	return props;
}

function applyAtomProp(atoms /* Pool */, values /* Map */, propId /* string */) {
	/* reader */
	values.each(function (aid, propVal) {
		atoms.get(aid)[propId] = propVal;
	});
}

function parseCTabV2000(ctabLines, countsSplit) { // eslint-disable-line max-statements
	/* reader */
	var ctab = new Struct();
	var i;
	var atomCount = utils.parseDecimalInt(countsSplit[0]);
	var bondCount = utils.parseDecimalInt(countsSplit[1]);
	var atomListCount = utils.parseDecimalInt(countsSplit[2]);
	ctab.isChiral = utils.parseDecimalInt(countsSplit[4]) != 0;
	var stextLinesCount = utils.parseDecimalInt(countsSplit[5]);
	var propertyLinesCount = utils.parseDecimalInt(countsSplit[10]);

	var shift = 0;
	var atomLines = ctabLines.slice(shift, shift + atomCount);
	shift += atomCount;
	var bondLines = ctabLines.slice(shift, shift + bondCount);
	shift += bondCount;
	var atomListLines = ctabLines.slice(shift, shift + atomListCount);
	shift += atomListCount + stextLinesCount;

	var atoms = atomLines.map(parseAtomLine);
	for (i = 0; i < atoms.length; ++i)
		ctab.atoms.add(atoms[i]);
	var bonds = bondLines.map(parseBondLine);
	for (i = 0; i < bonds.length; ++i)
		ctab.bonds.add(bonds[i]);

	var atomLists = atomListLines.map(parseAtomListLine);
	atomLists.each(function (pair) {
		ctab.atoms.get(pair.aid).atomList = pair.atomList;
		ctab.atoms.get(pair.aid).label = 'L#';
	});

	var sGroups = {};
	var rLogic = {};
	var props = parsePropertyLines(ctab, ctabLines, shift,
		Math.min(ctabLines.length, shift + propertyLinesCount), sGroups, rLogic);
	props.each(function (propId, values) {
		applyAtomProp(ctab.atoms, values, propId);
	});

	var atomMap = {};
	var sid;
	for (sid in sGroups) {
		var sg = sGroups[sid];
		if (sg.type === 'DAT' && sg.atoms.length === 0) {
			var parent = sGroups[sid].parent;
			if (parent >= 0) {
				var psg = sGroups[parent - 1];
				if (psg.type === 'GEN')
					sg.atoms = [].slice.call(psg.atoms);
			}
		}
	}
	for (sid in sGroups)
		sGroup.loadSGroup(ctab, sGroups[sid], atomMap);
	var emptyGroups = [];
	for (sid in sGroups) { // TODO: why do we need that?
		Struct.SGroup.filter(ctab, sGroups[sid], atomMap);
		if (sGroups[sid].atoms.length == 0 && !sGroups[sid].allAtoms)
			emptyGroups.push(sid);
	}
	for (i = 0; i < emptyGroups.length; ++i) {
		ctab.sGroupForest.remove(emptyGroups[i]);
		ctab.sgroups.remove(emptyGroups[i]);
	}
	for (var rgid in rLogic)
		ctab.rgroups.set(rgid, new Struct.RGroup(rLogic[rgid]));
	return ctab;
}

function parseRg2000(/* string[] */ ctabLines) /* Struct */ { // eslint-disable-line max-statements
	ctabLines = ctabLines.slice(7);
	if (ctabLines[0].strip() != '$CTAB')
		throw new Error('RGFile format invalid');
	var i = 1;
	while (ctabLines[i].charAt(0) != '$') i++;
	if (ctabLines[i].strip() != '$END CTAB')
		throw new Error('RGFile format invalid');
	var coreLines = ctabLines.slice(1, i);
	ctabLines = ctabLines.slice(i + 1);
	var fragmentLines = {};
	while (true) { // eslint-disable-line no-constant-condition
		if (ctabLines.length == 0)
			throw new Error('Unexpected end of file');
		var line = ctabLines[0].strip();
		if (line == '$END MOL') {
			ctabLines = ctabLines.slice(1);
			break;
		}
		if (line != '$RGP')
			throw new Error('RGFile format invalid');
		var rgid = ctabLines[1].strip() - 0;
		fragmentLines[rgid] = [];
		ctabLines = ctabLines.slice(2);
		while (true) { // eslint-disable-line no-constant-condition
			if (ctabLines.length == 0)
				throw new Error('Unexpected end of file');
			line = ctabLines[0].strip();
			if (line == '$END RGP') {
				ctabLines = ctabLines.slice(1);
				break;
			}
			if (line != '$CTAB')
				throw new Error('RGFile format invalid');
			i = 1;
			while (ctabLines[i].charAt(0) != '$') i++;
			if (ctabLines[i].strip() != '$END CTAB')
				throw new Error('RGFile format invalid');
			fragmentLines[rgid].push(ctabLines.slice(1, i));
			ctabLines = ctabLines.slice(i + 1);
		}
	}

	var core = parseCTab(coreLines);
	var frag = {};
	if (loadRGroupFragments) {
		for (var id in fragmentLines) {
			frag[id] = [];
			for (var j = 0; j < fragmentLines[id].length; ++j)
				frag[id].push(parseCTab(fragmentLines[id][j]));
		}
	}
	return rgMerge(core, frag);
}

function parseRxn2000(/* string[] */ ctabLines) /* Struct */ {
	/* reader */
	ctabLines = ctabLines.slice(4);
	var countsSplit = utils.partitionLine(ctabLines[0], utils.fmtInfo.rxnItemsPartition);
	var nReactants = countsSplit[0] - 0,
		nProducts = countsSplit[1] - 0,
		nAgents = countsSplit[2] - 0;
	ctabLines = ctabLines.slice(1); // consume counts line

	var mols = [];
	while (ctabLines.length > 0 && ctabLines[0].substr(0, 4) == '$MOL') {
		ctabLines = ctabLines.slice(1);
		var n = 0;
		while (n < ctabLines.length && ctabLines[n].substr(0, 4) != '$MOL') n++;

		var lines = ctabLines.slice(0, n);
		var struct;
		if (lines[0].search('\\$MDL') == 0) {
			struct = parseRg2000(lines);
		} else {
			struct = parseCTab(lines.slice(3));
			struct.name = lines[0].strip();
		}
		mols.push(struct);
		ctabLines = ctabLines.slice(n);
	}
	return utils.rxnMerge(mols, nReactants, nProducts, nAgents);
}

function parseCTab(/* string */ ctabLines) /* Struct */ {
	/* reader */
	var countsSplit = utils.partitionLine(ctabLines[0], utils.fmtInfo.countsLinePartition);
	ctabLines = ctabLines.slice(1);
	return parseCTabV2000(ctabLines, countsSplit);
}

function rgMerge(scaffold, rgroups) /* Struct */ {
	/* reader */
	var ret = new Struct();

	scaffold.mergeInto(ret, null, null, false, true);
	for (var rgid in rgroups) {
		for (var j = 0; j < rgroups[rgid].length; ++j) {
			var ctab = rgroups[rgid][j];
			ctab.rgroups.set(rgid, new Struct.RGroup());
			var frag = {};
			var frid = ctab.frags.add(frag);
			ctab.rgroups.get(rgid).frags.add(frid);
			ctab.atoms.each(function (aid, atom) {
				atom.fragment = frid;
			});
			ctab.mergeInto(ret);
		}
	}

	return ret;
}

function labelsListToIds(labels) {
	/* reader */
	var ids = [];
	for (var i = 0; i < labels.length; ++i)
		ids.push(element.getElementByLabel(labels[i].strip()));
	return ids;
}

function parsePropertyLineAtomList(hdr, lst) {
	/* reader */
	var aid = utils.parseDecimalInt(hdr[1]) - 1;
	var count = utils.parseDecimalInt(hdr[2]);
	var notList = hdr[4].strip() == 'T';
	var ids = labelsListToIds(lst.slice(0, count));
	var ret = {};
	ret[aid] = new Struct.AtomList({
		notList: notList,
		ids: ids
	});
	return ret;
}

module.exports = {
	parseCTabV2000: parseCTabV2000,
	parseRg2000: parseRg2000,
	parseRxn2000: parseRxn2000
};
