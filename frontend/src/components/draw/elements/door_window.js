// Import React for rendering components
import React from 'react';
// Import tinycolor for color manipulation 
import tinycolor from 'tinycolor2';
// Import Konva components for rendering shapes
import { Group, Rect, Arc } from 'react-konva';

export const WINDOW_LENGTH = 60;
export const DOOR_LENGTH = 50;

// Render Door
export function renderDoor(door, i, preview = false, onClick = null, isSelected = false, handleElementUpdate) {
  const length = door.length || DOOR_LENGTH;
  const thickness = door.wall?.thickness || 25;

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
      draggable={isSelected}
      dragBoundFunc={createWallDragBoundFunc(length, door.wall)}
      // For the update function!
      onDragEnd={(e) => {
        if (!handleElementUpdate || !door.wall) return;

        const pos = e.target.position();
        const wall = door.wall;
        const dx = wall.end.x - wall.start.x;
        const dy = wall.end.y - wall.start.y;
        const wallLengthSq = dx * dx + dy * dy;
        const vec = {
          x: pos.x - wall.start.x,
          y: pos.y - wall.start.y
        };
        const dot = vec.x * dx + vec.y * dy;
        const position_x = Math.max(0, Math.min(1, dot / wallLengthSq));

        handleElementUpdate({
          ...door,
          position: {
            x: wall.start.x + dx * position_x,
            y: wall.start.y + dy * position_x
          }
        });
      }}>

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
        y={flip ? thickness / 2 : -thickness / 2}
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
export function renderWindow(win, i, preview = false, onClick = null, isSelected = false, handleElementUpdate) {
  const length = win.length || WINDOW_LENGTH;
  const lineThickness = 2;
  const glassthickness = 6;
  const postWidth = lineThickness;
  const postHeight = win.wall?.thickness || 25;

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
      opacity={isSelected ? 0.7 : 1}
      draggable={isSelected}
      dragBoundFunc={createWallDragBoundFunc(length, win.wall)}
      // For the update function!
      onDragEnd={(e) => {
        if (!handleElementUpdate || !win.wall) return;

        const pos = e.target.position();
        const wall = win.wall;
        const dx = wall.end.x - wall.start.x;
        const dy = wall.end.y - wall.start.y;
        const wallLengthSq = dx * dx + dy * dy;
        const vec = {
          x: pos.x - wall.start.x,
          y: pos.y - wall.start.y
        };
        const dot = vec.x * dx + vec.y * dy;
        const position_x = Math.max(0, Math.min(1, dot / wallLengthSq));

        handleElementUpdate({
          ...win,
          position: {
            x: wall.start.x + dx * position_x,
            y: wall.start.y + dy * position_x
          }
        });
      }}>

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

// Calculate the transform for the element based on the wall and position
function calculateElementTransform(wall, position) {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const angleRad = Math.atan2(dy, dx);

  return {
    x: position.x,
    y: position.y,
    angle: angleRad * 180 / Math.PI,
  };
}

// Create a drag bound function for the wall
export function createWallDragBoundFunc(elementLength, wall) {
  return (pos) => {
    const wallVec = {
      x: wall.end.x - wall.start.x,
      y: wall.end.y - wall.start.y,
    };
    const wallLength = Math.hypot(wallVec.x, wallVec.y);

    const vecToPointer = {
      x: pos.x - wall.start.x,
      y: pos.y - wall.start.y,
    };

    let dot = (vecToPointer.x * wallVec.x + vecToPointer.y * wallVec.y) / wallLength;
    let ratio = dot / wallLength;

    const halfLengthRatio = (elementLength / 2) / wallLength;
    ratio = Math.max(halfLengthRatio, Math.min(1 - halfLengthRatio, ratio));

    return {
      x: wall.start.x + ratio * wallVec.x,
      y: wall.start.y + ratio * wallVec.y
    };
  };
}


