var element = require('./../element');

var common = require('./common');
var utils = require('./utils');

function Molfile(v3000) {
	/* reader */
	/* saver */
	this.molecule = null;
	this.molfile = null;
	this.v3000 = v3000 || false;
}

Molfile.prototype.parseCTFile = function (molfileLines) {
	var ret = null;
	if (molfileLines[0].search('\\$RXN') == 0)
		ret = common.parseRxn(molfileLines);
	else
		ret = common.parseMol(molfileLines);
	ret.initHalfBonds();
	ret.initNeighbors();
	ret.markFragments();
	return ret;
};

Molfile.prototype.prepareSGroups = function (skipErrors, preserveIndigoDesc) {
	var mol = this.molecule;
	var toRemove = [];
	var errors = 0;

	this.molecule.sGroupForest.getSGroupsBFS().reverse().forEach(function (id) {
		var sgroup = mol.sgroups.get(id);
		var errorIgnore = false;

		try {
			common.prepareForSaving[sgroup.type](sgroup, mol);
		} catch (ex) {
			if (!skipErrors || typeof (ex.id) != 'number')
				throw ex;
			errorIgnore = true;
		}
		/* eslint-disable no-mixed-operators*/
		if (errorIgnore ||
			!preserveIndigoDesc && /^INDIGO_.+_DESC$/i.test(sgroup.data.fieldName)) {
		/* eslint-enable no-mixed-operators*/
			errors += errorIgnore;
			toRemove.push(sgroup.id);
		}
	}, this);
	if (errors)
		throw new Error('WARNING: ' + errors + ' invalid S-groups were detected. They will be omitted.');

	for (var i = 0; i < toRemove.length; ++i)
		mol.sGroupDelete(toRemove[i]);
	return mol;
};

Molfile.prototype.getCTab = function (molecule, rgroups) {
	/* saver */
	this.molecule = molecule.clone();
	this.molfile = '';
	this.writeCTab2000(rgroups);
	return this.molfile;
};

Molfile.prototype.saveMolecule = function (molecule, skipSGroupErrors, norgroups, preserveIndigoDesc) { // eslint-disable-line max-statements
	/* saver */
	this.reaction = molecule.rxnArrows.count() > 0;
	if (molecule.rxnArrows.count() > 1)
		throw new Error('Reaction may not contain more than one arrow');
	this.molfile = '';
	if (this.reaction) {
		if (molecule.rgroups.count() > 0)
			throw new Error('Unable to save the structure - reactions with r-groups are not supported at the moment');
		var components = molecule.getComponents();

		var reactants = components.reactants;
		var products = components.products;
		var all = reactants.concat(products);
		this.molfile = '$RXN\n\n\n\n' +
			utils.paddedNum(reactants.length, 3) +
			utils.paddedNum(products.length, 3) +
			utils.paddedNum(0, 3) + '\n';
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

Molfile.prototype.writeHeader = function () {
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

Molfile.prototype.write = function (str) {
	/* saver */
	this.molfile += str;
};

Molfile.prototype.writeCR = function (str) {
	/* saver */
	if (arguments.length == 0)
		str = '';

	this.molfile += str + '\n';
};

Molfile.prototype.writeWhiteSpace = function (length) {
	/* saver */

	if (arguments.length == 0)
		length = 1;

	length.times(function () {
		this.write(' ');
	}, this);
};

Molfile.prototype.writePadded = function (str, width) {
	/* saver */
	this.write(str);
	this.writeWhiteSpace(width - str.length);
};

Molfile.prototype.writePaddedNumber = function (number, width) {
	/* saver */

	var str = (number - 0).toString();

	this.writeWhiteSpace(width - str.length);
	this.write(str);
};

Molfile.prototype.writePaddedFloat = function (number, width, precision) {
	/* saver */

	this.write(utils.paddedNum(number, width, precision));
};

Molfile.prototype.writeCTab2000Header = function () {
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

Molfile.prototype.writeCTab2000 = function (rgroups) { // eslint-disable-line max-statements
	/* saver */
	this.writeCTab2000Header();

	this.mapping = {};
	var i = 1;

	/* eslint-disable camelcase*/
	var atomList_list = [];
	var atomLabel_list = [];
	/* eslint-enable camel-case*/
	this.molecule.atoms.each(function (id, atom) { // eslint-disable-line max-statements
		this.writePaddedFloat(atom.pp.x, 10, 4);
		this.writePaddedFloat(-atom.pp.y, 10, 4);
		this.writePaddedFloat(atom.pp.z, 10, 4);
		this.writeWhiteSpace();

		var label = atom.label;
		if (atom.atomList != null) {
			label = 'L';
			atomList_list.push(id);
		} else if (element.getElementByLabel(label) == null && ['A', 'Q', 'X', '*', 'R#'].indexOf(label) == -1) { // search in generics?
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

		this.writePaddedNumber(atom.explicitValence < 0 ? 0 : (atom.explicitValence == 0 ? 15 : atom.explicitValence), 3); // eslint-disable-line no-nested-ternary

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
	this.molecule.bonds.each(function (id, bond) {
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
		this.write('A  ');
		this.writePaddedNumber(atomLabel_list[0] + 1, 3);
		this.writeCR();
		this.writeCR(this.molecule.atoms.get(atomLabel_list[0]).label);
		atomLabel_list.splice(0, 1);
	}

	var chargeList = [];
	var isotopeList = [];
	var radicalList = [];
	var rglabelList = [];
	var rglogicList = [];
	var aplabelList = [];
	var rbcountList = [];
	var unsaturatedList = [];
	var substcountList = [];

	this.molecule.atoms.each(function (id, atom) {
		if (atom.charge != 0)
			chargeList.push([id, atom.charge]);
		if (atom.isotope != 0)
			isotopeList.push([id, atom.isotope]);
		if (atom.radical != 0)
			radicalList.push([id, atom.radical]);
		if (atom.rglabel != null && atom.label == 'R#') { // TODO need to force rglabel=null when label is not 'R#'
			for (var rgi = 0; rgi < 32; rgi++)
				if (atom.rglabel & (1 << rgi)) rglabelList.push([id, rgi + 1]);
		}
		if (atom.attpnt != null)
			aplabelList.push([id, atom.attpnt]);
		if (atom.ringBondCount != 0)
			rbcountList.push([id, atom.ringBondCount]);
		if (atom.substitutionCount != 0)
			substcountList.push([id, atom.substitutionCount]);
		if (atom.unsaturatedAtom != 0)
			unsaturatedList.push([id, atom.unsaturatedAtom]);
	});

	if (rgroups) {
		rgroups.each(function (rgid, rg) {
			if (rg.resth || rg.ifthen > 0 || rg.range.length > 0) {
				var line = '  1 ' +
					utils.paddedNum(rgid, 3) + ' ' +
					utils.paddedNum(rg.ifthen, 3) + ' ' +
					utils.paddedNum(rg.resth ? 1 : 0, 3) + '   ' + rg.range;
				rglogicList.push(line);
			}
		});
	}

	function writeAtomPropList(propId, values) {
		while (values.length > 0) {
			var part = [];

			while (values.length > 0 && part.length < 8) {
				part.push(values[0]);
				values.splice(0, 1);
			}

			this.write(propId);
			this.writePaddedNumber(part.length, 3);

			part.each(function (value) {
				this.writeWhiteSpace();
				this.writePaddedNumber(this.mapping[value[0]], 3);
				this.writeWhiteSpace();
				this.writePaddedNumber(value[1], 3);
			}, this);

			this.writeCR();
		}
	}

	writeAtomPropList.call(this, 'M  CHG', chargeList);
	writeAtomPropList.call(this, 'M  ISO', isotopeList);
	writeAtomPropList.call(this, 'M  RAD', radicalList);
	writeAtomPropList.call(this, 'M  RGP', rglabelList);
	for (var j = 0; j < rglogicList.length; ++j)
		this.write('M  LOG' + rglogicList[j] + '\n');

	writeAtomPropList.call(this, 'M  APO', aplabelList);
	writeAtomPropList.call(this, 'M  RBC', rbcountList);
	writeAtomPropList.call(this, 'M  SUB', substcountList);
	writeAtomPropList.call(this, 'M  UNS', unsaturatedList);

	if (atomList_list.length > 0) {
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

	var sgmap = {};
	var cnt = 1;
	var sgmapback = {};
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

		this.writeCR(common.saveToMolfile[sgroup.type](sgroup, this.molecule, sgmap, this.mapping, this.bondMapping));
	}

	// TODO: write M  APO
	// TODO: write M  AAL
	// TODO: write M  RGP
	// TODO: write M  LOG

	this.writeCR('M  END');
};

module.exports = Molfile;
