// lint-staged config for the pre-push hook (.husky/pre-push). The hook runs it
// on the files the branch changes against origin/master, and it runs the Jest
// tests related to them, one Jest run per package.
import path from 'node:path';

const root = import.meta.dirname;

const relatedTests = (files) => {
  const byPackage = new Map();
  for (const file of files) {
    const pkg = path.relative(root, file).split(path.sep)[1];
    byPackage.set(pkg, [...(byPackage.get(pkg) ?? []), file]);
  }
  return [...byPackage].map(
    ([pkg, pkgFiles]) =>
      `npm run test:unit -w packages/${pkg} -- --passWithNoTests --findRelatedTests ${pkgFiles.join(' ')}`,
  );
};

export default {
  'packages/*/**/*.{js,jsx,ts,tsx}': relatedTests,
};
