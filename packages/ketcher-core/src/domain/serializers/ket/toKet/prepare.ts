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
import { Pile, Pool, SGroup, Struct, Vec2 } from 'domain/entities';

type KetNode = {
  type: string;
  fragment?: Struct;
  center: Vec2;
  data?: any;
};

export function prepareStructForKet(struct: Struct) {
  const ketNodes: KetNode[] = [];

  const rgFrags = new Set(); // skip this when writing molecules
  for (const [rgnumber, rgroup] of struct.rgroups.entries()) {
    // RGroups writing
    rgroup.frags.forEach((frid) => rgFrags.add(frid));

    const fragsAtoms = Array.from(rgroup.frags.values()).reduce(
      (res, frid) => res.union(struct.getFragmentIds(frid)),
      new Pile(),
    );

    ketNodes.push({
      type: 'rgroup',
      fragment: struct.clone(fragsAtoms),
      center: getFragmentCenter(struct, fragsAtoms),
      data: { rgnumber, rgroup },
    });
  }

  const filteredFragmentIds = Array.from(struct.frags.keys()).filter(
    (fid) => !rgFrags.has(fid),
  );
  addMolecules(ketNodes, filteredFragmentIds, struct);

  struct.rxnArrows.forEach((item) => {
    ketNodes.push({
      type: 'arrow',
      center: item.pos[0],
      data: {
        mode: item.mode,
        pos: item.pos,
        height: item.height,
      },
    });
  });

  struct.rxnPluses.forEach((item) => {
    ketNodes.push({
      type: 'plus',
      center: item.pp,
      data: {},
    });
  });

  struct.simpleObjects.forEach((item) => {
    ketNodes.push({
      type: 'simpleObject',
      center: item.pos[0],
      data: {
        mode: item.mode,
        pos: item.pos,
      },
    });
  });

  struct.texts.forEach((item) => {
    ketNodes.push({
      type: 'text',
      center: item.position,
      data: {
        content: item.content,
        position: item.position,
        pos: item.pos,
      },
    });
  });

  ketNodes.forEach((ketNode) => {
    if (ketNode.fragment) {
      const sgroups: SGroup[] = Array.from(ketNode.fragment.sgroups.values());
      const filteredSGroups = sgroups.filter((sg: SGroup) =>
        sg.atoms.every((atom) => atom !== undefined),
      );
      const filteredSGroupsMap = new Pool<SGroup>();
      filteredSGroups.forEach((sg, index) => {
        filteredSGroupsMap.set(index, sg);
      });
      ketNode.fragment.sgroups = filteredSGroupsMap;
    }
  });

  // TODO: check if this sorting operation is needed
  // return ketNodes.sort((a, b) => a.center.x - b.center.x)
  return ketNodes;
}

function getFragmentCenter(struct, atomSet) {
  const bb = struct.getCoordBoundingBox(atomSet);
  return Vec2.centre(bb.min, bb.max);
}

/**
 * Merge fragments which are in the same S-Groups to one fragment(molecule)
 * and add new fragments(molecules) to KetNodes
 * See: https://github.com/epam/ketcher/issues/2142
 */
function addMolecules(
  ketNodes: KetNode[],
  fragmentIds: number[],
  struct: Struct,
) {
  const sGroupFragmentsMap = generateSGroupFragmentsMap(
    ketNodes,
    fragmentIds,
    struct,
  );
  const mergedFragments = Pile.unionIntersections(
    Array.from(sGroupFragmentsMap.values()),
  );

  mergedFragments.forEach((fragments) => {
    let atomSet = new Pile<number>();
    fragments.forEach((fragmentId) => {
      atomSet = atomSet.union(struct.getFragmentIds(fragmentId));
    });
    ketNodes.push({
      type: 'molecule',
      fragment: struct.clone(atomSet),
      center: getFragmentCenter(struct, atomSet),
    });
  });
}

/**
 * @example Give `fragmentIds` is `[0, 1]`,
 * and S-Group0 includes fragment0 and fragment1,
 * and S-Group1 includes fragment1,
 * then return value should be
 * ```
 * {
 *   0: [0, 1],
 *   1: [1]
 * }
 * ```
 */
function generateSGroupFragmentsMap(
  ketNodes: KetNode[],
  fragmentIds: number[],
  struct: Struct,
) {
  const sGroupFragmentsMap = new Map<number, Pile<number>>();

  fragmentIds.forEach((fragmentId) => {
    const atomsInFragment = struct.getFragmentIds(fragmentId);

    let hasAtomInSGroup = false;
    atomsInFragment.forEach((atomId) => {
      struct.atoms.get(atomId)?.sgs.forEach((sGroupId) => {
        hasAtomInSGroup = true;
        const fragmentSet = sGroupFragmentsMap.get(sGroupId);
        if (fragmentSet) {
          fragmentSet.add(fragmentId);
        } else {
          sGroupFragmentsMap.set(sGroupId, new Pile([fragmentId]));
        }
      });
    });

    if (!hasAtomInSGroup) {
      ketNodes.push({
        type: 'molecule',
        fragment: struct.clone(atomsInFragment),
        center: getFragmentCenter(struct, atomsInFragment),
      });
    }
  });

  return sGroupFragmentsMap;
}
