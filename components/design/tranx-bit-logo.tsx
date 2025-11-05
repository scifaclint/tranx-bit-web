import type React from "react";

interface TranxBitLogoProps {
  variant?: "dark" | "light";
  size?: "small" | "medium" | "large";
  className?: string;
  isMobile?: boolean;
}

const TranxBitLogo: React.FC<TranxBitLogoProps> = ({
  variant = "dark",
  size = "medium",
  className = "",
  isMobile = false,
}) => {
  const sizeConfig = {
    small: { height: 40, logoRadius: 18, fontSize: 16 },
    medium: { height: 60, logoRadius: 25, fontSize: 24 },
    large: { height: 80, logoRadius: 35, fontSize: 32 },
  };

  const config = sizeConfig[size];
  const isDark = variant === "dark";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={config.height}
        height={config.height}
        viewBox={`0 0 ${config.height} ${config.height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx={config.height / 2}
          cy={config.height / 2}
          r={config.logoRadius}
          fill={isDark ? "#000" : "#fff"}
          stroke={isDark ? "#fff" : "#000"}
          strokeWidth="2"
        />

        <g transform={`translate(${config.height / 2}, ${config.height / 2})`}>
          <rect
            x={-config.logoRadius * 0.43}
            y={-config.logoRadius * 0.57}
            width={config.logoRadius * 0.86}
            height={config.logoRadius * 0.11}
            fill={isDark ? "#fff" : "#000"}
            rx="2"
          />

          <rect
            x={-config.logoRadius * 0.06}
            y={-config.logoRadius * 0.57}
            width={config.logoRadius * 0.11}
            height={config.logoRadius * 0.71}
            fill={isDark ? "#fff" : "#000"}
            rx="2"
          />

          <path
            d={`M ${-config.logoRadius * 0.23} ${config.logoRadius * 0.23} L ${
              -config.logoRadius * 0.34
            } ${config.logoRadius * 0.34} L ${-config.logoRadius * 0.23} ${
              config.logoRadius * 0.46
            } M ${-config.logoRadius * 0.34} ${config.logoRadius * 0.34} L ${
              config.logoRadius * 0.34
            } ${config.logoRadius * 0.34}`}
            stroke={isDark ? "#fff" : "#000"}
            strokeWidth="1.5"
            fill="none"
          />

          <path
            d={`M ${config.logoRadius * 0.23} ${config.logoRadius * 0.23} L ${
              config.logoRadius * 0.34
            } ${config.logoRadius * 0.34} L ${config.logoRadius * 0.23} ${
              config.logoRadius * 0.46
            }`}
            stroke={isDark ? "#fff" : "#000"}
            strokeWidth="1.5"
            fill="none"
          />
        </g>
      </svg>

      {!isMobile && (
        <div
          className="font-bold flex items-center"
          style={{
            fontSize: `${config.fontSize}px`,
            color: isDark ? "#000" : "#fff",
          }}
        >
          <span>Tranx</span>
          <span style={{ color: "#666" }}>B</span>
          <span style={{ color: "#666" }}>
            <svg
              width={config.fontSize * 0.6}
              height={config.fontSize * 1.2}
              viewBox="0 0 12 24"
              className="inline-block"
              style={{ marginRight: "2px" }}
            >
              <rect x="5" y="10" width="2" height="14" fill="#666" />
              <circle
                cx="6"
                cy="5"
                r="4"
                fill={isDark ? "#000" : "#fff"}
                stroke="#666"
                strokeWidth="1"
              />
              <text
                x="6"
                y="7.5"
                fontSize="6"
                fill="#666"
                fontFamily="Arial, sans-serif"
                fontWeight="bold"
                textAnchor="middle"
              >
                $
              </text>
            </svg>
          </span>
          <span style={{ color: "#666" }}>t</span>
        </div>
      )}
    </div>
  );
};

export default TranxBitLogo;
