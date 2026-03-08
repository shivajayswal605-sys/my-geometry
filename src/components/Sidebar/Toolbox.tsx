import React from 'react';
import { 
  Ruler, 
  Compass, 
  MousePointer2, 
  Grid3X3, 
  Square, 
  Triangle,
  RotateCw,
  FlipHorizontal,
  Move,
  Pen,
  Eraser,
  Circle,
  Minus,
  Shapes,
  Square as SquareIcon,
  Triangle as TriangleIcon
} from 'lucide-react';

const ProtractorIcon = Circle;
import { GridType, ToolMode } from '../../types';
import { cn } from '../../lib/utils';

interface ToolboxProps {
  gridType: GridType;
  setGridType: (type: GridType) => void;
  addTool: (type: 'ruler' | 'compass' | 'protractor') => void;
  activeMode: ToolMode;
  setActiveMode: (mode: ToolMode) => void;
}

export const Toolbox: React.FC<ToolboxProps> = ({ gridType, setGridType, addTool, activeMode, setActiveMode }) => {
  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
      {/* Main Tools */}
      <div className="bg-white/95 backdrop-blur-xl p-2 rounded-[2rem] shadow-2xl border border-slate-200 flex flex-col gap-2">
        <ToolButton 
          icon={<MousePointer2 size={20} />} 
          label="Select" 
          active={activeMode === 'select'} 
          onClick={() => setActiveMode('select')}
        />
        <ToolButton 
          icon={<Pen size={20} />} 
          label="Pen" 
          active={activeMode === 'pen'} 
          onClick={() => setActiveMode('pen')}
        />
        <ToolButton 
          icon={<Minus size={20} />} 
          label="Line Segment" 
          active={activeMode === 'line-segment'} 
          onClick={() => setActiveMode('line-segment')}
        />
        <ToolButton 
          icon={<Eraser size={20} />} 
          label="Eraser" 
          active={activeMode === 'eraser'} 
          onClick={() => setActiveMode('eraser')}
        />
        
        <div className="h-px bg-slate-100 mx-2 my-1" />
        
        <div className="flex flex-col gap-1 p-1 bg-slate-50 rounded-2xl border border-slate-100">
          <ToolButton 
            icon={<Circle size={18} />} 
            label="Circle" 
            active={activeMode === 'shape-circle'} 
            onClick={() => setActiveMode('shape-circle')}
          />
          <ToolButton 
            icon={<SquareIcon size={18} />} 
            label="Square" 
            active={activeMode === 'shape-square'} 
            onClick={() => setActiveMode('shape-square')}
          />
          <ToolButton 
            icon={<TriangleIcon size={18} />} 
            label="Triangle" 
            active={activeMode === 'shape-triangle'} 
            onClick={() => setActiveMode('shape-triangle')}
          />
        </div>

        <div className="h-px bg-slate-100 mx-2 my-1" />
        
        <ToolButton 
          icon={<Ruler size={20} />} 
          label="Ruler" 
          onClick={() => addTool('ruler')} 
        />
        <ToolButton 
          icon={<Compass size={20} />} 
          label="Compass" 
          onClick={() => addTool('compass')}
        />
        <ToolButton 
          icon={<ProtractorIcon size={20} />} 
          label="Protractor" 
          onClick={() => addTool('protractor')}
        />
      </div>

      {/* Grid Controls */}
      <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-slate-200 flex flex-col gap-2">
        <ToolButton 
          icon={<Grid3X3 size={20} />} 
          label="Square" 
          active={gridType === 'square'} 
          onClick={() => setGridType('square')}
        />
        <ToolButton 
          icon={<Triangle size={20} className="rotate-180" />} 
          label="Iso" 
          active={gridType === 'isometric'} 
          onClick={() => setGridType('isometric')}
        />
        <ToolButton 
          icon={<Square size={20} className="opacity-20" />} 
          label="None" 
          active={gridType === 'none'} 
          onClick={() => setGridType('none')}
        />
      </div>

      {/* Transformations */}
      <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-slate-200 flex flex-col gap-2">
        <ToolButton icon={<Move size={20} />} label="Translate" />
        <ToolButton icon={<RotateCw size={20} />} label="Rotate" />
        <ToolButton icon={<FlipHorizontal size={20} />} label="Reflect" />
      </div>
    </div>
  );
};

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "p-3 rounded-xl transition-all duration-200 group relative flex items-center justify-center",
      active 
        ? "bg-slate-900 text-white shadow-lg" 
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    {icon}
    <span className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
      {label}
    </span>
  </button>
);
