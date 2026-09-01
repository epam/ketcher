/* eslint-disable react-you-might-not-need-an-effect/no-event-handler */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
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

  const addToSaSWithBatches = useCallback(function addToSaSWithBatches(
    fullFilteredArray: Template[],
  ) {
    const batchSize = 16;
    const currentBatch = fullFilteredArray.slice(0, batchSize);
    const remainingItems = fullFilteredArray.slice(batchSize);

    setFilteredSaltsAndSolvents((filteredSaltsAndSolvents) => [
      ...(filteredSaltsAndSolvents ?? []),
      ...currentBatch,
    ]);
    if (remainingItems.length > 0) {
      timerId.current = setTimeout(
        () => addToSaSWithBatches(remainingItems),
        batchDelay,
      );
    }
  }, []);

  useEffect(() => {
    clearTimeout(timerId.current as unknown as number);
    setFilteredSaltsAndSolvents([]);
    const filteredSaS =
      filterFGLib(saltsAndSolvents, filter)[SALTS_AND_SOLVENTS] ?? [];
    addToSaSWithBatches(filteredSaS);
  }, [saltsAndSolvents, filter, addToSaSWithBatches]);

  return filteredSaltsAndSolvents;
}
