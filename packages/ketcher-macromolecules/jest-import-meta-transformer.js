/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * TypeScript AST transformer for ts-jest that replaces import.meta.env
 * with process.env, enabling Jest (CommonJS) compatibility.
 *
 * In rollup builds, @rollup/plugin-replace already statically inlines
 * import.meta.env.* values before any JS execution, so this transformer
 * only runs during Jest test compilation.
 */
const ts = require('typescript');

module.exports = {
  version: 1,
  name: 'import-meta-env-transformer',
  factory: (_params) => {
    // Returns a TransformerFactory<SourceFile>
    return (context) => {
      return (sourceFile) => {
        const visitor = (node) => {
          // Replace `import.meta.env` → `process.env`
          // AST: PropertyAccessExpression(.env) { MetaProperty(import.meta) }
          if (
            ts.isPropertyAccessExpression(node) &&
            ts.isMetaProperty(node.expression) &&
            node.expression.keywordToken === ts.SyntaxKind.ImportKeyword &&
            node.name.escapedText === 'env'
          ) {
            return ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier('process'),
              ts.factory.createIdentifier('env'),
            );
          }
          return ts.visitEachChild(node, visitor, context);
        };
        return ts.visitNode(sourceFile, visitor);
      };
    };
  },
};
