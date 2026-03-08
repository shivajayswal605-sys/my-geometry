import React from 'react';
import { Group, Arc, Line, Text, Circle } from 'react-konva';
import { RotateCw } from 'lucide-react';

interface ProtractorProps {
  id: string;
  x: number;
  y: number;
  width: number;
  rotation: number;
  onUpdate: (updates: any) => void;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: any) => void;
  onDragMoveGlobal: (e: any) => void;
}

export const Protractor: React.FC<ProtractorProps> = ({ 
  id, x, y, width, rotation, onUpdate, isSelected, onSelect, onDragEnd, onDragMoveGlobal 
}) => {
  const radius = width / 2;

  const handleDragMove = (e: any) => {
    if (e.target === e.currentTarget) {
      onUpdate({ x: e.target.x(), y: e.target.y() });
      onDragMoveGlobal(e);
    }
  };

  const handleRotate = (e: any) => {
    e.cancelBubble = true;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const dx = pos.x - x;
    const dy = pos.y - y;
    const newRotation = (Math.atan2(dy, dx) * 180) / Math.PI;
    onUpdate({ rotation: newRotation });
    
    // Reset handle position relative to group
    e.target.x(radius);
    e.target.y(0);
  };

  const renderDegreeMarks = () => {
    const marks = [];
    for (let i = 0; i <= 180; i += 1) {
      const angleRad = (i * Math.PI) / 180;
      const isMajor = i % 10 === 0;
      const isMid = i % 5 === 0 && !isMajor;
      
      const startR = radius - (isMajor ? 25 : (isMid ? 15 : 8));
      const endR = radius;
      
      marks.push(
        <React.Fragment key={i}>
          <Line
            points={[
              Math.cos(angleRad) * startR,
              -Math.sin(angleRad) * startR,
              Math.cos(angleRad) * endR,
              -Math.sin(angleRad) * endR
            ]}
            stroke="#1e293b"
            strokeWidth={isMajor ? 1.5 : 0.5}
            opacity={0.8}
          />
          {isMajor && (
            <Text
              x={Math.cos(angleRad) * (radius - 40) - 8}
              y={-Math.sin(angleRad) * (radius - 40) - 6}
              text={i.toString()}
              fontSize={10}
              fontFamily="JetBrains Mono"
              fill="#1e293b"
              rotation={-i + 90}
            />
          )}
        </React.Fragment>
      );
    }
    return marks;
  };

  return (
    <Group 
      x={x} 
      y={y} 
      rotation={rotation} 
      onClick={onSelect} 
      onTap={onSelect}
      draggable
      onDragMove={handleDragMove}
      onDragEnd={onDragEnd}
      onMouseEnter={(e: any) => {
        if (e.target.getType() === 'Group' || e.target.className === 'Arc') {
          e.target.getStage().container().style.cursor = 'move';
        }
      }}
      onMouseLeave={(e: any) => {
        e.target.getStage().container().style.cursor = 'default';
      }}
    >
      {/* Body */}
      <Arc
        innerRadius={0}
        outerRadius={radius}
        angle={180}
        rotation={180}
        fill="rgba(255, 255, 255, 0.4)"
        stroke={isSelected ? "#3b82f6" : "#94a3b8"}
        strokeWidth={isSelected ? 2 : 1}
      />
      
      {/* Base Line */}
      <Line
        points={[-radius, 0, radius, 0]}
        stroke="#1e293b"
        strokeWidth={2}
      />

      {/* Marks */}
      <Group listening={false}>
        {renderDegreeMarks()}
      </Group>

      {/* Center Point */}
      <Circle radius={4} fill="#ef4444" />

      {/* Rotation Handle */}
      {isSelected && (
        <Group x={radius} y={0} draggable onDragMove={handleRotate}>
          <Circle radius={14} fill="white" stroke="#3b82f6" strokeWidth={2} shadowBlur={4} />
        </Group>
      )}
    </Group>
  );
};
