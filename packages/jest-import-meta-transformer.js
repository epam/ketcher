/**
 * TypeScript AST transformer for ts-jest that makes `import.meta` usable in
 * Jest (CommonJS):
 *
 * - `import.meta.env` becomes `process.env`. In Vite builds, `define` already
 *   statically inlines import.meta.env.* values before any JS execution.
 * - `import.meta.url` becomes the file URL of the current module, which is
 *   what it is in a Vite build.
 *
 * This transformer only runs during Jest test compilation.
 */
const ts = require('typescript');

const isImportMetaProperty = (node, name) =>
  ts.isPropertyAccessExpression(node) &&
  ts.isMetaProperty(node.expression) &&
  node.expression.keywordToken === ts.SyntaxKind.ImportKeyword &&
  node.name.escapedText === name;

// AST for `require('node:url').pathToFileURL(__filename).href`
const createModuleFileUrl = () =>
  ts.factory.createPropertyAccessExpression(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createCallExpression(
          ts.factory.createIdentifier('require'),
          undefined,
          [ts.factory.createStringLiteral('node:url')],
        ),
        ts.factory.createIdentifier('pathToFileURL'),
      ),
      undefined,
      [ts.factory.createIdentifier('__filename')],
    ),
    ts.factory.createIdentifier('href'),
  );

module.exports = {
  version: 1,
  name: 'import-meta-env-transformer',
  factory: (_params) => {
    // Returns a TransformerFactory<SourceFile>
    return (context) => {
      return (sourceFile) => {
        const visitor = (node) => {
          if (isImportMetaProperty(node, 'env')) {
            return ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier('process'),
              ts.factory.createIdentifier('env'),
            );
          }
          if (isImportMetaProperty(node, 'url')) {
            return createModuleFileUrl();
          }
          return ts.visitEachChild(node, visitor, context);
        };
        return ts.visitNode(sourceFile, visitor);
      };
    };
  },
};
