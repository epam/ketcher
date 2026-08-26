/* eslint-disable react-you-might-not-need-an-effect/no-event-handler */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { filterFGLib } from '../../utils';
import type { Template } from './TemplateTable';

const SALTS_AND_SOLVENTS = 'Salts and Solvents';
const batchDelay = 300;

export default function useSaltsAndSolvents(
  saltsAndSolvents: Template[],
  filter: string,
) {
  const isFirstRenderRef = useRef(true);
  const filterRef = useRef(filter);
  const timerId = useRef<null | ReturnType<typeof setTimeout>>(null);
  const [filteredSaltsAndSolvents, setFilteredSaltsAndSolvents] = useState(
    saltsAndSolvents[SALTS_AND_SOLVENTS],
  );

  useLayoutEffect(() => {
    filterRef.current = filter;
  }, [filter]);

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
    const filteredSaS =
      filterFGLib(saltsAndSolvents, filterRef.current)[SALTS_AND_SOLVENTS] ??
      [];
    addToSaSWithBatches(filteredSaS);
  }, [saltsAndSolvents, addToSaSWithBatches]);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    clearTimeout(timerId.current as unknown as number);
    const filteredSaS = filterFGLib(saltsAndSolvents, filter)[
      SALTS_AND_SOLVENTS
    ];
    setFilteredSaltsAndSolvents(filteredSaS);
  }, [saltsAndSolvents, filter]);

  return filteredSaltsAndSolvents;
}
