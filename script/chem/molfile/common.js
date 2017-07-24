var Set = require('../../util/set');

var v2000 = require('./v2000');
var v3000 = require('./v3000');

var Struct = require('./../struct/index');
var utils = require('./utils');

var loadRGroupFragments = true; // TODO: set to load the fragments

/* Parse Mol */
function parseMol(/* string */ ctabLines) /* Struct */ {
	/* reader */
	if (ctabLines[0].search('\\$MDL') == 0)
		return v2000.parseRg2000(ctabLines);
	var struct = parseCTab(ctabLines.slice(3));
	struct.name = ctabLines[0].trim();
	return struct;
}

function parseCTab(/* string */ ctabLines) /* Struct */ {
	/* reader */
	var countsSplit = partitionLine(ctabLines[0], utils.fmtInfo.countsLinePartition);
	var version = countsSplit[11].trim();
	ctabLines = ctabLines.slice(1);
	if (version == 'V2000')
		return v2000.parseCTabV2000(ctabLines, countsSplit);
	else if (version == 'V3000')
		return v3000.parseCTabV3000(ctabLines, !loadRGroupFragments);
	else
		throw new Error('Molfile version unknown: ' + version); // eslint-disable-line no-else-return
}

/* Parse Rxn */
function parseRxn(/* string[] */ ctabLines) /* Struct */ {
	/* reader */
	var split = ctabLines[0].trim().split(' ');
	if (split.length > 1 && split[1] == 'V3000')
		return v3000.parseRxn3000(ctabLines);
	else
		return v2000.parseRxn2000(ctabLines); // eslint-disable-line no-else-return
}

/* Prepare For Saving */
var prepareForSaving = {
	MUL: Struct.SGroup.prepareMulForSaving,
	SRU: prepareSruForSaving,
	SUP: prepareSupForSaving,
	DAT: prepareDatForSaving,
	GEN: prepareGenForSaving
};

function prepareSruForSaving(sgroup, mol) {
	var xBonds = [];
	mol.bonds.each(function (bid, bond) {
		var a1 = mol.atoms.get(bond.begin);
		var a2 = mol.atoms.get(bond.end);
		/* eslint-disable no-mixed-operators*/
		if (Set.contains(a1.sgs, sgroup.id) && !Set.contains(a2.sgs, sgroup.id) ||
			Set.contains(a2.sgs, sgroup.id) && !Set.contains(a1.sgs, sgroup.id))
		/* eslint-enable no-mixed-operators*/
			xBonds.push(bid);
	}, sgroup);
	if (xBonds.length != 0 && xBonds.length != 2)
		throw { 'id': sgroup.id, 'error-type': 'cross-bond-number', 'message': 'Unsupported cross-bonds number' };
	sgroup.bonds = xBonds;
}

function prepareSupForSaving(sgroup, mol) {
	// This code is also used for GroupSru and should be moved into a separate common method
	// It seems that such code should be used for any sgroup by this this should be checked
	var xBonds = [];
	mol.bonds.each(function (bid, bond) {
		var a1 = mol.atoms.get(bond.begin);
		var a2 = mol.atoms.get(bond.end);
		/* eslint-disable no-mixed-operators*/
		if (Set.contains(a1.sgs, sgroup.id) && !Set.contains(a2.sgs, sgroup.id) ||
			Set.contains(a2.sgs, sgroup.id) && !Set.contains(a1.sgs, sgroup.id))
		/* eslint-enable no-mixed-operators*/
			xBonds.push(bid);
	}, sgroup);
	sgroup.bonds = xBonds;
}

function prepareGenForSaving(sgroup, mol) { // eslint-disable-line no-unused-vars
}

function prepareDatForSaving(sgroup, mol) {
	sgroup.atoms = Struct.SGroup.getAtoms(mol, sgroup);
}

/* Save To Molfile */
var saveToMolfile = {
	MUL: saveMulToMolfile,
	SRU: saveSruToMolfile,
	SUP: saveSupToMolfile,
	DAT: saveDatToMolfile,
	GEN: saveGenToMolfile
};

function saveMulToMolfile(sgroup, mol, sgMap, atomMap, bondMap) { // eslint-disable-line max-params
	var idstr = (sgMap[sgroup.id] + '').padStart(3);

	var lines = [];
	lines = lines.concat(makeAtomBondLines('SAL', idstr, Object.keys(sgroup.atomSet), atomMap)); // TODO: check atomSet
	lines = lines.concat(makeAtomBondLines('SPA', idstr, Object.keys(sgroup.parentAtomSet), atomMap));
	lines = lines.concat(makeAtomBondLines('SBL', idstr, sgroup.bonds, bondMap));
	var smtLine = 'M  SMT ' + idstr + ' ' + sgroup.data.mul;
	lines.push(smtLine);
	lines = lines.concat(bracketsToMolfile(mol, sgroup, idstr));
	return lines.join('\n');
}

function saveSruToMolfile(sgroup, mol, sgMap, atomMap, bondMap) { // eslint-disable-line max-params
	var idstr = (sgMap[sgroup.id] + '').padStart(3);

	var lines = [];
	lines = lines.concat(makeAtomBondLines('SAL', idstr, sgroup.atoms, atomMap));
	lines = lines.concat(makeAtomBondLines('SBL', idstr, sgroup.bonds, bondMap));
	lines = lines.concat(bracketsToMolfile(mol, sgroup, idstr));
	return lines.join('\n');
}

function saveSupToMolfile(sgroup, mol, sgMap, atomMap, bondMap) { // eslint-disable-line max-params
	var idstr = (sgMap[sgroup.id] + '').padStart(3);

	var lines = [];
	lines = lines.concat(makeAtomBondLines('SAL', idstr, sgroup.atoms, atomMap));
	lines = lines.concat(makeAtomBondLines('SBL', idstr, sgroup.bonds, bondMap));
	if (sgroup.data.name && sgroup.data.name != '')
		lines.push('M  SMT ' + idstr + ' ' + sgroup.data.name);
	return lines.join('\n');
}

function saveDatToMolfile(sgroup, mol, sgMap, atomMap) {
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
		' ' + utils.paddedNum(pp.x, 10, 4) + utils.paddedNum(-pp.y, 10, 4) +
		'    ' + // ' eee'
		(data.attached ? 'A' : 'D') + // f
		(data.absolute ? 'A' : 'R') + // g
		(data.showUnits ? 'U' : ' ') + // h
		'   ' + //  i
		(data.nCharnCharsToDisplay >= 0 ? utils.paddedNum(data.nCharnCharsToDisplay, 3) : 'ALL') + // jjj
		'  1   ' + // 'kkk ll '
		(data.tagChar || ' ') + // m
		'  ' + utils.paddedNum(data.daspPos, 1) + // n
		'  '; // oo
	lines.push(sddLine);
	var val = normalizeNewlines(data.fieldValue).replace(/\n*$/, '');
	var charsPerLine = 69;
	val.split('\n').forEach(function (chars) {
		while (chars.length > charsPerLine) {
			lines.push('M  SCD ' + idstr + ' ' + chars.slice(0, charsPerLine));
			chars = chars.slice(charsPerLine);
		}
		lines.push('M  SED ' + idstr + ' ' + chars);
	});
	return lines.join('\n');
}

function saveGenToMolfile(sgroup, mol, sgMap, atomMap, bondMap) { // eslint-disable-line max-params
	var idstr = (sgMap[sgroup.id] + '').padStart(3);

	var lines = [];
	lines = lines.concat(makeAtomBondLines('SAL', idstr, sgroup.atoms, atomMap));
	lines = lines.concat(makeAtomBondLines('SBL', idstr, sgroup.bonds, bondMap));
	lines = lines.concat(bracketsToMolfile(mol, sgroup, idstr));
	return lines.join('\n');
}

function makeAtomBondLines(prefix, idstr, ids, map) {
	if (!ids)
		return [];
	var lines = [];
	for (var i = 0; i < Math.floor((ids.length + 14) / 15); ++i) {
		var rem = Math.min(ids.length - 15 * i, 15); // eslint-disable-line no-mixed-operators
		var salLine = 'M  ' + prefix + ' ' + idstr + ' ' + utils.paddedNum(rem, 2);
		for (var j = 0; j < rem; ++j)
			salLine += ' ' + utils.paddedNum(map[ids[i * 15 + j]], 3); // eslint-disable-line no-mixed-operators
		lines.push(salLine);
	}
	return lines;
}

function bracketsToMolfile(mol, sg, idstr) { // eslint-disable-line max-statements
	var inBonds = [];
	var xBonds = [];
	var atomSet = Set.fromList(sg.atoms);
	Struct.SGroup.getCrossBonds(inBonds, xBonds, mol, atomSet);
	Struct.SGroup.bracketPos(sg, mol, xBonds);
	var bb = sg.bracketBox;
	var d = sg.bracketDir;
	var n = d.rotateSC(1, 0);
	var brackets = Struct.SGroup.getBracketParameters(mol, xBonds, atomSet, bb, d, n);
	var lines = [];
	for (var i = 0; i < brackets.length; ++i) {
		var bracket = brackets[i];
		var a0 = bracket.c.addScaled(bracket.n, -0.5 * bracket.h).yComplement();
		var a1 = bracket.c.addScaled(bracket.n, 0.5 * bracket.h).yComplement();
		var line = 'M  SDI ' + idstr + utils.paddedNum(4, 3);
		var coord = [a0.x, a0.y, a1.x, a1.y];
		for (var j = 0; j < coord.length; ++j)
			line += utils.paddedNum(coord[j], 10, 4);
		lines.push(line);
	}
	return lines;
}

// According Unicode Consortium sould be
// nlRe = /\r\n|[\n\v\f\r\x85\u2028\u2029]/g;
// http://www.unicode.org/reports/tr18/#Line_Boundaries
var nlRe = /\r\n|[\n\r]/g;
function normalizeNewlines(str) {
	return str.replace(nlRe, '\n');
}

function partitionLine(/* string*/ str, /* array of int*/ parts, /* bool*/ withspace) {
	/* reader */
	var res = [];
	for (var i = 0, shift = 0; i < parts.length; ++i) {
		res.push(str.slice(shift, shift + parts[i]));
		if (withspace)
			shift++;
		shift += parts[i];
	}
	return res;
}

module.exports = {
	parseCTab: parseCTab,
	parseMol: parseMol,
	parseRxn: parseRxn,
	prepareForSaving: prepareForSaving,
	saveToMolfile: saveToMolfile
};
