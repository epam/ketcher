#!/usr/bin/env bash
set -euo pipefail

# Runs each test in `cascade-reactions.spec.ts` individually by line number
# Usage: run this script from the `ketcher-autotests` directory

SPEC_NAME="macro-micro-switcher2.spec.ts"
# path to the spec file used for scanning
SPEC_PATH="tests/specs/Macromolecule-editor/Macro-Micro-Switcher/${SPEC_NAME}"

# Discover test starting line numbers that contain `verifyFileExport` inside their body.
# We scan the spec file at `SPEC_PATH`: remember the last seen test definition line, and
# when we hit a line containing `verifyFileExport` emit that last test start line.
# Deduplicate and sort.
mapfile -t LINES < <(awk '
  /^[[:space:]]*test([.](fail|skip|only))?[[:space:]]*\(/ { last=NR }
  /verifyFileExport\(/ { if(last) print last }
' "${SPEC_PATH}" | sort -n -u)

if [ ${#LINES[@]} -eq 0 ]; then
  echo "No tests with verifyFileExport found in ${SPEC}."
  exit 0
fi

for L in "${LINES[@]}"; do
  echo
  echo "=== Running: ${SPEC_NAME}:${L} ==="
  npm run docker:update "${SPEC_NAME}:${L}"
  STATUS=$?
  if [ $STATUS -ne 0 ]; then
    echo "Test ${SPEC}:${L} failed with exit code ${STATUS}."
    exit $STATUS
  fi
done

echo
echo "All specified tests completed successfully."
