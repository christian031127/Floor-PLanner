import React, { useState, useEffect } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import GridOverlay from './GridOverlay';

const PlanEditor = ({ selectedTool, addWall, walls = [], setWalls, selectedWall, setSelectedWall, isInteractingWithUI }) => {
  const [drawing, setDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [previewLine, setPreviewLine] = useState(null);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth - 250,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth - 250,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e) => {
    if (!isInteractingWithUI && selectedTool !== 'select' && !drawing) {
      setSelectedWall(null);
    }

    const { x, y } = e.target.getStage().getPointerPosition();

    if (selectedTool === 'select') {
      const clickedWall = walls.find(wall => {
        const A = { x: wall.start_x, y: wall.start_y };
        const B = { x: wall.end_x, y: wall.end_y };
        const AP = { x: x - A.x, y: y - A.y };
        const AB = { x: B.x - A.x, y: B.y - A.y };
        const ab2 = AB.x ** 2 + AB.y ** 2;
        const ap_ab = AP.x * AB.x + AP.y * AB.y;
        const t = Math.max(0, Math.min(1, ap_ab / ab2));
        const closest = { x: A.x + AB.x * t, y: A.y + AB.y * t };
        const distance = Math.hypot(x - closest.x, y - closest.y);
        return distance < 10;
      });
      setSelectedWall(clickedWall || null);
      return;
    } else {
      if (!isInteractingWithUI && selectedWall) setSelectedWall(null);
    }

    if (selectedTool !== 'wall') return;

    if (!drawing) {
      const snappedStart = snapToEndpoint(x, y);
      setStartPoint(snappedStart);
      setDrawing(true);
    } else {
      if (previewLine) {
        const cleanedWall = simplifyWall({
          start_x: previewLine.start_x,
          start_y: previewLine.start_y,
          end_x: previewLine.end_x,
          end_y: previewLine.end_y,
        });
        addWall(cleanedWall);
      }
      setDrawing(false);
      setStartPoint(null);
      setPreviewLine(null);
    }
  };

  const handleMouseMove = (e) => {
    if (!drawing || !startPoint) return;
    const { x, y } = e.target.getStage().getPointerPosition();
    let dx = x - startPoint.x;
    let dy = y - startPoint.y;
    const angle = Math.atan2(dy, dx);
    const snapAngles = [
      0,
      Math.PI / 4,
      Math.PI / 2,
      (3 * Math.PI) / 4,
      Math.PI,
      (5 * Math.PI) / 4,
      (3 * Math.PI) / 2,
      (7 * Math.PI) / 4,
      2 * Math.PI,
    ];
    const SNAP_TOLERANCE = 0.07;

    for (const targetAngle of snapAngles) {
      const delta = Math.abs(angle - targetAngle);
      const wrappedDelta = Math.min(delta, Math.abs(2 * Math.PI - delta));
      if (wrappedDelta < SNAP_TOLERANCE) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx = Math.cos(targetAngle) * length;
        dy = Math.sin(targetAngle) * length;
        break;
      }
    }

    setPreviewLine({
      start_x: startPoint.x,
      start_y: startPoint.y,
      end_x: startPoint.x + dx,
      end_y: startPoint.y + dy,
    });
  };

  const snapToEndpoint = (x, y, tolerance = 10) => {
    for (const wall of walls) {
      if (Math.abs(wall.start_x - x) < tolerance && Math.abs(wall.start_y - y) < tolerance) {
        return { x: wall.start_x, y: wall.start_y };
      }
      if (Math.abs(wall.end_x - x) < tolerance && Math.abs(wall.end_y - y) < tolerance) {
        return { x: wall.end_x, y: wall.end_y };
      }
    }
    return { x, y };
  };

  const simplifyWall = (wall) => {
    const round = (val) => Math.round(val * 10) / 10;
    return {
      start_x: round(wall.start_x),
      start_y: round(wall.start_y),
      end_x: round(wall.end_x),
      end_y: round(wall.end_y),
    };
  };

  function getNormal({ x, y }) {
    const length = Math.sqrt(x * x + y * y);
    return { x: -y / length, y: x / length };
  }

  function getOffsetPoints(p1, p2, thickness) {
    const dir = { x: p2.x - p1.x, y: p2.y - p1.y };
    const normal = getNormal(dir);
    return {
      outer1: { x: p1.x + normal.x * thickness / 2, y: p1.y + normal.y * thickness / 2 },
      outer2: { x: p2.x + normal.x * thickness / 2, y: p2.y + normal.y * thickness / 2 },
    };
  }

  function getIntersection(p1, d1, p2, d2) {
    const a1 = d1.y, b1 = -d1.x, c1 = a1 * p1.x + b1 * p1.y;
    const a2 = d2.y, b2 = -d2.x, c2 = a2 * p2.x + b2 * p2.y;
    const det = a1 * b2 - a2 * b1;
    if (Math.abs(det) < 1e-6) return null;
    return {
      x: (b2 * c1 - b1 * c2) / det,
      y: (a1 * c2 - a2 * c1) / det,
    };
  }

  const joinTriangles = [];
  const thickness = 25;

  for (let i = 0; i < walls.length; i++) {
    for (let j = i + 1; j < walls.length; j++) {
      const w1 = walls[i];
      const w2 = walls[j];

      const sharedPoints = [
        [w1.start_x, w1.start_y, w2.start_x, w2.start_y],
        [w1.start_x, w1.start_y, w2.end_x, w2.end_y],
        [w1.end_x, w1.end_y, w2.start_x, w2.start_y],
        [w1.end_x, w1.end_y, w2.end_x, w2.end_y],
      ];

      for (const [x1, y1, x2, y2] of sharedPoints) {
        if (Math.hypot(x1 - x2, y1 - y2) < 1) {
          const shared = { x: x1, y: y1 };
          const w1_dir = { x: w1.end_x - w1.start_x, y: w1.end_y - w1.start_y };
          const w2_dir = { x: w2.end_x - w2.start_x, y: w2.end_y - w2.start_y };

          const n1 = getNormal(w1_dir);
          const n2 = getNormal(w2_dir);

          const w1_outer = extendPoint(shared.x, shared.y, n1.x, n1.y, thickness / 2);
          const w2_outer = extendPoint(shared.x, shared.y, n2.x, n2.y, thickness / 2);

          const int = getIntersection(w1_outer, w1_dir, w2_outer, w2_dir);

          if (int) {
            joinTriangles.push([shared.x, shared.y, w1_outer.x, w1_outer.y, int.x, int.y]);
            joinTriangles.push([shared.x, shared.y, w2_outer.x, w2_outer.y, int.x, int.y]);
          }
        }
      }
    }
  }

  return (
    <Stage
      width={windowSize.width}
      height={windowSize.height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      style={{ backgroundColor: '#f5e6d3' }}
    >
      <Layer>
        <Rect x={0} y={0} width={windowSize.width} height={windowSize.height} fill="#f5e6d3" />
        <GridOverlay width={windowSize.width} height={windowSize.height} cellSize={25} />
        {walls.map((wall, index) => (
          <Line
            key={index}
            points={[wall.start_x, wall.start_y, wall.end_x, wall.end_y]}
            stroke={selectedTool === 'select' && wall === selectedWall ? 'red' : 'gray'}
            strokeWidth={selectedTool === 'select' && wall === selectedWall ? 25 : 25}
          />
        ))}
        {previewLine && (
          <Line points={[previewLine.start_x, previewLine.start_y, previewLine.end_x, previewLine.end_y]} stroke="gray" strokeWidth={5} dash={[10, 5]} />
        )}
        {joinTriangles.map((pts, idx) => (
          <Line
            key={`join-${idx}`}
            points={pts}
            fill="gray"
            stroke="gray"
            closed
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default PlanEditor;
