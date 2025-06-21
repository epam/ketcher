import { monomerFactory, MonomerOrAmbiguousType } from 'ketcher-core';

type Props = {
  monomerItem: MonomerOrAmbiguousType;
};

export const GhostMonomer = ({ monomerItem }: Props) => {
  const [Monomer, MonomerRenderer] = monomerFactory(monomerItem);

  const monomerInstance = new Monomer(monomerItem);
  const monomerRenderer = new MonomerRenderer(monomerInstance);

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
        style={{
          filter: 'drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.4))',
        }}
        // stroke="#FFF"
        // strokeWidth="3"
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
