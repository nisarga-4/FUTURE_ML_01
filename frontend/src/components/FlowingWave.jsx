import "./FlowingWave.css";

export default function FlowingWave() {
  const lines = Array.from({ length: 34 });

  return (
    <div className="flowing-wave" aria-hidden="true">
      <svg
        className="flowing-wave__svg"
        viewBox="0 0 1600 520"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="waveGradient"
            x1="0%"
            y1="50%"
            x2="100%"
            y2="50%"
          >
            <stop offset="0%" stopColor="#12D9FF" />
            <stop offset="30%" stopColor="#20E0C0" />
            <stop offset="62%" stopColor="#59E86D" />
            <stop offset="100%" stopColor="#D9FF3F" />
          </linearGradient>

          <filter
            id="softGlow"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="2.5" result="blur" />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#softGlow)">
          {lines.map((_, index) => {
            const offset = index * 7;

            return (
              <path
                key={index}
                className={`wave-line wave-line-${index % 5}`}
                d={`
                  M -100 ${340 + offset * 0.15}
                  C 180 ${260 - offset * 0.8},
                    310 ${420 + offset * 0.4},
                    560 ${330 - offset * 0.35}
                  S 930 ${165 + offset * 0.65},
                    1180 ${285 - offset * 0.2}
                  S 1450 ${390 + offset * 0.25},
                    1700 ${245 - offset * 0.35}
                `}
                fill="none"
                stroke="url(#waveGradient)"
                strokeWidth="1.15"
                opacity={0.18 + index * 0.012}
              />
            );
          })}
        </g>
      </svg>

      <div className="flowing-wave__glow flowing-wave__glow--cyan" />
      <div className="flowing-wave__glow flowing-wave__glow--lime" />
    </div>
  );
}