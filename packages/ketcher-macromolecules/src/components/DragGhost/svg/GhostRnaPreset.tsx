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
  const inset = 2;
  const sugarScaleX = (sugarSize.width - inset * 2) / sugarSize.width;
  const sugarScaleY = (sugarSize.height - inset * 2) / sugarSize.height;
  const sugarScale = Math.min(sugarScaleX, sugarScaleY);
  const sugarDx = (sugarSize.width - sugarSize.width * sugarScale) / 2;
  const sugarDy = (sugarSize.height - sugarSize.height * sugarScale) / 2;
  const phosphateScale = phosphateSize
    ? Math.min(
        (phosphateSize.width - inset * 2) / phosphateSize.width,
        (phosphateSize.height - inset * 2) / phosphateSize.height,
      )
    : 1;
  const phosphateDx = phosphateSize
    ? (phosphateSize.width - phosphateSize.width * phosphateScale) / 2
    : 0;
  const phosphateDy = phosphateSize
    ? (phosphateSize.height - phosphateSize.height * phosphateScale) / 2
    : 0;
  const baseScale = baseSize
    ? Math.min(
        (baseSize.width - inset * 2) / baseSize.width,
        (baseSize.height - inset * 2) / baseSize.height,
      )
    : 1;
  const baseDx = baseSize
    ? (baseSize.width - baseSize.width * baseScale) / 2
    : 0;
  const baseDy = baseSize
    ? (baseSize.height - baseSize.height * baseScale) / 2
    : 0;
  const connectorGreyWidth = 4;
  const connectorOutlineWidth = 6;

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
        <g transform={`translate(${sugarX}, ${sugarY})`}>
          <use href={sugarRenderer.monomerSymbolElementId} fill="white" />
          <g
            transform={`translate(${sugarDx}, ${sugarDy}) scale(${sugarScale})`}
          >
            <use href={sugarRenderer.monomerSymbolElementId} fill="#CAD3DD" />
          </g>
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
            <use href={phosphateRenderer.monomerSymbolElementId} fill="white" />
            <g
              transform={`translate(${phosphateDx}, ${phosphateDy}) scale(${phosphateScale})`}
            >
              <use
                href={phosphateRenderer.monomerSymbolElementId}
                fill="#CAD3DD"
              />
            </g>
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
            <use href={baseRenderer.monomerSymbolElementId} fill="white" />
            <g
              transform={`translate(${baseDx}, ${baseDy}) scale(${baseScale})`}
            >
              <use href={baseRenderer.monomerSymbolElementId} fill="#CAD3DD" />
            </g>
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

        {/* draw connectors on top for higher stacking */}
        {phosphateSize && (
          <g>
            <line
              x1={sugarX + sugarSize.width}
              y1={sugarY + sugarSize.height / 2}
              x2={phosphateX + connectorOutlineWidth / 3}
              y2={phosphateY + phosphateSize.height / 2}
              stroke="white"
              strokeWidth={7}
              strokeLinecap="butt"
            />
            <line
              x1={sugarX + sugarSize.width - connectorOutlineWidth / 2}
              y1={sugarY + sugarSize.height / 2}
              x2={phosphateX + connectorOutlineWidth / 2}
              y2={phosphateY + phosphateSize.height / 2}
              stroke="#CAD3DD"
              strokeWidth={connectorGreyWidth}
              strokeLinecap="round"
            />
          </g>
        )}

        {baseSize && (
          <g>
            <line
              x1={sugarX + sugarSize.width / 2}
              y1={sugarY + sugarSize.height}
              x2={baseX + baseSize.width / 2}
              y2={baseY + connectorOutlineWidth / 2}
              stroke="white"
              strokeWidth={7}
              strokeLinecap="butt"
            />
            <line
              x1={sugarX + sugarSize.width / 2}
              y1={sugarY + sugarSize.height - connectorOutlineWidth / 2}
              x2={baseX + baseSize.width / 2}
              y2={baseY + connectorOutlineWidth / 2}
              stroke="#CAD3DD"
              strokeWidth={connectorGreyWidth}
              strokeLinecap="round"
            />
          </g>
        )}
      </g>
    </svg>
  );
};
