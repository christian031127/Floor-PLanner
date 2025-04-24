import React from 'react';
import tinycolor from 'tinycolor2'; // Import tinycolor for color manipulation
import { Group, Rect, Arc } from 'react-konva'; // Import Konva components for rendering shapes

const WALL_THICKNESS = 25;

export const WINDOW_LENGTH = 60;
export const DOOR_LENGTH = 50;

export function calculateElementTransform(wall, position) {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const angleRad = Math.atan2(dy, dx);

  return {
    x: position.x,
    y: position.y,
    angle: angleRad * 180 / Math.PI,
  };
}

// Render Door
export function renderDoor(door, i, preview = false, onClick = null, isSelected = false, onDragMove) {
  const length = door.length || DOOR_LENGTH;
  const thickness = WALL_THICKNESS;

  const { x, y, angle } = calculateElementTransform(door.wall, door.position);

  const baseColor = door.fill || '#F5F5F5';
  const finalBaseColor = preview ? tinycolor(baseColor).setAlpha(0.4).toRgbString() : baseColor;

  const strokeColor = 'black';
  const strokeWidth = isSelected ? 2.5 : 1;

  const flip = door.flip || false;

  return (
    <Group
      key={door.id || `door-${i}`}
      x={x}
      y={y}
      rotation={angle}
      scaleX={flip ? -1 : 1}
      onClick={onClick || undefined}
      opacity={isSelected ? 0.7 : 1}
      draggable={!preview}
      onDragMove={onDragMove}>

      <Rect
        x={0}
        y={0}
        width={length}
        height={thickness}
        fill={finalBaseColor}
        offsetX={length / 2}
        offsetY={thickness / 2}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      <Arc
        x={length / 2}
        y={flip ? WALL_THICKNESS / 2 : -WALL_THICKNESS / 2}
        innerRadius={0}
        outerRadius={length}
        fill={finalBaseColor}
        angle={90}
        rotation={flip ? 90 : 180}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </Group>
  );
}

// Render Window
export function renderWindow(win, i, preview = false, onClick = null, isSelected = false) {
  const length = win.length || WINDOW_LENGTH;
  const lineThickness = 2;
  const glassthickness = 6;
  const postWidth = lineThickness;
  const postHeight = WALL_THICKNESS;

  const { x, y, angle } = calculateElementTransform(win.wall, win.position);

  const baseColor = win.fill || '#F5F5F5';
  const finalBaseColor = preview ? tinycolor(baseColor).setAlpha(0.4).toRgbString() : baseColor;

  return (
    <Group
      key={win.id || `window-${i}`}
      x={x}
      y={y}
      rotation={angle}
      onClick={onClick || undefined}
      opacity={isSelected ? 0.7 : 1}>

      {/* Láthatatlan háttér, nagyobb kattintható terület */}
      <Rect
        x={-length / 2}
        y={-postHeight / 2}
        width={length}
        height={postHeight}
        fill="transparent"
      />

      {/* Bal oldal */}
      <Rect
        x={-length / 2}
        y={0}
        width={postWidth}
        height={postHeight}
        fill={finalBaseColor}
        offsetX={postWidth / 2}
        offsetY={postHeight / 2}
        stroke={isSelected ? 'black' : undefined}
        strokeWidth={isSelected ? 1.5 : 0}
      />

      {/* Jobb oldal */}
      <Rect
        x={length / 2}
        y={0}
        width={postWidth}
        height={postHeight}
        fill={finalBaseColor}
        offsetX={postWidth / 2}
        offsetY={postHeight / 2}
        stroke={isSelected ? 'black' : undefined}
        strokeWidth={isSelected ? 1.5 : 0}
      />

      {/* Közepe */}
      <Rect
        x={0}
        y={0}
        width={length}
        height={glassthickness}
        fill={finalBaseColor}
        offsetX={length / 2}
        offsetY={glassthickness / 2}
        stroke={isSelected ? 'black' : undefined}
        strokeWidth={isSelected ? 1.5 : 0}
      />
    </Group>
  );
}

