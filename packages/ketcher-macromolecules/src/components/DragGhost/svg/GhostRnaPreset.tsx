import { IRnaPreset } from 'ketcher-core';

type Props = {
  preset: IRnaPreset;
};

export const GhostRnaPreset = ({ preset }: Props) => {
  const { sugar, base, phosphate } = preset;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={105}
      height={97}
      viewBox="0 0 105 97"
      fill="none"
    >
      <g filter="url(#a)">
        <path
          fill="#fff"
          d="M35 0a6 6 0 0 1 6 6v7h26.475C69.274 5.541 75.989 0 84 0c9.389 0 17 7.611 17 17s-7.611 17-17 17c-8.011 0-14.727-5.541-16.525-13H41v7a6 6 0 0 1-6 6h-8.066v18.906L42.98 68.953l-19.49 19.49L4 68.953 19.934 53.02V34H13a6 6 0 0 1-6-6V6a6 6 0 0 1 6-6h22Z"
          shapeRendering="crispEdges"
        />
      </g>
      <path stroke="#CAD3DD" strokeWidth={2} d="M23.518 29v26M71 17H38" />
      <rect width={28} height={28} x={10.275} y={3} fill="#CAD3DD" rx={4} />
      <rect width={28} height={28} x={10} y={3} fill="#CAD3DD" rx={4} />
      <rect width={28} height={28} x={70} y={3} fill="#CAD3DD" rx={14} />
      <path
        fill="#CAD3DD"
        d="m23.557 53.397 15.556 15.557L23.557 84.51 8 68.954z"
      />
      <path
        fill="#333"
        d="M21.905 71h-.989l1.507-4.364h1.189L25.116 71h-.989l-1.093-3.367H23L21.905 71Zm-.062-1.715h2.335v.72h-2.335v-.72ZM82.954 19v-4.364h1.722c.331 0 .613.064.846.19.233.125.41.299.533.522.123.222.185.477.185.767 0 .29-.063.546-.188.767a1.293 1.293 0 0 1-.543.518c-.236.123-.521.185-.856.185h-1.098v-.74h.948c.178 0 .324-.03.44-.09a.607.607 0 0 0 .26-.259.806.806 0 0 0 .087-.38.786.786 0 0 0-.088-.38.583.583 0 0 0-.26-.254.95.95 0 0 0-.443-.091h-.622V19h-.922ZM22.928 19v-4.364h1.722c.33 0 .61.06.843.177.235.117.413.282.535.497.124.213.186.463.186.752 0 .29-.063.539-.188.748a1.216 1.216 0 0 1-.543.477c-.236.11-.521.166-.857.166h-1.152v-.741h1.003c.176 0 .322-.024.439-.073a.522.522 0 0 0 .26-.217.687.687 0 0 0 .087-.36.715.715 0 0 0-.087-.367.536.536 0 0 0-.262-.226 1.074 1.074 0 0 0-.441-.078h-.622V19h-.923Zm2.357-1.986L26.369 19h-1.018l-1.061-1.986h.995Z"
      />
      <defs>
        <filter
          id="a"
          width={105}
          height={96.443}
          x={0}
          y={0}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={4} />
          <feGaussianBlur stdDeviation={2} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_12586_13359"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_12586_13359"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};
