export const ArrowMarker = () => {
  return (
    <>
      <path
        strokeLinecap="round"
        d="M5,0 0,2.5 5,5z"
        id="arrow-marker-content"
      />
      <marker
        id="arrow-marker"
        markerHeight="3"
        markerWidth="5"
        orient="auto"
        refX="2.5"
        refY="1.5"
      >
        <use
          href="#arrow-marker-content"
          transform="rotate(180 2.5 1.5) scale(1,0.6)"
          strokeWidth="1.2500"
          fill="black"
          stroke="none"
        />
      </marker>
      <marker
        id="arrow-marker-arc"
        markerWidth="5"
        markerHeight="5"
        viewBox="0 0 5 5"
        refX="5"
        refY="2.5"
        orient="auto"
      >
        <use
          href="#arrow-marker-content"
          transform="rotate(180, 2.5, 2.5)"
          fill="#365CFF"
          stroke="none"
        />
      </marker>
    </>
  );
};
