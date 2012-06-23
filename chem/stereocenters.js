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
    
chem.Stereocenters = function (mol, neighbors_func, context)
{
    this.molecule = mol;
    this.atoms = new util.Map();
    this.getNeighbors = neighbors_func;
    this.context = context;
};

chem.Stereocenters.prototype.each = function (func, context)
{
    this.atoms.each(func, context);
};

chem.Stereocenters.prototype.buildFromBonds = function (/*const int *atom_types, const int *atom_groups, const int *bond_orientations, */ignore_errors)
{
   //_bond_directions.copy(bond_orientations, mol.edgeEnd());

   this.molecule.atoms.each(function (aid)
   {
      /*
      if (atom_types[atom_idx] == 0)
         continue;
         */
      var nei_list = this.getNeighbors.call(this.context, aid);
      var stereocenter = false;
      
      nei_list.find(function (nei)
      {
         var bond = this.molecule.bonds.get(nei.bid);
         
         if (bond.type == chem.Struct.BOND.TYPE.SINGLE && bond.begin == aid)
            if (bond.stereo == chem.Struct.BOND.STEREO.UP || bond.stereo == chem.Struct.BOND.STEREO.DOWN)
            {
                stereocenter = true;
                return true;
            }
         return false;
      }, this);
      
      if (!stereocenter)
         return;

      if (ignore_errors)
      {
//         try
//         {
            this._buildOneCenter(aid/*, atom_groups[atom_idx], atom_types[atom_idx], bond_orientations*/);
//         }
//         catch (er)
//         {
//         }
      }
      else
         this._buildOneCenter(aid/*, atom_groups[atom_idx], atom_types[atom_idx], bond_orientations*/);
   }, this);
};

chem.Stereocenters.allowed_stereocenters =
[
    {elem: 'C',  charge: 0, degree: 3, n_double_bonds: 0, implicit_degree: 4},
    {elem: 'C',  charge: 0, degree: 4, n_double_bonds: 0, implicit_degree: 4},
    {elem: 'Si', charge: 0, degree: 3, n_double_bonds: 0, implicit_degree: 4},
    {elem: 'Si', charge: 0, degree: 4, n_double_bonds: 0, implicit_degree: 4},
    {elem: 'N',  charge: 1, degree: 3, n_double_bonds: 0, implicit_degree: 4},
    {elem: 'N',  charge: 1, degree: 4, n_double_bonds: 0, implicit_degree: 4},
    {elem: 'N',  charge: 0, degree: 3, n_double_bonds: 0, implicit_degree: 3},
    {elem: 'S',  charge: 0, degree: 4, n_double_bonds: 2, implicit_degree: 4},
    {elem: 'S',  charge: 1, degree: 3, n_double_bonds: 0, implicit_degree: 3},
    {elem: 'S',  charge: 0, degree: 3, n_double_bonds: 1, implicit_degree: 3},
    {elem: 'P',  charge: 0, degree: 3, n_double_bonds: 0, implicit_degree: 3},
    {elem: 'P',  charge: 1, degree: 4, n_double_bonds: 0, implicit_degree: 4},
    {elem: 'P',  charge: 0, degree: 4, n_double_bonds: 1, implicit_degree: 4}
];


chem.Stereocenters.prototype._buildOneCenter = function (atom_idx/*, int group, int type, const int *bond_orientations*/)
{
   var atom = this.molecule.atoms.get(atom_idx);

   var nei_list = this.getNeighbors.call(this.context, atom_idx);
   var degree = nei_list.length;
   var implicit_degree = -1;

   var stereocenter =
   {
       group: 0, // = group;
       type: 0, // = type;
       pyramid: new Array(4)
   };
   
   var nei_idx = 0;
   var edge_ids = new Array(4);

   var last_atom_dir = 0;
   var n_double_bonds = 0;

   stereocenter.pyramid[0] = -1;
   stereocenter.pyramid[1] = -1;
   stereocenter.pyramid[2] = -1;
   stereocenter.pyramid[3] = -1;

   var n_pure_hydrogens = 0;

   if (degree > 4)
      throw new Error("stereocenter with %d bonds are not supported" + degree);

   nei_list.each(function (nei)
   {
      var nei_atom = this.molecule.atoms.get(nei.aid);
      var bond = this.molecule.bonds.get(nei.bid);

      edge_ids[nei_idx] =
      {
         edge_idx: nei.bid,
         nei_idx: nei.aid,
         rank: nei.aid,
         vec: util.Vec2.diff(nei_atom.pp, atom.pp)
      };

      if (nei_atom.pureHydrogen())
      {
         n_pure_hydrogens++;
         edge_ids[nei_idx].rank = 10000;
      } else if (nei_atom.label == 'H')
         edge_ids[nei_idx].rank = 5000;

      if (!edge_ids[nei_idx].vec.normalize())
         throw new Error("zero bond length");

      if (bond.type == chem.Struct.BOND.TYPE.TRIPLE)
         throw new Error("non-single bonds not allowed near stereocenter");
      else if (bond.type == chem.Struct.BOND.TYPE.AROMATIC)
         throw new Error("aromatic bonds not allowed near stereocenter");
      else if (bond.type == chem.Struct.BOND.TYPE.DOUBLE)
         n_double_bonds++;

      nei_idx++;
   }, this);

   chem.Stereocenters.allowed_stereocenters.find(function (as)
   {
      if (as.elem == atom.label && as.charge == atom.charge &&
          as.degree == degree && as.n_double_bonds == n_double_bonds)
      {
         implicit_degree = as.implicit_degree;
         return true;
      }
      return false;
   }, this);

   if (implicit_degree == -1)
      throw new Error("unknown stereocenter configuration: " + atom.label + ", charge " + atom.charge + ", " + degree + " bonds (" + n_double_bonds + " double)");

   if (degree == 4 && n_pure_hydrogens > 1)
      throw new Error(n_pure_hydrogens + " hydrogens near stereocenter");

   if (degree == 3 && implicit_degree == 4 && n_pure_hydrogens > 0)
      throw new Error("have hydrogen(s) besides implicit hydrogen near stereocenter");

   /*
   if (stereocenter.type == ATOM_ANY)
   {
      _stereocenters.insert(atom_idx, stereocenter);
      return;
   }
   */

   if (degree == 4)
   {
      // sort by neighbor atom index (ascending)
      if (edge_ids[0].rank > edge_ids[1].rank)
         edge_ids.swap(0, 1);
      if (edge_ids[1].rank > edge_ids[2].rank)
         edge_ids.swap(1, 2);
      if (edge_ids[2].rank > edge_ids[3].rank)
         edge_ids.swap(2, 3);
      if (edge_ids[1].rank > edge_ids[2].rank)
         edge_ids.swap(1, 2);
      if (edge_ids[0].rank > edge_ids[1].rank)
         edge_ids.swap(0, 1);
      if (edge_ids[1].rank > edge_ids[2].rank)
         edge_ids.swap(1, 2);

      var main1 = -1, main2 = -1, side1 = -1, side2 = -1;
      var main_dir = 0;

      for (nei_idx = 0; nei_idx < 4; nei_idx++)
      {
         var stereo = this._getBondStereo(atom_idx, edge_ids[nei_idx].edge_idx);

         if (stereo == chem.Struct.BOND.STEREO.UP || stereo == chem.Struct.BOND.STEREO.DOWN)
         {
            main1 = nei_idx;
            main_dir = stereo;
            break;
         }
      }

      if (main1 == -1)
         throw new Error("none of 4 bonds going from stereocenter is stereobond");

      var xyz1, xyz2;

      // find main2 as opposite to main1
      if (main2 == -1)
      {
         xyz1 = chem.Stereocenters._xyzzy(edge_ids[main1].vec, edge_ids[(main1 + 1) % 4].vec, edge_ids[(main1 + 2) % 4].vec);
         xyz2 = chem.Stereocenters._xyzzy(edge_ids[main1].vec, edge_ids[(main1 + 1) % 4].vec, edge_ids[(main1 + 3) % 4].vec);

         if (xyz1 + xyz2 == 3 || xyz1 + xyz2 == 12)
         {
            main2 = (main1 + 1) % 4;
            side1 = (main1 + 2) % 4;
            side2 = (main1 + 3) % 4;
         }
      }
      if (main2 == -1)
      {
         xyz1 = chem.Stereocenters._xyzzy(edge_ids[main1].vec, edge_ids[(main1 + 2) % 4].vec, edge_ids[(main1 + 1) % 4].vec);
         xyz2 = chem.Stereocenters._xyzzy(edge_ids[main1].vec, edge_ids[(main1 + 2) % 4].vec, edge_ids[(main1 + 3) % 4].vec);

         if (xyz1 + xyz2 == 3 || xyz1 + xyz2 == 12)
         {
            main2 = (main1 + 2) % 4;
            side1 = (main1 + 1) % 4;
            side2 = (main1 + 3) % 4;
         }
      }
      if (main2 == -1)
      {
         xyz1 = chem.Stereocenters._xyzzy(edge_ids[main1].vec, edge_ids[(main1 + 3) % 4].vec, edge_ids[(main1 + 1) % 4].vec);
         xyz2 = chem.Stereocenters._xyzzy(edge_ids[main1].vec, edge_ids[(main1 + 3) % 4].vec, edge_ids[(main1 + 2) % 4].vec);

         if (xyz1 + xyz2 == 3 || xyz1 + xyz2 == 12)
         {
            main2 = (main1 + 3) % 4;
            side1 = (main1 + 2) % 4;
            side2 = (main1 + 1) % 4;
         }
      }

      if (main2 == -1)
         throw new Error("internal error: can not find opposite bond");

      if (main_dir == chem.Struct.BOND.STEREO.UP && this._getBondStereo(atom_idx, edge_ids[main2].edge_idx) == chem.Struct.BOND.STEREO.DOWN)
         throw new Error("stereo types of the opposite bonds mismatch");
      if (main_dir == chem.Struct.BOND.STEREO.DOWN && this._getBondStereo(atom_idx, edge_ids[main2].edge_idx) == chem.Struct.BOND.STEREO.UP)
         throw new Error("stereo types of the opposite bonds mismatch");

      if (main_dir == this._getBondStereo(atom_idx, edge_ids[side1].edge_idx))
         throw new Error("stereo types of non-opposite bonds match");
      if (main_dir == this._getBondStereo(atom_idx, edge_ids[side2].edge_idx))
         throw new Error("stereo types of non-opposite bonds match");

      if (main1 == 3 || main2 == 3)
         last_atom_dir = main_dir;
      else
         last_atom_dir = (main_dir == chem.Struct.BOND.STEREO.UP ? chem.Struct.BOND.STEREO.DOWN : chem.Struct.BOND.STEREO.UP);

      sign = chem.Stereocenters._sign(edge_ids[0].vec, edge_ids[1].vec, edge_ids[2].vec);

      if ((last_atom_dir == chem.Struct.BOND.STEREO.UP && sign > 0) ||
          (last_atom_dir == chem.Struct.BOND.STEREO.DOWN && sign < 0))
      {
         stereocenter.pyramid[0] = edge_ids[0].nei_idx;
         stereocenter.pyramid[1] = edge_ids[1].nei_idx;
         stereocenter.pyramid[2] = edge_ids[2].nei_idx;
      }
      else
      {
         stereocenter.pyramid[0] = edge_ids[0].nei_idx;
         stereocenter.pyramid[1] = edge_ids[2].nei_idx;
         stereocenter.pyramid[2] = edge_ids[1].nei_idx;
      }

      stereocenter.pyramid[3] = edge_ids[3].nei_idx;
   }
   else if (degree == 3)
   {
      // sort by neighbor atom index (ascending)
      if (edge_ids[0].rank > edge_ids[1].rank)
         edge_ids.swap(0, 1);
      if (edge_ids[1].rank > edge_ids[2].rank)
         edge_ids.swap(1, 2);
      if (edge_ids[0].rank > edge_ids[1].rank)
         edge_ids.swap(0, 1);

      var stereo0 = this._getBondStereo(atom_idx, edge_ids[0].edge_idx);
      var stereo1 = this._getBondStereo(atom_idx, edge_ids[1].edge_idx);
      var stereo2 = this._getBondStereo(atom_idx, edge_ids[2].edge_idx);

      var n_up = 0, n_down = 0;

      n_up += ((stereo0 == chem.Struct.BOND.STEREO.UP) ? 1 : 0);
      n_up += ((stereo1 == chem.Struct.BOND.STEREO.UP) ? 1 : 0);
      n_up += ((stereo2 == chem.Struct.BOND.STEREO.UP) ? 1 : 0);

      n_down += ((stereo0 == chem.Struct.BOND.STEREO.DOWN) ? 1 : 0);
      n_down += ((stereo1 == chem.Struct.BOND.STEREO.DOWN) ? 1 : 0);
      n_down += ((stereo2 == chem.Struct.BOND.STEREO.DOWN) ? 1 : 0);

      if (implicit_degree == 4) // have implicit hydrogen
      {
         if (n_up == 3)
            throw new Error("all 3 bonds up near stereoatom");
         if (n_down == 3)
            throw new Error("all 3 bonds down near stereoatom");

         if (n_up == 0 && n_down == 0)
            throw new Error("no up/down bonds near stereoatom -- indefinite case");
         if (n_up == 1 && n_down == 1)
            throw new Error("one bond up, one bond down -- indefinite case");

         main_dir = 0;

         if (n_up == 2)
            last_atom_dir = chem.Struct.BOND.STEREO.DOWN;
         else if (n_down == 2)
            last_atom_dir = chem.Struct.BOND.STEREO.UP;
         else
         {
            main1 = -1;
            side1 = -1;
            side2 = -1;

            for (nei_idx = 0; nei_idx < 3; nei_idx++)
            {
               dir = this._getBondStereo(atom_idx, edge_ids[nei_idx].edge_idx);

               if (dir == chem.Struct.BOND.STEREO.UP || dir == chem.Struct.BOND.STEREO.DOWN)
               {
                  main1 = nei_idx;
                  main_dir = dir;
                  side1 = (nei_idx + 1) % 3;
                  side2 = (nei_idx + 2) % 3;
                  break;
               }
            }

            if (main1 == -1)
               throw new Error("internal error: can not find up or down bond");

            var xyz = chem.Stereocenters._xyzzy(edge_ids[side1].vec, edge_ids[side2].vec, edge_ids[main1].vec);

            if (xyz == 3 || xyz == 4)
               throw new Error("degenerate case for 3 bonds near stereoatom");

            if (xyz == 1)
               last_atom_dir = main_dir;
            else
               last_atom_dir = (main_dir == chem.Struct.BOND.STEREO.UP ? chem.Struct.BOND.STEREO.DOWN : chem.Struct.BOND.STEREO.UP);
         }

         var sign = chem.Stereocenters._sign(edge_ids[0].vec, edge_ids[1].vec, edge_ids[2].vec);

         if ((last_atom_dir == chem.Struct.BOND.STEREO.UP && sign > 0) ||
             (last_atom_dir == chem.Struct.BOND.STEREO.DOWN && sign < 0))
         {
            stereocenter.pyramid[0] = edge_ids[0].nei_idx;
            stereocenter.pyramid[1] = edge_ids[1].nei_idx;
            stereocenter.pyramid[2] = edge_ids[2].nei_idx;
         }
         else
         {
            stereocenter.pyramid[0] = edge_ids[0].nei_idx;
            stereocenter.pyramid[1] = edge_ids[2].nei_idx;
            stereocenter.pyramid[2] = edge_ids[1].nei_idx;
         }

         stereocenter.pyramid[3] = -1;
      }
      else // 3-connected P, N or S; no implicit hydrogens
      {
         var dir;

         if (n_down > 0 && n_up > 0)
            throw new Error("one bond up, one bond down -- indefinite case");
         else if (n_down == 0 && n_up == 0)
            throw new Error("no up-down bonds attached to stereocenter");
         else if (n_up > 0)
            dir = 1;
         else
            dir = -1;

         if (chem.Stereocenters._xyzzy(edge_ids[0].vec, edge_ids[1].vec, edge_ids[2].vec) == 1 ||
             chem.Stereocenters._xyzzy(edge_ids[0].vec, edge_ids[2].vec, edge_ids[1].vec) == 1 ||
             chem.Stereocenters._xyzzy(edge_ids[2].vec, edge_ids[1].vec, edge_ids[0].vec) == 1)
            // all bonds belong to the same half-plane
            dir = -dir;

         sign = chem.Stereocenters._sign(edge_ids[0].vec, edge_ids[1].vec, edge_ids[2].vec);

         if (sign == dir)
         {
            stereocenter.pyramid[0] = edge_ids[0].nei_idx;
            stereocenter.pyramid[1] = edge_ids[2].nei_idx;
            stereocenter.pyramid[2] = edge_ids[1].nei_idx;
         }
         else
         {
            stereocenter.pyramid[0] = edge_ids[0].nei_idx;
            stereocenter.pyramid[1] = edge_ids[1].nei_idx;
            stereocenter.pyramid[2] = edge_ids[2].nei_idx;
         }
         stereocenter.pyramid[3] = -1;
      }
   }

   this.atoms.set(atom_idx, stereocenter);
};

chem.Stereocenters.prototype._getBondStereo = function (center_idx, edge_idx)
{
   var bond = this.molecule.bonds.get(edge_idx);

   if (center_idx != bond.begin) // TODO: check this
      return 0;

   return bond.stereo;
};

// 1 -- in the smaller angle, 2 -- in the bigger angle,
// 4 -- in the 'positive' straight angle, 8 -- in the 'negative' straight angle
chem.Stereocenters._xyzzy = function (v1, v2, u)
{
   var eps = 0.001;

   var sine1 = util.Vec2.cross(v1, v2);
   var cosine1 = util.Vec2.dot(v1, v2);

   var sine2 = util.Vec2.cross(v1, u);
   var cosine2 = util.Vec2.dot(v1, u);

   if (Math.abs(sine1) < eps)
   {
      if (Math.abs(sine2) < eps)
         throw new Error("degenerate case -- bonds overlap");

      return (sine2 > 0) ? 4 : 8;
   }

   if (sine1 * sine2 < -eps * eps)
      return 2;

   if (cosine2 < cosine1)
      return 2;

   return 1;
};

chem.Stereocenters._sign = function (v1, v2, v3)
{
   var res = (v1.x - v3.x) * (v2.y - v3.y) - (v1.y - v3.y) * (v2.x - v3.x);
   var eps = 0.001;

   if (res > eps)
      return 1;
   if (res < -eps)
      return -1;

   throw new Error("degenerate triangle");
};

chem.Stereocenters.isPyramidMappingRigid = function (mapping)
{
   var arr = mapping.clone();
   var rigid = true;

   if (arr[0] > arr[1])
      arr.swap(0, 1), rigid = !rigid;
   if (arr[1] > arr[2])
      arr.swap(1, 2), rigid = !rigid;
   if (arr[2] > arr[3])
      arr.swap(2, 3), rigid = !rigid;
   if (arr[1] > arr[2])
      arr.swap(1, 2), rigid = !rigid;
   if (arr[0] > arr[1])
      arr.swap(0, 1), rigid = !rigid;
   if (arr[1] > arr[2])
      arr.swap(1, 2), rigid = !rigid;

   return rigid;
};
