"""
Copyright Schrodinger, LLC. All rights reserved.
"""

import csv
import os
import requests
import sys
import tempfile
from flask import Flask
from flask import jsonify, request, render_template
from flask_cors import CORS, cross_origin
from  rdkit import Chem
from  rdkit.Chem import rdDepictor
from functools import partial


app = Flask(__name__)
CORS(app)

sys.path.insert(0, "/software/lib/Darwin-x86_64/rdkit-Release_2018_03_2/lib/python3.6/site-packages/")


def runOnMolecule(function):
    json = request.json
    struct = json['struct']
    mol = Chem.MolFromMolBlock(struct)
    function(mol)
    struct = Chem.MolToMolBlock(mol, kekulize=False)
    json['struct']=struct
    return jsonify(json)


def cleanUp(molecule):
    rdDepictor.SetPreferCoordGen(True)
    rdDepictor.Compute2DCoords(molecule)



@app.route('/info', methods=['GET'])
def info():
   info = {'imago_version':'no_imago'}
   return jsonify(info)



@app.route('/calculate_cip', methods=['POST'])
def calculate_CIP():
    """
        Find out the CIP description of chiral centers and bonds
        """
    json = request.json
    struct = json['struct']
    mol = Chem.MolFromMolBlock(struct)
    Chem.AssignStereochemistry(mol)
    cipAtoms = []
    for atom in mol.GetAtoms():
        if atom.HasProp('_CIPCode'):
            cipAtoms.append((atom.GetIdx(), "(%s)" % atom.GetProp('_CIPCode')))
    cipBonds = []
    for bond in mol.GetBonds():
        bondCIP = ""
        if (bond.GetStereo() == Chem.rdchem.BondStereo.STEREOE) : bondCIP = "(E)"
        if (bond.GetStereo() == Chem.rdchem.BondStereo.STEREOZ) : bondCIP = "(Z)"
        if (bondCIP != "") :
            cipBonds.append((bond.GetBeginAtomIdx(), bond.GetEndAtomIdx(), bondCIP))
    json['CIP_atoms']=cipAtoms
    json['CIP_bonds']=cipBonds
    return jsonify(json)


@app.route('/clean', methods=['POST'])
def cleanStructure():
    """
    Perform clean up of a structure
    :rtype: json
    """
    return runOnMolecule(cleanUp)


@app.route('/aromatize', methods=['POST'])
def aromatizeStructure():
    """
    Aromatize the structure
    :rtype: json
    """
    return runOnMolecule(partial (Chem.SanitizeMol,
                                  sanitizeOps=
                                  Chem.SANITIZE_SETAROMATICITY))


@app.route('/dearomatize', methods=['POST'])
def dearomatizeStructure():
    """
    Kekulize the structure
    :rtype: json
    """
    return runOnMolecule(partial (Chem.SanitizeMol,
                                  sanitizeOps=
                                  Chem.SANITIZE_KEKULIZE))
