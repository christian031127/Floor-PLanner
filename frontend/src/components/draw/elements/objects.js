import React from 'react';
import tinycolor from 'tinycolor2'; // Import tinycolor for color manipulation
import { Group, Rect, Line, Ellipse, Circle, Arc } from 'react-konva'; // Import Konva components for rendering shapes

// Render Sofa
export function renderSofa(sofa, i, preview = false, onClick, isSelected = false, onDragMove = null) {
  const x = sofa.position.x;
  const y = sofa.position.y;

  const rotation = ((sofa.angle * 180 / Math.PI + 360) + 360) % 360;
  const scale = (sofa.size || 1.7) * (isSelected ? 1.05 : 1);

  const baseColor = sofa.fill || '#888';
  const finalBaseColor = preview ? tinycolor(baseColor).setAlpha(0.4).toRgbString() : baseColor;

  const backColor = darkenColor(finalBaseColor, 10);
  const armColor = darkenColor(finalBaseColor, 10);
  const seatColor = lightenColor(finalBaseColor, 5);
  const cushionColor = darkenColor(finalBaseColor, 5);

  return (
    <Group
      key={`sofa-${i}`}
      x={x}
      y={y}
      rotation={rotation}
      onClick={onClick}
      opacity={isSelected ? 0.7 : 1}
      draggable={isSelected}
      onDragMove={onDragMove}>

      {/* Háttámla */}
      <Rect
        x={-30 * scale}
        y={-20 * scale}
        width={60 * scale}
        height={6 * scale}
        fill={backColor} />

      {/* Karfák */}
      <Rect
        x={-30 * scale}
        y={-14 * scale}
        width={6 * scale}
        height={28 * scale}
        fill={armColor} />

      <Rect
        x={24 * scale}
        y={-14 * scale}
        width={6 * scale}
        height={28 * scale}
        fill={armColor} />

      {/* Ülőrész háttér */}
      <Rect
        x={-24 * scale}
        y={-14 * scale}
        width={48 * scale}
        height={28 * scale}
        fill={seatColor} />

      {/* Ülőpárnák */}
      <Rect
        x={-22 * scale}
        y={-12 * scale}
        width={20 * scale}
        height={24 * scale}
        fill={cushionColor} />

      <Rect
        x={2 * scale}
        y={-12 * scale}
        width={20 * scale}
        height={24 * scale}
        fill={cushionColor} />

    </Group>
  );
}

// Render Bed
export function renderBed(bed, i, preview = false, onClick, isSelected = false, onDragMove = null) {
  const { x, y } = bed.position;

  const rotation = ((bed.angle * 180 / Math.PI + 360) + 360) % 360;
  const scale = (bed.size || 1.4) * (isSelected ? 1.05 : 1);

  const baseColor = bed.fill || '#888';
  const finalBaseColor = preview ? tinycolor(baseColor).setAlpha(0.4).toRgbString() : baseColor;

  const mattressColor = darkenColor(finalBaseColor, 10);
  const outlineColor = darkenColor(finalBaseColor, 15);
  const pillowColor = lightenColor(finalBaseColor, 15);
  const blanketColor = lightenColor(finalBaseColor, 20);

  return (
    <Group
      key={`bed-${i}`}
      x={x}
      y={y}
      rotation={rotation}
      onClick={onClick}
      opacity={isSelected ? 0.7 : 1}
      draggable={isSelected}
      onDragMove={onDragMove}>

      {/* Matrac */}
      <Rect
        x={-35 * scale}
        y={-50 * scale}
        width={70 * scale}
        height={80 * scale}
        fill={mattressColor}
        stroke={outlineColor}
        strokeWidth={1}
        cornerRadius={6}
      />

      {/* Takarócsík */}
      <Rect
        x={-35 * scale}
        y={-50 * scale + 28 * scale}
        width={70 * scale}
        height={10 * scale}
        fill={blanketColor}
        stroke={outlineColor}
        strokeWidth={1}
      />

      {/* Bal párna */}
      <Rect
        x={-30 * scale}
        y={-45 * scale}
        width={25 * scale}
        height={15 * scale}
        fill={pillowColor}
        stroke={outlineColor}
        strokeWidth={1}
        cornerRadius={4}
      />

      {/* Jobb párna */}
      <Rect
        x={5 * scale}
        y={-45 * scale}
        width={25 * scale}
        height={15 * scale}
        fill={pillowColor}
        stroke={outlineColor}
        strokeWidth={1}
        cornerRadius={4}
      />
    </Group>
  );
}

// Render Lamp
export function renderLamp(lamp, i, preview = false, onClick, isSelected = false, onDragMove = null) {
  const x = lamp.position.x;
  const y = lamp.position.y;

  const rotation = ((lamp.angle * 180 / Math.PI + 360) + 360) % 360;
  const s = (lamp.size || 1.2) * (isSelected ? 1.05 : 1);

  const baseColor = lamp.fill || '#888';
  const finalBaseColor = preview ? tinycolor(baseColor).setAlpha(0.4).toRgbString() : baseColor;

  const poleColor = darkenColor(finalBaseColor, 5);
  const lightColor = lightenColor(finalBaseColor, 50);

  return (
    <Group
      key={`lamp-${i}`}
      x={x}
      y={y}
      rotation={rotation}
      offsetY={-10 * s}
      onClick={onClick}
      opacity={isSelected ? 0.7 : 1}
      draggable={isSelected}
      onDragMove={onDragMove}>

      {/* Oszlop */}
      <Rect
        x={-2 * s}
        y={-20 * s}
        width={4 * s}
        height={20 * s}
        fill={poleColor}
      />

      {/* Lámpafej */}
      <Circle
        x={0}
        y={-25 * s}
        radius={6 * s}
        fill={lightColor}
        shadowBlur={preview ? 0 : 8}
      />

      {/* Lámpakupak */}
      <Arc
        x={0}
        y={-32 * s}
        innerRadius={0}
        outerRadius={8 * s}
        angle={180}
        rotation={0}
        fill={poleColor}
      />

      {/* Talpazat */}
      <Rect
        x={-6 * s}
        y={-2 * s}
        width={12 * s}
        height={4 * s}
        fill={poleColor}
      />
    </Group>
  );
}

// Render Grill
export function renderGrill(grill, i, preview = false, onClick, isSelected = false, onDragMove = null) {
  const x = grill.position.x;
  const y = grill.position.y;

  const rotation = ((grill.angle * 180 / Math.PI + 360) + 360) % 360;
  const scale = (grill.size || 1.5) * (isSelected ? 1.05 : 1);

  const baseColor = grill.fill || '#888';
  const finalBaseColor = preview ? tinycolor(baseColor).setAlpha(0.4).toRgbString() : baseColor;

  const bowlColor = darkenColor(finalBaseColor, 15);
  const lidColor = darkenColor(finalBaseColor, 20);
  const gridColor = lightenColor(finalBaseColor, 10);
  const legColor = darkenColor(finalBaseColor, 10);
  const handleColor = lightenColor(finalBaseColor, 20);

  return (
    <Group
      key={`grill-${i}`}
      x={x}
      y={y}
      rotation={rotation}
      onClick={onClick}
      opacity={isSelected ? 0.7 : 1}
      draggable={isSelected}
      onDragMove={onDragMove}>

      {/* Grill tálca */}
      <Ellipse radiusX={20 * scale} radiusY={14 * scale} fill={bowlColor} />

      {/* Grill rács */}
      {[...Array(4)].map((_, idx) => {
        const uniqueKey = `grill-grid-line-${idx}`;
        return (
          <Line
            key={uniqueKey}
            points={[-16 * scale, (-6 + idx * 4) * scale, 16 * scale, (-6 + idx * 4) * scale]}
            stroke={gridColor}
            strokeWidth={1}
          />
        );
      })}

      {/* Fogantyúk */}
      <Rect x={-24 * scale} y={-4 * scale} width={4 * scale} height={8 * scale} fill={handleColor} />
      <Rect x={20 * scale} y={-4 * scale} width={4 * scale} height={8 * scale} fill={handleColor} />

      {/* Fedél */}
      <Arc
        x={0}
        y={-10 * scale}
        innerRadius={0}
        outerRadius={20 * scale}
        angle={180}
        rotation={180}
        fill={lidColor}
      />

      {/* 2 láb */}
      {[[-10, 12], [10, 12]].map(([lx, ly], index) => (
        <Line
          key={`leg-${lx}-${ly}`}
          points={[lx * scale, ly * scale, lx * scale, (ly + 10) * scale]}
          stroke={legColor}
          strokeWidth={1.5}
        />
      ))}
    </Group>
  );
}

// Utility functions to lighten and darken colors
function lightenColor(hex, amount = 20) {
  return tinycolor(hex).lighten(amount).toString();
}

function darkenColor(hex, amount = 20) {
  return tinycolor(hex).darken(amount).toString();
}


