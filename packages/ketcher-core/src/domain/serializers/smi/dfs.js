/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

function Dfs(mol, atomData, components, nReactants) {
  this.molecule = mol;
  this.atom_data = atomData;
  this.components = components;
  this.nComponentsInReactants = -1;
  this.nReactants = nReactants;

  this.vertices = new Array(this.molecule.atoms.size); // Minimum size
  this.molecule.atoms.forEach((atom, aid) => {
    this.vertices[aid] = new Dfs.VertexDesc();
  }, this);

  this.edges = new Array(this.molecule.bonds.size); // Minimum size
  this.molecule.bonds.forEach((bond, bid) => {
    this.edges[bid] = new Dfs.EdgeDesc();
  }, this);

  this.v_seq = [];
}

Dfs.VertexDesc = function () {
  this.dfs_state = 0; // 0 -- not on stack
  // 1 -- on stack
  // 2 -- removed from stack
  this.parent_vertex = 0; // parent vertex in DFS tree
  this.parent_edge = 0; // edge to parent vertex
  this.branches = 0; // how many DFS branches go out from this vertex}
};

Dfs.EdgeDesc = function () {
  this.opening_cycles = 0; // how many cycles are
  // (i) starting with this edge
  // and (ii) ending in this edge's first vertex
  this.closing_cycle = 0; // 1 if this edge closes a cycle
};

Dfs.SeqElem = function (vIdx, parVertex, parEdge) {
  this.idx = vIdx; // index of vertex in _graph
  this.parent_vertex = parVertex; // parent vertex in DFS tree
  this.parent_edge = parEdge; // edge to parent vertex
};

Dfs.prototype._findNextUnvisitedVertex = function (cid, component) {
  let selected = -1;

  while (cid.value < this.components.length && selected === -1) {
    selected = this.components[cid.value].find((aid) => {
      if (this.vertices[aid].dfs_state === 0) {
        selected = aid;
        return true;
      }
      return false;
    });
    if (selected === null) {
      selected = -1;
      cid.value++;
    }
    if (cid.value === this.nReactants) {
      this.nComponentsInReactants = component;
    }
  }
  if (selected < -1) {
    this.molecule.atoms.find((aid) => {
      if (this.vertices[aid].dfs_state === 0) {
        selected = aid;
        return true;
      }
      return false;
    });
  }
  return selected;
};

Dfs.prototype._processClosedCycle = function (vIdx, neiIdx, edgeIdx) {
  this.edges[edgeIdx].closing_cycle = 1;

  let j = vIdx;
  while (j !== -1 && this.vertices[j].parent_vertex !== neiIdx) {
    j = this.vertices[j].parent_vertex;
  }

  if (j === -1) throw new Error('cycle unwind error');

  this.edges[this.vertices[j].parent_edge].opening_cycles++;
  this.vertices[vIdx].branches++;

  const seqElem = new Dfs.SeqElem(neiIdx, vIdx, edgeIdx);
  this.v_seq.push(seqElem);
};

Dfs.prototype._processOpenVertex = function (vIdx, neiIdx, edgeIdx, vStack) {
  if (this.vertices[neiIdx].dfs_state === 1) {
    const j = vStack.indexOf(neiIdx);

    if (j === -1) {
      throw new Error('internal: removing vertex from stack');
    }

    vStack.splice(j, 1);

    const parent = this.vertices[neiIdx].parent_vertex;

    if (parent >= 0) {
      this.vertices[parent].branches--;
    }
  }

  this.vertices[vIdx].branches++;
  this.vertices[neiIdx].parent_vertex = vIdx;
  this.vertices[neiIdx].parent_edge = edgeIdx;
  this.vertices[neiIdx].dfs_state = 1;
  vStack.push(neiIdx);
};

Dfs.prototype._processNeighbors = function (vIdx, parentVertex, vStack) {
  const atomD = this.atom_data[vIdx];

  for (let i = 0; i < atomD.neighbours.length; i++) {
    const neiIdx = atomD.neighbours[i].aid;
    const edgeIdx = atomD.neighbours[i].bid;

    if (neiIdx === parentVertex) continue; // eslint-disable-line no-continue

    if (this.vertices[neiIdx].dfs_state === 2) {
      this._processClosedCycle(vIdx, neiIdx, edgeIdx);
    } else {
      this._processOpenVertex(vIdx, neiIdx, edgeIdx, vStack);
    }
  }
};

Dfs.prototype.walk = function () {
  const vStack = [];
  const cid = { value: 0 };
  let component = 0;

  while (true) {
    // eslint-disable-line no-constant-condition
    if (vStack.length < 1) {
      const selected = this._findNextUnvisitedVertex(cid, component);
      if (selected === -1) break;
      this.vertices[selected].parent_vertex = -1;
      this.vertices[selected].parent_edge = -1;
      vStack.push(selected);
      component++;
    }

    const vIdx = vStack.pop();
    const parentVertex = this.vertices[vIdx].parent_vertex;

    const seqElem = new Dfs.SeqElem(
      vIdx,
      parentVertex,
      this.vertices[vIdx].parent_edge,
    );
    this.v_seq.push(seqElem);

    this.vertices[vIdx].dfs_state = 2;

    this._processNeighbors(vIdx, parentVertex, vStack);
  }
};

Dfs.prototype.edgeClosingCycle = function (eIdx) {
  return this.edges[eIdx].closing_cycle !== 0;
};

Dfs.prototype.numBranches = function (vIdx) {
  return this.vertices[vIdx].branches;
};

Dfs.prototype.numOpeningCycles = function (eIdx) {
  return this.edges[eIdx].opening_cycles;
};

Dfs.prototype.toString = function () {
  let str = '';
  this.v_seq.forEach((seqElem) => {
    str += seqElem.idx + ' -> ';
  });
  str += '*';
  return str;
};

export default Dfs;
