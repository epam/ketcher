/**
 * Custom ESLint rules that enforce architectural invariants
 * (see .memory-bank/invariants.md).
 *
 * Invariants enforced here:
 * - A4 `domain-no-application-imports`: files under
 *   packages/ketcher-core/src/domain/ must not make runtime (non-type-only)
 *   imports from application/, React, or UI frameworks. Type-only imports are
 *   allowed.
 * - A5 `ui-imports-in-core` and `ui-deps-in-core`: packages/ketcher-core must
 *   not import or declare React or UI frameworks.
 * - A1 `renderer-no-model-mutations`: renderers must never call mutating
 *   methods of DrawingEntitiesManager and must not build a Command of
 *   BaseOperation objects themselves.
 *
 * Known violations that predate the rules are allowlisted per file in the
 * ALLOWED_* lists below instead of eslint-disable comments (rule R7). The unit
 * tests in scripts/invariant-rules.test.mjs assert that every allowlist entry
 * still suppresses at least one real violation, so the lists cannot go stale.
 */
import path from 'node:path';

/** Modules that pull React or UI frameworks in. Used by A4 and A5. */
export const UI_MODULES = [
  'react',
  'react-dom',
  'react-device-detect',
  'ketcher-react',
];

const UI_MODULE_PATTERN =
  /^(react|react-dom|react-device-detect|ketcher-react)([/.].*)?$|^@mui\//;

/**
 * `ui-deps-in-core` rejects declared dependencies, and `react-device-detect`
 * is currently a known-debt dependency enforced at import level by
 * `ui-imports-in-core` (see ALLOWED_UI_IMPORTS), so it does not fail every
 * single package file here.
 */
const FRAMEWORK_DEPENDENCY_PATTERN =
  /^(react|react-dom|ketcher-react)(\/.*)?$|^@mui\//;

/**
 * A5 known debt: react-device-detect brings React into ketcher-core
 * transitively. Moving those imports to ketcher-react is a separate refactor
 * (issue #12512, Track P). New react-device-detect imports must not appear.
 * See .memory-bank/accepted-patterns.md.
 */
export const ALLOWED_UI_IMPORTS = [
  {
    file: 'packages/ketcher-core/src/application/editor/tools/select/SelectBase.ts',
    imports: ['react-device-detect'],
  },
  {
    file: 'packages/ketcher-core/src/utilities/shortcutsUtil.ts',
    imports: ['react-device-detect'],
  },
];

/**
 * A4 known debt: runtime imports from application/render and
 * application/editor in the domain layer predate invariant A4
 * (invariant A4 allows type-only imports). List refreshed on the first lint
 * run of the enforcement. See .memory-bank/accepted-patterns.md.
 */
export const ALLOWED_DOMAIN_IMPORTS = [
  {
    file: 'packages/ketcher-core/src/domain/AttachmentPoint.ts',
    imports: [
      'application/editor/editorEvents',
      'application/editor/editorSingleton',
    ],
  },
  {
    file: 'packages/ketcher-core/src/domain/PreviewAttachmentPoint.ts',
    imports: ['application/render/util'],
  },
  {
    file: 'packages/ketcher-core/src/domain/entities/AmbiguousMonomer.ts',
    imports: [
      'application/editor/editorSingleton',
      'application/editor/operations/monomer/resolveMonomerClass',
    ],
  },
  {
    file: 'packages/ketcher-core/src/domain/entities/DrawingEntitiesManager.replaceMonomer.ts',
    imports: ['application/editor/tools/types'],
  },
  {
    file: 'packages/ketcher-core/src/domain/entities/DrawingEntitiesManager.ts',
    imports: [
      'application/editor/editorSettings',
      'application/editor/editorSingleton',
      'application/editor/libraryItemDragDrop/replacementHelpers',
      'application/editor/operations/coreAtom/atom',
      'application/editor/operations/coreBond/bond',
      'application/editor/operations/coreRxn/multitailArrow',
      'application/editor/operations/coreRxn/rxnArrow',
      'application/editor/operations/coreRxn/rxnPlus',
      'application/editor/operations/coreSGroup/sgroup',
      'application/editor/operations/drawingEntity',
      'application/editor/operations/modes',
      'application/editor/operations/modes/snake',
      'application/editor/operations/monomer',
      'application/editor/operations/monomerToAtomBond/monomerToAtomBond',
      'application/editor/operations/polymerBond',
      'application/editor/operations/stereoFlag',
      'application/editor/shared/coordinates',
      'application/editor/tools/rnaPresetConnections',
      'application/editor/tools/types',
      'application/render/renderers/sequence/SequenceRenderer',
    ],
  },
  {
    file: 'packages/ketcher-core/src/domain/entities/DrawingEntity.ts',
    imports: ['application/editor/shared/coordinates'],
  },
  {
    file: 'packages/ketcher-core/src/domain/entities/Nucleoside.ts',
    imports: [
      'application/editor/editorSingleton',
      'application/editor/shared/coordinates',
      'application/render/renderers/monomerSizeState',
    ],
  },
  {
    file: 'packages/ketcher-core/src/domain/entities/Nucleotide.ts',
    imports: [
      'application/editor/editorSingleton',
      'application/editor/shared/coordinates',
      'application/render/renderers/monomerSizeState',
    ],
  },
  {
    file: 'packages/ketcher-core/src/domain/entities/sgroup.ts',
    imports: ['application/editor/shared/constants'],
  },
  {
    file: 'packages/ketcher-core/src/domain/entities/snake-layout-model/SnakeLayoutModel.ts',
    imports: [
      'application/editor/editorSettings',
      'application/editor/editorSingleton',
    ],
  },
  {
    file: 'packages/ketcher-core/src/domain/entities/struct.ts',
    imports: [
      'application/editor/actions/helpers',
      'application/editor/shared/utils',
    ],
  },
  {
    file: 'packages/ketcher-core/src/domain/helpers/attachmentPointCalculations.ts',
    imports: ['application/editor/shared/coordinates'],
  },
  {
    file: 'packages/ketcher-core/src/domain/serializers/ket/fromKet/polymerBondToDrawingEntity.ts',
    imports: ['application/editor/editorSingleton'],
  },
  {
    file: 'packages/ketcher-core/src/domain/serializers/ket/fromKet/textToStruct.ts',
    imports: ['application/render/restruct/draftToLexical'],
  },
  {
    file: 'packages/ketcher-core/src/domain/serializers/ket/ketSerializer.ts',
    imports: [
      'application/editor/MacromoleculesConverter',
      'application/editor/editorSingleton',
      'application/editor/tools/types',
    ],
  },
];

/**
 * A1 known debt: SequenceRenderer builds Commands and changes selection state.
 * The rule applies to new code: a change may remove a violation but must not
 * add one. See .memory-bank/accepted-patterns.md.
 */
export const ALLOWED_MODEL_MUTATIONS = [
  {
    file: 'packages/ketcher-core/src/application/render/renderers/sequence/SequenceRenderer.ts',
    patterns: [
      'newCommand',
      'addDrawingEntitiesToSelection',
      'unselectDrawingEntity',
    ],
  },
];

/**
 * DrawingEntitiesManager methods that change model data or selection state.
 * A1 says renderers never call these. The list mirrors the mutation surface of
 * packages/ketcher-core/src/domain/entities/DrawingEntitiesManager.ts.
 */
export const MODEL_MUTATING_METHODS = [
  'addDrawingEntitiesToSelection',
  'addMonomer',
  'addMonomerChangeModel',
  'addRnaPreset',
  'addRnaPresetFromNode',
  'applySnakeLayout',
  'cancelIntentionToFinishBondCreation',
  'cancelIntentionToStartBondCreation',
  'cancelPolymerBondCreation',
  'createDrawingEntityMovingCommand',
  'createDrawingEntityRedrawCommand',
  'createDrawingEntitySelectionCommand',
  'createMonomer',
  'createPolymerBond',
  'deleteAllEntities',
  'deleteDrawingEntity',
  'deleteMonomer',
  'deletePolymerBond',
  'deletePolymerBondChangeModel',
  'deleteSelectedEntities',
  'finishPolymerBondCreation',
  'finishPolymerBondCreationModelChange',
  'flipSelectedDrawingEntities',
  'hidePolymerBondInformation',
  'intendToFinishAttachmenPointBondCreation',
  'intendToFinishBondCreation',
  'intendToSelectDrawingEntity',
  'intendToStartAttachmenPointBondCreation',
  'intendToStartBondCreation',
  'modifyMonomerItem',
  'moveDrawingEntityModelChange',
  'movePolymerBond',
  'moveSelectedDrawingEntities',
  'rearrangeChainModelChange',
  'recalculateCanvasMatrix',
  'redrawBonds',
  'rotateSelectedDrawingEntities',
  'selectDrawingEntities',
  'selectDrawingEntity',
  'selectAllDrawingEntities',
  'selectIfLocatedInPolygon',
  'selectIfLocatedInRectangle',
  'showPolymerBondInformation',
  'startPolymerBondCreation',
  'startPolymerBondCreationChangeModel',
  'unselectAllDrawingEntities',
  'unselectDrawingEntity',
  'updateMonomerItem',
];

const isUiModule = (specifier) => UI_MODULE_PATTERN.test(specifier);

/** Resolves a relative specifier and reports whether it lands in application/. */
const resolvesIntoApplication = (specifier, filepath) => {
  if (!specifier.startsWith('.')) {
    return false;
  }
  const dir = path.posix.dirname(filepath.replace(/\\/g, '/'));
  const resolved = path.posix.normalize(path.posix.join(dir, specifier));
  return /(^|\/)application(\/|$)/.test(resolved);
};

/** Invariant A4 forbids `application/render/**` and `application/editor/**`. */
const treatAsApplication = (specifier, filename) => {
  if (specifier.startsWith('.')) {
    return resolvesIntoApplication(specifier, filename);
  }
  return /^application\/(render|editor)(\/|$)/.test(specifier);
};

/**
 * True when the import/export statement and every one of its specifiers are
 * type-only, so the statement disappears at compile time and A4 allows it.
 * `import { type X } from '...'` and `import type X from '...'` count as
 * type-only, `import { X, type T }` and bare `import ... from` do not.
 * The repository parses files with @typescript-eslint, whose flat AST puts
 * `importKind` on the declaration and on every specifier.
 */
const isTypeOnlyStatement = (node) => {
  if (
    node.importKind === 'type' ||
    node.isTypeOnly === true ||
    node.exportKind === 'type'
  ) {
    return true;
  }
  if (node.type !== 'ImportDeclaration') {
    return false;
  }
  const specifiers = node.specifiers ?? [];
  return (
    specifiers.length > 0 &&
    specifiers.every((specifier) => specifier.importKind === 'type')
  );
};

const isAllowed = (allow, filename, specifier) =>
  allow.some(
    (entry) =>
      filename.replace(/\\/g, '/').endsWith(entry.file) &&
      (entry.imports || []).includes(specifier),
  );

const A4_MESSAGE =
  'Invariant A4: the domain layer must not make runtime imports from application/, React, or UI frameworks. Type-only imports are allowed. See .memory-bank/invariants.md (A4).';

const A5_IMPORT_MESSAGE =
  'Invariant A5: ketcher-core is a framework-agnostic library and must not import React or UI-framework modules. See .memory-bank/invariants.md (A5).';

const A5_DEPS_MESSAGE =
  'Invariant A5: ketcher-core must not declare React or UI-framework dependencies (react, react-dom, ketcher-react, @mui/*). See .memory-bank/invariants.md (A5).';

const A1_COMMAND_MESSAGE =
  'Invariant A1: renderers never mutate the domain model. Build the change as a Command of BaseOperations outside the render layer. See .memory-bank/invariants.md (A1).';

const A1_MUTATION_MESSAGE =
  'Invariant A1: renderers are read-only consumers of the model; they must not call mutating DrawingEntitiesManager methods. See .memory-bank/invariants.md (A1).';

const OBJECT_NAME_PATTERN = /drawingEntitiesManager/i;

const ALLOWED_ENTRY_SCHEMA = {
  type: 'object',
  properties: {
    file: { type: 'string' },
    imports: { type: 'array', items: { type: 'string' } },
    patterns: { type: 'array', items: { type: 'string' } },
  },
  required: ['file'],
};

const isImportSourceNode = (node) => {
  switch (node.type) {
    case 'ImportDeclaration':
    case 'ExportNamedDeclaration':
    case 'ExportAllDeclaration':
    case 'ImportExpression':
      return node.source && typeof node.source.value === 'string'
        ? node.source.value
        : null;
    case 'CallExpression':
      if (
        node.callee.type === 'Import' ||
        (node.callee.type === 'Identifier' && node.callee.name === 'require')
      ) {
        const arg = node.arguments[0];
        return arg?.type === 'Literal' && typeof arg.value === 'string'
          ? arg.value
          : null;
      }
      return null;
    default:
      return null;
  }
};

export const rules = {
  'domain-no-application-imports': {
    meta: {
      docs: {
        description:
          'A4 — the domain layer imports no rendering, editor, or UI code at runtime',
      },
      schema: [
        {
          type: 'object',
          properties: { allow: { type: 'array', items: ALLOWED_ENTRY_SCHEMA } },
        },
      ],
    },
    create(context) {
      const allow = context.options?.[0]?.allow ?? ALLOWED_DOMAIN_IMPORTS;
      const check = (node) => {
        const specifier = isImportSourceNode(node);
        if (specifier === null || typeof specifier !== 'string') {
          return;
        }
        if (node.type === 'ImportDeclaration' && isTypeOnlyStatement(node)) {
          return;
        }
        const application = treatAsApplication(specifier, context.filename);
        if (!application && !isUiModule(specifier)) {
          return;
        }
        if (isAllowed(allow, context.filename, specifier)) {
          return;
        }
        context.report({ node, message: A4_MESSAGE });
      };

      return {
        ImportDeclaration: check,
        ExportNamedDeclaration: check,
        ExportAllDeclaration: check,
        ImportExpression: check,
        CallExpression: check,
      };
    },
  },

  'ui-imports-in-core': {
    meta: {
      docs: {
        description:
          'A5 — ketcher-core imports no React or UI-framework modules',
      },
      schema: [
        {
          type: 'object',
          properties: { allow: { type: 'array', items: ALLOWED_ENTRY_SCHEMA } },
        },
      ],
    },
    create(context) {
      const allow = context.options?.[0]?.allow ?? ALLOWED_UI_IMPORTS;
      const check = (node) => {
        const specifier = isImportSourceNode(node);
        if (specifier === null || typeof specifier !== 'string') {
          return;
        }
        if (!isUiModule(specifier) || !specifier.startsWith('react')) {
          return;
        }
        if (isAllowed(allow, context.filename, specifier)) {
          return;
        }
        context.report({ node, message: A5_IMPORT_MESSAGE });
      };

      return {
        ImportDeclaration: check,
        ImportExpression: check,
        CallExpression: check,
      };
    },
  },

  'ui-deps-in-core': {
    meta: {
      docs: {
        description:
          'A5 — ketcher-core declares no React or UI-framework dependencies',
      },
      schema: [
        {
          type: 'object',
          properties: {
            forbiddenDeps: { type: 'array', items: { type: 'string' } },
          },
        },
      ],
    },
    create(context) {
      const forbidden = (context.options?.[0]?.forbiddenDeps ?? []).filter(
        (dep) => FRAMEWORK_DEPENDENCY_PATTERN.test(dep),
      );
      if (forbidden.length === 0) {
        return {};
      }
      let reported = false;
      return {
        Program(node) {
          if (reported) {
            return;
          }
          reported = true;
          context.report({
            node,
            message: `${A5_DEPS_MESSAGE} Declared: ${forbidden.join(', ')}.`,
          });
        },
      };
    },
  },

  'renderer-no-model-mutations': {
    meta: {
      docs: { description: 'A1 — renderers never mutate the domain model' },
      schema: [
        {
          type: 'object',
          properties: {
            allowedFiles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  file: { type: 'string' },
                  patterns: { type: 'array', items: { type: 'string' } },
                },
                required: ['file', 'patterns'],
              },
            },
          },
        },
      ],
    },
    create(context) {
      const allowedFiles =
        context.options?.[0]?.allowedFiles ?? ALLOWED_MODEL_MUTATIONS;
      const allowedForFile = (patternKey) =>
        allowedFiles.some(
          (entry) =>
            context.filename.replace(/\\/g, '/').endsWith(entry.file) &&
            entry.patterns.includes(patternKey),
        );

      const checkMemberCall = (node) => {
        if (node.callee.type !== 'MemberExpression') {
          return;
        }
        const propertyNode = node.callee.property;
        const property =
          propertyNode.type === 'Identifier' ? propertyNode.name : null;
        if (!property || !MODEL_MUTATING_METHODS.includes(property)) {
          return;
        }
        const objectSource =
          context.sourceCode?.getText?.(node.callee.object) ?? '';
        if (!OBJECT_NAME_PATTERN.test(objectSource)) {
          return;
        }
        if (allowedForFile(property)) {
          return;
        }
        context.report({ node, message: A1_MUTATION_MESSAGE });
      };

      const checkNewCommand = (node) => {
        if (
          node.callee?.type !== 'Identifier' ||
          node.callee.name !== 'Command'
        ) {
          return;
        }
        if (allowedForFile('newCommand')) {
          return;
        }
        context.report({ node, message: A1_COMMAND_MESSAGE });
      };

      return {
        NewExpression: checkNewCommand,
        CallExpression: checkMemberCall,
      };
    },
  },
};
