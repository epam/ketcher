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
    </>
  );
};
