var Map = require('../util/map');
var Set = require('../util/set');
var Vec2 = require('../util/vec2');
var util = require('../util');

var element = require('./element');
var Struct = require('./struct');

var FRAGMENT = {
	NONE: 0,
	REACTANT: 1,
	PRODUCT: 2,
	AGENT: 3
};

var Molfile = function (v3000) {
	/* reader */
	/* saver */
	this.molecule = null;
	this.molfile = null;
	this.v3000 = v3000 || false;
};

Molfile.loadRGroupFragments = true; // TODO: set to load the fragments

var parseDecimalInt = function (str)
{
	/* reader */
	var val = parseInt(str, 10);

	return isNaN(val) ? 0 : val;
};

var partitionLine = function (/* string*/ str, /* array of int*/ parts, /* bool*/ withspace)
{
	/* reader */
	var res = [];
	for (var i = 0, shift = 0; i < parts.length; ++i)
	{
		res.push(str.slice(shift, shift + parts[i]));
		if (withspace)
			shift++;
		shift += parts[i];
	}
	return res;
};

var partitionLineFixed = function (/* string*/ str, /* int*/ itemLength, /* bool*/ withspace)
{
	/* reader */
	var res = [];
	for (var shift = 0; shift < str.length; shift += itemLength)
	{
		res.push(str.slice(shift, shift + itemLength));
		if (withspace)
			shift++;
	}
	return res;
};

// TODO: reconstruct molfile string instead parsing multiple times
//       merge to bottom
function parseCTFile(str, options) {
	var molfile = new Molfile();
	var lines = splitNewlines(str);
	try {
		return molfile.parseCTFile(lines);
	} catch (ex) {
		if (options.badHeaderRecover) {
			try {
				// check whether there's an extra empty line on top
				// this often happens when molfile text is pasted into the dialog window
				return molfile.parseCTFile(lines.slice(1));
			} catch (ex1) {
			}
			try {
				// check for a missing first line
				// this sometimes happens when pasting
				return molfile.parseCTFile([''].concat(lines));
			} catch (ex2) {
			}
		}
		throw ex;
	}
}

Molfile.prototype.parseCTFile = function (molfileLines) {
	var ret = null;
	if (molfileLines[0].search('\\$RXN') == 0)
		ret = parseRxn(molfileLines);
	else
		ret = parseMol(molfileLines);
	ret.initHalfBonds();
	ret.initNeighbors();
	ret.markFragments();
	return ret;
};

var fmtInfo = {
	bondTypeMap: {
		1: Struct.Bond.PATTERN.TYPE.SINGLE,
		2: Struct.Bond.PATTERN.TYPE.DOUBLE,
		3: Struct.Bond.PATTERN.TYPE.TRIPLE,
		4: Struct.Bond.PATTERN.TYPE.AROMATIC,
		5: Struct.Bond.PATTERN.TYPE.SINGLE_OR_DOUBLE,
		6: Struct.Bond.PATTERN.TYPE.SINGLE_OR_AROMATIC,
		7: Struct.Bond.PATTERN.TYPE.DOUBLE_OR_AROMATIC,
		8: Struct.Bond.PATTERN.TYPE.ANY
	},
	bondStereoMap: {
		0: Struct.Bond.PATTERN.STEREO.NONE,
		1: Struct.Bond.PATTERN.STEREO.UP,
		4: Struct.Bond.PATTERN.STEREO.EITHER,
		6: Struct.Bond.PATTERN.STEREO.DOWN,
		3: Struct.Bond.PATTERN.STEREO.CIS_TRANS
	},
	v30bondStereoMap: {
		0: Struct.Bond.PATTERN.STEREO.NONE,
		1: Struct.Bond.PATTERN.STEREO.UP,
		2: Struct.Bond.PATTERN.STEREO.EITHER,
		3: Struct.Bond.PATTERN.STEREO.DOWN
	},
	bondTopologyMap: {
		0: Struct.Bond.PATTERN.TOPOLOGY.EITHER,
		1: Struct.Bond.PATTERN.TOPOLOGY.RING,
		2: Struct.Bond.PATTERN.TOPOLOGY.CHAIN
	},
	countsLinePartition: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6],
	atomLinePartition: [10, 10, 10, 1, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
	bondLinePartition: [3, 3, 3, 3, 3, 3, 3],
	atomListHeaderPartition: [3, 1, 1, 4, 1, 1],
	atomListHeaderLength: 11, // = atomListHeaderPartition.reduce(function(a,b) { return a + b; }, 0)
	atomListHeaderItemLength: 4,
	chargeMap: [0, +3, +2, +1, 0, -1, -2, -3],
	valenceMap: [undefined, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0],
	implicitHydrogenMap: [undefined, 0, 1, 2, 3, 4],
	v30atomPropMap: {
		'CHG': 'charge',
		'RAD': 'radical',
		'MASS': 'isotope',
		'VAL': 'explicitValence',
		'HCOUNT': 'hCount',
		'INVRET': 'invRet',
		'SUBST': 'substitutionCount',
		'UNSAT': 'unsaturatedAtom',
		'RBCNT': 'ringBondCount'
	},
	rxnItemsPartition: [3, 3, 3]
};

var parseAtomLine = function (atomLine)
{
	/* reader */
	var atomSplit = partitionLine(atomLine, fmtInfo.atomLinePartition);
	var params =
		{
		// generic
			pp: new Vec2(parseFloat(atomSplit[0]), -parseFloat(atomSplit[1]), parseFloat(atomSplit[2])),
			label: atomSplit[4].strip(),
			explicitValence: fmtInfo.valenceMap[parseDecimalInt(atomSplit[10])],

		// obsolete
			massDifference: parseDecimalInt(atomSplit[5]),
			charge: fmtInfo.chargeMap[parseDecimalInt(atomSplit[6])],

		// query
			hCount: parseDecimalInt(parseDecimalInt(atomSplit[8])),
			stereoCare: parseDecimalInt(atomSplit[9]) != 0,

		// reaction
			aam: parseDecimalInt(atomSplit[14]),
			invRet: parseDecimalInt(atomSplit[15]),

		// reaction query
			exactChangeFlag: parseDecimalInt(atomSplit[16]) != 0
		};
	return new Struct.Atom(params);
};

var stripV30 = function (line)
{
	/* reader */
	if (line.slice(0, 7) != 'M  V30 ')
		throw Error('Prefix invalid');
	return line.slice(7);
};

var parseAtomLineV3000 = function (line)
{
	/* reader */
	var split, subsplit, key, value, i;
	split = spaceparsplit(line);
	var params = {
		pp: new Vec2(parseFloat(split[2]), -parseFloat(split[3]), parseFloat(split[4])),
		aam: split[5].strip()
	};
	var label = split[1].strip();
	if (label.charAt(0) == '"' && label.charAt(label.length - 1) == '"') {
		label = label.substr(1, label.length - 2); // strip qutation marks
	}
	if (label.charAt(label.length - 1) == ']') { // assume atom list
		label = label.substr(0, label.length - 1); // remove ']'
		var atomListParams = {};
		atomListParams.notList = false;
		if (label.substr(0, 5) == 'NOT [') {
			atomListParams.notList = true;
			label = label.substr(5); // remove 'NOT ['
		} else if (label.charAt(0) != '[') {
			throw 'Error: atom list expected, found \'' + label + '\'';
		} else {
			label = label.substr(1); // remove '['
		}
		atomListParams.ids = labelsListToIds(label.split(','));
		params['atomList'] = new Struct.AtomList(atomListParams);
		params['label'] = 'L#';
	} else {
		params['label'] = label;
	}
	split.splice(0, 6);
	for (i = 0; i < split.length; ++i) {
		subsplit = splitonce(split[i], '=');
		key = subsplit[0];
		value = subsplit[1];
		if (key in fmtInfo.v30atomPropMap) {
			var ival = parseDecimalInt(value);
			if (key == 'VAL') {
				if (ival == 0)
					continue;
				if (ival == -1)
					ival = 0;
			}
			params[fmtInfo.v30atomPropMap[key]] = ival;
		} else if (key == 'RGROUPS') {
			value = value.strip().substr(1, value.length - 2);
			var rgrsplit = value.split(' ').slice(1);
			params.rglabel = 0;
			for (var j = 0; j < rgrsplit.length; ++j) {
				params.rglabel |= 1 << (rgrsplit[j] - 1);
			}
		} else if (key == 'ATTCHPT') {
			params.attpnt = value.strip() - 0;
		}
	}
	return new Struct.Atom(params);
};

var parseBondLineV3000 = function (line)
{
	/* reader */
	var split, subsplit, key, value, i;
	split = spaceparsplit(line);
	var params = {
		begin: parseDecimalInt(split[2]) - 1,
		end: parseDecimalInt(split[3]) - 1,
		type: fmtInfo.bondTypeMap[parseDecimalInt(split[1])]
	};
	split.splice(0, 4);
	for (i = 0; i < split.length; ++i) {
		subsplit = splitonce(split[i], '=');
		key = subsplit[0];
		value = subsplit[1];
		if (key == 'CFG') {
			params.stereo = fmtInfo.v30bondStereoMap[parseDecimalInt(value)];
			if (params.type == Struct.Bond.PATTERN.TYPE.DOUBLE && params.stereo == Struct.Bond.PATTERN.STEREO.EITHER)
				params.stereo = Struct.Bond.PATTERN.STEREO.CIS_TRANS;
		} else if (key == 'TOPO') {
			params.topology = fmtInfo.bondTopologyMap[parseDecimalInt(value)];
		} else if (key == 'RXCTR') {
			params.reactingCenterStatus = parseDecimalInt(value);
		} else if (key == 'STBOX') {
			params.stereoCare = parseDecimalInt(value);
		}
	}
	return new Struct.Bond(params);
};

var parseBondLine = function (bondLine)
{
	/* reader */
	var bondSplit = partitionLine(bondLine, fmtInfo.bondLinePartition);
	var params =
		{
			begin: parseDecimalInt(bondSplit[0]) - 1,
			end: parseDecimalInt(bondSplit[1]) - 1,
			type: fmtInfo.bondTypeMap[parseDecimalInt(bondSplit[2])],
			stereo: fmtInfo.bondStereoMap[parseDecimalInt(bondSplit[3])],
			topology: fmtInfo.bondTopologyMap[parseDecimalInt(bondSplit[5])],
			reactingCenterStatus: parseDecimalInt(bondSplit[6])
		};

	return new Struct.Bond(params);
};

var parseAtomListLine = function (/* string */atomListLine)
{
	/* reader */
	var split = partitionLine(atomListLine, fmtInfo.atomListHeaderPartition);

	var number = parseDecimalInt(split[0]) - 1;
	var notList = (split[2].strip() == 'T');
	var count = parseDecimalInt(split[4].strip());

	var ids = atomListLine.slice(fmtInfo.atomListHeaderLength);
	var list = [];
	var itemLength = fmtInfo.atomListHeaderItemLength;
	for (var i = 0; i < count; ++i)
		list[i] = parseDecimalInt(ids.slice(i * itemLength, (i + 1) * itemLength - 1));

	return {
		'aid': number,
		'atomList': new Struct.AtomList({
			'notList': notList,
			'ids': list
		})
	};
};

var readKeyValuePairs = function (str, /* bool */ valueString)
{
	/* reader */
	var ret = {};
	var partition = partitionLineFixed(str, 3, true);
	var count = parseDecimalInt(partition[0]);
	for (var i = 0; i < count; ++i)
		ret[parseDecimalInt(partition[2 * i + 1]) - 1] =
			valueString ? partition[2 * i + 2].strip() :
			parseDecimalInt(partition[2 * i + 2]);
	return ret;
};

var readKeyMultiValuePairs = function (str, /* bool */ valueString)
{
	/* reader */
	var ret = [];
	var partition = partitionLineFixed(str, 3, true);
	var count = parseDecimalInt(partition[0]);
	for (var i = 0; i < count; ++i)
		ret.push([
			parseDecimalInt(partition[2 * i + 1]) - 1,
			valueString ? partition[2 * i + 2].strip() : parseDecimalInt(partition[2 * i + 2])
		]);
	return ret;
};

var labelsListToIds = function (labels)
{
	/* reader */
	var ids = [];
	for (var i = 0; i < labels.length; ++i) {
		ids.push(element.getElementByLabel(labels[i].strip()));
	}
	return ids;
};

var parsePropertyLineAtomList = function (hdr, lst)
{
	/* reader */
	var aid = parseDecimalInt(hdr[1]) - 1;
	var count = parseDecimalInt(hdr[2]);
	var notList = hdr[4].strip() == 'T';
	var ids = labelsListToIds(lst.slice(0, count));
	var ret = {};
	ret[aid] = new Struct.AtomList({
		'notList': notList,
		'ids': ids
	});
	return ret;
};

var postLoadMul = function (sgroup, mol, atomMap) {
	sgroup.data.mul = sgroup.data.subscript - 0;
	var atomReductionMap = {};

	sgroup.atoms = Struct.SGroup.filterAtoms(sgroup.atoms, atomMap);
	sgroup.patoms = Struct.SGroup.filterAtoms(sgroup.patoms, atomMap);

	// mark repetitions for removal
	for (var k = 1; k < sgroup.data.mul; ++k) {
		for (var m = 0; m < sgroup.patoms.length; ++m) {
			var raid = sgroup.atoms[k * sgroup.patoms.length + m];
			if (raid < 0)
				continue;
			if (sgroup.patoms[m] < 0) {
				throw new Error('parent atom missing');
			}
			//                mol.atoms.get(raid).pp.y -= 3*k; // for debugging purposes
			atomReductionMap[raid] = sgroup.patoms[m]; // "merge" atom in parent
		}
	}
	sgroup.patoms = Struct.SGroup.removeNegative(sgroup.patoms);

	var patomsMap = util.identityMap(sgroup.patoms);

	var bondsToRemove = [];
	mol.bonds.each(function (bid, bond) {
		var beginIn = bond.begin in atomReductionMap;
		var endIn = bond.end in atomReductionMap;
		// if both adjacent atoms of a bond are to be merged, remove it
		if (beginIn && endIn
				 || beginIn && bond.end in patomsMap
				 || endIn && bond.begin in patomsMap) {
			bondsToRemove.push(bid);
				// if just one atom is merged, modify the bond accordingly
		} else if (beginIn) {
			bond.begin = atomReductionMap[bond.begin];
		} else if (endIn) {
			bond.end = atomReductionMap[bond.end];
		}
	}, sgroup);

	// apply removal lists
	for (var b = 0; b < bondsToRemove.length; ++b) {
		mol.bonds.remove(bondsToRemove[b]);
	}
	for (var a in atomReductionMap) {
		mol.atoms.remove(a);
		atomMap[a] = -1;
	}
	sgroup.atoms = sgroup.patoms;
	sgroup.patoms = null;
};


var postLoadSru = function (sgroup, mol, atomMap) {
	sgroup.data.connectivity = (sgroup.data.connectivity || 'EU').strip().toLowerCase();
};

var postLoadSup = function (sgroup, mol, atomMap) {
	sgroup.data.name = (sgroup.data.subscript || '').strip();
	sgroup.data.subscript = '';
};

var postLoadGen = function (sgroup, mol, atomMap) {
};

var postLoadDat = function (sgroup, mol, atomMap) {
	if (!sgroup.data.absolute)
		sgroup.pp = sgroup.pp.add(Struct.SGroup.getMassCentre(mol, sgroup.atoms));
		// [NK] Temporary comment incoplete 'allAtoms' behavior
		// TODO: need ether remove 'allAtoms' flag or hadle it
		// consistently (other flags: *_KEY, *_RADICAL?)
		// var allAtomsInGroup = this.atoms.length == mol.atoms.count();
		// if (allAtomsInGroup &&
		//     (this.data.fieldName == 'MDLBG_FRAGMENT_STEREO' ||
		//      this.data.fieldName == 'MDLBG_FRAGMENT_COEFFICIENT' ||
		//      this.data.fieldName == 'MDLBG_FRAGMENT_CHARGE')) {
		// 	this.atoms = [];
		// 	this.allAtoms = true;
		// }
};

function loadSGroup(mol, sg, atomMap)
{
	var postLoadMap = {
		'MUL': postLoadMul,
		'SRU': postLoadSru,
		'SUP': postLoadSup,
		'DAT': postLoadDat,
		'GEN': postLoadGen
	};

	// add the group to the molecule
	sg.id = mol.sgroups.add(sg);

	// apply type-specific post-processing
	postLoadMap[sg.type](sg, mol, atomMap);
	// mark atoms in the group as belonging to it
	for (var s = 0; s < sg.atoms.length; ++s)
		if (mol.atoms.has(sg.atoms[s]))
			Set.add(mol.atoms.get(sg.atoms[s]).sgs, sg.id);

	mol.sGroupForest.insert(sg.id);
	return sg.id;
}

var initSGroup = function (sGroups, propData)
{
	/* reader */
	var kv = readKeyValuePairs(propData, true);
	for (var key in kv) {
		var type = kv[key];
		if (!(type in Struct.SGroup.TYPES))
			throw new Error('Unsupported S-group type');
		var sg = new Struct.SGroup(type);
		sg.number = key;
		sGroups[key] = sg;
	}
};

var applySGroupProp = function (sGroups, propName, propData, numeric, core)
{
	var kv = readKeyValuePairs(propData, !(numeric));
	for (var key in kv) {
		// "core" properties are stored directly in an sgroup, not in sgroup.data
		(core ? sGroups[key] : sGroups[key].data)[propName] = kv[key];
	}
};

var toIntArray = function (strArray)
{
	/* reader */
	var ret = [];
	for (var j = 0; j < strArray.length; ++j)
		ret[j] = parseDecimalInt(strArray[j]);
	return ret;
};

var applySGroupArrayProp = function (sGroups, propName, propData, shift)
{
	/* reader */
	var sid = parseDecimalInt(propData.slice(1, 4)) - 1;
	var num = parseDecimalInt(propData.slice(4, 8));
	var part = toIntArray(partitionLineFixed(propData.slice(8), 3, true));

	if (part.length != num)
		throw new Error('File format invalid');
	if (shift) {
		part = part.map(function (v) {
			return v + shift;
		});
	}
	sGroups[sid][propName] = sGroups[sid][propName].concat(part);
};

var applyDataSGroupName = function (sg, name) {
	/* reader */
	sg.data.fieldName = name;
};

var applyDataSGroupQuery = function (sg, query) {
	/* reader */
	sg.data.query = query;
};

var applyDataSGroupQueryOp = function (sg, queryOp) {
	/* reader */
	sg.data.queryOp = queryOp;
};

var applyDataSGroupDesc = function (sGroups, propData) {
	/* reader */
	var split = partitionLine(propData, [4, 31, 2, 20, 2, 3], false);
	var id = parseDecimalInt(split[0]) - 1;
	var fieldName = split[1].strip();
	var fieldType = split[2].strip();
	var units = split[3].strip();
	var query = split[4].strip();
	var queryOp = split[5].strip();
	var sGroup = sGroups[id];
	sGroup.data.fieldType = fieldType;
	sGroup.data.fieldName = fieldName;
	sGroup.data.units = units;
	sGroup.data.query = query;
	sGroup.data.queryOp = queryOp;
};

var applyDataSGroupInfo = function (sg, propData) {
	/* reader */
	var split = partitionLine(propData, [10/* x.x*/, 10/* y.y*/, 4/* eee*/, 1/* f*/, 1/* g*/, 1/* h*/, 3/* i */, 3/* jjj*/, 3/* kkk*/, 3/* ll*/, 2/* m*/, 3/* n*/, 2/* oo*/], false);

	var x = parseFloat(split[0]);
	var y = parseFloat(split[1]);
	var attached = split[3].strip() == 'A';
	var absolute = split[4].strip() == 'A';
	var showUnits = split[5].strip() == 'U';
	var nCharsToDisplay = split[7].strip();
	nCharsToDisplay = nCharsToDisplay == 'ALL' ? -1 : parseDecimalInt(nCharsToDisplay);
	var tagChar = split[10].strip();
	var daspPos = parseDecimalInt(split[11].strip());

	sg.pp = new Vec2(x, -y);
	sg.data.attached = attached;
	sg.data.absolute = absolute;
	sg.data.showUnits = showUnits;
	sg.data.nCharsToDisplay = nCharsToDisplay;
	sg.data.tagChar = tagChar;
	sg.data.daspPos = daspPos;
};

var applyDataSGroupInfoLine = function (sGroups, propData) {
	/* reader */
	var id = parseDecimalInt(propData.substr(0, 4)) - 1;
	var sg = sGroups[id];
	applyDataSGroupInfo(sg, propData.substr(5));
};

var applyDataSGroupData = function (sg, data, finalize) {
	/* reader */
	sg.data.fieldValue = (sg.data.fieldValue || '') + data;
	if (finalize) {
		sg.data.fieldValue = sg.data.fieldValue.trimRight();
		if (sg.data.fieldValue.startsWith('"') && sg.data.fieldValue.endsWith('"'))
			sg.data.fieldValue = sg.data.fieldValue.substr(1, sg.data.fieldValue.length - 2);
		// Partially revert f556e8, from KETCHER-457 and RB with love
		// sg.data.fieldValue += '\n';
	}
};

var applyDataSGroupDataLine = function (sGroups, propData, finalize) {
	/* reader */
	var id = parseDecimalInt(propData.substr(0, 5)) - 1;
	var data = propData.substr(5);
	var sg = sGroups[id];
	applyDataSGroupData(sg, data, finalize);
};

var parsePropertyLines = function (ctab, ctabLines, shift, end, sGroups, rLogic)
{
	/* reader */
	var props = new Map();
	while (shift < end)
	{
		var line = ctabLines[shift];
		if (line.charAt(0) == 'A') {
			if (!props.get('label'))
				props.set('label', new Map());
			props.get('label').set(parseDecimalInt(line.slice(3, 6)) - 1, ctabLines[++shift]);
		} else if (line.charAt(0) == 'M') {
			var type = line.slice(3, 6);
			var propertyData = line.slice(6);
			if (type == 'END') {
				break;
			} else if (type == 'CHG') {
				if (!props.get('charge'))
					props.set('charge', new Map());
				props.get('charge').update(readKeyValuePairs(propertyData));
			} else if (type == 'RAD') {
				if (!props.get('radical'))
					props.set('radical', new Map());
				props.get('radical').update(readKeyValuePairs(propertyData));
			} else if (type == 'ISO') {
				if (!props.get('isotope'))
					props.set('isotope', new Map());
				props.get('isotope').update(readKeyValuePairs(propertyData));
			} else if (type == 'RBC') {
				if (!props.get('ringBondCount'))
					props.set('ringBondCount', new Map());
				props.get('ringBondCount').update(readKeyValuePairs(propertyData));
			} else if (type == 'SUB') {
				if (!props.get('substitutionCount'))
					props.set('substitutionCount', new Map());
				props.get('substitutionCount').update(readKeyValuePairs(propertyData));
			} else if (type == 'UNS') {
				if (!props.get('unsaturatedAtom'))
					props.set('unsaturatedAtom', new Map());
				props.get('unsaturatedAtom').update(readKeyValuePairs(propertyData));
				// else if (type == "LIN") // link atom
			} else if (type == 'RGP') { // rgroup atom
				if (!props.get('rglabel'))
					props.set('rglabel', new Map());
				var rglabels = props.get('rglabel');
				var a2rs = readKeyMultiValuePairs(propertyData);
				for (var a2ri = 0; a2ri < a2rs.length; a2ri++) {
					var a2r = a2rs[a2ri];
					rglabels.set(a2r[0], (rglabels.get(a2r[0]) || 0) | (1 << (a2r[1] - 1)));
				}
			} else if (type == 'LOG') { // rgroup atom
				propertyData = propertyData.slice(4);
				var rgid = parseDecimalInt(propertyData.slice(0, 3).strip());
				var iii = parseDecimalInt(propertyData.slice(4, 7).strip());
				var hhh = parseDecimalInt(propertyData.slice(8, 11).strip());
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
				props.get('attpnt').update(readKeyValuePairs(propertyData));
			} else if (type == 'ALS') { // atom list
				if (!props.get('atomList'))
					props.set('atomList', new Map());
				var list = parsePropertyLineAtomList(
				partitionLine(propertyData, [1, 3, 3, 1, 1, 1]),
				partitionLineFixed(propertyData.slice(10), 4, false));
				props.get('atomList').update(
					list);
				if (!props.get('label'))
					props.set('label', new Map());
				for (var aid in list) props.get('label').set(aid, 'L#');
			} else if (type == 'STY') { // introduce s-group
				initSGroup(sGroups, propertyData);
			} else if (type == 'SST') {
				applySGroupProp(sGroups, 'subtype', propertyData);
			} else if (type == 'SLB') {
				applySGroupProp(sGroups, 'label', propertyData, true);
			} else if (type == 'SPL') {
				applySGroupProp(sGroups, 'parent', propertyData, true, true);
			} else if (type == 'SCN') {
				applySGroupProp(sGroups, 'connectivity', propertyData);
			} else if (type == 'SAL') {
				applySGroupArrayProp(sGroups, 'atoms', propertyData, -1);
			} else if (type == 'SBL') {
				applySGroupArrayProp(sGroups, 'bonds', propertyData, -1);
			} else if (type == 'SPA') {
				applySGroupArrayProp(sGroups, 'patoms', propertyData, -1);
			} else if (type == 'SMT') {
				var sid = parseDecimalInt(propertyData.slice(0, 4)) - 1;
				sGroups[sid].data.subscript = propertyData.slice(4).strip();
			} else if (type == 'SDT') {
				applyDataSGroupDesc(sGroups, propertyData);
			} else if (type == 'SDD') {
				applyDataSGroupInfoLine(sGroups, propertyData);
			} else if (type == 'SCD') {
				applyDataSGroupDataLine(sGroups, propertyData, false);
			} else if (type == 'SED') {
				applyDataSGroupDataLine(sGroups, propertyData, true);
			}
		}
		++shift;
	}
	return props;
};

var applyAtomProp = function (atoms /* Pool */, values /* Map */, propId /* string */, clean /* boolean */)
{
	/* reader */
	values.each(function (aid, propVal) {
		atoms.get(aid)[propId] = propVal;
	});
};

var parseCTabV2000 = function (ctabLines, countsSplit)
{
	/* reader */
	var ctab = new Struct();
	var i;
	var atomCount = parseDecimalInt(countsSplit[0]);
	var bondCount = parseDecimalInt(countsSplit[1]);
	var atomListCount = parseDecimalInt(countsSplit[2]);
	ctab.isChiral = parseDecimalInt(countsSplit[4]) != 0;
	var stextLinesCount = parseDecimalInt(countsSplit[5]);
	var propertyLinesCount = parseDecimalInt(countsSplit[10]);

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

	var sGroups = {}, rLogic = {};
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
				if (psg.type === 'GEN') {
					sg.atoms = [].slice.call(psg.atoms);
				}
			}
		}
	}
	for (sid in sGroups) {
		loadSGroup(ctab, sGroups[sid], atomMap);
	}
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
	for (var rgid in rLogic) {
		ctab.rgroups.set(rgid, new Struct.RGroup(rLogic[rgid]));
	}
	return ctab;
};

// split a line by spaces outside parentheses
var spaceparsplit = function (line)
{
	/* reader */
	var split = [], pc = 0, c, i, i0 = -1;
	var line_array = line.toArray(); // IE7 doesn't support line[i]
	var quoted = false;

	for (i = 0; i < line.length; ++i)
	{
		c = line_array[i];
		if (c == '(')
			pc++;
		else if (c == ')')
			pc--;
		if (c == '"')
			quoted = !quoted;
		if (!quoted && line_array[i] == ' ' && pc == 0) {
			if (i > i0 + 1)
				split.push(line.slice(i0 + 1, i));
			i0 = i;
		}
	}
	if (i > i0 + 1)
		split.push(line.slice(i0 + 1, i));
	i0 = i;
	return split;
};

var splitonce = function (line, delim)
{
	/* reader */
	var p = line.indexOf(delim);
	return [line.slice(0, p), line.slice(p + 1)];
};

var splitSGroupDef = function (line)
{
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
				line = line.slice(i + 1).strip();
				i = 0;
			}
		}
	}
	if (braceBalance != 0)
		throw 'Brace balance broken. S-group properies invalid!';
	if (line.length > 0)
		split.push(line.strip());
	return split;
};

var parseBracedNumberList = function (line, shift)
{
	/* reader */
	if (!line)
		return null;
	var list = [];
	line = line.strip();
	line = line.substr(1, line.length - 2);
	var split = line.split(' ');
	shift = shift || 0;
	for (var i = 1; i < split.length; ++i) { // skip the first element
		list.push(split[i] - 0 + shift);
	}
	return list;
};

var v3000parseCollection = function (ctab, ctabLines, shift)
{
	/* reader */
	shift++;
	while (ctabLines[shift].strip() != 'M  V30 END COLLECTION')
		shift++;
	shift++;
	return shift;
};

var v3000parseSGroup = function (ctab, ctabLines, sgroups, atomMap, shift)
{
	/* reader */
	var line = '';
	shift++;
	while (shift < ctabLines.length) {
		line = stripV30(ctabLines[shift++]).strip();
		if (line.strip() == 'END SGROUP')
			return shift;
		while (line.charAt(line.length - 1) == '-')
			line = (line.substr(0, line.length - 1) +
			stripV30(ctabLines[shift++])).strip();
		var split = splitSGroupDef(line);
		var type = split[1];
		var sg = new Struct.SGroup(type);
		sg.number = split[0] - 0;
		sg.type = type;
		sg.label = split[2] - 0;
		sgroups[sg.number] = sg;
		var props = {};
		for (var i = 3; i < split.length; ++i) {
			var subsplit = splitonce(split[i], '=');
			if (subsplit.length != 2) {
				throw 'A record of form AAA=BBB or AAA=(...) expected, got \'' + split[i] + '\'';
			}
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
		if (props['MULT']) {
			sg.data.subscript = props['MULT'][0] - 0;
		}
		if (props['LABEL']) {
			sg.data.subscript = props['LABEL'][0].strip();
		}
		if (props['CONNECT']) {
			sg.data.connectivity = props['CONNECT'][0].toLowerCase();
		}
		if (props['FIELDDISP']) {
			applyDataSGroupInfo(sg, stripQuotes(props['FIELDDISP'][0]));
		}
		if (props['FIELDDATA']) {
			applyDataSGroupData(sg, props['FIELDDATA'][0], true);
		}
		if (props['FIELDNAME']) {
			applyDataSGroupName(sg, props['FIELDNAME'][0]);
		}
		if (props['QUERYTYPE']) {
			applyDataSGroupQuery(sg, props['QUERYTYPE'][0]);
		}
		if (props['QUERYOP']) {
			applyDataSGroupQueryOp(sg, props['QUERYOP'][0]);
		}
		loadSGroup(ctab, sg, atomMap);
	}
	throw new Error('S-group declaration incomplete.');
};

var parseCTabV3000 = function (ctabLines, norgroups)
{
	/* reader */
	var ctab = new Struct();

	var shift = 0;
	if (ctabLines[shift++].strip() != 'M  V30 BEGIN CTAB')
		throw Error('CTAB V3000 invalid');
	if (ctabLines[shift].slice(0, 13) != 'M  V30 COUNTS')
		throw Error('CTAB V3000 invalid');
	var vals = ctabLines[shift].slice(14).split(' ');
	ctab.isChiral = (parseDecimalInt(vals[4]) == 1);
	shift++;

	if (ctabLines[shift].strip() == 'M  V30 BEGIN ATOM') {
		shift++;
		var line;
		while (shift < ctabLines.length) {
			line = stripV30(ctabLines[shift++]).strip();
			if (line == 'END ATOM')
				break;
			while (line.charAt(line.length - 1) == '-')
				line = (line.substring(0, line.length - 1) + stripV30(ctabLines[shift++])).strip();
			ctab.atoms.add(parseAtomLineV3000(line));
		}

		if (ctabLines[shift].strip() == 'M  V30 BEGIN BOND')
		{
			shift++;
			while (shift < ctabLines.length) {
				line = stripV30(ctabLines[shift++]).strip();
				if (line == 'END BOND')
					break;
				while (line.charAt(line.length - 1) == '-')
					line = (line.substring(0, line.length - 1) + stripV30(ctabLines[shift++])).strip();
				ctab.bonds.add(parseBondLineV3000(line));
			}
		}

		// TODO: let sections follow in arbitrary order
		var sgroups = {};
		var atomMap = {};

		while (ctabLines[shift].strip() != 'M  V30 END CTAB') {
			if (ctabLines[shift].strip() == 'M  V30 BEGIN COLLECTION') {
				// TODO: read collection information
				shift = v3000parseCollection(ctab, ctabLines, shift);
			} else if (ctabLines[shift].strip() == 'M  V30 BEGIN SGROUP') {
				shift = v3000parseSGroup(ctab, ctabLines, sgroups, atomMap, shift);
			} else {
				throw Error('CTAB V3000 invalid');
			}
		}
	}
	if (ctabLines[shift++].strip() != 'M  V30 END CTAB')
		throw Error('CTAB V3000 invalid');

	if (!norgroups) {
		readRGroups3000(ctab, ctabLines.slice(shift));
	}

	return ctab;
};

var readRGroups3000 = function (ctab, /* string */ ctabLines) /* Struct */
{
	/* reader */
	var rfrags = {};
	var rLogic = {};
	var shift = 0;
	while (shift < ctabLines.length && ctabLines[shift].search('M  V30 BEGIN RGROUP') == 0)
	{
		var id = ctabLines[shift++].split(' ').pop();
		rfrags[id] = [];
		rLogic[id] = {};
		while (true) {
			var line = ctabLines[shift].strip();
			if (line.search('M  V30 RLOGIC') == 0) {
				line = line.slice(13);
				var rlsplit = line.strip().split(/\s+/g);
				var iii = parseDecimalInt(rlsplit[0]);
				var hhh = parseDecimalInt(rlsplit[1]);
				var ooo = rlsplit.slice(2).join(' ');
				var logic = {};
				if (iii > 0)
					logic.ifthen = iii;
				logic.resth = hhh == 1;
				logic.range = ooo;
				rLogic[id] = logic;
				shift++;
				continue;
			}
			if (line != 'M  V30 BEGIN CTAB')
				throw Error('CTAB V3000 invalid');
			for (var i = 0; i < ctabLines.length; ++i)
				if (ctabLines[shift + i].strip() == 'M  V30 END CTAB')
					break;
			var lines = ctabLines.slice(shift, shift + i + 1);
			var rfrag = parseCTabV3000(lines, true);
			rfrags[id].push(rfrag);
			shift = shift + i + 1;
			if (ctabLines[shift].strip() == 'M  V30 END RGROUP') {
				shift++;
				break;
			}
		}
	}

	for (var rgid in rfrags) {
		for (var j = 0; j < rfrags[rgid].length; ++j) {
			var rg = rfrags[rgid][j];
			rg.rgroups.set(rgid, new Struct.RGroup(rLogic[rgid]));
			var frid = rg.frags.add({});
			rg.rgroups.get(rgid).frags.add(frid);
			rg.atoms.each(function (aid, atom) { atom.fragment = frid; });
			rg.mergeInto(ctab);
		}
	}
};

var parseMol = function (/* string */ ctabLines) /* Struct */
{
	/* reader */
	if (ctabLines[0].search('\\$MDL') == 0) {
		return parseRg2000(ctabLines);
	}
	var struct = parseCTab(ctabLines.slice(3));
	struct.name = ctabLines[0].strip();
	return struct;
};

var parseCTab = function (/* string */ ctabLines) /* Struct */
{
	/* reader */
	var countsSplit = partitionLine(ctabLines[0], fmtInfo.countsLinePartition);
	var version = countsSplit[11].strip();
	ctabLines = ctabLines.slice(1);
	if (version == 'V2000')
		return parseCTabV2000(ctabLines, countsSplit);
	else if (version == 'V3000')
		return parseCTabV3000(ctabLines, !Molfile.loadRGroupFragments);
	else
		throw Error('Molfile version unknown: ' + version);
};

var prepareSruForSaving = function (sgroup, mol) {
	var xBonds = [];
	mol.bonds.each(function (bid, bond) {
		var a1 = mol.atoms.get(bond.begin);
		var a2 = mol.atoms.get(bond.end);
		if (Set.contains(a1.sgs, sgroup.id) && !Set.contains(a2.sgs, sgroup.id) ||
			Set.contains(a2.sgs, sgroup.id) && !Set.contains(a1.sgs, sgroup.id))
			xBonds.push(bid);
	}, sgroup);
	if (xBonds.length != 0 && xBonds.length != 2)
		throw { 'id': sgroup.id, 'error-type': 'cross-bond-number', 'message': 'Unsupported cross-bonds number' };
	sgroup.bonds = xBonds;
};

var prepareSupForSaving = function (sgroup, mol) {
	// This code is also used for GroupSru and should be moved into a separate common method
	// It seems that such code should be used for any sgroup by this this should be checked
	var xBonds = [];
	mol.bonds.each(function (bid, bond) {
		var a1 = mol.atoms.get(bond.begin);
		var a2 = mol.atoms.get(bond.end);
		if (Set.contains(a1.sgs, sgroup.id) && !Set.contains(a2.sgs, sgroup.id) ||
			Set.contains(a2.sgs, sgroup.id) && !Set.contains(a1.sgs, sgroup.id))
			xBonds.push(bid);
	}, sgroup);
	sgroup.bonds = xBonds;
};

var prepareGenForSaving = function (sgroup, mol) {
};

var prepareDatForSaving = function (sgroup, mol) {
	sgroup.atoms = Struct.SGroup.getAtoms(mol, sgroup);
};

var prepareForSaving = {
	'MUL': Struct.SGroup.prepareMulForSaving,
	'SRU': prepareSruForSaving,
	'SUP': prepareSupForSaving,
	'DAT': prepareDatForSaving,
	'GEN': prepareGenForSaving
};

Molfile.prototype.prepareSGroups = function (skipErrors, preserveIndigoDesc) {
	var mol = this.molecule;
	var toRemove = [];
	var errors = 0;

	this.molecule.sGroupForest.getSGroupsBFS().reverse().forEach(function (id) {
		var sgroup = mol.sgroups.get(id);
		var errorIgnore = false;

		try {
			prepareForSaving[sgroup.type](sgroup, mol);
		} catch (ex) {
			if (!skipErrors || typeof (ex.id) != 'number')
				throw ex;
			errorIgnore = true;
		}
		if (errorIgnore ||
			!preserveIndigoDesc && /^INDIGO_.+_DESC$/i.test(sgroup.data.fieldName)) {
			errors += errorIgnore;
			toRemove.push(sgroup.id);
		}
	}, this);
	if (errors) {
		alert('WARNING: ' + errors + ' invalid S-groups were detected. They will be omitted.');
	}

	for (var i = 0; i < toRemove.length; ++i) {
		mol.sGroupDelete(toRemove[i]);
	}
	return mol;
};

Molfile.prototype.getCTab = function (molecule, rgroups)
{
	/* saver */
	this.molecule = molecule.clone();
	this.molfile = '';
	this.writeCTab2000(rgroups);
	return this.molfile;
};

Molfile.prototype.saveMolecule = function (molecule, skipSGroupErrors, norgroups, preserveIndigoDesc)
{
	/* saver */
	this.reaction = molecule.rxnArrows.count() > 0;
	if (molecule.rxnArrows.count() > 1)
		throw new Error('Reaction may not contain more than one arrow');
	this.molfile = '';
	if (this.reaction) {
		if (molecule.rgroups.count() > 0)
			throw new Error('Unable to save the structure - reactions with r-groups are not supported at the moment');
		var components = molecule.getComponents();

		var reactants = components.reactants, products = components.products, all = reactants.concat(products);
		this.molfile = '$RXN\n\n\n\n' + paddedNum(reactants.length, 3) + paddedNum(products.length, 3) + paddedNum(0, 3) + '\n';
		for (var i = 0; i < all.length; ++i) {
			var saver = new Molfile(false);
			var submol = molecule.clone(all[i], null, true);
			var molfile = saver.saveMolecule(submol, false, true);
			this.molfile += '$MOL\n' + molfile;
		}
		return this.molfile;
	}

	if (molecule.rgroups.count() > 0) {
		if (norgroups) {
			molecule = molecule.getScaffold();
		} else {
			var scaffold = new Molfile(false).getCTab(molecule.getScaffold(), molecule.rgroups);
			this.molfile = '$MDL  REV  1\n$MOL\n$HDR\n\n\n\n$END HDR\n';
			this.molfile += '$CTAB\n' + scaffold + '$END CTAB\n';

			molecule.rgroups.each(function (rgid, rg) {
				this.molfile += '$RGP\n';
				this.writePaddedNumber(rgid, 3);
				this.molfile += '\n';
				rg.frags.each(function (fnum, fid) {
					var group = new Molfile(false).getCTab(molecule.getFragment(fid));
					this.molfile += '$CTAB\n' + group + '$END CTAB\n';
				}, this);
				this.molfile += '$END RGP\n';
			}, this);
			this.molfile += '$END MOL\n';

			return this.molfile;
		}
	}

	this.molecule = molecule.clone();

	this.prepareSGroups(skipSGroupErrors, preserveIndigoDesc);

	this.writeHeader();

	// TODO: saving to V3000
	this.writeCTab2000();

	return this.molfile;
};

Molfile.prototype.writeHeader = function ()
{
	/* saver */

	var date = new Date();

	this.writeCR(); // TODO: write structure name
	this.writeWhiteSpace(2);
	this.write('Ketcher');
	this.writeWhiteSpace();
	this.writeCR((date.getMonth() + 1).toPaddedString(2) + date.getDate().toPaddedString(2) + (date.getFullYear() % 100).toPaddedString(2) +
	date.getHours().toPaddedString(2) + date.getMinutes().toPaddedString(2) + '2D 1   1.00000     0.00000     0');
	this.writeCR();
};

Molfile.prototype.write = function (str)
{
	/* saver */
	this.molfile += str;
};

Molfile.prototype.writeCR = function (str)
{
	/* saver */
	if (arguments.length == 0)
		str = '';

	this.molfile += str + '\n';
};

Molfile.prototype.writeWhiteSpace = function (length)
{
	/* saver */

	if (arguments.length == 0)
		length = 1;

	length.times(function ()
	{
		this.write(' ');
	}, this);
};

Molfile.prototype.writePadded = function (str, width)
{
	/* saver */
	this.write(str);
	this.writeWhiteSpace(width - str.length);
};

Molfile.prototype.writePaddedNumber = function (number, width)
{
	/* saver */

	var str = (number - 0).toString();

	this.writeWhiteSpace(width - str.length);
	this.write(str);
};

Molfile.prototype.writePaddedFloat = function (number, width, precision)
{
	/* saver */

	this.write(paddedNum(number, width, precision));
};

Molfile.prototype.writeCTab2000Header = function ()
{
	/* saver */

	this.writePaddedNumber(this.molecule.atoms.count(), 3);
	this.writePaddedNumber(this.molecule.bonds.count(), 3);

	this.writePaddedNumber(0, 3);
	this.writeWhiteSpace(3);
	this.writePaddedNumber(this.molecule.isChiral ? 1 : 0, 3);
	this.writePaddedNumber(0, 3);
	this.writeWhiteSpace(12);
	this.writePaddedNumber(999, 3);
	this.writeCR(' V2000');
};

var makeAtomBondLines = function (prefix, idstr, ids, map) {
	if (!ids)
		return [];
	var lines = [];
	for (var i = 0; i < Math.floor((ids.length + 14) / 15); ++i) {
		var rem = Math.min(ids.length - 15 * i, 15);
		var salLine = 'M  ' + prefix + ' ' + idstr + ' ' + paddedNum(rem, 2);
		for (var j = 0; j < rem; ++j) {
			salLine += ' ' + paddedNum(map[ids[i * 15 + j]], 3);
		}
		lines.push(salLine);
	}
	return lines;
};

var bracketsToMolfile = function (mol, sg, idstr) {
	var inBonds = [], xBonds = [];
	var atomSet = Set.fromList(sg.atoms);
	Struct.SGroup.getCrossBonds(inBonds, xBonds, mol, atomSet);
	Struct.SGroup.bracketPos(sg, null, mol, xBonds);
	var bb = sg.bracketBox;
	var d = sg.bracketDir, n = d.rotateSC(1, 0);
	var brackets = Struct.SGroup.getBracketParameters(mol, xBonds, atomSet, bb, d, n, null, sg.id);
	var lines = [];
	for (var i = 0; i < brackets.length; ++i) {
		var bracket = brackets[i];
		var a0 = bracket.c.addScaled(bracket.n, -0.5 * bracket.h).yComplement();
		var a1 = bracket.c.addScaled(bracket.n, 0.5 * bracket.h).yComplement();
		var line = 'M  SDI ' + idstr + paddedNum(4, 3);
		var coord = [a0.x, a0.y, a1.x, a1.y];
		for (var j = 0; j < coord.length; ++j) {
			line += paddedNum(coord[j], 10, 4);
		}
		lines.push(line);
	}
	return lines;
};

var saveMulToMolfile = function (sgroup, mol, sgMap, atomMap, bondMap) {
	var idstr = (sgMap[sgroup.id] + '').padStart(3);

	var lines = [];
	lines = lines.concat(makeAtomBondLines('SAL', idstr, Object.keys(sgroup.atomSet), atomMap)); // TODO: check atomSet
	lines = lines.concat(makeAtomBondLines('SPA', idstr, Object.keys(sgroup.parentAtomSet), atomMap));
	lines = lines.concat(makeAtomBondLines('SBL', idstr, sgroup.bonds, bondMap));
	var smtLine = 'M  SMT ' + idstr + ' ' + sgroup.data.mul;
	lines.push(smtLine);
	lines = lines.concat(bracketsToMolfile(mol, sgroup, idstr));
	return lines.join('\n');
};

var saveSruToMolfile = function (sgroup, mol, sgMap, atomMap, bondMap) {
	var idstr = (sgMap[sgroup.id] + '').padStart(3);

	var lines = [];
	lines = lines.concat(makeAtomBondLines('SAL', idstr, sgroup.atoms, atomMap));
	lines = lines.concat(makeAtomBondLines('SBL', idstr, sgroup.bonds, bondMap));
	lines = lines.concat(bracketsToMolfile(mol, sgroup, idstr));
	return lines.join('\n');
};

var saveSupToMolfile = function (sgroup, mol, sgMap, atomMap, bondMap) {
	var idstr = (sgMap[sgroup.id] + '').padStart(3);

	var lines = [];
	lines = lines.concat(makeAtomBondLines('SAL', idstr, sgroup.atoms, atomMap));
	lines = lines.concat(makeAtomBondLines('SBL', idstr, sgroup.bonds, bondMap));
	if (sgroup.data.name && sgroup.data.name != '')
		lines.push('M  SMT ' + idstr + ' ' + sgroup.data.name);
	return lines.join('\n');
};

var saveDatToMolfile = function (sgroup, mol, sgMap, atomMap, bondMap) {
	var idstr = (sgMap[sgroup.id] + '').padStart(3);

	var data = sgroup.data;
	var pp = sgroup.pp;
	if (!data.absolute)
		pp = pp.sub(Struct.SGroup.getMassCentre(mol, sgroup.atoms));
	var lines = [];
	lines = lines.concat(makeAtomBondLines('SAL', idstr, sgroup.atoms, atomMap));
	var sdtLine = 'M  SDT ' + idstr + ' ' +
	    (data.fieldName || '').padEnd(30) +
	    (data.fieldType || '').padStart(2) +
	    (data.units || '').padEnd(20) +
	    (data.query || '').padStart(2);

	if (data.queryOp)    // see gitlab #184
		sdtLine += data.queryOp.padEnd(80 - 65);

	lines.push(sdtLine);
	var sddLine = 'M  SDD ' + idstr +
			' ' + paddedNum(pp.x, 10, 4) + paddedNum(-pp.y, 10, 4) +
			'    ' + // ' eee'
			(data.attached ? 'A' : 'D') + // f
			(data.absolute ? 'A' : 'R') + // g
			(data.showUnits ? 'U' : ' ') + // h
			'   ' + //  i
			(data.nCharnCharsToDisplay >= 0 ? paddedNum(data.nCharnCharsToDisplay, 3) : 'ALL') + // jjj
			'  1   ' + // 'kkk ll '
	    (data.tagChar || ' ') + // m
			'  ' + paddedNum(data.daspPos, 1) + // n
			'  '; // oo
	lines.push(sddLine);
	var val = normalizeNewlines(data.fieldValue).replace(/\n*$/, '');
	var charsPerLine = 69;
	val.split('\n').each(function (chars) {
		while (chars.length > charsPerLine) {
			lines.push('M  SCD ' + idstr + ' ' + chars.slice(0, charsPerLine));
			chars = chars.slice(charsPerLine);
		}
		lines.push('M  SED ' + idstr + ' ' + chars);
	});
	return lines.join('\n');
};

var saveGenToMolfile = function (sgroup, mol, sgMap, atomMap, bondMap) {
	var idstr = (sgMap[sgroup.id] + '').padStart(3);

	var lines = [];
	lines = lines.concat(makeAtomBondLines('SAL', idstr, sgroup.atoms, atomMap));
	lines = lines.concat(makeAtomBondLines('SBL', idstr, sgroup.bonds, bondMap));
	lines = lines.concat(bracketsToMolfile(mol, sgroup, idstr));
	return lines.join('\n');
};

var saveToMolfile = {
	'MUL': saveMulToMolfile,
	'SRU': saveSruToMolfile,
	'SUP': saveSupToMolfile,
	'DAT': saveDatToMolfile,
	'GEN': saveGenToMolfile
};

Molfile.prototype.writeCTab2000 = function (rgroups)
{
	/* saver */
	this.writeCTab2000Header();

	this.mapping = {};
	var i = 1;

	var atomList_list = [];
	var atomLabel_list = [];
	this.molecule.atoms.each(function (id, atom)
	{
		this.writePaddedFloat(atom.pp.x, 10, 4);
		this.writePaddedFloat(-atom.pp.y, 10, 4);
		this.writePaddedFloat(atom.pp.z, 10, 4);
		this.writeWhiteSpace();

		var label = atom.label;
		if (atom.atomList != null) {
			label = 'L';
			atomList_list.push(id);
		} else if (element.getElementByLabel(label) == null && ['A', 'Q', 'X', '*', 'R#'].indexOf(label) == -1) {
			label = 'C';
			atomLabel_list.push(id);
		}
		this.writePadded(label, 3);
		this.writePaddedNumber(0, 2);
		this.writePaddedNumber(0, 3);
		this.writePaddedNumber(0, 3);

		if (Object.isUndefined(atom.hCount))
			atom.hCount = 0;
		this.writePaddedNumber(atom.hCount, 3);

		if (Object.isUndefined(atom.stereoCare))
			atom.stereoCare = 0;
		this.writePaddedNumber(atom.stereoCare, 3);

		this.writePaddedNumber(atom.explicitValence < 0 ? 0 : (atom.explicitValence == 0 ? 15 : atom.explicitValence), 3);

		this.writePaddedNumber(0, 3);
		this.writePaddedNumber(0, 3);
		this.writePaddedNumber(0, 3);

		if (Object.isUndefined(atom.aam))
			atom.aam = 0;
		this.writePaddedNumber(atom.aam, 3);

		if (Object.isUndefined(atom.invRet))
			atom.invRet = 0;
		this.writePaddedNumber(atom.invRet, 3);

		if (Object.isUndefined(atom.exactChangeFlag))
			atom.exactChangeFlag = 0;
		this.writePaddedNumber(atom.exactChangeFlag, 3);

		this.writeCR();

		this.mapping[id] = i;
		i++;
	}, this);

	this.bondMapping = {};
	i = 1;
	this.molecule.bonds.each(function (id, bond)
	{
		this.bondMapping[id] = i++;
		this.writePaddedNumber(this.mapping[bond.begin], 3);
		this.writePaddedNumber(this.mapping[bond.end], 3);
		this.writePaddedNumber(bond.type, 3);

		if (Object.isUndefined(bond.stereo))
			bond.stereo = 0;
		this.writePaddedNumber(bond.stereo, 3);

		this.writeWhiteSpace(3);

		if (Object.isUndefined(bond.topology))
			bond.topology = 0;
		this.writePaddedNumber(bond.topology, 3);

		if (Object.isUndefined(bond.reactingCenterStatus))
			bond.reactingCenterStatus = 0;
		this.writePaddedNumber(bond.reactingCenterStatus, 3);

		this.writeCR();
	}, this);

	while (atomLabel_list.length > 0) {
		this.write('A  '); this.writePaddedNumber(atomLabel_list[0] + 1, 3); this.writeCR();
		this.writeCR(this.molecule.atoms.get(atomLabel_list[0]).label);
		atomLabel_list.splice(0, 1);
	}

	var charge_list = new Array();
	var isotope_list = new Array();
	var radical_list = new Array();
	var rglabel_list = new Array();
	var rglogic_list = new Array();
	var aplabel_list = new Array();
	var rbcount_list = new Array();
	var unsaturated_list = new Array();
	var substcount_list = new Array();

	this.molecule.atoms.each(function (id, atom)
	{
		if (atom.charge != 0)
			charge_list.push([id, atom.charge]);
		if (atom.isotope != 0)
			isotope_list.push([id, atom.isotope]);
		if (atom.radical != 0)
			radical_list.push([id, atom.radical]);
		if (atom.rglabel != null && atom.label == 'R#') { // TODO need to force rglabel=null when label is not 'R#'
			for (var rgi = 0; rgi < 32; rgi++) {
				if (atom.rglabel & (1 << rgi)) rglabel_list.push([id, rgi + 1]);
			}
		}
		if (atom.attpnt != null)
			aplabel_list.push([id, atom.attpnt]);
		if (atom.ringBondCount != 0)
			rbcount_list.push([id, atom.ringBondCount]);
		if (atom.substitutionCount != 0)
			substcount_list.push([id, atom.substitutionCount]);
		if (atom.unsaturatedAtom != 0)
			unsaturated_list.push([id, atom.unsaturatedAtom]);
	});

	if (rgroups)
		rgroups.each(function (rgid, rg) {
			if (rg.resth || rg.ifthen > 0 || rg.range.length > 0) {
				var line = '  1 ' + paddedNum(rgid, 3) + ' ' + paddedNum(rg.ifthen, 3) + ' ' + paddedNum(rg.resth ? 1 : 0, 3) + '   ' + rg.range;
				rglogic_list.push(line);
			}
		});

	var writeAtomPropList = function (prop_id, values)
	{
		while (values.length > 0)
		{
			var part = new Array();

			while (values.length > 0 && part.length < 8)
			{
				part.push(values[0]);
				values.splice(0, 1);
			}

			this.write(prop_id);
			this.writePaddedNumber(part.length, 3);

			part.each(function (value)
			{
				this.writeWhiteSpace();
				this.writePaddedNumber(this.mapping[value[0]], 3);
				this.writeWhiteSpace();
				this.writePaddedNumber(value[1], 3);
			}, this);

			this.writeCR();
		}
	};

	writeAtomPropList.call(this, 'M  CHG', charge_list);
	writeAtomPropList.call(this, 'M  ISO', isotope_list);
	writeAtomPropList.call(this, 'M  RAD', radical_list);
	writeAtomPropList.call(this, 'M  RGP', rglabel_list);
	for (var j = 0; j < rglogic_list.length; ++j) {
		this.write('M  LOG' + rglogic_list[j] + '\n');
	}
	writeAtomPropList.call(this, 'M  APO', aplabel_list);
	writeAtomPropList.call(this, 'M  RBC', rbcount_list);
	writeAtomPropList.call(this, 'M  SUB', substcount_list);
	writeAtomPropList.call(this, 'M  UNS', unsaturated_list);

	if (atomList_list.length > 0)
	{
		for (j = 0; j < atomList_list.length; ++j) {
			var aid = atomList_list[j];
			var atomList = this.molecule.atoms.get(aid).atomList;
			this.write('M  ALS');
			this.writePaddedNumber(aid + 1, 4);
			this.writePaddedNumber(atomList.ids.length, 3);
			this.writeWhiteSpace();
			this.write(atomList.notList ? 'T' : 'F');

			var labelList = atomList.labelList();
			for (var k = 0; k < labelList.length; ++k) {
				this.writeWhiteSpace();
				this.writePadded(labelList[k], 3);
			}
			this.writeCR();
		}
	}

	var sgmap = {}, cnt = 1, sgmapback = {};
	var sgorder = this.molecule.sGroupForest.getSGroupsBFS();
	sgorder.forEach(function (id) {
		sgmapback[cnt] = id;
		sgmap[id] = cnt++;
	}, this);
	for (var q = 1; q < cnt; ++q) { // each group on its own
		var id = sgmapback[q];
		var sgroup = this.molecule.sgroups.get(id);
		this.write('M  STY');
		this.writePaddedNumber(1, 3);
		this.writeWhiteSpace(1);
		this.writePaddedNumber(q, 3);
		this.writeWhiteSpace(1);
		this.writePadded(sgroup.type, 3);
		this.writeCR();

		// TODO: write subtype, M SST

		this.write('M  SLB');
		this.writePaddedNumber(1, 3);
		this.writeWhiteSpace(1);
		this.writePaddedNumber(q, 3);
		this.writeWhiteSpace(1);
		this.writePaddedNumber(q, 3);
		this.writeCR();

		var parentid = this.molecule.sGroupForest.parent.get(id);
		if (parentid >= 0) {
			this.write('M  SPL');
			this.writePaddedNumber(1, 3);
			this.writeWhiteSpace(1);
			this.writePaddedNumber(q, 3);
			this.writeWhiteSpace(1);
			this.writePaddedNumber(sgmap[parentid], 3);
			this.writeCR();
		}

		// connectivity
		if (sgroup.type == 'SRU' && sgroup.data.connectivity) {
			var connectivity = '';
			connectivity += ' ';
			connectivity += q.toString().padStart(3);
			connectivity += ' ';
			connectivity += (sgroup.data.connectivity || '').padEnd(3);
			this.write('M  SCN');
			this.writePaddedNumber(1, 3);
			this.write(connectivity.toUpperCase());
			this.writeCR();
		}

		if (sgroup.type == 'SRU') {
			this.write('M  SMT ');
			this.writePaddedNumber(q, 3);
			this.writeWhiteSpace();
			this.write(sgroup.data.subscript || 'n');
			this.writeCR();
		}

		this.writeCR(saveToMolfile[sgroup.type](sgroup, this.molecule, sgmap, this.mapping, this.bondMapping));
	}

	// TODO: write M  APO
	// TODO: write M  AAL
	// TODO: write M  RGP
	// TODO: write M  LOG

	this.writeCR('M  END');
};

var parseRxn = function (/* string[] */ ctabLines) /* Struct */
{
	/* reader */
	var split = ctabLines[0].strip().split(' ');
	if (split.length > 1 && split[1] == 'V3000')
		return parseRxn3000(ctabLines);
	else
		return parseRxn2000(ctabLines);
};

var parseRxn2000 = function (/* string[] */ ctabLines) /* Struct */
{
	/* reader */
	ctabLines = ctabLines.slice(4);
	var countsSplit = partitionLine(ctabLines[0], fmtInfo.rxnItemsPartition);
	var nReactants = countsSplit[0] - 0,
		nProducts = countsSplit[1] - 0,
		nAgents = countsSplit[2] - 0;
	ctabLines = ctabLines.slice(1); // consume counts line

	var mols = [];
	while (ctabLines.length > 0 && ctabLines[0].substr(0, 4) == '$MOL') {
		ctabLines = ctabLines.slice(1);
		var n = 0; while (n < ctabLines.length && ctabLines[n].substr(0, 4) != '$MOL') n++;
		mols.push(parseMol(ctabLines.slice(0, n)));
		ctabLines = ctabLines.slice(n);
	}
	return rxnMerge(mols, nReactants, nProducts, nAgents);
};

var parseRxn3000 = function (/* string[] */ ctabLines) /* Struct */
{
	/* reader */
	ctabLines = ctabLines.slice(4);
	var countsSplit = ctabLines[0].split(/\s+/g).slice(3);
	var nReactants = countsSplit[0] - 0,
		nProducts = countsSplit[1] - 0,
		nAgents = countsSplit.length > 2 ? countsSplit[2] - 0 : 0;

	var assert = function (condition) {
		util.assert(condition, 'CTab format invalid');
	};

	var findCtabEnd = function (i) {
		for (var j = i; j < ctabLines.length; ++j) {
			if (ctabLines[j].strip() == 'M  V30 END CTAB')
				return j;
		}
		assert(false);
	};

	var findRGroupEnd = function (i) {
		for (var j = i; j < ctabLines.length; ++j)
			if (ctabLines[j].strip() == 'M  V30 END RGROUP')
				return j;
		assert(false);
	};

	var molLinesReactants = [], molLinesProducts = [], current = null, rGroups = [];
	for (var i = 0; i < ctabLines.length; ++i) {
		var line = ctabLines[i].strip();

		if (line.startsWith('M  V30 COUNTS')) {
			// do nothing
		} else if (line == 'M  END') {
			break; // stop reading
		} else if (line == 'M  V30 BEGIN PRODUCT') {
			assert(current == null);
			current = molLinesProducts;
		} else if (line == 'M  V30 END PRODUCT') {
			assert(current === molLinesProducts);
			current = null;
		} else if (line == 'M  V30 BEGIN REACTANT') {
			assert(current == null);
			current = molLinesReactants;
		} else if (line == 'M  V30 END REACTANT') {
			assert(current === molLinesReactants);
			current = null;
		} else if (line.startsWith('M  V30 BEGIN RGROUP')) {
			assert(current == null);
			var j = findRGroupEnd(i);
			rGroups.push(ctabLines.slice(i, j + 1));
			i = j;
		} else if (line == 'M  V30 BEGIN CTAB') {
			var j = findCtabEnd(i);
			current.push(ctabLines.slice(i, j + 1));
			i = j;
		} else {
			throw new Error('line unrecognized: ' + line);
		}
	}
	var mols = [];
	var molLines = molLinesReactants.concat(molLinesProducts);
	for (var j = 0; j < molLines.length; ++j) {
		var mol = parseCTabV3000(molLines[j], countsSplit);
		mols.push(mol);
	}
	var ctab = rxnMerge(mols, nReactants, nProducts, nAgents);

	readRGroups3000(ctab, function (array) {
		var res = [];
		for (var k = 0; k < array.length; ++k) {
			res = res.concat(array[k]);
		}
		return res;
	}(rGroups));

	return ctab;
};

var rxnMerge = function (mols, nReactants, nProducts, nAgents) /* Struct */
{
	/* reader */
	var ret = new Struct();
	var bbReact = [],
		bbAgent = [],
		bbProd = [];
	var molReact = [],
		molAgent = [],
		molProd = [];
	var j;
	var bondLengthData = { cnt: 0, totalLength: 0 };
	for (j = 0; j < mols.length; ++j) {
		var mol = mols[j];
		var bondLengthDataMol = mol.getBondLengthData();
		bondLengthData.cnt += bondLengthDataMol.cnt;
		bondLengthData.totalLength += bondLengthDataMol.totalLength;
	}
	var avgBondLength = 1 / (bondLengthData.cnt == 0 ? 1 : bondLengthData.totalLength / bondLengthData.cnt);
	for (j = 0; j < mols.length; ++j) {
		mol = mols[j];
		mol.scale(avgBondLength);
	}

	for (j = 0; j < mols.length; ++j) {
		mol = mols[j];
		var bb = mol.getCoordBoundingBoxObj();
		if (!bb)
			continue;

		var fragmentType = (j < nReactants ? FRAGMENT.REACTANT :
			(j < nReactants + nProducts ? FRAGMENT.PRODUCT :
					FRAGMENT.AGENT));
		if (fragmentType == FRAGMENT.REACTANT) {
			bbReact.push(bb);
			molReact.push(mol);
		} else if (fragmentType == FRAGMENT.AGENT) {
			bbAgent.push(bb);
			molAgent.push(mol);
		} else if (fragmentType == FRAGMENT.PRODUCT) {
			bbProd.push(bb);
			molProd.push(mol);
		}

		mol.atoms.each(function (aid, atom) {
			atom.rxnFragmentType = fragmentType;
		});
	}

	// reaction fragment layout
	var xorig = 0;
	var shiftMol = function (ret, mol, bb, xorig, over) {
		var d = new Vec2(xorig - bb.min.x, over ? 1 - bb.min.y : -(bb.min.y + bb.max.y) / 2);
		mol.atoms.each(function (aid, atom) {
			atom.pp.add_(d);
		});
		mol.sgroups.each(function (id, item) {
			if (item.pp)
				item.pp.add_(d);
		});
		bb.min.add_(d);
		bb.max.add_(d);
		mol.mergeInto(ret);
		return bb.max.x - bb.min.x;
	};

	for (j = 0; j < molReact.length; ++j) {
		xorig += shiftMol(ret, molReact[j], bbReact[j], xorig, false) + 2.0;
	}
	xorig += 2.0;
	for (j = 0; j < molAgent.length; ++j) {
		xorig += shiftMol(ret, molAgent[j], bbAgent[j], xorig, true) + 2.0;
	}
	xorig += 2.0;

	for (j = 0; j < molProd.length; ++j) {
		xorig += shiftMol(ret, molProd[j], bbProd[j], xorig, false) + 2.0;
	}

	var bb1, bb2, x, y, bbReactAll = null, bbProdAll = null;
	for (j = 0; j <	bbReact.length - 1; ++j) {
		bb1 = bbReact[j];
		bb2 = bbReact[j + 1];

		x = (bb1.max.x + bb2.min.x) / 2;
		y = (bb1.max.y + bb1.min.y + bb2.max.y + bb2.min.y) / 4;

		ret.rxnPluses.add(new Struct.RxnPlus({ 'pp': new Vec2(x, y) }));
	}
	for (j = 0; j <	bbReact.length; ++j) {
		if (j == 0) {
			bbReactAll = {};
			bbReactAll.max = new Vec2(bbReact[j].max);
			bbReactAll.min = new Vec2(bbReact[j].min);
		} else {
			bbReactAll.max = Vec2.max(bbReactAll.max, bbReact[j].max);
			bbReactAll.min = Vec2.min(bbReactAll.min, bbReact[j].min);
		}
	}
	for (j = 0; j <	bbProd.length - 1; ++j) {
		bb1 = bbProd[j];
		bb2 = bbProd[j + 1];

		x = (bb1.max.x + bb2.min.x) / 2;
		y = (bb1.max.y + bb1.min.y + bb2.max.y + bb2.min.y) / 4;

		ret.rxnPluses.add(new Struct.RxnPlus({ 'pp': new Vec2(x, y) }));
	}
	for (j = 0; j <	bbProd.length; ++j) {
		if (j == 0) {
			bbProdAll = {};
			bbProdAll.max = new Vec2(bbProd[j].max);
			bbProdAll.min = new Vec2(bbProd[j].min);
		} else {
			bbProdAll.max = Vec2.max(bbProdAll.max, bbProd[j].max);
			bbProdAll.min = Vec2.min(bbProdAll.min, bbProd[j].min);
		}
	}
	bb1 = bbReactAll;
	bb2 = bbProdAll;
	if (!bb1 && !bb2) {
		ret.rxnArrows.add(new Struct.RxnArrow({ 'pp': new Vec2(0, 0) }));
	} else {
		var v1 = bb1 ? new Vec2(bb1.max.x, (bb1.max.y + bb1.min.y) / 2) : null;
		var v2 = bb2 ? new Vec2(bb2.min.x, (bb2.max.y + bb2.min.y) / 2) : null;
		var defaultOffset = 3;
		if (!v1)
			v1 = new Vec2(v2.x - defaultOffset, v2.y);
		if (!v2)
			v2 = new Vec2(v1.x + defaultOffset, v1.y);
		ret.rxnArrows.add(new Struct.RxnArrow({ 'pp': Vec2.lc2(v1, 0.5, v2, 0.5) }));
	}
	ret.isReaction = true;
	return ret;
};

var rgMerge = function (scaffold, rgroups) /* Struct */
{
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
			ctab.atoms.each(function (aid, atom) { atom.fragment = frid; });
			ctab.mergeInto(ret);
		}
	}

	return ret;
};

var parseRg2000 = function (/* string[] */ ctabLines) /* Struct */
{
	ctabLines = ctabLines.slice(7);
	if (ctabLines[0].strip() != '$CTAB')
		throw new Error('RGFile format invalid');
	var i = 1; while (ctabLines[i].charAt(0) != '$') i++;
	if (ctabLines[i].strip() != '$END CTAB')
		throw new Error('RGFile format invalid');
	var coreLines = ctabLines.slice(1, i);
	ctabLines = ctabLines.slice(i + 1);
	var fragmentLines = {};
	while (true) {
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
		while (true) {
			if (ctabLines.length == 0)
				throw new Error('Unexpected end of file');
			line = ctabLines[0].strip();
			if (line == '$END RGP') {
				ctabLines = ctabLines.slice(1);
				break;
			}
			if (line != '$CTAB')
				throw new Error('RGFile format invalid');
			i = 1; while (ctabLines[i].charAt(0) != '$') i++;
			if (ctabLines[i].strip() != '$END CTAB')
				throw new Error('RGFile format invalid');
			fragmentLines[rgid].push(ctabLines.slice(1, i));
			ctabLines = ctabLines.slice(i + 1);
		}
	}

	var core = parseCTab(coreLines);
	var frag = {};
	if (Molfile.loadRGroupFragments) {
		for (var id in fragmentLines) {
			frag[id] = [];
			for (var j = 0; j < fragmentLines[id].length; ++j) {
				frag[id].push(parseCTab(fragmentLines[id][j]));
			}
		}
	}
	return rgMerge(core, frag);
};

// Utility functions

function paddedNum(number, width, precision) {
	var numStr = number.toFixed(precision || 0).replace(',', '.'); // Really need to replace?
	if (numStr.length > width) {
		throw new Error('number does not fit');
	}
	return numStr.padStart(width);
}

function stripQuotes(str) {
	if (str[0] === '"' && str[str.length - 1] === '"') {
		return str.substr(1, str.length - 2);
	}
	return str;
}

// According Unicode Consortium sould be
// nlRe = /\r\n|[\n\v\f\r\x85\u2028\u2029]/g;
// http://www.unicode.org/reports/tr18/#Line_Boundaries
var nlRe = /\r\n|[\n\r]/g;

function normalizeNewlines(str) {
	return str.replace(nlRe, '\n');
}

function splitNewlines(str) {
	return str.split(nlRe);
}

module.exports = {
	stringify: function (struct, options) {
		var opts = options || {};
		return new Molfile(opts.v3000).saveMolecule(struct, opts.ignoreErrors,
		                                            opts.noRgroups, opts.preserveIndigoDesc);
	},
	parse: function (str, options) {
		return parseCTFile(str, options || {});
	}
};
