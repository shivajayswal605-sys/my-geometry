import React from 'react';
import { Group, Line } from 'react-konva';
import { GridType } from '../../types';

interface GridProps {
  width: number;
  height: number;
  type: GridType;
  cellSize: number;
}

export const Grid: React.FC<GridProps> = ({ width, height, type, cellSize }) => {
  if (type === 'none') return null;

  const lines = [];

  if (type === 'square') {
    // Vertical lines
    for (let x = 0; x <= width; x += cellSize) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, 0, x, height]}
          stroke="#e2e8f0"
          strokeWidth={x % (cellSize * 5) === 0 ? 1.5 : 0.5}
        />
      );
    }
    // Horizontal lines
    for (let y = 0; y <= height; y += cellSize) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[0, y, width, y]}
          stroke="#e2e8f0"
          strokeWidth={y % (cellSize * 5) === 0 ? 1.5 : 0.5}
        />
      );
    }
  } else if (type === 'isometric') {
    const angle = Math.PI / 6; // 30 degrees
    const hStep = cellSize * Math.cos(angle);
    const vStep = cellSize * Math.sin(angle);

    // Diagonal lines (left to right)
    for (let i = -width; i <= width + height; i += cellSize) {
       lines.push(
         <Line
           key={`iso1-${i}`}
           points={[i, 0, i + height * Math.tan(angle), height]}
           stroke="#e2e8f0"
           strokeWidth={0.5}
         />
       );
       lines.push(
        <Line
          key={`iso2-${i}`}
          points={[i, 0, i - height * Math.tan(angle), height]}
          stroke="#e2e8f0"
          strokeWidth={0.5}
        />
      );
    }
  }

  return <Group>{lines}</Group>;
};
