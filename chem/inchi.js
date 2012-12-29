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

if (!window.chem || !chem.Struct)
    throw new Error("chem.Molecule should be defined first");

chem.InChiSaver = function() {
};

chem.InChiSaver.prototype.saveMolecule = function(molecule) {
    var ret = '';
    if (ui.standalone) {
        throw { message : 'InChI is not supported in the standalone mode' };
    } else if (molecule.atoms.count() > 0) {
        molecule = molecule.clone();
        molecule.sgroups.each(function(sgid, sg) {
            if (sg.type == 'MUL') {
                try {
                    sg.prepareForSaving(molecule);
                } catch(ex) {
                    throw { message : 'Bad s-group (' + ex.message + ')' };
                }
            } else {
                throw { message : "InChi data format doesn't support s-groups" };
            }
        }, this);
        new Ajax.Request(ui.path + 'getinchi', {
            method: 'post',
            asynchronous : false,
            parameters: { moldata: new chem.MolfileSaver().saveMolecule(molecule) },
            onComplete: function (res) {
                if (res.responseText.startsWith('Ok.')) {
                    ret = res.responseText.split('\n')[1];
                } else if (res.responseText.startsWith('Error.')) {
                    throw { message : res.responseText.split('\n')[1] };
                } else {
                    throw { message : 'Unexpected server message (' + res.responseText + ')' };
                }
            }
        });
    }
    return ret;
};