import { useCallback, useEffect, useRef, useState } from 'react';
import { filterFGLib } from '../../utils';
import type { Template } from './TemplateTable';

const SALTS_AND_SOLVENTS = 'Salts and Solvents';
const batchDelay = 300;

export default function useSaltsAndSolvents(
  saltsAndSolvents: Template[],
  filter: string,
) {
  const timerId = useRef<null | ReturnType<typeof setTimeout>>(null);
  const [filteredSaltsAndSolvents, setFilteredSaltsAndSolvents] = useState(
    saltsAndSolvents[SALTS_AND_SOLVENTS],
  );
  const addToSaSWithBatches = useCallback((fullFilteredArray) => {
    const batchSize = 16;
    setFilteredSaltsAndSolvents((filteredSaltsAndSolvents) => [
      ...(filteredSaltsAndSolvents ?? []),
      ...fullFilteredArray.splice(0, batchSize),
    ]);
    if (fullFilteredArray.length > 0) {
      timerId.current = setTimeout(
        () => addToSaSWithBatches(fullFilteredArray),
        batchDelay,
      );
    }
  }, []);
  useEffect(() => {
    const filteredSaS =
      filterFGLib(saltsAndSolvents, filter)[SALTS_AND_SOLVENTS] ?? [];
    addToSaSWithBatches(filteredSaS);
  }, [saltsAndSolvents, filter, addToSaSWithBatches]);

  return filteredSaltsAndSolvents;
}
