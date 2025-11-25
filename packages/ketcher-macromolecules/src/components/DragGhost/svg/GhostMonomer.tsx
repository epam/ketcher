import {
  AmbiguousMonomer,
  AmbiguousMonomerRenderer,
  isAmbiguousMonomerLibraryItem,
  monomerFactory,
  MonomerOrAmbiguousType,
} from 'ketcher-core';
import { useMemo } from 'react';

type Props = {
  monomerItem: MonomerOrAmbiguousType;
};

export const GhostMonomer = ({ monomerItem }: Props) => {
  const monomerRenderer = useMemo(() => {
    if (isAmbiguousMonomerLibraryItem(monomerItem)) {
      const monomerInstance = new AmbiguousMonomer(monomerItem);
      return new AmbiguousMonomerRenderer(monomerInstance);
    } else {
      const [Monomer, MonomerRenderer] = monomerFactory(monomerItem);
      const monomerInstance = new Monomer(monomerItem);
      return new MonomerRenderer(monomerInstance);
    }
  }, [monomerItem]);

  const monomerSymbolElementId = monomerRenderer.monomerSymbolElementId;
  const monomerSize = monomerRenderer.monomerSize;
  const { width, height } = monomerSize;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      overflow="visible"
    >
      <use
        href={monomerSymbolElementId}
        fill="#CAD3DD"
        stroke="white"
        strokeWidth={2}
        style={{
          filter: 'drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.4))',
        }}
      />
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="central"
        pointerEvents="none"
        fill="#333"
        fontSize="7px"
        fontWeight="bold"
      >
        {monomerItem.label}
      </text>
    </svg>
  );
};
