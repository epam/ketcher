let defaultMonomersLibraryData: string | null = null;
let defaultMonomersLibraryPromise: Promise<string> | null = null;

const looksLikeMonomersLibraryAssetUrl = (value: string) => {
  return (
    !value.includes('\n') &&
    (value.startsWith('data:') ||
      value.startsWith('blob:') ||
      value.startsWith('file:') ||
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('./') ||
      value.startsWith('../') ||
      value.startsWith('/'))
  );
};

const normalizeMonomersLibraryImport = async (value: string) => {
  if (!looksLikeMonomersLibraryAssetUrl(value)) {
    return value;
  }

  const response = await fetch(value);

  if (!response.ok) {
    throw new Error(
      `Failed to load default monomers library: ${response.status} ${response.statusText}`,
    );
  }

  return response.text();
};

export async function preloadDefaultMonomersLibrary(): Promise<string> {
  if (defaultMonomersLibraryData) {
    return defaultMonomersLibraryData;
  }

  defaultMonomersLibraryPromise ??= import('./data/monomers.ket').then(
    async ({ default: monomersData }) => {
      const normalizedMonomersData = await normalizeMonomersLibraryImport(
        monomersData,
      );

      defaultMonomersLibraryData = normalizedMonomersData;
      return normalizedMonomersData;
    },
  );

  return defaultMonomersLibraryPromise;
}

export function getPreloadedDefaultMonomersLibrary(): string | null {
  return defaultMonomersLibraryData;
}
