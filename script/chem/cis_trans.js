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
    throw new Error("Vec2 and Molecule should be defined first");
    
chem.CisTrans = function (mol, neighbors_func, context)
{
    this.molecule = mol;
    this.bonds = new util.Map();
    this.getNeighbors = neighbors_func;
    this.context = context;
};

chem.CisTrans.PARITY =
{
    NONE:  0,
    CIS:   1,
    TRANS: 2
};

chem.CisTrans.prototype.each = function (func, context)
{
    this.bonds.each(func, context);
};

chem.CisTrans.prototype.getParity = function (idx)
{
    return this.bonds.get(idx).parity;
};

chem.CisTrans.prototype.getSubstituents = function (idx)
{
    return this.bonds.get(idx).substituents;
};

chem.CisTrans.prototype.sameside = function (beg, end, nei_beg, nei_end)
{
   var diff = util.Vec2.diff(beg, end);
   var norm = new util.Vec2(-diff.y, diff.x);

   if (!norm.normalize())
      return 0;

   var norm_beg = util.Vec2.diff(nei_beg, beg);
   var norm_end = util.Vec2.diff(nei_end, end);

   if (!norm_beg.normalize())
      return 0;
   if (!norm_end.normalize())
      return 0;

   var prod_beg = util.Vec2.dot(norm_beg, norm);
   var prod_end = util.Vec2.dot(norm_end, norm);

   if (Math.abs(prod_beg) < 0.001 || Math.abs(prod_end) < 0.001)
      return 0;

   return (prod_beg * prod_end > 0) ? 1 : -1;
};

chem.CisTrans.prototype._sameside = function (i_beg, i_end, i_nei_beg, i_nei_end)
{
   return this.sameside(this.molecule.atoms.get(i_beg).pp, this.molecule.atoms.get(i_end).pp,
      this.molecule.atoms.get(i_nei_beg).pp, this.molecule.atoms.get(i_nei_end).pp);
};

chem.CisTrans.prototype._sortSubstituents = function (substituents)
{
   var h0 = this.molecule.atoms.get(substituents[0]).pureHydrogen();
   var h1 = substituents[1] < 0 || this.molecule.atoms.get(substituents[1]).pureHydrogen();
   var h2 = this.molecule.atoms.get(substituents[2]).pureHydrogen();
   var h3 = substituents[3] < 0 || this.molecule.atoms.get(substituents[3]).pureHydrogen();

   if (h0 && h1)
      return false;
   if (h2 && h3)
      return false;

   if (h1)
      substituents[1] = -1;
   else if (h0)
   {
      substituents[0] = substituents[1];
      substituents[1] = -1;
   }
   else if (substituents[0] > substituents[1])
      substituents.swap(0, 1);

   if (h3)
      substituents[3] = -1;
   else if (h2)
   {
      substituents[2] = substituents[3];
      substituents[3] = -1;
   }
   else if (substituents[2] > substituents[3])
      substituents.swap(2, 3);

   return true;
};

chem.CisTrans.prototype.isGeomStereoBond = function (bond_idx, substituents)
{
   // it must be [C,N,Si]=[C,N,Si] bond
   
   var bond = this.molecule.bonds.get(bond_idx);

   if (bond.type != chem.Struct.BOND.TYPE.DOUBLE)
      return false;

   var label1 = this.molecule.atoms.get(bond.begin).label;
   var label2 = this.molecule.atoms.get(bond.end).label;

   if (label1 != 'C' && label1 != 'N' && label1 != 'Si' && label1 != 'Ge')
      return false;
   if (label2 != 'C' && label2 != 'N' && label2 != 'Si' && label2 != 'Ge')
      return false;

   // the atoms should have 1 or 2 single bonds
   // (apart from the double bond under consideration)
   var nei_begin = this.getNeighbors.call(this.context, bond.begin);
   var nei_end = this.getNeighbors.call(this.context, bond.end);

   if (nei_begin.length < 2 || nei_begin.length > 3 ||
       nei_end.length < 2 || nei_end.length > 3)
      return false;

   substituents[0] = -1;
   substituents[1] = -1;
   substituents[2] = -1;
   substituents[3] = -1;

   var i;
   var nei;
   
   for (i = 0; i < nei_begin.length; i++)
   {
      nei = nei_begin[i];
      
      if (nei.bid == bond_idx)
         continue;
      
      if (this.molecule.bonds.get(nei.bid).type != chem.Struct.BOND.TYPE.SINGLE)
         return false;

      if (substituents[0] == -1)
         substituents[0] = nei.aid;
      else // (substituents[1] == -1)
         substituents[1] = nei.aid;
   }

   for (i = 0; i < nei_end.length; i++)
   {
      nei = nei_end[i];

      if (nei.bid == bond_idx)
         continue;
      
      if (this.molecule.bonds.get(nei.bid).type != chem.Struct.BOND.TYPE.SINGLE)
         return false;

      if (substituents[2] == -1)
         substituents[2] = nei.aid;
      else // (substituents[3] == -1)
         substituents[3] = nei.aid;
   }

   if (substituents[1] != -1 && this._sameside(bond.begin, bond.end, substituents[0], substituents[1]) != -1)
      return false;
   if (substituents[3] != -1 && this._sameside(bond.begin, bond.end, substituents[2], substituents[3]) != -1)
      return false;

   return true;
};

chem.CisTrans.prototype.build = function (exclude_bonds)
{
   this.molecule.bonds.each(function (bid, bond)
   {
      var ct = this.bonds.set(bid, 
      { 
         parity: 0,
         substituents: new Array(4)
      });

      if (Object.isArray(exclude_bonds) && exclude_bonds[bid])
         return;

      if (!this.isGeomStereoBond(bid, ct.substituents))
         return;

      if (!this._sortSubstituents(ct.substituents))
         return;

      var sign = this._sameside(bond.begin, bond.end, ct.substituents[0], ct.substituents[2]);

      if (sign == 1)
         ct.parity = chem.CisTrans.PARITY.CIS;
      else if (sign == -1)
         ct.parity = chem.CisTrans.PARITY.TRANS;
   }, this);
};


    
