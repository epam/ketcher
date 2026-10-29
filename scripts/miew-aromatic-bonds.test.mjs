import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const require = createRequire(
  new URL('../packages/ketcher-react/package.json', import.meta.url),
);
const THREE = require('three');
const miew = new URL(
  './dist/',
  pathToFileURL(require.resolve('miew/package.json')),
);

class RecordingGroup extends THREE.Group {
  constructor(_params, selection, colorer, mode, _transforms, complexity) {
    super();
    this._selection = selection;
    this._colorer = colorer;
    this._mode = mode;
    this._polyComplexity = complexity;
    const [count] = this._makeGeoArgs();
    this._geo = {
      count,
      items: [],
      setItem(index, left, right, radius) {
        this.items[index] = {
          left: left.clone(),
          right: right.clone(),
          radius,
        };
      },
      setColor() {},
      finalize() {},
    };
    this._mesh = {};
    this._build();
  }
}

function loadGroups(bundle) {
  const source = readFileSync(new URL(bundle, miew), 'utf8');
  const modules = [
    'groups/BondsGroup',
    'groups/BondsCylinderGroup',
    'groups/BondsLinesGroup',
    'processors/BondsProcessor',
  ].map((name) => {
    const marker = `;// CONCATENATED MODULE: ./src/gfx/modes/${name}.js`;
    const start = source.indexOf(marker);
    assert.notEqual(start, -1, `Missing ${name} in ${bundle}`);
    return source.slice(
      start,
      source.indexOf(';// CONCATENATED MODULE:', start + marker.length),
    );
  });
  return runInNewContext(
    `${modules.join('\n')}\n({ BondsLinesGroup, BondsCylinderGroup, BondsProcessor })`,
    {
      groups_ChemGroup: RecordingGroup,
      gfx_RCGroup: THREE.Group,
      chem_Bond: { BondType: { AROMATIC: 2 } },
      [bundle === 'Miew.module.js'
        ? 'external_module_three_commonjs_three_commonjs2_three_amd_three_root_THREE_namespaceObject'
        : 'external_module_three_commonjs_three_commonjs2_three_amd_three_root_THREE_']:
        THREE,
    },
  );
}

function render(groups, Group, aromaticIndices, overrides = {}) {
  const atoms = Array.from({ length: 6 }, (_, index) => ({
    index,
    mask: 1,
    bonds: [],
    position: new THREE.Vector3(
      Math.cos((index * Math.PI) / 3),
      Math.sin((index * Math.PI) / 3),
      0,
    ),
  }));
  const bonds = atoms.map((atom, index) => {
    const right = atoms[(index + 1) % atoms.length];
    const bond = {
      _index: index,
      _left: atom,
      _right: right,
      _type: aromaticIndices.includes(index) ? 2 : 1,
      _order: aromaticIndices.includes(index)
        ? 0
        : (overrides.orders?.[index] ?? 1),
      calcNormalDir: () =>
        new THREE.Vector3()
          .crossVectors(
            right.position.clone().sub(atom.position),
            new THREE.Vector3(0, 0, 1),
          )
          .normalize(),
    };
    atom.bonds.push(bond);
    right.bonds.push(bond);
    return bond;
  });
  const component = {
    forEachBond: (callback) => bonds.forEach(callback),
    forEachCycle(callback) {
      if (aromaticIndices.length === 6) {
        callback({ forEachBond: (visit) => bonds.forEach(visit) });
      }
    },
  };
  const complex = {
    getBonds: () => bonds,
    getTransforms: () => [],
    forEachComponent: (callback) => callback(component),
  };
  const processor = new groups.BondsProcessor(
    Group,
    {},
    complex,
    {
      getAtomColor: () => 0xffffff,
    },
    {
      drawMultiorderBonds: () => overrides.multiple ?? true,
      showAromaticLoops: () => overrides.aromatic ?? true,
      calcStickRadius: () => 0.1,
      calcSpaceFraction: () => 0.2,
      calcAtomRadius: () => 0.2,
    },
    1,
    1,
    {},
  );
  return { group: processor.children[0], atoms, bonds };
}

for (const bundle of ['Miew.module.js', 'Miew.js']) {
  const groups = loadGroups(bundle);
  for (const Group of [groups.BondsLinesGroup, groups.BondsCylinderGroup]) {
    test(`${bundle}: ${Group.name} renders partial aromatic bonds as solid plus three dashes`, () => {
      for (const aromatic of [[0], [0, 2, 4]]) {
        const { group, bonds } = render(groups, Group, aromatic);
        const expected = 6 + aromatic.length * 3;
        assert.equal(group._geo.count, expected);
        assert.equal(group._geo.items.length, expected);
        assert.equal(group._chunksIdc.filter((index) => index === 0).length, 4);
        const items = group._geo.items;
        assert.ok(items[1].right.distanceTo(items[2].left) > 0);
        assert.ok(items[2].right.distanceTo(items[3].left) > 0);
        assert.equal(bonds[0]._type, 2);
        assert.equal(bonds[0]._order, 0);
        assert.equal(group._calcChunksList(1, true).length, expected * 2);
        group._mesh.raycast = (_raycaster, intersections) => {
          intersections.push({ chunkIdx: 6 }, { chunkIdx: 7 }, { chunkIdx: 8 });
        };
        const hits = [];
        group.raycast({}, hits);
        assert.deepEqual(
          hits.map((hit) => hit.atom),
          [bonds[0]._left, bonds[0]._right, bonds[1]._left],
        );
      }
    });

    test(`${bundle}: ${Group.name} preserves full rings and ordinary bond orders`, () => {
      for (const [aromatic, overrides, count] of [
        [[0, 1, 2, 3, 4, 5], {}, 6],
        [[], {}, 6],
        [[], { orders: [2, 3] }, 9],
        [[0, 2, 4], { multiple: false }, 6],
        [[0, 2, 4], { aromatic: false }, 6],
      ]) {
        const { group } = render(groups, Group, aromatic, overrides);
        assert.equal(group._geo.count, count);
        assert.equal(group._geo.items.length, count);
      }
    });

    test(`${bundle}: ${Group.name} preserves dashes and picking after frame updates`, () => {
      const { group, atoms } = render(groups, Group, [0, 2, 4]);
      const before = group._geo.items.map((item) => item.left.clone());
      const mapping = [...group._chunksIdc];
      const offset = new THREE.Vector3(1, 2, 3);
      group.updateToFrame({
        needsColorUpdate: () => false,
        getAtomPos: (index) => atoms[index].position.clone().add(offset),
      });
      assert.equal(group._geo.items.length, 15);
      group._geo.items.forEach((item, index) => {
        assert.ok(item.left.distanceTo(before[index].add(offset)) < 1e-10);
      });
      assert.deepEqual([...group._chunksIdc], mapping);
    });
  }
}
