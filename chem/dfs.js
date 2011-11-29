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
    throw new Error("Molecule should be defined first");

chem.Dfs = function (mol, atom_data, components, nReactants)
{
    this.molecule = mol;
    this.atom_data = atom_data;
    this.components = components;
    this.nComponentsInReactants = -1;
    this.nReactants = nReactants;

    this.vertices = new Array(this.molecule.atoms.count()); // Minimum size
    this.molecule.atoms.each(function (aid)
    {
        this.vertices[aid] = new chem.Dfs.VertexDesc();
    }, this);

    this.edges = new Array(this.molecule.bonds.count()); // Minimum size
    this.molecule.bonds.each(function (bid)
    {
        this.edges[bid] = new chem.Dfs.EdgeDesc();
    }, this);

    this.v_seq = new Array();
};

chem.Dfs.VertexDesc = function ()
{
    this.dfs_state = 0;       // 0 -- not on stack
                              // 1 -- on stack
                              // 2 -- removed from stack
    this.parent_vertex = 0;   // parent vertex in DFS tree
    this.parent_edge = 0;     // edge to parent vertex
    this.branches = 0;    // how many DFS branches go out from this vertex}
};

chem.Dfs.EdgeDesc = function ()
{
    this.opening_cycles = 0; // how many cycles are
                             // (i) starting with this edge
                             // and (ii) ending in this edge's first vertex
    this.closing_cycle = 0;  // 1 if this edge closes a cycle
};

chem.Dfs.SeqElem = function (v_idx, par_vertex, par_edge)
{
    this.idx = v_idx;                // index of vertex in _graph
    this.parent_vertex = par_vertex; // parent vertex in DFS tree
    this.parent_edge = par_edge;     // edge to parent vertex
};

chem.Dfs.prototype.walk = function ()
{
   var v_stack = new Array();
   var i, j;
   var cid = 0;
   var component = 0;

   while (true)
   {
      if (v_stack.length < 1)
      {
         var selected = -1;

         var findFunc = function (aid)
         {
            if (this.vertices[aid].dfs_state == 0)
            {
                selected = aid;
                return true;
            }
            return false;
         };

         while (cid < this.components.length && selected == -1) {
             selected = util.Set.find(this.components[cid], findFunc, this);
             if (selected === null) {
                 selected = -1;
                 cid++;
                 if (cid == this.nReactants) {
                     this.nComponentsInReactants = component;
                 }
             }
         }
         if (selected < -1) {
            this.molecule.atoms.find(findFunc, this);
         }
         if (selected == -1)
            break;
         this.vertices[selected].parent_vertex = -1;
         this.vertices[selected].parent_edge = -1;
         v_stack.push(selected);
         component++;
      }

      var v_idx = v_stack.pop();
      var parent_vertex = this.vertices[v_idx].parent_vertex;

      var seq_elem = new chem.Dfs.SeqElem(v_idx, parent_vertex, this.vertices[v_idx].parent_edge);
      this.v_seq.push(seq_elem);

      this.vertices[v_idx].dfs_state = 2;

      var atom_d = this.atom_data[v_idx];

      for (i = 0; i < atom_d.neighbours.length; i++)
      {
         var nei_idx = atom_d.neighbours[i].aid;
         var edge_idx = atom_d.neighbours[i].bid;

         if (nei_idx == parent_vertex)
            continue;

         if (this.vertices[nei_idx].dfs_state == 2)
         {
            this.edges[edge_idx].closing_cycle = 1;

            j = v_idx;

            while (j != -1)
            {
               if (this.vertices[j].parent_vertex == nei_idx)
                  break;
               j = this.vertices[j].parent_vertex;
            }

            if (j == -1)
               throw new Error("cycle unwind error");

            this.edges[this.vertices[j].parent_edge].opening_cycles++;
            this.vertices[v_idx].branches++;

            seq_elem = new chem.Dfs.SeqElem(nei_idx, v_idx, edge_idx);
            this.v_seq.push(seq_elem);
         }
         else
         {
            if (this.vertices[nei_idx].dfs_state == 1)
            {
               j = v_stack.indexOf(nei_idx);

               if (j == -1)
                  throw new Error("internal: removing vertex from stack");

               v_stack.splice(j, 1);

               var parent = this.vertices[nei_idx].parent_vertex;

               if (parent >= 0)
                  this.vertices[parent].branches--;
            }

            this.vertices[v_idx].branches++;
            this.vertices[nei_idx].parent_vertex = v_idx;
            this.vertices[nei_idx].parent_edge = edge_idx;
            this.vertices[nei_idx].dfs_state = 1;
            v_stack.push(nei_idx);
         }
      }
   }
};

chem.Dfs.prototype.edgeClosingCycle = function (e_idx)
{
   return this.edges[e_idx].closing_cycle != 0;
};

chem.Dfs.prototype.numBranches = function (v_idx)
{
   return this.vertices[v_idx].branches;
};

chem.Dfs.prototype.numOpeningCycles = function (e_idx)
{
   return this.edges[e_idx].opening_cycles;
};

chem.Dfs.prototype.toString = function ()
{
    var str = '';
    this.v_seq.each(function (seq_elem) {str += seq_elem.idx + ' -> '});
    str += '*';
    return str;
};
