/****************************************************************************
 * Copyright (C) 2009-2010 GGA Software Services LLC
 *
 * This file may be distributed and/or modified under the terms of the
 * GNU Affero General Public License version 3 as published by the Free
 * Software Foundation and appearing in the file LICENSE.GPL included in
 * the packaging of this file.
 *
 * This file is provided AS IS with NO WARRANTY OF ANY KIND, INCLUDING THE
 * WARRANTY OF DESIGN, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
 ***************************************************************************/

if (!window.chem || !util.Vec2 || !chem.Struct)
	throw new Error("Vec2 and Molecule should be defined first");

chem.Molfile = function ()
{};

chem.Molfile.loadRGroupFragments = true; // TODO: set to load the fragments

chem.Molfile.parseDecimalInt = function (str)
{
	var val = parseInt(str, 10);

	return isNaN(val) ? 0 : val;
};

chem.Molfile.partitionLine = function (/*string*/ str, /*array of int*/ parts, /*bool*/ withspace)
{
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

chem.Molfile.partitionLineFixed = function (/*string*/ str, /*int*/ itemLength, /*bool*/ withspace)
{
	var res = [];
	for (var shift = 0; shift < str.length; shift += itemLength)
	{
		res.push(str.slice(shift, shift + itemLength));
		if (withspace)
			shift++;
	}
	return res;
};

chem.Molfile.parseCTFile = function (molfileLines)
{
    var ret = null;
	if (molfileLines[0].search("\\$RXN") == 0)
		ret = chem.Molfile.parseRxn(molfileLines);
	else
		ret = chem.Molfile.parseMol(molfileLines);
    ret.initHalfBonds();
    ret.initNeighbors();
    ret.markFragments();
    return ret;
};

chem.Molfile.fmtInfo = {
	bondTypeMap: {
		1: chem.Struct.BOND.TYPE.SINGLE,
		2: chem.Struct.BOND.TYPE.DOUBLE,
		3: chem.Struct.BOND.TYPE.TRIPLE,
		4: chem.Struct.BOND.TYPE.AROMATIC,
		5: chem.Struct.BOND.TYPE.SINGLE_OR_DOUBLE,
		6: chem.Struct.BOND.TYPE.SINGLE_OR_AROMATIC,
		7: chem.Struct.BOND.TYPE.DOUBLE_OR_AROMATIC,
		8: chem.Struct.BOND.TYPE.ANY
		},
	bondStereoMap: {
		0: chem.Struct.BOND.STEREO.NONE,
		1: chem.Struct.BOND.STEREO.UP,
		4: chem.Struct.BOND.STEREO.EITHER,
		6: chem.Struct.BOND.STEREO.DOWN,
		3: chem.Struct.BOND.STEREO.CIS_TRANS
		},
	v30bondStereoMap: {
		0: chem.Struct.BOND.STEREO.NONE,
		1: chem.Struct.BOND.STEREO.UP,
		2: chem.Struct.BOND.STEREO.EITHER,
		3: chem.Struct.BOND.STEREO.DOWN
		},
	bondTopologyMap: {
		0: chem.Struct.BOND.TOPOLOGY.EITHER,
		1: chem.Struct.BOND.TOPOLOGY.RING,
		2: chem.Struct.BOND.TOPOLOGY.CHAIN
		},
	countsLinePartition: [3,3,3,3,3,3,3,3,3,3,3,6],
	atomLinePartition: [10,10,10,1,3,2,3,3,3,3,3,3,3,3,3,3,3],
	bondLinePartition: [3,3,3,3,3,3,3],
	atomListHeaderPartition: [3,1,1,4,1,1],
	atomListHeaderLength: 11, // = atomListHeaderPartition.reduce(function(a,b) { return a + b; }, 0)
	atomListHeaderItemLength: 4,
	chargeMap: [0, +3, +2, +1, 0, -1, -2, -3],
	valenceMap: [undefined, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0],
	implicitHydrogenMap: [undefined, 0, 1, 2, 3, 4],
	v30atomPropMap: {
		'CHG':'charge',
		'RAD':'radical',
		'MASS':'isotope',
		'VAL':'valence',
        'HCOUNT':'hCount',
        'INVRET':'invRet',
        'SUBST':'substitutionCount',
        'UNSAT':'unsaturatedAtom',
        'RBCNT':'ringBondCount'
	},
	rxnItemsPartition: [3,3,3]
};

chem.Molfile.parseAtomLine = function (atomLine)
{
	var mf = chem.Molfile;
	var atomSplit = mf.partitionLine(atomLine, mf.fmtInfo.atomLinePartition);
	var params =
	{
		// generic
		pp: new util.Vec2(parseFloat(atomSplit[0]), -parseFloat(atomSplit[1])),
		label: atomSplit[4].strip(),
		valence: mf.fmtInfo.valenceMap[mf.parseDecimalInt(atomSplit[10])],

		// obsolete
		massDifference: mf.parseDecimalInt(atomSplit[5]),
		charge: mf.fmtInfo.chargeMap[mf.parseDecimalInt(atomSplit[6])],

		// query
		hCount: mf.parseDecimalInt(mf.parseDecimalInt(atomSplit[8])),
		stereoCare: mf.parseDecimalInt(atomSplit[9]) != 0,

		// reaction
		aam: mf.parseDecimalInt(atomSplit[14]),
		invRet: mf.parseDecimalInt(atomSplit[15]),

		// reaction query
		exactChangeFlag: mf.parseDecimalInt(atomSplit[16]) != 0
	};
	params.explicitValence = typeof(params.valence) != 'undefined';
	return new chem.Struct.Atom(params);
};

chem.Molfile.stripV30 = function (line)
{
	if (line.slice(0, 7) != 'M  V30 ')
		throw Error("Prefix invalid");
	return line.slice(7);
};

chem.Molfile.parseAtomLineV3000 = function (line)
{
	var mf = chem.Molfile;
	var split, subsplit, key, value, i;
	split = mf.spaceparsplit(line);
	var params = {
		pp: new util.Vec2(parseFloat(split[2]), -parseFloat(split[3])),
		aam: split[5].strip()
	};
	var label = split[1].strip();
	if (label.charAt(0) == "\"" && label.charAt(label.length - 1) == "\"") {
		label = label.substr(1, label.length - 2); // strip qutation marks
	}
	if (label.charAt(label.length - 1) == "]") { // assume atom list
		label = label.substr(0, label.length - 1); // remove ']'
		var atomListParams = {};
		atomListParams.notList = false;
		if (label.substr(0, 5) == "NOT [") {
			atomListParams.notList = true;
			label = label.substr(5); // remove 'NOT ['
		} else if (label.charAt(0) != "[") {
			throw "Error: atom list expected, found \'" + label + "\'";
		} else {
			label = label.substr(1); // remove '['
		}
		atomListParams.ids = mf.labelsListToIds(label.split(","));
		params['atomList'] = new chem.Struct.AtomList(atomListParams);
		params['label'] = '';
	} else {
		params['label'] = label;
	}
	split.splice(0, 6);
	for (i = 0; i < split.length; ++i) {
		subsplit = mf.splitonce(split[i], '=');
		key = subsplit[0];
		value = subsplit[1];
		if (key in mf.fmtInfo.v30atomPropMap) {
			var ival = mf.parseDecimalInt(value);
			if (key == 'VAL') {
				if (ival == 0)
					continue;
				if (ival == -1)
					ival = 0;
			}
			params[mf.fmtInfo.v30atomPropMap[key]] = ival;
		} else if (key == 'RGROUPS') {
            value = value.strip().substr(1, value.length-2);
            var rgrsplit = value.split(' ').slice(1);
            params.rglabel = 0;
            for (var j = 0; j < rgrsplit.length; ++j) {
                params.rglabel |= 1 << (rgrsplit[j]-1);
            }
        } else if (key == 'ATTCHPT') {
            params.attpnt = value.strip()-0;
        }
	}
	params.explicitValence = typeof(params.valence) != 'undefined';
	return new chem.Struct.Atom(params);
};

chem.Molfile.parseBondLineV3000 = function (line)
{
	var mf = chem.Molfile;
	var split, subsplit, key, value, i;
	split = mf.spaceparsplit(line);
	var params = {
		begin: mf.parseDecimalInt(split[2]) - 1,
		end: mf.parseDecimalInt(split[3]) - 1,
		type: mf.fmtInfo.bondTypeMap[mf.parseDecimalInt(split[1])]
	};
	split.splice(0, 4);
	for (i = 0; i < split.length; ++i) {
		subsplit = mf.splitonce(split[i], '=');
		key = subsplit[0];
		value = subsplit[1];
		if (key == 'CFG')
			params.stereo = mf.fmtInfo.v30bondStereoMap[mf.parseDecimalInt(value)];
		else if (key == 'TOPO')
			params.topology = mf.fmtInfo.bondTopologyMap[mf.parseDecimalInt(value)];
		else if (key == 'RXCTR')
			params.reactingCenterStatus = mf.parseDecimalInt(value);
		else if (key == 'STBOX')
			params.stereoCare = mf.parseDecimalInt(value);
	}
	return new chem.Struct.Bond(params);
};

chem.Molfile.parseBondLine = function (bondLine)
{
	var mf = chem.Molfile;
	var bondSplit = mf.partitionLine(bondLine, mf.fmtInfo.bondLinePartition);
	var params =
	{
		begin: mf.parseDecimalInt(bondSplit[0]) - 1,
		end: mf.parseDecimalInt(bondSplit[1]) - 1,
		type: mf.fmtInfo.bondTypeMap[mf.parseDecimalInt(bondSplit[2])],
		stereo: mf.fmtInfo.bondStereoMap[mf.parseDecimalInt(bondSplit[3])],
		topology: mf.fmtInfo.bondTopologyMap[mf.parseDecimalInt(bondSplit[5])],
		reactingCenterStatus: mf.parseDecimalInt(bondSplit[6])
	};

	return new chem.Struct.Bond(params);
};

chem.Molfile.parseAtomListLine = function (/* string */atomListLine)
{
	var mf = chem.Molfile;
	var split = mf.partitionLine(atomListLine, mf.fmtInfo.atomListHeaderPartition);

	var number = mf.parseDecimalInt(split[0]) - 1;
	var notList = (split[2].strip() == "T");
	var count = mf.parseDecimalInt(split[4].strip());

	var ids = atomListLine.slice(mf.fmtInfo.atomListHeaderLength);
	var list = [];
	var itemLength = mf.fmtInfo.atomListHeaderItemLength;
	for (var i = 0; i < count; ++i)
		list[i] = mf.parseDecimalInt(ids.slice(i * itemLength, (i + 1) * itemLength - 1));

	return {
		"aid": number,
		"atomList" : new chem.Struct.AtomList({
			"notList": notList,
			"ids": list
		})
		};
};

chem.Molfile.readKeyValuePairs = function (str, /* bool */ valueString)
{
	var mf = chem.Molfile;
	var ret = {};
	var partition = mf.partitionLineFixed(str, 3, true);
	var count = mf.parseDecimalInt(partition[0]);
	for (var i = 0; i < count; ++i)
		ret[mf.parseDecimalInt(partition[2 * i + 1]) - 1] =
		valueString ? partition[2 * i + 2].strip() :
		mf.parseDecimalInt(partition[2 * i + 2]);
	return ret;
};

chem.Molfile.readKeyMultiValuePairs = function (str, /* bool */ valueString)
{
	var mf = chem.Molfile;
	var ret = [];
	var partition = mf.partitionLineFixed(str, 3, true);
	var count = mf.parseDecimalInt(partition[0]);
	for (var i = 0; i < count; ++i)
        ret.push([
            mf.parseDecimalInt(partition[2 * i + 1]) - 1,
            valueString ? partition[2 * i + 2].strip() : mf.parseDecimalInt(partition[2 * i + 2])
        ]);
	return ret;
};

chem.Molfile.labelsListToIds = function (labels)
{
	var ids = [];
	for (var i = 0; i < labels.length; ++i) {
		ids.push(chem.Element.getElementByLabel(labels[i].strip()));
	}
	return ids;
};

chem.Molfile.parsePropertyLineAtomList = function (hdr, lst)
{
	var mf = chem.Molfile;
	var aid = mf.parseDecimalInt(hdr[1]) - 1;
	var count = mf.parseDecimalInt(hdr[2]);
	var notList = hdr[4].strip() == 'T';
	var ids = mf.labelsListToIds(lst.slice(0, count));
	var ret = {};
	ret[aid] = new chem.Struct.AtomList({
		"notList": notList,
		"ids": ids
	});
	return ret;
};

chem.Molfile.initSGroup = function (sGroups, propData)
{
	var mf = chem.Molfile;
	var kv = mf.readKeyValuePairs(propData, true);
	for (var key in kv) {
		var type = kv[key];
		if (!(type in chem.SGroup.TYPES))
			throw new Error('Unsupported S-group type');
		var sg = new chem.SGroup(type);
		sg.number = key;
		sGroups[key] = sg;
	}
};

chem.Molfile.applySGroupProp = function (sGroups, propName, propData, numeric)
{
	var mf = chem.Molfile;
	var kv = mf.readKeyValuePairs(propData, !(numeric));
	for (var key in kv) {
		sGroups[key].data[propName] = kv[key];
	}
};

chem.Molfile.toIntArray = function (strArray)
{
	var mf = chem.Molfile;
	var ret = [];
	for (var j = 0; j < strArray.length; ++j)
		ret[j] = mf.parseDecimalInt(strArray[j]);
	return ret;
};

chem.Molfile.applySGroupArrayProp = function (sGroups, propName, propData, shift)
{
	var mf = chem.Molfile;
	var sid = mf.parseDecimalInt(propData.slice(1, 4))-1;
	var num = mf.parseDecimalInt(propData.slice(4, 8));
	var part = mf.toIntArray(mf.partitionLineFixed(propData.slice(8), 3, true));

	if (part.length != num)
		throw new Error('File format invalid');
	if (shift) {
		util.apply(part, function(v) {
			return v + shift;
		});
	}
	sGroups[sid][propName] = sGroups[sid][propName].concat(part);
};

chem.Molfile.applyDataSGroupName = function (sg, name) {
	sg.data.fieldName = name;
};

chem.Molfile.applyDataSGroupQuery = function (sg, query) {
	sg.data.query = query;
};

chem.Molfile.applyDataSGroupQueryOp = function (sg, queryOp) {
	sg.data.queryOp = queryOp;
};

chem.Molfile.applyDataSGroupDesc = function (sGroups, propData) {
	var mf = chem.Molfile;
	var split = mf.partitionLine(propData, [4,31,2,20,2,3], false);
	var id = mf.parseDecimalInt(split[0])-1;
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

chem.Molfile.applyDataSGroupInfo = function (sg, propData) {
	var mf = chem.Molfile;
	var split = mf.partitionLine(propData, [10/*x.x*/,10/*y.y*/,4/* eee*/,1/*f*/,1/*g*/,1/*h*/,3/* i */,3/*jjj*/,3/*kkk*/,3/*ll*/,2/*m*/,3/*n*/,2/*oo*/], false);

	var x = parseFloat(split[0]);
	var y = parseFloat(split[1]);
	var attached = split[3].strip() == 'A';
	var absolute = split[4].strip() == 'A';
	var showUnits = split[5].strip() == 'U';
	var nCharsToDisplay = split[7].strip();
	nCharsToDisplay = nCharsToDisplay == 'ALL' ? -1 : mf.parseDecimalInt(nCharsToDisplay);
	var tagChar = split[10].strip();
	var daspPos = mf.parseDecimalInt(split[11].strip());

	sg.pp = new util.Vec2(x, -y);
	sg.data.attached = attached;
	sg.data.absolute = absolute;
	sg.data.showUnits = showUnits;
	sg.data.nCharsToDisplay = nCharsToDisplay;
	sg.data.tagChar = tagChar;
	sg.data.daspPos = daspPos;
};

chem.Molfile.applyDataSGroupInfoLine = function (sGroups, propData) {
	var mf = chem.Molfile;
	var id = mf.parseDecimalInt(propData.substr(0,4))-1;
	var sg = sGroups[id];
	mf.applyDataSGroupInfo(sg, propData.substr(5));
};

chem.Molfile.applyDataSGroupData = function (sg, data, finalize) {
	sg.data.fieldValue = (sg.data.fieldValue || '') + data;
	if (finalize) {
		sg.data.fieldValue = util.stripRight(sg.data.fieldValue);
                if (sg.data.fieldValue.startsWith('"') && sg.data.fieldValue.endsWith('"'))
                    sg.data.fieldValue = sg.data.fieldValue.substr(1, sg.data.fieldValue.length - 2);
        }
};

chem.Molfile.applyDataSGroupDataLine = function (sGroups, propData, finalize) {
	var mf = chem.Molfile;
	var id = mf.parseDecimalInt(propData.substr(0,5))-1;
	var data = propData.substr(5);
	var sg = sGroups[id];
	mf.applyDataSGroupData(sg, data, finalize);
};

chem.Molfile.parsePropertyLines = function (ctab, ctabLines, shift, end, sGroups, rLogic)
{
	var mf = chem.Molfile;
	var props = new util.Map();
	while (shift < end)
	{
		var line = ctabLines[shift];
        if (line.charAt(0) == 'A') {
            if (!props.get('label'))
                props.set('label', new util.Map());
            props.get('label').set(mf.parseDecimalInt(line.slice(3, 6))-1, ctabLines[++shift]);
        } else if (line.charAt(0) == 'M') {
			var type = line.slice(3, 6);
			var propertyData = line.slice(6);
			if (type == "END") {
				break;
			} else if (type == "CHG") {
				if (!props.get('charge'))
					props.set('charge', new util.Map());
				props.get('charge').update(mf.readKeyValuePairs(propertyData));
			} else if (type == "RAD") {
				if (!props.get('radical'))
					props.set('radical', new util.Map());
				props.get('radical').update(mf.readKeyValuePairs(propertyData));
			} else if (type == "ISO") {
				if (!props.get('isotope'))
					props.set('isotope', new util.Map());
				props.get('isotope').update(mf.readKeyValuePairs(propertyData));
			} else if (type == "RBC") {
				if (!props.get('ringBondCount'))
					props.set('ringBondCount', new util.Map());
				props.get('ringBondCount').update(mf.readKeyValuePairs(propertyData));
			} else if (type == "SUB") {
				if (!props.get('substitutionCount'))
					props.set('substitutionCount', new util.Map());
				props.get('substitutionCount').update(mf.readKeyValuePairs(propertyData));
			} else if (type == "UNS") {
				if (!props.get('unsaturatedAtom'))
					props.set('unsaturatedAtom', new util.Map());
				props.get('unsaturatedAtom').update(mf.readKeyValuePairs(propertyData));
			// else if (type == "LIN") // link atom
			} else if (type == "RGP") { // rgroup atom
                if (!props.get('rglabel'))
                    props.set('rglabel', new util.Map());
                var rglabels = props.get('rglabel');
                var a2rs = mf.readKeyMultiValuePairs(propertyData);
                for (var a2ri = 0; a2ri < a2rs.length; a2ri++) {
                    var a2r = a2rs[a2ri];
                    rglabels.set(a2r[0], (rglabels.get(a2r[0]) || 0) | (1 << (a2r[1] - 1)));
                }
			} else if (type == "LOG") { // rgroup atom
                propertyData = propertyData.slice(4);
                var rgid = mf.parseDecimalInt(propertyData.slice(0,3).strip());
                var iii = mf.parseDecimalInt(propertyData.slice(4,7).strip());
                var hhh = mf.parseDecimalInt(propertyData.slice(8,11).strip());
                var ooo = propertyData.slice(12).strip();
                var logic = {};
                if (iii > 0)
                    logic.ifthen = iii;
                logic.resth = hhh == 1;
                logic.range = ooo;
                rLogic[rgid] = logic;
            } else if (type == "APO") {
                if (!props.get('attpnt'))
                    props.set('attpnt', new util.Map());
                props.get('attpnt').update(mf.readKeyValuePairs(propertyData));
            } else if (type == "ALS") { // atom list
				if (!props.get('atomList'))
					props.set('atomList', new util.Map());
				props.get('atomList').update(
					mf.parsePropertyLineAtomList(
						mf.partitionLine(propertyData, [1,3,3,1,1,1]),
						mf.partitionLineFixed(propertyData.slice(10), 4, false)));
			} else if (type == "STY") { // introduce s-group
				mf.initSGroup(sGroups, propertyData);
			} else if (type == "SST") {
				mf.applySGroupProp(sGroups, 'subtype', propertyData);
			} else if (type == "SLB") {
				mf.applySGroupProp(sGroups, 'label', propertyData, true);
			} else if (type == "SCN") {
				mf.applySGroupProp(sGroups, 'connectivity', propertyData);
			} else if (type == "SAL") {
				mf.applySGroupArrayProp(sGroups, 'atoms', propertyData, -1);
			} else if (type == "SBL") {
				mf.applySGroupArrayProp(sGroups, 'bonds', propertyData, -1);
			} else if (type == "SPA") {
				mf.applySGroupArrayProp(sGroups, 'patoms', propertyData, -1);
			} else if (type == "SMT") {
				var sid = mf.parseDecimalInt(propertyData.slice(0, 4))-1;
				sGroups[sid].data.subscript = propertyData.slice(4).strip();
			} else if (type == "SDT") {
				mf.applyDataSGroupDesc(sGroups, propertyData);
			} else if (type == "SDD") {
				mf.applyDataSGroupInfoLine(sGroups, propertyData);
			} else if (type == "SCD") {
				mf.applyDataSGroupDataLine(sGroups, propertyData, false);
			} else if (type == "SED") {
				mf.applyDataSGroupDataLine(sGroups, propertyData, true);
			}
		}
		++shift;
	}
	return props;
};

chem.Molfile.applyAtomProp = function (atoms /* Pool */, values /* util.Map */, propId /* string */, clean /* boolean */)
{
	values.each(function(aid, propVal){
		atoms.get(aid)[propId] = propVal;
	});
};

chem.Molfile.parseCTabV2000 = function (ctabLines, countsSplit)
{
	var ctab = new chem.Struct();
	var i;
	var mf = chem.Molfile;
	var atomCount = mf.parseDecimalInt(countsSplit[0]);
	var bondCount = mf.parseDecimalInt(countsSplit[1]);
	var atomListCount = mf.parseDecimalInt(countsSplit[2]);
	ctab.isChiral = mf.parseDecimalInt(countsSplit[4]) != 0;
	var stextLinesCount = mf.parseDecimalInt(countsSplit[5]);
	var propertyLinesCount = mf.parseDecimalInt(countsSplit[10]);

	var shift = 0;
	var atomLines = ctabLines.slice(shift, shift + atomCount);
	shift += atomCount;
	var bondLines = ctabLines.slice(shift, shift + bondCount);
	shift += bondCount;
	var atomListLines = ctabLines.slice(shift, shift + atomListCount);
	shift += atomListCount + stextLinesCount;

	var atoms = atomLines.map(mf.parseAtomLine);
	for (i = 0; i < atoms.length; ++i)
		ctab.atoms.add(atoms[i]);
	var bonds = bondLines.map(mf.parseBondLine);
	for (i = 0; i < bonds.length; ++i)
		ctab.bonds.add(bonds[i]);

	var atomLists = atomListLines.map(mf.parseAtomListLine);
	atomLists.each(function(pair){
		ctab.atoms.get(pair.aid).atomList = pair.atomList;
		ctab.atoms.get(pair.aid).label = '';
	});

	var sGroups = {}, rLogic = {};
	var props = mf.parsePropertyLines(ctab, ctabLines, shift,
		Math.min(ctabLines.length, shift + propertyLinesCount), sGroups, rLogic);
	props.each(function (propId, values) {
		mf.applyAtomProp(ctab.atoms, values, propId);
	});

	var atomMap = {};
    var sid;
	for (sid in sGroups) {
		chem.SGroup.addGroup(ctab, sGroups[sid], atomMap);
	}
	var emptyGroups = [];
	for (sid in sGroups) {
		chem.SGroup.filter(ctab, sGroups[sid], atomMap);
		if (sGroups[sid].atoms.length == 0 && !sGroups[sid].allAtoms)
			emptyGroups.push(sid);
	}
	for (i = 0; i < emptyGroups.length; ++i) {
		ctab.sgroups.remove(emptyGroups[i]);
	}
        for (var rgid in rLogic) {
            ctab.rgroups.set(rgid, new chem.Struct.RGroup(rLogic[rgid]));
        }
	return ctab;
};

// split a line by spaces outside parentheses
chem.Molfile.spaceparsplit = function (line)
{
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
				split.push(line.slice(i0+1, i));
			i0 = i;
		}
	}
	if (i > i0 + 1)
		split.push(line.slice(i0 + 1, i));
	i0 = i;
	return split;
};

chem.Molfile.splitonce = function (line, delim)
{
	var p = line.indexOf(delim);
	return [line.slice(0,p),line.slice(p+1)];
};

chem.Molfile.splitSGroupDef = function (line)
{
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
				line = line.slice(i+1).strip();
				i = 0;
			}
		}
	}
	if (braceBalance != 0)
		throw "Brace balance broken. S-group properies invalid!";
	if (line.length > 0)
		split.push(line.strip());
	return split;
};

chem.Molfile.parseBracedNumberList = function (line, shift)
{
	if (!line)
		return null;
	var list = [];
	line = line.strip();
	line = line.substr(1, line.length-2);
	var split = line.split(" ");
	shift = shift || 0;
	for (var i = 1; i < split.length; ++i) { // skip the first element
		list.push(split[i] - 0 + shift);
	}
	return list;
};

chem.Molfile.v3000parseCollection = function (ctab, ctabLines, shift)
{
    shift++;
    while (ctabLines[shift].strip() != "M  V30 END COLLECTION")
        shift++;
    shift++;
    return shift;
};

chem.Molfile.v3000parseSGroup = function (ctab, ctabLines, sgroups, atomMap, shift)
{
    var mf = chem.Molfile;
    var line = '';
    shift++;
    while (shift < ctabLines.length) {
        line = mf.stripV30(ctabLines[shift++]).strip();
        if (line.strip() == 'END SGROUP')
            return shift;
        while (line[line.length-1] == '-')
            line = (line.substr(0, line.length - 1) +
                mf.stripV30(ctabLines[shift++])).strip();
        var split = mf.splitSGroupDef(line);
        var type = split[1];
        var sg = new chem.SGroup(type);
        sg.number = split[0] - 0;
        sg.type = type;
        sg.label = split[2] - 0;
        sgroups[sg.number] = sg;
        var props = {};
        for (var i = 3; i < split.length; ++i) {
            var subsplit = mf.splitonce(split[i],'=');
            if (subsplit.length != 2) {
                throw "A record of form AAA=BBB or AAA=(...) expected, got '" + split[i] + "'";
            }
            var name = subsplit[0];
            if (!(name in props))
                props[name] = [];
            props[name].push(subsplit[1]);
        }
        sg.atoms = mf.parseBracedNumberList(props['ATOMS'][0], -1);
        if (props['PATOMS'])
            sg.patoms = mf.parseBracedNumberList(props['PATOMS'][0], -1);
        sg.bonds = props['BONDS'] ? mf.parseBracedNumberList(props['BONDS'][0], -1) : [];
        var brkxyzStrs = props['BRKXYZ'];
        sg.brkxyz = [];
        if (brkxyzStrs) {
            for (var j = 0; j < brkxyzStrs.length; ++j)
                sg.brkxyz.push(mf.parseBracedNumberList(brkxyzStrs[j]));
        }
        if (props['MULT']) {
            sg.data.subscript = props['MULT'][0]-0;
        }
        if (props['LABEL']) {
            sg.data.subscript = props['LABEL'][0].strip();
        }
        if (props['CONNECT']) {
            sg.data.connectivity = props['CONNECT'][0].toLowerCase();
        }
        if (props['FIELDDISP']) {
            mf.applyDataSGroupInfo(sg, util.stripQuotes(props['FIELDDISP'][0]));
        }
        if (props['FIELDDATA']) {
            mf.applyDataSGroupData(sg, props['FIELDDATA'][0], true);
        }
        if (props['FIELDNAME']) {
            mf.applyDataSGroupName(sg, props['FIELDNAME'][0]);
        }
        if (props['QUERYTYPE']) {
            mf.applyDataSGroupQuery(sg, props['QUERYTYPE'][0]);
        }
        if (props['QUERYOP']) {
            mf.applyDataSGroupQueryOp(sg, props['QUERYOP'][0]);
        }
        chem.SGroup.addGroup(ctab, sg, atomMap);
    }
    throw new Error("S-group declaration incomplete.");
};

chem.Molfile.parseCTabV3000 = function (ctabLines, norgroups)
{
    var ctab = new chem.Struct();
    var mf = chem.Molfile;

    var shift = 0;
    if (ctabLines[shift++].strip() != "M  V30 BEGIN CTAB")
        throw Error("CTAB V3000 invalid");
    if (ctabLines[shift].slice(0, 13) != "M  V30 COUNTS")
        throw Error("CTAB V3000 invalid");
    var vals = ctabLines[shift].slice(14).split(' ');
    ctab.isChiral = (mf.parseDecimalInt(vals[4]) == 1);
    shift++;

    if (ctabLines[shift].strip() == "M  V30 BEGIN ATOM") {
        shift++;
        var line;
        while (shift < ctabLines.length) {
            line = mf.stripV30(ctabLines[shift++]).strip();
            if (line == 'END ATOM')
                break;
            while (line[line.length-1] == '-')
                line = (line.substring(0, line.length - 1) + mf.stripV30(ctabLines[shift++])).strip();
            ctab.atoms.add(mf.parseAtomLineV3000(line));
        }

        if (ctabLines[shift].strip() == "M  V30 BEGIN BOND")
        {
            shift++;
            while (shift < ctabLines.length) {
                line = mf.stripV30(ctabLines[shift++]).strip();
                if (line == 'END BOND')
                    break;
                while (line[line.length - 1] == '-')
                    line = (line.substring(0, line.length - 1) + mf.stripV30(ctabLines[shift++])).strip();
                ctab.bonds.add(mf.parseBondLineV3000(line));
            }
        }

        // TODO: let sections follow in arbitrary order
        var sgroups = {};
        var atomMap = {};

        while (ctabLines[shift].strip() != "M  V30 END CTAB") {
            if (ctabLines[shift].strip() == "M  V30 BEGIN COLLECTION") {
                 // TODO: read collection information
                shift = mf.v3000parseCollection(ctab, ctabLines, shift);
            } else if (ctabLines[shift].strip() == "M  V30 BEGIN SGROUP") {
                shift = mf.v3000parseSGroup(ctab, ctabLines, sgroups, atomMap, shift);
            } else {
                throw Error("CTAB V3000 invalid");
            }
        }
    }
    if (ctabLines[shift++].strip() != "M  V30 END CTAB")
        throw Error("CTAB V3000 invalid");

    if (!norgroups) {
        mf.readRGroups3000(ctab, ctabLines.slice(shift));
    }

    return ctab;
};

chem.Molfile.readRGroups3000 = function (ctab, /* string */ ctabLines) /* chem.Struct */
{
    var rfrags = {};
    var rLogic = {};
    var shift = 0;
    var mf = chem.Molfile;
    while (shift < ctabLines.length && ctabLines[shift].search("M  V30 BEGIN RGROUP") == 0)
    {
        var id = ctabLines[shift++].split(' ').pop();
        rfrags[id] = [];
        rLogic[id] = {};
        while (true) {
            var line = ctabLines[shift].strip();
            if (line.search("M  V30 RLOGIC") == 0) {
                line = line.slice(13);
                var rlsplit = line.strip().split(/\s+/g);
                var iii = mf.parseDecimalInt(rlsplit[0]);
                var hhh = mf.parseDecimalInt(rlsplit[1]);
                var ooo = rlsplit.slice(2).join(" ");
                var logic = {};
                if (iii > 0)
                    logic.ifthen = iii;
                logic.resth = hhh == 1;
                logic.range = ooo;
                rLogic[id] = logic;
                shift++;
                continue;
            }
            if (line != "M  V30 BEGIN CTAB")
                throw Error("CTAB V3000 invalid");
            for (var i = 0; i < ctabLines.length; ++i)
                if (ctabLines[shift+i].strip() == "M  V30 END CTAB")
                    break;
            var lines = ctabLines.slice(shift, shift+i+1);
            var rfrag = this.parseCTabV3000(lines, true);
            rfrags[id].push(rfrag);
            shift = shift + i + 1;
            if (ctabLines[shift].strip() == "M  V30 END RGROUP") {
                shift++;
                break;
            }
        }
    }

    for (var rgid in rfrags) {
        for (var j = 0; j < rfrags[rgid].length; ++j) {
            var rg = rfrags[rgid][j];
            rg.rgroups.set(rgid, new chem.Struct.RGroup(rLogic[rgid]));
            var frid = rg.frags.add(new chem.Struct.Fragment());
            rg.rgroups.get(rgid).frags.add(frid);
            rg.atoms.each(function(aid, atom) {atom.fragment = frid;});
            rg.mergeInto(ctab);
        }
    }
};

chem.Molfile.parseMol = function (/* string */ ctabLines) /* chem.Struct */
{
    if (ctabLines[0].search("\\$MDL") == 0) {
        return this.parseRg2000(ctabLines);
    }
	ctabLines = ctabLines.slice(3);
    return this.parseCTab(ctabLines);
};

chem.Molfile.parseCTab = function (/* string */ ctabLines) /* chem.Struct */
{
	var mf = chem.Molfile;
	var countsSplit = mf.partitionLine(ctabLines[0], mf.fmtInfo.countsLinePartition);
	var version = countsSplit[11].strip();
	ctabLines = ctabLines.slice(1);
	if (version == 'V2000')
		return this.parseCTabV2000(ctabLines, countsSplit);
	else if (version == 'V3000')
		return this.parseCTabV3000(ctabLines, !chem.Molfile.loadRGroupFragments);
	else
		throw Error("Molfile version unknown: " + version);
};

chem.MolfileSaver = function (v3000)
{
	this.molecule = null;
	this.molfile = null;

	this.v3000 = v3000 || false
};

chem.MolfileSaver.prototype.prepareSGroups = function (skipErrors)
{
	var mol = this.molecule;
	var sgroups = mol.sgroups;
	var toRemove = [];
	sgroups.each(function(id, sg) {
		try {
			sg.prepareForSaving(mol);
		} catch (ex) {
			if (skipErrors && typeof(ex.id) == 'number') {
				toRemove.push(ex.id);
			} else {
				throw ex;
			}
		}
	});
        if (toRemove.length > 0) {
            alert("WARNING: " + toRemove.length.toString() + " invalid S-groups were detected. They will be omitted." );
        }
	for (var i = 0; i < toRemove.length; ++i) {
		mol.sGroupDelete(toRemove[i]);
	}
	return mol;
};

chem.MolfileSaver.getComponents = function (molecule) {
	var ccs = molecule.findConnectedComponents(true);
	var submols = [];
	var barriers = [];
	var arrowPos = null;
	molecule.rxnArrows.each(function(id, item){ // there's just one arrow
		arrowPos = item.pp.x;
	});
	molecule.rxnPluses.each(function(id, item){
		barriers.push(item.pp.x);
	});
	if (arrowPos != null)
		barriers.push(arrowPos);
	barriers.sort(function(a,b) {return a - b;});
	var components = [];

	var i;
	for (i = 0; i < ccs.length; ++i) {
		var bb = molecule.getCoordBoundingBox(ccs[i]);
		var c = util.Vec2.lc2(bb.min, 0.5, bb.max, 0.5);
		var j = 0;
		while (c.x > barriers[j])
			++j;
		components[j] = components[j] || {};
		util.Set.mergeIn(components[j], ccs[i]);
	}
	var submolTexts = [];
	var reactants = [], products = [];
	for (i = 0; i < components.length; ++i) {
		if (!components[i]) {
			submolTexts.push("");
			continue;
		}
		bb = molecule.getCoordBoundingBox(components[i]);
		c = util.Vec2.lc2(bb.min, 0.5, bb.max, 0.5);
		if (c.x < arrowPos)
			reactants.push(components[i]);
		else
			products.push(components[i]);
	}

	return {
		'reactants':reactants,
		'products':products
	};
};

chem.MolfileSaver.prototype.getCTab = function (molecule, rgroups)
{
	this.molecule = molecule.clone();
	this.molfile = '';
    this.writeCTab2000(rgroups);
    return this.molfile;
};

chem.MolfileSaver.prototype.saveMolecule = function (molecule, skipSGroupErrors, norgroups)
{
	this.reaction = molecule.rxnArrows.count() > 0;
	if (molecule.rxnArrows.count() > 1)
		throw new Error("Reaction may not contain more than one arrow");
	this.molfile = '';
	if (this.reaction) {
        if (molecule.rgroups.count() > 0)
            alert("Reactions with r-groups are not supported at the moment. R-fragments will be discarded in saving");
		var components = chem.MolfileSaver.getComponents(molecule);

		var reactants = components.reactants, products = components.products, all = reactants.concat(products);
		this.molfile = "$RXN\n\n\n\n" + util.paddedInt(reactants.length, 3) + util.paddedInt(products.length, 3) + util.paddedInt(0, 3) + "\n";
		for (var i = 0; i < all.length; ++i) {
			var saver = new chem.MolfileSaver(false);
			var submol = molecule.clone(all[i], null, true);
			var molfile = saver.saveMolecule(submol, false, true);
			this.molfile += "$MOL\n" + molfile;
		}
		return this.molfile;
	}

    if (molecule.rgroups.count() > 0) {
        if (norgroups) {
            molecule = molecule.getScaffold();
        } else {
            var scaffold = new chem.MolfileSaver(false).getCTab(molecule.getScaffold(), molecule.rgroups);
            this.molfile = "$MDL  REV  1\n$MOL\n$HDR\n\n\n\n$END HDR\n";
            this.molfile += "$CTAB\n" + scaffold + "$END CTAB\n";

            molecule.rgroups.each(function(rgid, rg){
                this.molfile += "$RGP\n";
                this.writePaddedNumber(rgid, 3);
                this.molfile += "\n";
                rg.frags.each(function(fnum, fid) {
                    var group = new chem.MolfileSaver(false).getCTab(molecule.getFragment(fid));
                    this.molfile += "$CTAB\n" + group + "$END CTAB\n";
                }, this);
                this.molfile += "$END RGP\n";
            }, this);
            this.molfile += "$END MOL\n";

            return this.molfile;
        }
    }

	this.molecule = molecule.clone();

	this.prepareSGroups(skipSGroupErrors);

	this.writeHeader();

	// TODO: saving to V3000
	this.writeCTab2000();

	return this.molfile;
};

chem.MolfileSaver.prototype.writeHeader = function ()
{
	var date = new Date();

	this.writeCR();
	this.writeWhiteSpace(2);
	this.write('Ketcher');
	this.writeWhiteSpace();
	this.writeCR((date.getMonth() + 1).toPaddedString(2) + date.getDate().toPaddedString(2) + (date.getFullYear() % 100).toPaddedString(2) +
		date.getHours().toPaddedString(2) + date.getMinutes().toPaddedString(2) + '2D 1   1.00000     0.00000     0');
	this.writeCR();
};

chem.MolfileSaver.prototype.write = function (str)
{
	this.molfile += str;
};

chem.MolfileSaver.prototype.writeCR = function (str)
{
	if (arguments.length == 0)
		str = '';

	this.molfile += str + '\n';
};

chem.MolfileSaver.prototype.writeWhiteSpace = function (length)
{
	if (arguments.length == 0)
		length = 1;

	length.times(function ()
	{
		this.write(' ');
	}, this);
};

chem.MolfileSaver.prototype.writePadded = function (str, width)
{
	this.write(str);
	this.writeWhiteSpace(width - str.length);
};

chem.MolfileSaver.prototype.writePaddedNumber = function (number, width)
{
	var str = (number - 0).toString();

	this.writeWhiteSpace(width - str.length);
	this.write(str);
};

chem.MolfileSaver.prototype.writePaddedFloat = function (number, width, precision)
{
	this.write(util.paddedFloat(number, width, precision));
};

chem.MolfileSaver.prototype.writeCTab2000Header = function ()
{
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

chem.MolfileSaver.prototype.writeCTab2000 = function (rgroups)
{
	this.writeCTab2000Header();

	this.mapping = {};
	var i = 1;

	var atomList_list = [];
    var atomLabel_list = [];
	this.molecule.atoms.each(function (id, atom)
	{
		this.writePaddedFloat(atom.pp.x, 10, 4);
		this.writePaddedFloat(-atom.pp.y, 10, 4);
		this.writePaddedFloat(0, 10, 4);
		this.writeWhiteSpace();

		var label = atom.label;
		if (atom.atomList != null) {
			label = 'L';
			atomList_list.push(id);
		} else if (chem.Element.getElementByLabel(label) == null && ['A', 'Q', 'X', '*', 'R#'].indexOf(label) == -1) {
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

		this.writePaddedNumber(!atom.explicitValence ? 0 : (atom.valence == 0 ? 15 : atom.valence), 3);

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
        this.write('A  ');this.writePaddedNumber(atomLabel_list[0] + 1, 3);this.writeCR();
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
                var line = '  1 ' + util.paddedInt(rgid, 3) + ' ' + util.paddedInt(rg.ifthen, 3) + ' ' + util.paddedInt(rg.resth ? 1 : 0, 3) + ' ' + rg.range;
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
			this.writePaddedNumber(aid+1, 4);
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

	var sgmap = {}, cnt = 1;
	this.molecule.sgroups.each(function (id) {
		sgmap[id] = cnt++;
	});
	if (cnt > 1) {
		this.write('M  STY');
		this.writePaddedNumber(cnt - 1, 3);
		this.molecule.sgroups.each(function (id, sgroup) {
			this.writeWhiteSpace(1);
			this.writePaddedNumber(sgmap[id], 3);
			this.writeWhiteSpace(1);
			this.writePadded(sgroup.type, 3);
		}, this);
		this.writeCR();

		// TODO: write subtype, M SST

		this.write('M  SLB');
		this.writePaddedNumber(cnt - 1, 3);
		this.molecule.sgroups.each(function (id, sgroup) {
			this.writeWhiteSpace(1);
			this.writePaddedNumber(sgmap[id], 3);
			this.writeWhiteSpace(1);
			this.writePaddedNumber(sgmap[id], 3);
		}, this);
		this.writeCR();

		// connectivity
		var connectivity = '';
		var connectivityCnt = 0;
		this.molecule.sgroups.each(function (id, sgroup) {
			if (sgroup.type == 'SRU' && sgroup.data.connectivity) {
				connectivity += ' ';
				connectivity += util.stringPadded(sgmap[id].toString(), 3);
				connectivity += ' ';
				connectivity += util.stringPadded(sgroup.data.connectivity, 3, true);
				connectivityCnt++;
			}
		}, this);
		if (connectivityCnt > 0) {
			this.write('M  SCN');
			this.writePaddedNumber(connectivityCnt, 3);
			this.write(connectivity.toUpperCase());
			this.writeCR();
		}

		this.molecule.sgroups.each(function (id, sgroup) {
			if (sgroup.type == 'SRU') {
				this.write('M  SMT ');
				this.writePaddedNumber(sgmap[id], 3);
				this.writeWhiteSpace();
				this.write(sgroup.data.subscript || 'n');
				this.writeCR();
			}
		}, this);

		this.molecule.sgroups.each(function (id, sgroup) {
			this.writeCR(sgroup.saveToMolfile(this.molecule, sgmap, this.mapping, this.bondMapping));
		}, this);
	}

	// TODO: write M  APO
	// TODO: write M  AAL
	// TODO: write M  RGP
	// TODO: write M  LOG

	this.writeCR('M  END');
};

chem.Molfile.parseRxn = function (/* string[] */ ctabLines) /* chem.Struct */
{
	var mf = chem.Molfile;
	var split = ctabLines[0].strip().split(' ');
	if (split.length > 1 && split[1] == 'V3000')
		return mf.parseRxn3000(ctabLines);
	else
		return mf.parseRxn2000(ctabLines);
};

chem.Molfile.parseRxn2000 = function (/* string[] */ ctabLines) /* chem.Struct */
{
	var mf = chem.Molfile;
	ctabLines = ctabLines.slice(4);
	var countsSplit = mf.partitionLine(ctabLines[0], mf.fmtInfo.rxnItemsPartition);
	var nReactants = countsSplit[0]-0,
	nProducts = countsSplit[1]-0,
	nAgents = countsSplit[2]-0;
	ctabLines = ctabLines.slice(2); // consume counts line and following $MOL

	var ret = new chem.Struct();
	var molLines = [];
	var i0 = 0, i;
	for (i = 0; i < ctabLines.length; ++i) {
		if (ctabLines[i].substr(0, 4) == "$MOL") {
			if (i > i0)
				molLines.push(ctabLines.slice(i0, i));
			i0 = i + 1;
		}
	}
	molLines.push(ctabLines.slice(i0));
	var mols = [];
	for (var j = 0; j < molLines.length; ++j) {
		var mol = chem.Molfile.parseMol(molLines[j]);
		mols.push(mol);
	}
	return mf.rxnMerge(mols, nReactants, nProducts, nAgents);
};

chem.Molfile.parseRxn3000 = function (/* string[] */ ctabLines) /* chem.Struct */
{
	var mf = chem.Molfile;
	ctabLines = ctabLines.slice(4);
	var countsSplit = ctabLines[0].split(/\s+/g).slice(3);
	var nReactants = countsSplit[0]-0,
	nProducts = countsSplit[1]-0,
	nAgents = countsSplit.length > 2 ? countsSplit[2]-0 : 0;

    var assert = function (condition) {
        if (!condition)
            throw new Error("CTab format invalid");
    };

    var findCtabEnd = function (i) {
        for (var j = i; j < ctabLines.length; ++j) {
            if (ctabLines[j].strip() == "M  V30 END CTAB")
                return j;
        }
        assert(false);
    };

    var findRGroupEnd = function (i) {
        for (var j = i; j < ctabLines.length; ++j)
            if (ctabLines[j].strip() == "M  V30 END RGROUP")
                return j;
        assert(false);
    };

	var molLinesReactants = [], molLinesProducts = [], current = null, rGroups = [];
	for (var i = 0; i < ctabLines.length; ++i) {
		var line = ctabLines[i].strip();

        if (line.startsWith("M  V30 COUNTS")) {
            // do nothing
        } else if (line == "M  END") {
            break; // stop reading
        } else if (line == "M  V30 BEGIN PRODUCT") {
            assert(current == null);
			current = molLinesProducts;
        } else if (line == "M  V30 END PRODUCT") {
            assert(current === molLinesProducts);
            current = null;
		} else if (line == "M  V30 BEGIN REACTANT") {
            assert(current == null);
			current = molLinesReactants;
        } else if (line == "M  V30 END REACTANT") {
            assert(current === molLinesReactants);
            current = null;
        } else if (line.startsWith("M  V30 BEGIN RGROUP")) {
            assert(current == null);
            var j = findRGroupEnd(i);
            rGroups.push(ctabLines.slice(i,j+1));
            i = j;
		} else if (line == "M  V30 BEGIN CTAB") {
            var j = findCtabEnd(i);
            current.push(ctabLines.slice(i,j+1));
            i = j;
		} else {
            throw new Error("line unrecognized: " + line);
        }
	}
	var mols = [];
	var molLines = molLinesReactants.concat(molLinesProducts);
	for (var j = 0; j < molLines.length; ++j) {
		var mol = chem.Molfile.parseCTabV3000(molLines[j], countsSplit);
		mols.push(mol);
	}
	var ctab = mf.rxnMerge(mols, nReactants, nProducts, nAgents);

    mf.readRGroups3000(ctab, function (array) {
        var res = [];
        for (var k = 0; k < array.length; ++k) {
            res = res.concat(array[k]);
        }
        return res;
    }(rGroups));

    return ctab;
};

chem.Molfile.rxnMerge = function (mols, nReactants, nProducts, nAgents) /* chem.Struct */
{
	var mf = chem.Molfile;

	var ret = new chem.Struct();
	var bbReact = [],
		bbAgent = [],
		bbProd = [];
	var molReact = [],
		molAgent = [],
		molProd = [];
        var j;
        var bondLengthData = {cnt:0,totalLength:0};
	for (j = 0; j < mols.length; ++j) {
            var mol = mols[j];
            var bondLengthDataMol = mol.getBondLengthData();
            bondLengthData.cnt += bondLengthDataMol.cnt;
            bondLengthData.totalLength += bondLengthDataMol.totalLength;
        }
        var avgBondLength = 1/(bondLengthData.cnt == 0 ? 1 : bondLengthData.totalLength / bondLengthData.cnt);
	for (j = 0; j < mols.length; ++j) {
            mol = mols[j];
            mol.scale(avgBondLength);
        }
        
	for (j = 0; j < mols.length; ++j) {
            mol = mols[j];
            var bb = mol.getCoordBoundingBoxObj();
            if (!bb)
                continue;

            var fragmentType = (j < nReactants ? chem.Struct.FRAGMENT.REACTANT :
                    (j < nReactants + nProducts ? chem.Struct.FRAGMENT.PRODUCT :
                            chem.Struct.FRAGMENT.AGENT));
            if (fragmentType == chem.Struct.FRAGMENT.REACTANT) {
                bbReact.push(bb);
                molReact.push(mol);
            } else if (fragmentType == chem.Struct.FRAGMENT.AGENT) {
                bbAgent.push(bb);
                molAgent.push(mol);
            } else if (fragmentType == chem.Struct.FRAGMENT.PRODUCT) {
                bbProd.push(bb);
                molProd.push(mol);
            }

            mol.atoms.each(function(aid, atom){
                atom.rxnFragmentType = fragmentType;
            });
	}

    // reaction fragment layout
	var xorig = 0;
    var shiftMol = function(ret, mol, bb, xorig, over) {
        var d = new util.Vec2(xorig - bb.min.x, over ? 1 - bb.min.y : -(bb.min.y + bb.max.y) / 2);
        mol.atoms.each(function(aid, atom){
            atom.pp.add_(d);
        });
        mol.sgroups.each(function(id, item){
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
		bb2 = bbReact[j+1];

		x = (bb1.max.x + bb2.min.x) / 2;
		y = (bb1.max.y + bb1.min.y + bb2.max.y + bb2.min.y) / 4;

		ret.rxnPluses.add(new chem.Struct.RxnPlus({'pp':new util.Vec2(x, y)}));
	}
	for (j = 0; j <	bbReact.length; ++j) {
		if (j == 0) {
			bbReactAll = {};
			bbReactAll.max = new util.Vec2(bbReact[j].max);
			bbReactAll.min = new util.Vec2(bbReact[j].min);
		} else {
			bbReactAll.max = util.Vec2.max(bbReactAll.max, bbReact[j].max);
			bbReactAll.min = util.Vec2.min(bbReactAll.min, bbReact[j].min);
		}
	}
	for (j = 0; j <	bbProd.length - 1; ++j) {
		bb1 = bbProd[j];
		bb2 = bbProd[j+1];

		x = (bb1.max.x + bb2.min.x) / 2;
		y = (bb1.max.y + bb1.min.y + bb2.max.y + bb2.min.y) / 4;

		ret.rxnPluses.add(new chem.Struct.RxnPlus({'pp':new util.Vec2(x, y)}));
	}
	for (j = 0; j <	bbProd.length; ++j) {
		if (j == 0) {
			bbProdAll = {};
			bbProdAll.max = new util.Vec2(bbProd[j].max);
			bbProdAll.min = new util.Vec2(bbProd[j].min);
		} else {
			bbProdAll.max = util.Vec2.max(bbProdAll.max, bbProd[j].max);
			bbProdAll.min = util.Vec2.min(bbProdAll.min, bbProd[j].min);
		}
	}
	bb1 = bbReactAll;
	bb2 = bbProdAll;
	if (!bb1 && !bb2)
		throw new Error("reaction must contain at least one product or reactant");
	var v1 = bb1 ? new util.Vec2(bb1.max.x, (bb1.max.y + bb1.min.y) / 2) : null;
	var v2 = bb2 ? new util.Vec2(bb2.min.x, (bb2.max.y + bb2.min.y) / 2) : null;
	var defaultOffset = 3;
	if (!v1)
		v1 = new util.Vec2(v2.x - defaultOffset, v2.y);
	if (!v2)
		v2 = new util.Vec2(v1.x + defaultOffset, v1.y);
	var v = util.Vec2.lc2(v1, 0.5, v2, 0.5);

	ret.rxnArrows.add(new chem.Struct.RxnArrow({'pp':v}));
	ret.isReaction = true;
	return ret;
};

chem.Molfile.rgMerge = function (scaffold, rgroups) /* chem.Struct */
{
	var ret = new chem.Struct();

    scaffold.mergeInto(ret, null, null, false, true);
    for (var rgid in rgroups) {
        for (var j = 0; j < rgroups[rgid].length; ++j) {
            var ctab = rgroups[rgid][j];
            ctab.rgroups.set(rgid, new chem.Struct.RGroup());
            var frid = ctab.frags.add(new chem.Struct.Fragment());
            ctab.rgroups.get(rgid).frags.add(frid);
            ctab.atoms.each(function(aid, atom) {atom.fragment = frid;});
            ctab.mergeInto(ret);
        }
    }

	return ret;
};

chem.Molfile.parseRg2000 = function (/* string[] */ ctabLines) /* chem.Struct */
{
	var mf = chem.Molfile;
	ctabLines = ctabLines.slice(7);
    if (ctabLines[0].strip() != '$CTAB')
        throw new Error('RGFile format invalid');
    var i = 1;while (ctabLines[i][0] != '$') i++;
    if (ctabLines[i].strip() != '$END CTAB')
        throw new Error('RGFile format invalid');
    var coreLines = ctabLines.slice(1, i);
	ctabLines = ctabLines.slice(i+1);
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
            i = 1;while (ctabLines[i][0] != '$') i++;
            if (ctabLines[i].strip() != '$END CTAB')
                throw new Error('RGFile format invalid');
            fragmentLines[rgid].push(ctabLines.slice(1, i));
            ctabLines = ctabLines.slice(i+1);
        }
    }

    var core = chem.Molfile.parseCTab(coreLines), frag = {};
    if (chem.Molfile.loadRGroupFragments) {
        for (var id in fragmentLines) {
            frag[id] = [];
            for (var j = 0; j < fragmentLines[id].length; ++j) {
                frag[id].push(chem.Molfile.parseCTab(fragmentLines[id][j]));
            }
        }
    }
	return mf.rgMerge(core, frag);
};