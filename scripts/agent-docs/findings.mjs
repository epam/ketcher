// Output shape shared by the agent-docs CLIs.

const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/** Sorts by file, line, code, message, so output does not depend on check order. */
export function sortFindings(findings) {
  return [...findings].sort(
    (a, b) =>
      compare(a.file, b.file) ||
      (a.line ?? 0) - (b.line ?? 0) ||
      compare(a.code, b.code) ||
      compare(a.message, b.message),
  );
}

/** `file:line: code: message`, then the fix on its own line. */
export function formatFinding(finding) {
  const where = finding.line ? `${finding.file}:${finding.line}` : finding.file;
  return `${where}: ${finding.code}: ${finding.message}\n  fix: ${finding.fix}\n`;
}
