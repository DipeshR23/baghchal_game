import React from 'react';
import { type BoardTheme } from '../../stores/uiStore.js';

interface BoardSVGProps {
  theme: BoardTheme;
}

export const BoardSVG: React.FC<BoardSVGProps> = ({ theme }) => {
  const isWood = theme === 'wood';

  return (
    <svg
      viewBox="-20 -20 440 440"
      className="w-full h-full select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Board Texture/Plate */}
      {isWood ? (
        <g>
          {/* Wooden Plate Outer Bevel */}
          <rect
            x="-16"
            y="-16"
            width="432"
            height="432"
            rx="16"
            fill="#1e1006"
            stroke="#2f1a0b"
            strokeWidth="4"
            className="shadow-2xl"
          />
          {/* Main Wooden Board Plate */}
          <rect
            x="-10"
            y="-10"
            width="420"
            height="420"
            rx="12"
            fill="url(#wood-pattern)"
            stroke="#160c04"
            strokeWidth="3"
          />
          {/* Inner Inset Border */}
          <rect
            x="-2"
            y="-2"
            width="404"
            height="404"
            rx="8"
            fill="none"
            stroke="#1b0f05"
            strokeWidth="1.5"
            opacity="0.3"
          />
          
          {/* Decorative Corner Ornaments */}
          <circle cx="0" cy="0" r="6" fill="#1b0f05" opacity="0.4" />
          <circle cx="400" cy="0" r="6" fill="#1b0f05" opacity="0.4" />
          <circle cx="0" cy="400" r="6" fill="#1b0f05" opacity="0.4" />
          <circle cx="400" cy="400" r="6" fill="#1b0f05" opacity="0.4" />
        </g>
      ) : (
        <g>
          {/* Modern Dark Glass Slate */}
          <rect
            x="-15"
            y="-15"
            width="430"
            height="430"
            rx="16"
            fill="#090d16"
            stroke="#1e293b"
            strokeWidth="2"
          />
          <rect
            x="-10"
            y="-10"
            width="420"
            height="420"
            rx="12"
            fill="url(#modern-pattern)"
            stroke="#334155"
            strokeWidth="1.5"
          />
        </g>
      )}

      {/* SVG Definitions for Board Patterns/Gradients */}
      <defs>
        {/* Wood Texture Simulation */}
        <radialGradient id="wood-pattern" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#db995a" />
          <stop offset="60%" stopColor="#c58448" />
          <stop offset="100%" stopColor="#a05d25" />
        </radialGradient>

        {/* Modern Dark Grid Style */}
        <radialGradient id="modern-pattern" cx="50%" cy="50%" r="80%">
          <stop offset="0%" stopColor="#0b132b" />
          <stop offset="100%" stopColor="#050814" />
        </radialGradient>
        
        {/* Soft shadow under lines (for Wood Board depth) */}
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* BOARD LINES */}
      <g filter={isWood ? "url(#shadow)" : undefined}>
        {/* 1. Grid Lines (Horizontal & Vertical) */}
        {[0, 100, 200, 300, 400].map((val) => (
          <g key={val}>
            {/* Horizontal Line */}
            <line
              x1="0"
              y1={val}
              x2="400"
              y2={val}
              className={isWood ? "wood-board-line" : "modern-board-line"}
            />
            {/* Vertical Line */}
            <line
              x1={val}
              y1="0"
              x2={val}
              y2="400"
              className={isWood ? "wood-board-line" : "modern-board-line"}
            />
          </g>
        ))}

        {/* 2. Main Diagonals */}
        <line
          x1="0"
          y1="0"
          x2="400"
          y2="400"
          className={isWood ? "wood-board-line wood-board-line-diagonal" : "modern-board-line modern-board-line-diagonal"}
        />
        <line
          x1="400"
          y1="0"
          x2="0"
          y2="400"
          className={isWood ? "wood-board-line wood-board-line-diagonal" : "modern-board-line modern-board-line-diagonal"}
        />

        {/* 3. Diamond Diagonals (Adjacency links) */}
        <line
          x1="200"
          y1="0"
          x2="0"
          y2="200"
          className={isWood ? "wood-board-line wood-board-line-diagonal" : "modern-board-line modern-board-line-diagonal"}
        />
        <line
          x1="0"
          y1="200"
          x2="200"
          y2="400"
          className={isWood ? "wood-board-line wood-board-line-diagonal" : "modern-board-line modern-board-line-diagonal"}
        />
        <line
          x1="200"
          y1="400"
          x2="400"
          y2="200"
          className={isWood ? "wood-board-line wood-board-line-diagonal" : "modern-board-line modern-board-line-diagonal"}
        />
        <line
          x1="400"
          y1="200"
          x2="200"
          y2="0"
          className={isWood ? "wood-board-line wood-board-line-diagonal" : "modern-board-line modern-board-line-diagonal"}
        />
      </g>

      {/* Intersection Ring Markers (Center & Corners) */}
      <g opacity={isWood ? 0.35 : 0.6}>
        {[
          { cx: 0, cy: 0 },
          { cx: 400, cy: 0 },
          { cx: 0, cy: 400 },
          { cx: 400, cy: 400 },
          { cx: 200, cy: 200 },
          { cx: 200, cy: 0 },
          { cx: 0, cy: 200 },
          { cx: 200, cy: 400 },
          { cx: 400, cy: 200 },
        ].map((pt, idx) => (
          <circle
            key={idx}
            cx={pt.cx}
            cy={pt.cy}
            r="4"
            fill={isWood ? "#1b0f05" : "#64748b"}
          />
        ))}
      </g>
    </svg>
  );
};
export { BoardSVG as default };
