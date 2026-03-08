import React from 'react';
import { Group, Line, Circle, Arc, Rect, Text } from 'react-konva';

interface CompassProps {
  id: string;
  x: number;
  y: number;
  rotation: number;
  radius: number;
  onUpdate: (updates: any) => void;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: any) => void;
  onDragMoveGlobal: (e: any) => void;
  onDrawStart?: (point: { x: number, y: number }) => void;
  onDrawMove?: (point: { x: number, y: number }) => void;
  onDrawEnd?: () => void;
}

export const Compass: React.FC<CompassProps> = ({ 
  id, x, y, rotation, radius, onUpdate, isSelected, onSelect, onDragEnd, onDragMoveGlobal,
  onDrawStart, onDrawMove, onDrawEnd
}) => {
  const legLength = 140;
  
  // openingAngleDeg is the angle between the two legs
  const openingAngleRad = 2 * Math.asin(radius / (2 * legLength));
  const openingAngleDeg = (openingAngleRad * 180) / Math.PI;

  const handleDragGroup = (e: any) => {
    if (e.target === e.currentTarget) {
      onUpdate({ x: e.target.x(), y: e.target.y() });
      onDragMoveGlobal(e);
    }
  };

  const handleDragNeedle = (e: any) => {
    e.cancelBubble = true;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const angleRad = (rotation * Math.PI) / 180;
    const offsetX = -Math.sin(angleRad) * legLength;
    const offsetY = Math.cos(angleRad) * legLength;
    
    onUpdate({ 
      x: pos.x - offsetX,
      y: pos.y - offsetY
    });
    
    e.target.x(0);
    e.target.y(legLength);
  };

  const handleDraw = (e: any) => {
    e.cancelBubble = true;
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    // 1. Current needle position (center of circle)
    const currentAngleRad = (rotation * Math.PI) / 180;
    const needleX = x - Math.sin(currentAngleRad) * legLength;
    const needleY = y + Math.cos(currentAngleRad) * legLength;

    // 2. Angle from needle to mouse
    const dx = pointerPos.x - needleX;
    const dy = pointerPos.y - needleY;
    const angleToMouse = Math.atan2(dy, dx);

    // 3. Current pencil tip position relative to needle
    const currentPencilX = x - Math.sin((rotation + openingAngleDeg) * Math.PI / 180) * legLength;
    const currentPencilY = y + Math.cos((rotation + openingAngleDeg) * Math.PI / 180) * legLength;
    const currentAngleToPencil = Math.atan2(currentPencilY - needleY, currentPencilX - needleX);

    // 4. Calculate new rotation to align pencil tip with mouse
    let angleDiffRad = angleToMouse - currentAngleToPencil;
    // Normalize angle difference to avoid jumping
    while (angleDiffRad > Math.PI) angleDiffRad -= 2 * Math.PI;
    while (angleDiffRad < -Math.PI) angleDiffRad += 2 * Math.PI;
    
    const angleDiff = (angleDiffRad * 180) / Math.PI;
    const newRotation = rotation + angleDiff;

    // 5. Calculate new hinge position (x, y) to keep needle fixed
    const newAngleRad = (newRotation * Math.PI) / 180;
    const newOffsetX = -Math.sin(newAngleRad) * legLength;
    const newOffsetY = Math.cos(newAngleRad) * legLength;
    
    const newX = needleX - newOffsetX;
    const newY = needleY - newOffsetY;

    onUpdate({ 
      rotation: newRotation,
      x: newX,
      y: newY
    });

    // 6. Calculate EXACT pencil tip position for drawing to ensure a perfect circle
    const finalPencilAngleRad = (newRotation + openingAngleDeg) * Math.PI / 180;
    const drawX = newX - Math.sin(finalPencilAngleRad) * legLength;
    const drawY = newY + Math.cos(finalPencilAngleRad) * legLength;

    if (onDrawMove) {
      onDrawMove({ x: drawX, y: drawY });
    }
    
    e.target.x(0);
    e.target.y(legLength);
  };

  const handleRadiusChange = (e: any) => {
    e.cancelBubble = true;
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    const dx = pointerPos.x - x;
    const dy = pointerPos.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    const newRadius = Math.min(legLength * 1.9, Math.max(10, dist));
    const newOpeningAngleRad = 2 * Math.asin(newRadius / (2 * legLength));
    const newOpeningAngleDeg = (newOpeningAngleRad * 180) / Math.PI;

    // Adjust rotation so the needle leg stays in place
    onUpdate({ 
      radius: newRadius,
    });
    
    e.target.x(0);
    e.target.y(legLength / 2);
  };

  return (
    <Group 
      x={x} 
      y={y} 
      onClick={onSelect} 
      onTap={onSelect}
      draggable
      onDragMove={handleDragGroup}
      onDragEnd={onDragEnd}
      onMouseEnter={(e: any) => {
        if (e.target.getType() === 'Group' || e.target.className === 'Line') {
          e.target.getStage().container().style.cursor = 'move';
        }
      }}
      onMouseLeave={(e: any) => {
        e.target.getStage().container().style.cursor = 'default';
      }}
    >
      {/* Visual Arc Preview */}
      <Arc
        innerRadius={radius - 0.5}
        outerRadius={radius + 0.5}
        angle={360}
        fill="rgba(59, 130, 246, 0.05)"
        stroke="rgba(59, 130, 246, 0.2)"
        strokeWidth={1}
        dash={[5, 5]}
        listening={false}
      />

      <Group rotation={rotation}>
        {/* Needle Leg */}
        <Line
          points={[0, 0, 0, legLength]}
          stroke="#94a3b8"
          strokeWidth={isSelected ? 8 : 6}
          lineCap="round"
          shadowBlur={2}
        />
        
        {/* Pencil Leg */}
        <Group rotation={openingAngleDeg}>
          <Line
            points={[0, 0, 0, legLength]}
            stroke="#94a3b8"
            strokeWidth={isSelected ? 8 : 6}
            lineCap="round"
            shadowBlur={2}
          />
          
          {/* Pencil Holder */}
          <Rect
            x={-6}
            y={legLength - 20}
            width={12}
            height={25}
            fill="#334155"
            cornerRadius={2}
          />
          
          {/* Pencil Tip */}
          <Line
            points={[0, legLength, 0, legLength + 15]}
            stroke="#3b82f6"
            strokeWidth={4}
            lineCap="round"
          />

          {/* Draw Handle (Pencil Tip) */}
          {isSelected && (
            <Circle
              y={legLength}
              radius={16}
              fill="#3b82f6"
              stroke="white"
              strokeWidth={2}
              draggable
              onDragStart={(e) => {
                // Calculate exact pencil tip position for the starting point
                const totalAngleRad = (rotation + openingAngleDeg) * Math.PI / 180;
                const px = x - Math.sin(totalAngleRad) * legLength;
                const py = y + Math.cos(totalAngleRad) * legLength;
                if (onDrawStart) onDrawStart({ x: px, y: py });
              }}
              onDragMove={handleDraw}
              onDragEnd={() => {
                if (onDrawEnd) onDrawEnd();
              }}
              shadowBlur={4}
            />
          )}

          {/* Radius Adjustment Handle (Middle of leg) */}
          {isSelected && (
            <Circle
              y={legLength / 2}
              radius={10}
              fill="white"
              stroke="#3b82f6"
              strokeWidth={2}
              draggable
              onDragMove={handleRadiusChange}
              shadowBlur={2}
            />
          )}
        </Group>

        {/* Hinge */}
        <Circle
          radius={12}
          fill="#1e293b"
          stroke="#94a3b8"
          strokeWidth={2}
          shadowBlur={4}
        />

        {/* Needle Point */}
        <Line
          points={[0, legLength, 0, legLength + 10]}
          stroke="#ef4444"
          strokeWidth={2}
          lineCap="round"
        />
        {isSelected && (
          <Circle
            y={legLength}
            radius={14}
            fill="white"
            stroke="#ef4444"
            strokeWidth={2}
            draggable
            onDragMove={handleDragNeedle}
            shadowBlur={4}
          />
        )}
      </Group>

      {/* Measurement Label */}
      {isSelected && (
        <Group y={-50} x={-40} listening={false}>
          <Rect width={80} height={20} fill="#1e293b" cornerRadius={4} opacity={0.8} />
          <Text
            x={8}
            y={5}
            text={`Radius: ${(radius / 40).toFixed(2)}u`}
            fontSize={10}
            fontFamily="JetBrains Mono"
            fill="#f8fafc"
          />
        </Group>
      )}
    </Group>
  );
};
