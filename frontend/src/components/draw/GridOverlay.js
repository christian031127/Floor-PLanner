import React from 'react';
import { Line } from 'react-konva';

const GridOverlay = ({ width, height, cellSize }) => {
  const lines = [];

  // Vízszintes vonalak
  for (let i = 0; i < height / cellSize; i++) {
    lines.push(
      <Line
        key={`h-${i}`}
        points={[0, i * cellSize, width, i * cellSize]}
        stroke="lightgray"
        strokeWidth={0.5}
      />
    );
  }

  // Függőleges vonalak
  for (let i = 0; i < width / cellSize; i++) {
    lines.push(
      <Line
        key={`v-${i}`}
        points={[i * cellSize, 0, i * cellSize, height]}
        stroke="lightgray"
        strokeWidth={0.5}
      />
    );
  }

  return <>{lines}</>;
};

export default GridOverlay;
