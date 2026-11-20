const MACROMOLECULES_CHUNK_PREFIX = 'ketcher-macromolecules';
const MACROMOLECULES_PACKAGE_PATH = '/packages/ketcher-macromolecules/';

const normalizeModuleId = (moduleId) =>
  String(moduleId).replaceAll('\\', '/');

const isMacromoleculesModule = (moduleId) => {
  const normalizedId = normalizeModuleId(moduleId);

  return (
    normalizedId.includes(MACROMOLECULES_PACKAGE_PATH) &&
    (normalizedId.includes('/src/') ||
      normalizedId.includes('/node_modules/'))
  );
};

export function findMacromoleculesChunkViolations(chunks) {
  return chunks.flatMap((chunk) => {
    if (!chunk.name?.startsWith(MACROMOLECULES_CHUNK_PREFIX)) {
      return [];
    }

    const unexpectedModules = chunk.modules
      .map(normalizeModuleId)
      .filter((moduleId) => !isMacromoleculesModule(moduleId));

    return unexpectedModules.length
      ? [{ chunkName: chunk.name, unexpectedModules }]
      : [];
  });
}
