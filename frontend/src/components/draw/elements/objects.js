import React from 'react';
import { Group, Rect, Line, Ellipse, Circle, Arc } from 'react-konva';

export function renderSofa(sofa, i, preview = false) {
  const x = sofa.position.x;
  const y = sofa.position.y;
  const rotation = sofa.angle * 180 / Math.PI;
  const scale = 1.7;

  const colorBackrest = preview ? 'rgba(102,102,102,0.15)' : '#666';
  const colorArmrest = preview ? 'rgba(85,85,85,0.15)' : '#555';
  const colorSeatBase = preview ? 'rgba(136,136,136,0.1)' : '#888';
  const colorCushion = preview ? 'rgba(170,170,170,0.1)' : '#aaa';

  return (
    <Group key={`sofa-${i}`} x={x} y={y} rotation={rotation}>
      {/* Háttámla */}
      <Rect
        x={-30 * scale}
        y={-20 * scale}
        width={60 * scale}
        height={6 * scale}
        fill={colorBackrest}
      />
      {/* Karfák */}
      <Rect
        x={-30 * scale}
        y={-14 * scale}
        width={6 * scale}
        height={28 * scale}
        fill={colorArmrest}
      />
      <Rect
        x={24 * scale}
        y={-14 * scale}
        width={6 * scale}
        height={28 * scale}
        fill={colorArmrest}
      />
      {/* Ülőrész háttér */}
      <Rect
        x={-24 * scale}
        y={-14 * scale}
        width={48 * scale}
        height={28 * scale}
        fill={colorSeatBase}
      />
      {/* Ülőpárnák */}
      <Rect
        x={-22 * scale}
        y={-12 * scale}
        width={20 * scale}
        height={24 * scale}
        fill={colorCushion}
      />
      <Rect
        x={2 * scale}
        y={-12 * scale}
        width={20 * scale}
        height={24 * scale}
        fill={colorCushion}
      />
    </Group>
  );
}

export function renderBed(bed, i, preview = false) {
  const { x, y } = bed.position;
  const rotation = bed.angle * 180 / Math.PI;
  const scale = 1.6;

  const mattressColor = preview ? 'rgba(255,255,255,0.3)' : 'lightgray';
  const outlineColor = preview ? 'rgba(0,0,0,0.2)' : 'black';
  const pillowColor = preview ? 'rgba(255,255,255,0.4)' : '#7a857b';
  const blanketColor = preview ? 'rgba(0,0,0,0.05)' : 'grey';

  return (
    <Group key={`bed-${i}`} x={x} y={y} rotation={rotation}>
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

export function renderLamp(lamp, i, preview = false) {
  const x = lamp.position.x;
  const y = lamp.position.y;
  const rotation = lamp.angle * 180 / Math.PI;
  const s = 1.1;

  const poleColor = preview ? 'rgba(105,105,105,0.2)' : '#444';
  const lightColor = preview ? 'rgba(255,235,59,0.2)' : '#ffeb3b';
  const capColor = preview ? 'rgba(34,34,34,0.2)' : '#222';
  const baseColor = preview ? 'rgba(50,50,50,0.2)' : '#333';

  return (
    <Group key={`lamp-${i}`} x={x} y={y} rotation={rotation} offsetY={-10 * s}>
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
        fill={capColor}
      />

      {/* Talpazat */}
      <Rect
        x={-6 * s}
        y={-2 * s}
        width={12 * s}
        height={4 * s}
        fill={baseColor}
      />
    </Group>
  );
}

export function renderGrill(grill, i, preview = false) {
  const x = grill.position.x;
  const y = grill.position.y;
  const rotation = grill.angle * 180 / Math.PI;
  const scale = 1.5;

  const bowlColor = preview ? 'rgba(68,68,68,0.2)' : '#444';
  const lidColor = preview ? 'rgba(34,34,34,0.2)' : '#222';
  const gridColor = preview ? 'rgba(187,187,187,0.3)' : '#bbb';
  const legColor = preview ? 'rgba(51,51,51,0.2)' : '#333';
  const handleColor = preview ? 'rgba(153,153,153,0.3)' : '#999';

  return (
    <Group key={`grill-${i}`} x={x} y={y} rotation={rotation}>
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

