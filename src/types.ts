export type GridType = 'none' | 'square' | 'isometric';
export type ToolMode = 'select' | 'pen' | 'eraser' | 'line-segment' | 'shape-circle' | 'shape-square' | 'shape-triangle';

export interface Point {
  x: number;
  y: number;
}

export interface LineData {
  id: string;
  points: number[];
  color: string;
  width: number;
  isClosed?: boolean;
}

export interface ShapeData {
  id: string;
  type: 'circle' | 'square' | 'triangle';
  x: number;
  y: number;
  radius?: number;
  width?: number;
  height?: number;
  color: string;
  rotation: number;
}

export interface ToolState {
  id: string;
  type: 'ruler' | 'compass' | 'protractor';
  x: number;
  y: number;
  rotation: number;
  width?: number;
  radius?: number;
  isVisible: boolean;
}

export interface CanvasState {
  gridType: GridType;
  zoom: number;
  tools: ToolState[];
}
