import { IRnaPreset, monomerFactory } from 'ketcher-core';

type Props = {
  preset: IRnaPreset;
};

export const GhostRnaPreset = ({ preset }: Props) => {
  const { sugar, phosphate, base } = preset;

  if (!sugar) {
    return null;
  }

  const [SugarMonomer, SugarRenderer] = monomerFactory(sugar);
  const sugarInstance = new SugarMonomer(sugar);
  const sugarRenderer = new SugarRenderer(sugarInstance);

  const phosphateRenderer = phosphate
    ? (() => {
        const [PhosphateMonomer, PhosphateRenderer] = monomerFactory(phosphate);
        const phosphateInstance = new PhosphateMonomer(phosphate);
        return new PhosphateRenderer(phosphateInstance);
      })()
    : null;

  const baseRenderer = base
    ? (() => {
        const [BaseMonomer, BaseRenderer] = monomerFactory(base);
        const baseInstance = new BaseMonomer(base);
        return new BaseRenderer(baseInstance);
      })()
    : null;

  const sugarSize = sugarRenderer.monomerSize;
  const phosphateSize = phosphateRenderer?.monomerSize;
  const baseSize = baseRenderer?.monomerSize;

  const sugarX = 0;
  const sugarY = 0;

  const phosphateX = phosphateSize ? sugarX + sugarSize.width + 30 : 0;
  const phosphateY = sugarY;

  const baseX = sugarX + (sugarSize.width - (baseSize?.width || 0)) / 2;
  const baseY = sugarY + sugarSize.height + 30;

  const totalWidth = Math.max(
    sugarX + sugarSize.width,
    phosphateSize ? phosphateX + phosphateSize.width : 0,
    baseSize ? baseX + baseSize.width : 0,
  );

  const totalHeight = Math.max(
    sugarY + sugarSize.height,
    phosphateSize ? phosphateY + phosphateSize.height : 0,
    baseSize ? baseY + baseSize.height : 0,
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={totalWidth}
      height={totalHeight}
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      overflow="visible"
    >
      <g
        style={{
          filter: 'drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.4))',
        }}
      >
        {phosphateSize && (
          <line
            x1={sugarX + sugarSize.width}
            y1={sugarY + sugarSize.height / 2}
            x2={phosphateX}
            y2={phosphateY + phosphateSize.height / 2}
            stroke="#CAD3DD"
            strokeWidth="3"
          />
        )}

        {baseSize && (
          <line
            x1={sugarX + sugarSize.width / 2}
            y1={sugarY + sugarSize.height}
            x2={baseX + baseSize.width / 2}
            y2={baseY}
            stroke="#CAD3DD"
            strokeWidth="3"
          />
        )}

        <g transform={`translate(${sugarX}, ${sugarY})`}>
          <use
            href={sugarRenderer.monomerSymbolElementId}
            fill="white"
            stroke="#CAD3DD"
            strokeWidth="2"
          />
          <text
            x={sugarSize.width / 2}
            y={sugarSize.height / 2}
            textAnchor="middle"
            dominantBaseline="central"
            pointerEvents="none"
            fill="#333"
            fontSize="7px"
            fontWeight="bold"
          >
            {sugar.label}
          </text>
        </g>

        {phosphateSize && (
          <g transform={`translate(${phosphateX}, ${phosphateY})`}>
            <use
              href={phosphateRenderer.monomerSymbolElementId}
              fill="white"
              stroke="#CAD3DD"
              strokeWidth="2"
            />
            <text
              x={phosphateSize.width / 2}
              y={phosphateSize.height / 2}
              textAnchor="middle"
              dominantBaseline="central"
              pointerEvents="none"
              fill="#333"
              fontSize="7px"
              fontWeight="bold"
            >
              {phosphate?.label}
            </text>
          </g>
        )}

        {baseSize && (
          <g transform={`translate(${baseX}, ${baseY})`}>
            <use
              href={baseRenderer.monomerSymbolElementId}
              fill="white"
              stroke="#CAD3DD"
              strokeWidth="2"
            />
            <text
              x={baseSize.width / 2}
              y={baseSize.height / 2}
              textAnchor="middle"
              dominantBaseline="central"
              pointerEvents="none"
              fill="#333"
              fontSize="7px"
              fontWeight="bold"
            >
              {base?.label}
            </text>
          </g>
        )}
      </g>
    </svg>
  );
};
