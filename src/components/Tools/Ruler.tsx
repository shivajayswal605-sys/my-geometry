import React from 'react';
import { Group, Line, Text, Rect, Circle } from 'react-konva';

interface RulerProps {
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

export const Ruler: React.FC<RulerProps> = ({ 
  id, x, y, width, rotation, onUpdate, isSelected, onSelect, onDragEnd, onDragMoveGlobal 
}) => {
  const height = 40;
  const pixelsPerUnit = 40;

  const handleDragMove = (e: any) => {
    // Only handle drag if the target is the group itself or its body (not handles)
    if (e.target === e.currentTarget) {
      onUpdate({ x: e.target.x(), y: e.target.y() });
      onDragMoveGlobal(e);
    }
  };

  const handleRotate = (e: any) => {
    e.cancelBubble = true;
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    const dx = pointerPos.x - x;
    const dy = pointerPos.y - y;
    const newRotation = (Math.atan2(dy, dx) * 180) / Math.PI;
    onUpdate({ rotation: newRotation });
    
    // Reset handle position relative to group
    e.target.x(width);
    e.target.y(height / 2);
  };

  const handleResize = (e: any) => {
    e.cancelBubble = true;
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    const dx = pointerPos.x - x;
    const dy = pointerPos.y - y;
    
    const angleRad = (rotation * Math.PI) / 180;
    const dirX = Math.cos(angleRad);
    const dirY = Math.sin(angleRad);
    
    const projectedWidth = dx * dirX + dy * dirY;
    onUpdate({ width: Math.max(80, projectedWidth) });
    
    // Reset handle position relative to group
    e.target.x(width - 8);
    e.target.y(0);
  };

  const renderTicks = () => {
    const ticks = [];
    const numTicks = Math.floor(width / (pixelsPerUnit / 10));

    for (let i = 0; i <= numTicks; i++) {
      const xPos = i * (pixelsPerUnit / 10);
      if (xPos > width) break;

      const isMajor = i % 10 === 0;
      const isMid = i % 5 === 0 && !isMajor;
      
      let tickHeight = 6;
      if (isMajor) tickHeight = 16;
      else if (isMid) tickHeight = 10;

      ticks.push(
        <React.Fragment key={i}>
          <Line
            points={[xPos, 0, xPos, tickHeight]}
            stroke="#1e293b"
            strokeWidth={isMajor ? 1.2 : 0.6}
          />
          {isMajor && (
            <Text
              x={xPos - 4}
              y={tickHeight + 2}
              text={(i / 10).toString()}
              fontSize={10}
              fontFamily="JetBrains Mono"
              fill="#1e293b"
            />
          )}
        </React.Fragment>
      );
    }
    return ticks;
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
        if (e.target.getType() === 'Group' || e.target.className === 'Rect') {
          e.target.getStage().container().style.cursor = 'move';
        }
      }}
      onMouseLeave={(e: any) => {
        e.target.getStage().container().style.cursor = 'default';
      }}
    >
      {/* Ruler Body - Clear plastic with yellow tint */}
      <Rect
        width={width}
        height={height}
        fill="rgba(254, 249, 195, 0.7)"
        stroke={isSelected ? "#3b82f6" : "#475569"}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={2}
        shadowBlur={isSelected ? 8 : 2}
        shadowColor="rgba(0,0,0,0.1)"
      />
      
      {/* Ticks */}
      <Group y={0} listening={false}>
        {renderTicks()}
      </Group>

      {/* Interaction Handles */}
      {isSelected && (
        <>
          {/* Rotation Handle - Large and clear */}
          <Group 
            x={width} 
            y={height / 2} 
            draggable 
            onDragMove={handleRotate}
          >
            <Circle
              radius={14}
              fill="white"
              stroke="#3b82f6"
              strokeWidth={2}
              shadowBlur={4}
            />
            <Line
              points={[-6, 0, 6, 0]}
              stroke="#3b82f6"
              strokeWidth={2}
              rotation={45}
            />
            <Line
              points={[0, -6, 0, 6]}
              stroke="#3b82f6"
              strokeWidth={2}
              rotation={45}
            />
          </Group>

          {/* Resize Handle - Visual indicator at the end */}
          <Rect
            x={width - 8}
            y={0}
            width={8}
            height={height}
            fill="rgba(59, 130, 246, 0.2)"
            draggable
            onDragMove={handleResize}
            onMouseEnter={(e: any) => (e.target.getStage().container().style.cursor = 'ew-resize')}
            onMouseLeave={(e: any) => (e.target.getStage().container().style.cursor = 'default')}
          />
        </>
      )}
    </Group>
  );
};
