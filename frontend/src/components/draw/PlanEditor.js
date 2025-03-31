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

    // Ha select módban vagyunk, és egy fal közelébe kattintunk, jelöljük ki
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
        return distance < 10; // max 10 px távolságra a fal bármely pontjától
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

  // Egérintés események kezelése (bizonyos fokokban megfogja a falat)
  const handleMouseMove = (e) => {
    if (!drawing || !startPoint) return;
    const { x, y } = e.target.getStage().getPointerPosition();
    let dx = x - startPoint.x;
    let dy = y - startPoint.y;
    const angle = Math.atan2(dy, dx); // radiánban
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
    const SNAP_TOLERANCE = 0.07; // radiánban, kb. 4 fok

    //let snapped = false;
    for (const targetAngle of snapAngles) {
      if (Math.abs(angle - targetAngle) < SNAP_TOLERANCE || Math.abs(angle - targetAngle + 2 * Math.PI) < SNAP_TOLERANCE) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx = Math.cos(targetAngle) * length;
        dy = Math.sin(targetAngle) * length;
        //snapped = true;
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
      </Layer>
    </Stage>
  );
};

export default PlanEditor;
