/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { CoordinatePlane } from './components/Canvas/CoordinatePlane';
import { Toolbox } from './components/Sidebar/Toolbox';
import { GridType, ToolState, LineData, ToolMode, ShapeData } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Undo2, Trash2, Shapes } from 'lucide-react';

export default function App() {
  const [gridType, setGridType] = useState<GridType>('square');
  const [tools, setTools] = useState<ToolState[]>([]);
  const [lines, setLines] = useState<LineData[]>([]);
  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const [activeMode, setActiveMode] = useState<ToolMode>('select');
  const [history, setHistory] = useState<{ lines: LineData[]; tools: ToolState[]; shapes: ShapeData[] }[]>([]);

  const saveHistory = useCallback(() => {
    setHistory(prev => [...prev.slice(-19), { lines: [...lines], tools: [...tools], shapes: [...shapes] }]);
  }, [lines, tools, shapes]);

  const undo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setLines(lastState.lines);
    setTools(lastState.tools);
    setShapes(lastState.shapes || []);
    setHistory(prev => prev.slice(0, -1));
  };

  const addTool = (type: ToolState['type']) => {
    saveHistory();
    const newTool: ToolState = {
      id: `${type}-${Date.now()}`,
      type,
      x: window.innerWidth / 2 - 150,
      y: window.innerHeight / 2 - 150,
      rotation: 0,
      width: type === 'ruler' ? 400 : (type === 'protractor' ? 300 : undefined),
      radius: type === 'compass' ? 100 : undefined,
      isVisible: true,
    };
    setTools([...tools, newTool]);
    setActiveMode('select');
  };

  const updateTool = (id: string, updates: Partial<ToolState>) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTool = (id: string) => {
    saveHistory();
    setTools(prev => prev.filter(t => t.id !== id));
  };

  const clearAll = () => {
    saveHistory();
    setLines([]);
    setTools([]);
  };

  return (
    <div className="relative w-full h-full overflow-hidden font-sans bg-slate-100">
      {/* Header */}
      <header className="fixed top-6 left-6 z-50 flex items-center gap-4 pointer-events-none">
        <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl pointer-events-auto flex items-center gap-3 border border-white/10">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-black italic text-xl">M</div>
          <h1 className="text-xl font-bold tracking-tight">MathsPad <span className="text-blue-400 font-light">Pro</span></h1>
        </div>
      </header>

      {/* Top Actions */}
      <div className="fixed top-6 right-6 z-50 flex gap-2">
        <ActionButton 
          icon={<Undo2 size={18} />} 
          onClick={undo} 
          disabled={history.length === 0}
          label="Undo"
        />
        <ActionButton 
          icon={<Trash2 size={18} />} 
          onClick={clearAll} 
          label="Clear All"
          variant="danger"
        />
      </div>

      {/* Main Canvas Area */}
      <main className="w-full h-full">
        <CoordinatePlane 
          gridType={gridType} 
          activeTools={tools} 
          updateTool={updateTool}
          deleteTool={deleteTool}
          lines={lines}
          setLines={(newLines) => {
            if (newLines.length !== lines.length) saveHistory();
            setLines(newLines);
          }}
          shapes={shapes}
          setShapes={(newShapes) => {
            if (newShapes.length !== shapes.length) saveHistory();
            setShapes(newShapes);
          }}
          activeMode={activeMode}
        />
      </main>

      {/* Sidebar UI */}
      <Toolbox 
        gridType={gridType} 
        setGridType={setGridType} 
        addTool={addTool}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
      />

      {/* Help Overlay */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-slate-200 max-w-xs transition-all hover:scale-[1.02]">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
            Quick Guide
          </h3>
          <ul className="text-[11px] text-slate-600 space-y-2 list-none">
            <li className="flex gap-2">
              <span className="font-bold text-blue-600">Ruler:</span> 
              Drag body to move. Pen snaps to top edge.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-red-600">Compass:</span> 
              Red point moves. Blue tip draws. Middle handle adjusts radius.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-emerald-600">Shapes:</span> 
              Select a shape and drag on canvas to draw.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-slate-900">Delete:</span> 
              Drag any tool to the bottom-right trash zone.
            </li>
          </ul>
        </div>
      </div>

      {/* Status Bar */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-slate-900/90 backdrop-blur-xl px-8 py-3 rounded-full shadow-2xl border border-white/10 flex items-center gap-8">
          <StatusItem label="Mode" value={activeMode} color="text-blue-400" />
          <div className="h-4 w-px bg-white/10" />
          <StatusItem label="Grid" value={gridType} color="text-emerald-400" />
          <div className="h-4 w-px bg-white/10" />
          <StatusItem label="Objects" value={lines.length + tools.length + shapes.length} color="text-amber-400" />
        </div>
      </footer>

      {/* Welcome Overlay */}
      <AnimatePresence>
        {tools.length === 0 && lines.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 pointer-events-none flex items-center justify-center z-10"
          >
            <div className="bg-white/40 backdrop-blur-sm p-12 rounded-[3rem] border border-white/20 text-center">
              <h2 className="text-4xl font-light text-slate-400 tracking-tight">Select a tool to begin construction</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ActionButton = ({ icon, onClick, disabled, label, variant = 'default' }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all active:scale-95
      ${disabled ? 'opacity-30 cursor-not-allowed' : 'opacity-100 cursor-pointer'}
      ${variant === 'danger' 
        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm'}
    `}
  >
    {icon}
    <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
  </button>
);

const StatusItem = ({ label, value, color }: any) => (
  <div className="flex items-center gap-2">
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{label}</span>
    <span className={`text-xs font-mono font-bold ${color} uppercase`}>{value}</span>
  </div>
);
