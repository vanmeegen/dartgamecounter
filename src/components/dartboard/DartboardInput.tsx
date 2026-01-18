/**
 * DartboardInput - Interactive SVG dartboard for touch/click input
 * Enlarged touch targets for double/triple rings and bull for mobile use
 */

import { type JSX } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import UndoIcon from "@mui/icons-material/Undo";
import type { Multiplier } from "../../types";

interface DartboardInputProps {
  onThrow: (segment: number, multiplier: Multiplier) => void;
  onUndo: () => void;
}

// Standard dartboard segment order (clockwise from top)
const SEGMENTS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

// Colors for the dartboard
const COLORS = {
  black: "#1a1a1a",
  white: "#f5f5dc",
  red: "#e63946",
  green: "#2d6a4f",
  bull: "#e63946",
  singleBull: "#2d6a4f",
};

// Radii for the dartboard sections (percentage of total radius)
// Enlarged for touch friendliness
const RADII = {
  doubleouter: 100,
  double: 85, // Double ring (enlarged from standard 84-90%)
  tripleOuter: 70,
  triple: 55, // Triple ring (enlarged from standard 52-58%)
  singleOuter: 40,
  singleBull: 20, // Single bull (enlarged)
  bull: 10, // Double bull (enlarged)
};

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number
): string {
  const start1 = polarToCartesian(cx, cy, outerR, startAngle);
  const end1 = polarToCartesian(cx, cy, outerR, endAngle);
  const start2 = polarToCartesian(cx, cy, innerR, endAngle);
  const end2 = polarToCartesian(cx, cy, innerR, startAngle);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${start1.x} ${start1.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${end1.x} ${end1.y}`,
    `L ${start2.x} ${start2.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${end2.x} ${end2.y}`,
    "Z",
  ].join(" ");
}

interface SegmentProps {
  segment: number;
  index: number;
  cx: number;
  cy: number;
  onClick: (segment: number, multiplier: Multiplier) => void;
}

function DartboardSegment({ segment, index, cx, cy, onClick }: SegmentProps): JSX.Element {
  const anglePerSegment = 360 / 20;
  const startAngle = index * anglePerSegment - anglePerSegment / 2;
  const endAngle = startAngle + anglePerSegment;

  // Alternate colors
  const isEven = index % 2 === 0;
  const darkColor = isEven ? COLORS.black : COLORS.red;
  const lightColor = isEven ? COLORS.white : COLORS.green;

  const scale = (r: number): number => (r / 100) * cx;

  return (
    <g>
      {/* Double ring (outer) */}
      <path
        d={describeArc(cx, cy, scale(RADII.double), scale(RADII.doubleouter), startAngle, endAngle)}
        fill={darkColor}
        stroke="#333"
        strokeWidth="0.5"
        onClick={() => onClick(segment, 2)}
        style={{ cursor: "pointer" }}
      />
      {/* Outer single */}
      <path
        d={describeArc(cx, cy, scale(RADII.tripleOuter), scale(RADII.double), startAngle, endAngle)}
        fill={lightColor}
        stroke="#333"
        strokeWidth="0.5"
        onClick={() => onClick(segment, 1)}
        style={{ cursor: "pointer" }}
      />
      {/* Triple ring */}
      <path
        d={describeArc(cx, cy, scale(RADII.triple), scale(RADII.tripleOuter), startAngle, endAngle)}
        fill={darkColor}
        stroke="#333"
        strokeWidth="0.5"
        onClick={() => onClick(segment, 3)}
        style={{ cursor: "pointer" }}
      />
      {/* Inner single */}
      <path
        d={describeArc(cx, cy, scale(RADII.singleOuter), scale(RADII.triple), startAngle, endAngle)}
        fill={lightColor}
        stroke="#333"
        strokeWidth="0.5"
        onClick={() => onClick(segment, 1)}
        style={{ cursor: "pointer" }}
      />
    </g>
  );
}

interface SegmentLabelProps {
  segment: number;
  index: number;
  cx: number;
  cy: number;
}

function SegmentLabel({ segment, index, cx, cy }: SegmentLabelProps): JSX.Element {
  const anglePerSegment = 360 / 20;
  const angle = index * anglePerSegment;
  const labelRadius = (92 / 100) * cx;
  const pos = polarToCartesian(cx, cy, labelRadius, angle);

  return (
    <text
      x={pos.x}
      y={pos.y}
      textAnchor="middle"
      dominantBaseline="central"
      fill="#fff"
      fontSize={cx * 0.06}
      fontWeight="bold"
      style={{ pointerEvents: "none" }}
    >
      {segment}
    </text>
  );
}

export function DartboardInput({ onThrow, onUndo }: DartboardInputProps): JSX.Element {
  const viewBoxSize = 200;
  const cx = viewBoxSize / 2;
  const cy = viewBoxSize / 2;

  const handleMiss = (): void => {
    onThrow(0, 1);
  };

  const scale = (r: number): number => (r / 100) * cx;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", gap: 0.5 }}>
      {/* Top controls */}
      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center", alignItems: "center" }}>
        <IconButton onClick={onUndo} size="small">
          <UndoIcon fontSize="small" />
        </IconButton>
        <Box
          onClick={handleMiss}
          sx={{
            px: 2,
            py: 0.5,
            bgcolor: "error.main",
            color: "white",
            borderRadius: 1,
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 600,
            "&:hover": { bgcolor: "error.dark" },
          }}
        >
          MISS
        </Box>
      </Box>

      {/* Dartboard */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
        }}
      >
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          {/* Background circle */}
          <circle cx={cx} cy={cy} r={cx} fill="#1a1a1a" />

          {/* Segments */}
          {SEGMENTS.map((segment, index) => (
            <DartboardSegment
              key={segment}
              segment={segment}
              index={index}
              cx={cx}
              cy={cy}
              onClick={onThrow}
            />
          ))}

          {/* Single bull */}
          <circle
            cx={cx}
            cy={cy}
            r={scale(RADII.singleBull)}
            fill={COLORS.singleBull}
            stroke="#333"
            strokeWidth="0.5"
            onClick={() => onThrow(25, 1)}
            style={{ cursor: "pointer" }}
          />

          {/* Double bull (bullseye) */}
          <circle
            cx={cx}
            cy={cy}
            r={scale(RADII.bull)}
            fill={COLORS.bull}
            stroke="#333"
            strokeWidth="0.5"
            onClick={() => onThrow(50, 1)}
            style={{ cursor: "pointer" }}
          />

          {/* Segment labels */}
          {SEGMENTS.map((segment, index) => (
            <SegmentLabel
              key={`label-${segment}`}
              segment={segment}
              index={index}
              cx={cx}
              cy={cy}
            />
          ))}
        </svg>
      </Box>
    </Box>
  );
}
