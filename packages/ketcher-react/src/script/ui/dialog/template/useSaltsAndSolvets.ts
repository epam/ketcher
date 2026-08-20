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
  // Tracks the inputs the mount-time batching effect below ran for, so a
  // later render can detect a prop change and recompute the fully filtered
  // list directly during render, instead of a second Effect that would
  // otherwise immediately re-run and clobber the batching effect's work.
  const prevInputsRef = useRef({ saltsAndSolvents, filter });

  if (
    prevInputsRef.current.saltsAndSolvents !== saltsAndSolvents ||
    prevInputsRef.current.filter !== filter
  ) {
    prevInputsRef.current = { saltsAndSolvents, filter };
    clearTimeout(timerId.current as unknown as number);
    setFilteredSaltsAndSolvents(
      filterFGLib(saltsAndSolvents, filter)[SALTS_AND_SOLVENTS],
    );
  }

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

  // Populates the (potentially large) initial list in batches on mount,
  // instead of blocking on one big render. Later prop changes are handled
  // by the render-time adjustment above.
  useEffect(() => {
    const filteredSaS =
      filterFGLib(saltsAndSolvents, filter)[SALTS_AND_SOLVENTS] ?? [];
    addToSaSWithBatches(filteredSaS);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  return filteredSaltsAndSolvents;
}
