import React from 'react';
import { Group, Rect, Arc } from 'react-konva';

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

export function renderDoor(door, i, preview = false) {
  const length = DOOR_LENGTH;
  const thickness = WALL_THICKNESS;

  const { x, y, angle } = calculateElementTransform(door.wall, door.position);
  const color = preview ? 'rgba(231, 194, 167, 0.3)' : 'rgba(139,69,19,0.3)';
  const flip = door.flip || false;

  return (
    <Group
      key={door.id || `door-${i}`}
      x={x}
      y={y}
      rotation={angle}
      scaleX={flip ? -1 : 1}
    >
      {/* Ajtólap */}
      <Rect
        x={0}
        y={0}
        width={length}
        height={thickness}
        fill={color}
        offsetX={length / 2}
        offsetY={thickness / 2}
        stroke="black"
        strokeWidth={1}
      />

      {/* Ív */}
      <Arc
        x={length / 2}
        y={flip ? WALL_THICKNESS / 2 : -WALL_THICKNESS / 2}
        innerRadius={0}
        outerRadius={length}
        fill={color}
        angle={90}
        rotation={flip ? 90 : 180}
        stroke="black"
        strokeWidth={1}
      />
    </Group>
  );
}

export function renderWindow(win, i, preview = false) {
  const length = WINDOW_LENGTH;
  const lineThickness = 2;
  const glassthickness = 6;
  const postWidth = lineThickness;
  const postHeight = WALL_THICKNESS;

  const { x, y, angle } = calculateElementTransform(win.wall, win.position);
  const color = preview ? 'rgba(255, 255, 255, 0.5)' : 'lightblue';

  return (
    <Group
      key={win.id || `window-${i}`}
      x={x}
      y={y}
      rotation={angle}
    >
      {/* Bal oldal */}
      <Rect
        x={-length / 2}
        y={0}
        width={postWidth}
        height={postHeight}
        fill={color}
        offsetX={postWidth / 2}
        offsetY={postHeight / 2}
      />

      {/* Jobb oldal */}
      <Rect
        x={length / 2}
        y={0}
        width={postWidth}
        height={postHeight}
        fill={color}
        offsetX={postWidth / 2}
        offsetY={postHeight / 2}
      />

      {/* Közepe */}
      <Rect
        x={0}
        y={0}
        width={length}
        height={glassthickness}
        fill={color}
        offsetX={length / 2}
        offsetY={glassthickness / 2}
      />
    </Group>
  );
}

