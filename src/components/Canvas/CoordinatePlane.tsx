import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Group, Rect, Text, Circle, RegularPolygon } from 'react-konva';
import { Grid } from './Grid';
import { Ruler } from '../Tools/Ruler';
import { Compass } from '../Tools/Compass';
import { Protractor } from '../Tools/Protractor';
import { GridType, ToolState, LineData, ToolMode, ShapeData } from '../../types';

interface CoordinatePlaneProps {
  gridType: GridType;
  activeTools: ToolState[];
  updateTool: (id: string, updates: Partial<ToolState>) => void;
  deleteTool: (id: string) => void;
  lines: LineData[];
  setLines: (lines: LineData[]) => void;
  shapes: ShapeData[];
  setShapes: (shapes: ShapeData[]) => void;
  activeMode: ToolMode;
}

export const CoordinatePlane: React.FC<CoordinatePlaneProps> = ({ 
  gridType, 
  activeTools, 
  updateTool,
  deleteTool,
  lines,
  setLines,
  shapes,
  setShapes,
  activeMode
}) => {
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isTrashHovered, setIsTrashHovered] = useState(false);
  const stageRef = useRef<any>(null);

  const trashZone = {
    x: dimensions.width - 100,
    y: dimensions.height - 100,
    width: 80,
    height: 80
  };

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    const pos = e.target.getStage().getPointerPosition();
    
    if (activeMode === 'pen') {
      setIsDrawing(true);
      const snapped = getSnappedPoint(pos.x, pos.y);
      setLines([...lines, { id: `line-${Date.now()}`, points: [snapped.x, snapped.y], color: '#1e293b', width: 2 }]);
      return;
    }

    if (activeMode === 'line-segment') {
      setIsDrawing(true);
      const snapped = getSnappedPoint(pos.x, pos.y);
      setLines([...lines, { id: `segment-${Date.now()}`, points: [snapped.x, snapped.y, snapped.x, snapped.y], color: '#1e293b', width: 2 }]);
      return;
    }

    if (activeMode.startsWith('shape-')) {
      setIsDrawing(true);
      const type = activeMode.replace('shape-', '') as any;
      setShapes([...shapes, { 
        id: `shape-${Date.now()}`, 
        type, 
        x: pos.x, 
        y: pos.y, 
        width: 0, 
        height: 0, 
        radius: 0, 
        color: '#3b82f6', 
        rotation: 0 
      }]);
      return;
    }

    if (activeMode === 'eraser') {
      return;
    }

    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  const getSnappedPoint = (px: number, py: number) => {
    const ruler = activeTools.find(t => t.type === 'ruler' && t.isVisible);
    if (!ruler) return { x: px, y: py };

    const width = ruler.width || 400;
    const height = 40;
    
    const dx = px - ruler.x;
    const dy = py - ruler.y;
    const angleRad = (-ruler.rotation * Math.PI) / 180;
    
    const localX = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
    const localY = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);
    
    // Snap to top edge if close
    if (localX >= 0 && localX <= width && localY >= -15 && localY <= 15) {
      const backAngleRad = (ruler.rotation * Math.PI) / 180;
      const globalX = localX * Math.cos(backAngleRad) - 0 * Math.sin(backAngleRad) + ruler.x;
      const globalY = localX * Math.sin(backAngleRad) + 0 * Math.cos(backAngleRad) + ruler.y;
      return { x: globalX, y: globalY, blocked: false };
    }

    // Block if inside ruler body
    if (localX >= 0 && localX <= width && localY > 0 && localY <= height) {
      return { x: px, y: py, blocked: true };
    }
    
    return { x: px, y: py, blocked: false };
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    if (activeMode === 'pen') {
      const snapped = getSnappedPoint(pos.x, pos.y);
      if (snapped.blocked) return;

      const newLines = [...lines];
      const lastLine = { ...newLines[newLines.length - 1] };
      lastLine.points = [...lastLine.points, snapped.x, snapped.y];
      newLines[newLines.length - 1] = lastLine;
      setLines(newLines);
    }

    if (activeMode === 'line-segment') {
      const snapped = getSnappedPoint(pos.x, pos.y);
      const newLines = [...lines];
      const lastLine = { ...newLines[newLines.length - 1] };
      const startX = lastLine.points[0];
      const startY = lastLine.points[1];
      lastLine.points = [startX, startY, snapped.x, snapped.y];
      newLines[newLines.length - 1] = lastLine;
      setLines(newLines);
    }

    if (activeMode.startsWith('shape-')) {
      const newShapes = [...shapes];
      const lastShape = { ...newShapes[newShapes.length - 1] };
      const dx = pos.x - lastShape.x;
      const dy = pos.y - lastShape.y;
      
      if (lastShape.type === 'circle') {
        lastShape.radius = Math.sqrt(dx * dx + dy * dy);
      } else if (lastShape.type === 'square') {
        const size = Math.max(Math.abs(dx), Math.abs(dy));
        lastShape.width = size * 2;
        lastShape.height = size * 2;
      } else if (lastShape.type === 'triangle') {
        lastShape.radius = Math.sqrt(dx * dx + dy * dy);
      }
      
      newShapes[newShapes.length - 1] = lastShape;
      setShapes(newShapes);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const eraseLine = (id: string) => {
    if (activeMode === 'eraser') {
      setLines(lines.filter(l => l.id !== id));
    }
  };

  const handleToolDragEnd = (e: any, id: string) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    // Check if dropped in trash zone
    if (
      pos.x >= trashZone.x && 
      pos.x <= trashZone.x + trashZone.width &&
      pos.y >= trashZone.y && 
      pos.y <= trashZone.y + trashZone.height
    ) {
      deleteTool(id);
      setIsTrashHovered(false);
    }
  };

  const handleToolDragMove = (e: any) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    const isOverTrash = (
      pos.x >= trashZone.x && 
      pos.x <= trashZone.x + trashZone.width &&
      pos.y >= trashZone.y && 
      pos.y <= trashZone.y + trashZone.height
    );
    
    if (isOverTrash !== isTrashHovered) {
      setIsTrashHovered(isOverTrash);
    }
  };

  const handleCompassDrawStart = (pos: { x: number, y: number }) => {
    setIsDrawing(true);
    setLines([...lines, { 
      id: `compass-arc-${Date.now()}`, 
      points: [pos.x, pos.y], 
      color: '#3b82f6', 
      width: 2 
    }]);
  };

  const handleCompassDrawMove = (pos: { x: number, y: number }) => {
    if (!isDrawing) return;
    const newLines = [...lines];
    const lastLine = { ...newLines[newLines.length - 1] };
    lastLine.points = [...lastLine.points, pos.x, pos.y];
    newLines[newLines.length - 1] = lastLine;
    setLines(newLines);
  };

  const handleCompassDrawEnd = () => {
    setIsDrawing(false);
  };

  return (
    <div className={`w-full h-full bg-slate-50 overflow-hidden ${activeMode === 'pen' ? 'cursor-crosshair' : activeMode === 'eraser' ? 'cursor-not-allowed' : 'cursor-default'}`}>
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        ref={stageRef}
      >
        <Layer>
          <Grid 
            width={dimensions.width} 
            height={dimensions.height} 
            type={gridType} 
            cellSize={40} 
          />
          
          {/* Drawn Lines */}
          {lines.map((line) => (
            <Line
              key={line.id}
              points={line.points}
              stroke={line.color}
              strokeWidth={activeMode === 'eraser' ? 10 : line.width}
              strokeScaleEnabled={false}
              tension={activeMode === 'line-segment' ? 0 : 0.5}
              lineCap="round"
              lineJoin="round"
              onClick={() => eraseLine(line.id)}
              onMouseEnter={(e: any) => {
                if (activeMode === 'eraser') e.target.opacity(0.3);
              }}
              onMouseLeave={(e: any) => {
                if (activeMode === 'eraser') e.target.opacity(1);
              }}
            />
          ))}

          {/* Drawn Shapes */}
          {shapes.map((shape) => {
            if (shape.type === 'circle') {
              return (
                <Circle
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  radius={shape.radius || 0}
                  stroke={shape.color}
                  strokeWidth={2}
                  onClick={() => activeMode === 'eraser' && setShapes(shapes.filter(s => s.id !== shape.id))}
                />
              );
            }
            if (shape.type === 'square') {
              return (
                <Rect
                  key={shape.id}
                  x={shape.x - (shape.width || 0) / 2}
                  y={shape.y - (shape.height || 0) / 2}
                  width={shape.width || 0}
                  height={shape.height || 0}
                  stroke={shape.color}
                  strokeWidth={2}
                  onClick={() => activeMode === 'eraser' && setShapes(shapes.filter(s => s.id !== shape.id))}
                />
              );
            }
            if (shape.type === 'triangle') {
              return (
                <RegularPolygon
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  sides={3}
                  radius={shape.radius || 0}
                  stroke={shape.color}
                  strokeWidth={2}
                  onClick={() => activeMode === 'eraser' && setShapes(shapes.filter(s => s.id !== shape.id))}
                />
              );
            }
            return null;
          })}

          {[...activeTools].sort((a, b) => (a.id === selectedId ? 1 : b.id === selectedId ? -1 : 0)).map((tool) => {
            const isSelected = selectedId === tool.id;
            const onUpdate = (updates: Partial<ToolState>) => updateTool(tool.id, updates);
            const onSelect = () => {
              setSelectedId(tool.id);
            };

            const commonProps = {
              id: tool.id,
              x: tool.x,
              y: tool.y,
              rotation: tool.rotation,
              onUpdate: onUpdate,
              isSelected: isSelected,
              onSelect: onSelect,
              onDragEnd: (e: any) => handleToolDragEnd(e, tool.id),
              onDragMoveGlobal: handleToolDragMove,
            };

            if (tool.type === 'ruler') {
              return <Ruler key={tool.id} {...commonProps} width={tool.width || 400} />;
            }
            if (tool.type === 'compass') {
              return (
                <Compass 
                  key={tool.id} 
                  {...commonProps} 
                  radius={tool.radius || 100} 
                  onDrawStart={handleCompassDrawStart}
                  onDrawMove={handleCompassDrawMove}
                  onDrawEnd={handleCompassDrawEnd}
                />
              );
            }
            if (tool.type === 'protractor') {
              return <Protractor key={tool.id} {...commonProps} width={tool.width || 300} />;
            }
            return null;
          })}

          {/* Trash Can Area */}
          <Group x={trashZone.x} y={trashZone.y}>
            <Rect
              width={trashZone.width}
              height={trashZone.height}
              fill={isTrashHovered ? "rgba(239, 68, 68, 0.2)" : "rgba(100, 116, 139, 0.05)"}
              stroke={isTrashHovered ? "#ef4444" : "#94a3b8"}
              strokeWidth={2}
              cornerRadius={16}
              dash={isTrashHovered ? [] : [5, 5]}
            />
            <Text
              x={0}
              y={trashZone.height + 10}
              width={trashZone.width}
              text="Drop to delete"
              align="center"
              fontSize={10}
              fill={isTrashHovered ? "#ef4444" : "#94a3b8"}
              fontFamily="JetBrains Mono"
            />
            {/* Trash Icon Simplified */}
            <Group x={trashZone.width / 2 - 12} y={trashZone.height / 2 - 15}>
              <Rect width={24} height={30} stroke={isTrashHovered ? "#ef4444" : "#94a3b8"} strokeWidth={2} cornerRadius={2} />
              <Line points={[0, 5, 24, 5]} stroke={isTrashHovered ? "#ef4444" : "#94a3b8"} strokeWidth={2} />
              <Line points={[8, 10, 8, 25]} stroke={isTrashHovered ? "#ef4444" : "#94a3b8"} strokeWidth={1} />
              <Line points={[16, 10, 16, 25]} stroke={isTrashHovered ? "#ef4444" : "#94a3b8"} strokeWidth={1} />
            </Group>
          </Group>
        </Layer>
      </Stage>
    </div>
  );
};
