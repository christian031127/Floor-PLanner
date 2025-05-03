import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text } from 'react-konva';
import GridOverlay from './GridOverlay';

// Wall rendering and adjustment functions
import { renderWall, adjustWallEndpoints, detectClosedAreas, calculateCentroid, calculatePolygonArea } from './elements/wall';

// Door and window rendering functions
import { renderDoor, renderWindow, DOOR_LENGTH, WINDOW_LENGTH } from './elements/door_window';

// Furniture rendering functions
import { renderSofa, renderBed, renderGrill, renderLamp } from './elements/objects';

const SNAP_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315].map(deg => deg * Math.PI / 180);
const SNAP_TOLERANCE = 0.07;

const PlanEditor = ({
  selectedTool, setSelectedTool,
  walls, setWalls,
  doors, setDoors,
  windows, setWindows,
  sofas, setSofas,
  beds, setBeds,
  grills, setGrills,
  lamps, setLamps,
  isInteractingWithUI,
  justSelectedRef,
  stageRef,
  planName,
  setSelectedElement,
  selectedElement,
  elements, setElements, setEditMode,
  handleObjectUpdate, handleElementUpdate
}) => {

  const [drawing, setDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [previewWall, setPreviewWall] = useState(null);
  //const [debugPoints, setDebugPoints] = useState([]);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth - 250,
    height: window.innerHeight,
  });

  const closedAreas = detectClosedAreas(walls);

  const [placementPhase, setPlacementPhase] = useState(false);
  const [pendingObject, setPendingObject] = useState(null);

  useEffect(() => {
    window.stageRef = stageRef;
  }, [stageRef]);

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

  useEffect(() => {
    if (['sofa', 'bed', 'lamp', 'grill'].includes(selectedTool)) {
      justSelectedRef.current = true;
      setTimeout(() => { justSelectedRef.current = false }, 50);
    }

    setPendingObject(null);
  }, [selectedTool, justSelectedRef]);

  // Handle mouse events for placing objects and drawing walls
  const handleMouseDown = (e) => {
    const { x, y } = e.target.getStage().getPointerPosition();
    if (justSelectedRef.current) return;

    // Door and window placement
    if (pendingObject && ['door', 'window'].includes(pendingObject.type)) {
      const newItem = {
        id: crypto.randomUUID(),
        type: pendingObject.type,
        position: pendingObject.position,
        wall: pendingObject.wall,
        wallId: pendingObject.wall?.id,
        ...(pendingObject.flip !== undefined ? { flip: pendingObject.flip } : {}),
        length: pendingObject.type === 'door' ? 50 : 60,
        fill: pendingObject.type === 'door' ? '#F5F5F5' : '#F5F5F5'
      };

      if (pendingObject.type === 'door') {
        setDoors([...doors, newItem]);
      } else {
        setWindows([...windows, newItem]);
      }

      setElements(prev => [...prev, newItem]);

      setPendingObject(null);
      setSelectedTool('select');
      return;
    }

    // First click on a pending object (sofa, bed, grill, lamp)
    if (pendingObject && placementPhase && ['sofa', 'bed', 'grill', 'lamp'].includes(pendingObject.type)) {
      setPlacementPhase(false);
      return;
    }

    // Second click on a pending object (sofa, bed, grill, lamp)
    if (pendingObject && !placementPhase && ['sofa', 'bed', 'grill', 'lamp'].includes(pendingObject.type)) {
      const newItem = {
        id: crypto.randomUUID(),
        type: pendingObject.type,
        position: pendingObject.position,
        angle: pendingObject.angle,
        size: pendingObject.size,
        fill: pendingObject.fill ?? '#888',
      };

      switch (pendingObject.type) {
        case 'sofa': setSofas([...sofas, newItem]); break;
        case 'bed': setBeds([...beds, newItem]); break;
        case 'grill': setGrills([...grills, newItem]); break;
        case 'lamp': setLamps([...lamps, newItem]); break;
        default: break;
      }

      setPendingObject(null);
      setSelectedTool('select');
      return;
    }

    // Handle door and window placement to walls
    if (selectedTool === 'door' || selectedTool === 'window') {
      const nearestWall = findNearestWallOnClick(x, y);
      if (nearestWall) {
        const isWindow = selectedTool === 'window';
        const elementLength = isWindow ? WINDOW_LENGTH : DOOR_LENGTH;
        const placement = getWallPlacementPoint(nearestWall, x, y, elementLength, isWindow ? 'center' : 'start');
        const flip = !isWindow && isMouseLeftOfWall(nearestWall, { x, y });

        const newItem = {
          id: crypto.randomUUID(),
          type: selectedTool,
          position: placement,
          wall: nearestWall,
          wallId: nearestWall.id,
          ...(isWindow ? {} : { flip }),
          length: isWindow ? 60 : 50,
          fill: isWindow ? '#F5F5F5' : '#F5F5F5'
        };

        if (isWindow) setWindows([...windows, newItem]);
        else setDoors([...doors, newItem]);

        setElements(prev => [...prev, newItem]);
      }
      return;
    }

    // Handle wall drawing
    if (!isInteractingWithUI && selectedTool === 'wall') {
      if (!drawing) {
        const snapped = snapToExistingWallEnds(x, y);
        setStartPoint(snapped);
        setDrawing(true);
      } else if (previewWall) {

        //addWall(newWall);

        if (previewWall) {
          const newWall = { ...previewWall, id: `wall-${crypto.randomUUID()}` };
          const updated = [...walls, newWall];
          //const snappedWalls = snapWallEndpointsToOtherWalls(updated);
          const { adjusted } = adjustWallEndpoints(updated);

          adjusted.forEach((w, i) => {
            console.log(`WALL ${i} (${w.id}):`);
            console.log("  outerStart:", w.outerStart);
            console.log("  outerEnd:  ", w.outerEnd);
            console.log("  innerEnd:  ", w.innerEnd);
            console.log("  innerStart:", w.innerStart);
          });

          setWalls(adjusted);

          setDrawing(false);
          setStartPoint(null);
          setPreviewWall(null);
        }

        //setDebugPoints(debug);
      }
    }
  };

  // Handle mouse movement for object placement and wall drawing
  const handleMouseMove = (e) => {
    if (isInteractingWithUI) return;

    const { x, y } = e.target.getStage().getPointerPosition();

    if (handlePendingObjectPlacement(x, y)) return;
    if (handlePendingObjectRotation(x, y)) return;
    if (handleDoorOrWindowPlacement(x, y)) return;
    if (handleWallDrawing(x, y)) return;
  };

  const handlePendingObjectPlacement = (x, y) => {
    if (!pendingObject && ['sofa', 'bed', 'grill', 'lamp'].includes(selectedTool)) {
      setPendingObject({ type: selectedTool, position: { x, y }, angle: 0 });
      setPlacementPhase(true);
      return true;
    }

    if (pendingObject && placementPhase && ['sofa', 'bed', 'grill', 'lamp'].includes(pendingObject.type)) {
      setPendingObject({ ...pendingObject, position: { x, y } });
      return true;
    }

    return false;
  };

  const handlePendingObjectRotation = (x, y) => {
    if (pendingObject && !placementPhase && ['sofa', 'bed', 'grill', 'lamp'].includes(pendingObject.type)) {
      const { x: px, y: py } = pendingObject.position;
      const angle = Math.atan2(y - py, x - px);
      const snappedAngle = snapAngleToGrid(angle);
      setPendingObject({ ...pendingObject, angle: snappedAngle });
      return true;
    }

    return false;
  };

  const handleDoorOrWindowPlacement = (x, y) => {
    if (!pendingObject && ['door', 'window'].includes(selectedTool)) {
      const wall = findNearestWallOnClick(x, y);
      if (wall) {
        const isWindow = selectedTool === 'window';
        const elementLength = isWindow ? WINDOW_LENGTH : DOOR_LENGTH;
        const pos = getWallPlacementPoint(wall, x, y, elementLength);

        const flip = !isWindow && isMouseLeftOfWall(wall, { x, y }); // csak ajtónál kell!

        setPendingObject({
          type: selectedTool,
          wall,
          wallId: wall.id,
          position: pos,
          ...(isWindow ? {} : { flip }),
          length: selectedTool === "door" ? 50 : 60,
          fill: selectedTool === "door" ? "#F5F5F5" : "#F5F5F5",
        });

      }

      return true;
    }

    if (pendingObject && ['door', 'window'].includes(pendingObject.type)) {
      const wall = findNearestWallOnClick(x, y);
      if (wall) {
        const isWindow = pendingObject.type === 'window';
        const elementLength = isWindow ? WINDOW_LENGTH : DOOR_LENGTH;
        const pos = getWallPlacementPoint(wall, x, y, elementLength);

        const flip = !isWindow && isMouseLeftOfWall(wall, { x, y });

        setPendingObject({ ...pendingObject, wall, position: pos, ...(isWindow ? {} : { flip }) });
      }
      return true;
    }

    return false;
  };

  const handleWallDrawing = (x, y) => {
    if (!drawing || !startPoint) return false;

    const dx = x - startPoint.x;
    const dy = y - startPoint.y;
    const angle = Math.atan2(dy, dx);
    const snappedAngle = snapAngleToGrid(angle);

    const length = Math.hypot(dx, dy);
    const end = {
      x: startPoint.x + Math.cos(snappedAngle) * length,
      y: startPoint.y + Math.sin(snappedAngle) * length,
    };
    const snappedEnd = snapToExistingWallEnds(end.x, end.y);
    setPreviewWall({ start: startPoint, end: snappedEnd });

    return true;
  };

  const snapAngleToGrid = (angle) => {
    for (const targetAngle of SNAP_ANGLES) {
      const delta = Math.abs(angle - targetAngle);
      const wrappedDelta = Math.min(delta, Math.abs(2 * Math.PI - delta));
      if (wrappedDelta < SNAP_TOLERANCE) {
        return targetAngle;
      }
    }
    return angle;
  };

  const getWallPlacementPoint = (wall, x, y, elementLength = 40, align = 'center') => {
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const len = Math.hypot(dx, dy);
    const wallVec = { x: dx / len, y: dy / len };
    const toClickVec = { x: x - wall.start.x, y: y - wall.start.y };
    const projectionLength = toClickVec.x * wallVec.x + toClickVec.y * wallVec.y;

    let margin;
    if (align === 'center') {
      margin = elementLength / 2;
    } else if (align === 'start') {
      margin = elementLength;
    } else {
      margin = 0;
    }

    const clampedLength = Math.max(margin, Math.min(len - margin, projectionLength));

    return {
      x: wall.start.x + wallVec.x * clampedLength,
      y: wall.start.y + wallVec.y * clampedLength,
    };
  };

  const findNearestWallOnClick = (x, y, maxDistance = 15) => {
    for (const wall of walls) {
      const d = distanceToLineSegment(wall.start, wall.end, { x, y });
      if (d < maxDistance) return wall;
    }
    return null;
  };

  const distanceToLineSegment = (A, B, P) => {
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(P.x - A.x, P.y - A.y);
    let t = ((P.x - A.x) * dx + (P.y - A.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const proj = { x: A.x + t * dx, y: A.y + t * dy };
    return Math.hypot(P.x - proj.x, P.y - proj.y);
  };

  const snapToExistingWallEnds = (x, y, tolerance = 10) => {
    for (const wall of walls) {
      if (Math.abs(wall.start.x - x) < tolerance && Math.abs(wall.start.y - y) < tolerance) {
        return { x: wall.start.x, y: wall.start.y };
      }
      if (Math.abs(wall.end.x - x) < tolerance && Math.abs(wall.end.y - y) < tolerance) {
        return { x: wall.end.x, y: wall.end.y };
      }
    }
    return { x, y };
  };

  function isMouseLeftOfWall(wall, mouse) {
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;

    const normal = { x: -dy, y: dx };
    const wallToMouse = {
      x: mouse.x - wall.start.x,
      y: mouse.y - wall.start.y,
    };

    const dot = normal.x * wallToMouse.x + normal.y * wallToMouse.y;
    return dot > 0;
  }

  return (
    <>
      {planName && (
        <div className="plan-name-label">
          Plan: {planName}
        </div>
      )}

      <Stage
        ref={stageRef}
        width={windowSize.width}
        height={windowSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        style={{ backgroundColor: '#f5e6d3' }}
      >
        <Layer>
          <Rect x={0} y={0} width={windowSize.width} height={windowSize.height} fill="#f5e6d3" />
          <GridOverlay width={windowSize.width} height={windowSize.height} cellSize={25} />

          {closedAreas.map((polygon, i) => (
            <Line
              key={`area-${polygon.map(pt => [pt.x, pt.y].join('-')).join('-')}`}
              closed
              fill="white"
              opacity={0.7}
              stroke="transparent"
              points={polygon.flatMap(pt => [pt.x, pt.y])}
            />
          ))}

          {closedAreas.map((polygon, i) => {
            const area = calculatePolygonArea(polygon); // px²
            const areaInM2 = (area / 10000).toFixed(2); // ha 100px = 1m, akkor 10000 px² = 1m²
            const center = calculateCentroid(polygon);

            return (
              <Text
                key={`area-label-${polygon.map(pt => [pt.x, pt.y].join('-')).join('-')}`}
                x={center.x}
                y={center.y}
                text={`${areaInM2} m²`}
                fontStyle='bold'
                fontSize={15}
                fill="black"
                offsetX={50}
                offsetY={-10}
              />
            );
          })}

          {walls.map((wall) => {
            return renderWall(
              wall,
              wall.id,
              selectedTool === 'select' &&
                selectedElement?.type === 'wall' &&
                selectedElement.data === wall
                ? 'red'
                : 'grey',
              (e) => {
                if (selectedTool === "select") {
                  e.cancelBubble = true;
                  setSelectedElement({ type: "wall", data: wall });
                  setEditMode(true);
                }
              }
            );
          })}

          {previewWall && (
            <>
              {renderWall(previewWall, 'preview', 'grey')}
              <Circle x={previewWall.end.x} y={previewWall.end.y} radius={5} fill="orange" />
            </>
          )}

          {/* {debugPoints.map((pt, i) => (
            <Circle key={`debug-${i}-${Math.round(pt.x)}-${Math.round(pt.y)}`} x={pt.x} y={pt.y} radius={5} fill="red" />
          ))} */}

          {elements
            .filter(el => el.type === 'door')
            .map((door, i) =>
              renderDoor(
                door,
                i,
                false,
                (e) => {
                  if (selectedTool === 'select') {
                    e.cancelBubble = true;
                    setSelectedElement({ type: 'element', data: door });
                    setEditMode(true);
                  }
                },
                selectedElement?.type === 'element' && selectedElement.data.id === door.id,
                handleElementUpdate
              )
            )}

          {elements
            .filter(el => el.type === 'window')
            .map((win, i) =>
              renderWindow(
                win,
                i,
                false,
                (e) => {
                  if (selectedTool === 'select') {
                    e.cancelBubble = true;
                    setSelectedElement({ type: 'element', data: win });
                    setEditMode(true);
                  }
                },
                selectedElement?.type === 'element' && selectedElement.data.id === win.id,
                handleElementUpdate
              )
            )}

          {sofas.map((sofa, i) =>
            renderSofa(
              sofa,
              i,
              false,
              () => {
                if (selectedTool === 'select') {
                  setSelectedElement({ type: 'object', data: sofa });
                  setEditMode(true);
                }
              },
              selectedElement?.type === 'object' && selectedElement.data.id === sofa.id,
              handleObjectUpdate
            )
          )}

          {beds.map((bed, i) =>
            renderBed(
              bed,
              i,
              false,
              () => {
                if (selectedTool === 'select') {
                  setSelectedElement({ type: 'object', data: bed });
                  setEditMode(true);
                }
              },
              selectedElement?.type === 'object' && selectedElement.data.id === bed.id,
              handleObjectUpdate
            )
          )}

          {grills.map((grill, i) =>
            renderGrill(
              grill,
              i,
              false,
              () => {
                if (selectedTool === 'select') {
                  setSelectedElement({ type: 'object', data: grill });
                  setEditMode(true);
                }
              },
              selectedElement?.type === 'object' && selectedElement.data.id === grill.id,
              handleObjectUpdate
            )
          )}

          {lamps.map((lamp, i) =>
            renderLamp(
              lamp,
              i,
              false,
              () => {
                if (selectedTool === 'select') {
                  setSelectedElement({ type: 'object', data: lamp });
                  setEditMode(true);
                }
              },
              selectedElement?.type === 'object' && selectedElement.data.id === lamp.id,
              handleObjectUpdate
            )
          )}

          {pendingObject && (() => {
            switch (pendingObject.type) {
              case 'sofa': return renderSofa(pendingObject, 'preview', true);
              case 'bed': return renderBed(pendingObject, 'preview', true);
              case 'door': return renderDoor(pendingObject, 'preview', true);
              case 'window': return renderWindow(pendingObject, 'preview', true);
              case 'grill': return renderGrill(pendingObject, 'preview', true);
              case 'lamp': return renderLamp(pendingObject, 'preview', true);
              default: return null;
            }
          })()}
        </Layer>
      </Stage>
    </>
  );
};

export default PlanEditor;
