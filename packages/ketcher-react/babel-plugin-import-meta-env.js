/**
 * Babel plugin to transform import.meta.env.* to process.env.* for Jest
 * (CommonJS) compatibility. In rollup builds, import.meta.env.* is already
 * statically replaced by @rollup/plugin-replace before Babel runs.
 */
module.exports = function ({ types: t }) {
  return {
    visitor: {
      MemberExpression(path) {
        if (
          t.isMetaProperty(path.node.object) &&
          path.node.object.meta.name === 'import' &&
          path.node.object.property.name === 'meta' &&
          !path.node.computed &&
          path.node.property.name === 'env'
        ) {
          path.replaceWith(
            t.memberExpression(t.identifier('process'), t.identifier('env')),
          );
        }
      },
    },
  };
};
