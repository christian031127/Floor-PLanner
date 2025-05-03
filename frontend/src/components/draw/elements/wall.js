import { React, Fragment } from 'react';
import { Line, Text } from 'react-konva';

const WALL_THICKNESS = 25;
const PIXEL_TO_CM = 1;

// Wall rendering function
export function renderWall(wall, key, color = 'gray', onClick = null) {
  const computedCorners = computeWallCorners(wall);
  const corners = [
    wall.outerStart ?? computedCorners[0],
    wall.outerEnd ?? computedCorners[1],
    wall.innerEnd ?? computedCorners[2],
    wall.innerStart ?? computedCorners[3],
  ];

  if (corners.some(pt => !pt || isNaN(pt.x) || isNaN(pt.y))) return null;

  const outerMid = midpoint(corners[0], corners[1]);
  const innerMid = midpoint(corners[3], corners[2]);

  const outerVec = { x: corners[1].x - corners[0].x, y: corners[1].y - corners[0].y };
  const innerVec = { x: corners[2].x - corners[3].x, y: corners[2].y - corners[3].y };

  const outerLen = Math.hypot(outerVec.x, outerVec.y);
  const innerLen = Math.hypot(innerVec.x, innerVec.y);

  const outerAngle = getAngleDeg(outerVec);
  const innerAngle = getAngleDeg(innerVec);

  return (
    <Fragment key={`wall-${key}`}>
      <Line
        closed
        points={corners.flatMap(pt => [pt.x, pt.y])}
        fill={color}
        //stroke="black"
        //strokeWidth={0.5}
        onClick={onClick || undefined}
      />

      <Text
        x={outerMid.x}
        y={outerMid.y + 3}
        text={`${Math.round(outerLen * PIXEL_TO_CM) / 100} m`}
        rotation={outerAngle}
        fontSize={12}
        fill="black"
        offsetX={20}
      />

      <Text
        x={innerMid.x}
        y={innerMid.y + 3}
        text={`${Math.round(innerLen * PIXEL_TO_CM) / 100} m`}
        rotation={innerAngle}
        fontSize={12}
        fill="black"
        offsetX={20}
      />
    </Fragment>
  );
}

// Helper functions

// Helper function to calculate the midpoint between two points
function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

// Helper function to calculate angle in degrees
function getAngleDeg(vec) {
  const angle = Math.atan2(vec.y, vec.x) * 180 / Math.PI;
  return angle > 90 || angle < -90 ? angle + 180 : angle;
}

// Calculating wall corners
function computeWallCorners(wall) {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const len = Math.hypot(dx, dy);
  const norm = { x: dy / len, y: -dx / len };
  const half = (wall.thickness || WALL_THICKNESS) / 2;

  return [
    { x: wall.start.x + norm.x * half, y: wall.start.y + norm.y * half },
    { x: wall.end.x + norm.x * half, y: wall.end.y + norm.y * half },
    { x: wall.end.x - norm.x * half, y: wall.end.y - norm.y * half },
    { x: wall.start.x - norm.x * half, y: wall.start.y - norm.y * half },
  ];
}

// Wall endpoint adjustment
export function adjustWallEndpoints(walls) {
  const updated = walls.map(w => ({
    ...w,
    outerStart: w.outerStart ?? undefined,
    outerEnd: w.outerEnd ?? undefined,
    innerStart: w.innerStart ?? undefined,
    innerEnd: w.innerEnd ?? undefined,
  }));

  const junctions = [];

  // Connected points map
  const pointConnections = new Map();
  for (const wall of updated) {
    const keys = [
      { key: 'start', point: wall.start },
      { key: 'end', point: wall.end }
    ];

    for (const { key, point } of keys) {
      const mapKey = `${point.x.toFixed(6)},${point.y.toFixed(6)}`;
      if (!pointConnections.has(mapKey)) pointConnections.set(mapKey, []);
      pointConnections.get(mapKey).push({ wall, key });
    }
  }

  for (let i = 0; i < updated.length; i++) {
    for (let j = 0; j < updated.length; j++) {
      if (i === j) continue;
      const a = updated[i];
      const b = updated[j];
      const sharedInfo = getSharedPoint(a, b);
      if (!sharedInfo) continue;

      // Check if the point is shared by two walls
      const mapKey = `${sharedInfo.point.x.toFixed(6)},${sharedInfo.point.y.toFixed(6)}`;
      const conns = pointConnections.get(mapKey);
      if (!conns || conns.length !== 2) continue;

      const { aKey: originalAKey, bKey: originalBKey } = sharedInfo;
      let aKey = originalAKey;
      let bKey = originalBKey;

      const aStart = a.start;
      const aEnd = a.end;
      let bStart = b.start;
      let bEnd = b.end;

      let aNorm = getWallNormal({ start: aStart, end: aEnd });
      let bNorm = getWallNormal({ start: bStart, end: bEnd });

      let flipped = false;

      if ((aKey === 'start' && bKey === 'start') || (aKey === 'end' && bKey === 'end')) {
        bNorm = { x: -bNorm.x, y: -bNorm.y };
        [b.start, b.end] = [b.end, b.start];
        bStart = b.start;
        bEnd = b.end;
        bKey = bKey === 'start' ? 'end' : 'start';
        flipped = true;
      }

      const thicknessA = a.thickness || WALL_THICKNESS;
      const thicknessB = b.thickness || WALL_THICKNESS;

      const outerA1 = movePoint(aStart, aNorm, thicknessA / 2);
      const outerA2 = movePoint(aEnd, aNorm, thicknessA / 2);
      const outerB1 = movePoint(bStart, bNorm, thicknessB / 2);
      const outerB2 = movePoint(bEnd, bNorm, thicknessB / 2);
      const outerIntersection = findIntersectionExtended(outerA1, outerA2, outerB1, outerB2);

      const innerA1 = movePoint(aStart, aNorm, -thicknessA / 2);
      const innerA2 = movePoint(aEnd, aNorm, -thicknessA / 2);
      const innerB1 = movePoint(bStart, bNorm, -thicknessB / 2);
      const innerB2 = movePoint(bEnd, bNorm, -thicknessB / 2);
      const innerIntersection = findIntersectionExtended(innerA1, innerA2, innerB1, innerB2);

      if (outerIntersection && innerIntersection) {
        if (flipped) {
          b.outerStart = undefined;
          b.outerEnd = undefined;
          b.innerStart = undefined;
          b.innerEnd = undefined;
        }

        junctions.push({
          wallA: a,
          wallB: b,
          aKey,
          bKey,
          outer: outerIntersection,
          inner: innerIntersection,
        });
      }
    }
  }

  for (const j of junctions) {
    if (j.aKey === 'start') {
      j.wallA.outerStart = j.outer;
      j.wallA.innerStart = j.inner;
    } else {
      j.wallA.outerEnd = j.outer;
      j.wallA.innerEnd = j.inner;
    }

    if (j.bKey === 'start') {
      j.wallB.outerStart = j.outer;
      j.wallB.innerStart = j.inner;
    } else {
      j.wallB.outerEnd = j.outer;
      j.wallB.innerEnd = j.inner;
    }
  }

  return { adjusted: updated };
}

// Helper function to move a point along a normal vector
function movePoint(pt, normal, dist) {
  return {
    x: pt.x + normal.x * dist,
    y: pt.y + normal.y * dist,
  };
}

// Helper function to calculate the normal vector of a wall
function getWallNormal(wall) {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const len = Math.hypot(dx, dy);
  return { x: dy / len, y: -dx / len };
}

// Helper function to get the shared point between two walls
function getSharedPoint(a, b) {
  if (pointsEqual(a.start, b.start)) return { point: a.start, aKey: 'start', bKey: 'start' };
  if (pointsEqual(a.start, b.end)) return { point: a.start, aKey: 'start', bKey: 'end' };
  if (pointsEqual(a.end, b.start)) return { point: a.end, aKey: 'end', bKey: 'start' };
  if (pointsEqual(a.end, b.end)) return { point: a.end, aKey: 'end', bKey: 'end' };
  return null;
}

// Helper function to check if two points are equal within a tolerance
function pointsEqual(p1, p2, tolerance = 1e-6) {
  return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
}

// Helper function to find the intersection of two line segments
function findIntersectionExtended(a1, a2, b1, b2) {
  const x1 = a1.x, y1 = a1.y, x2 = a2.x, y2 = a2.y;
  const x3 = b1.x, y3 = b1.y, x4 = b2.x, y4 = b2.y;
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-6) return null;

  const px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
  const py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;
  return { x: px, y: py };
}

// Helper function to detect closed areas in walls
export function detectClosedAreas(walls) {
  const graph = new Map();
  const edges = [];

  for (const wall of walls) {
    const a = quantizePoint(wall.start);
    const b = quantizePoint(wall.end);
    const aKey = pointKey(a);
    const bKey = pointKey(b);

    if (!graph.has(aKey)) graph.set(aKey, []);
    if (!graph.has(bKey)) graph.set(bKey, []);

    graph.get(aKey).push({ from: a, to: b });
    graph.get(bKey).push({ from: b, to: a });

    edges.push({ from: a, to: b });
    edges.push({ from: b, to: a });
  }

  const visited = new Set();
  const faces = [];

  for (const edge of edges) {
    const edgeKey = `${pointKey(edge.from)}->${pointKey(edge.to)}`;
    if (visited.has(edgeKey)) continue;

    const face = walkFace(graph, edge.from, edge.to, visited);
    if (face && face.length >= 3 && !isDuplicatePolygon(faces, face)) {
      faces.push(face);
    }
  }

  const sorted = faces.slice().sort((a, b) => calculatePolygonArea(b) - calculatePolygonArea(a));
  if (sorted.length > 1) sorted.shift(); 

  return sorted;
}

// Helper function to walk around a face in the graph
// Graph traversal to find the face
function walkFace(graph, start, next, visited) {
  const face = [start];
  const startKey = pointKey(start);
  let current = next;
  let previous = start;

  while (true) {
    face.push(current);
    const currentKey = pointKey(current);
    const prevAngle = Math.atan2(previous.y - current.y, previous.x - current.x);

    const previousCopy = previous;
    const neighbors = (graph.get(currentKey) || []).filter(e => {
      return pointKey(e.to) !== pointKey(previousCopy);
    });

    if (neighbors.length === 0) return null;

    neighbors.sort(((currentCopy) => (a, b) => {
      const angleA = normalizeAngle(Math.atan2(a.to.y - currentCopy.y, a.to.x - currentCopy.x) - prevAngle);
      const angleB = normalizeAngle(Math.atan2(b.to.y - currentCopy.y, b.to.x - currentCopy.x) - prevAngle);
      return angleA - angleB;
    })(current));

    const nextEdge = neighbors[0];
    const edgeKey = `${pointKey(current)}->${pointKey(nextEdge.to)}`;
    if (visited.has(edgeKey)) return null;
    visited.add(edgeKey);

    previous = current;
    current = nextEdge.to;

    if (pointKey(current) === startKey) break;
    if (face.length > 100) return null;
  }

  return face;
}

// Helper function to quantize a point to a grid
function quantizePoint(p, precision = 1) {
  return {
    x: Math.round(p.x / precision) * precision,
    y: Math.round(p.y / precision) * precision,
  };
}

// Helper function to normalize an angle to the range [0, 2π)
function normalizeAngle(a) {
  return (a + 2 * Math.PI) % (2 * Math.PI);
}

// Point and polygon key functions
function pointKey(p) {
  return `${Math.round(p.x)},${Math.round(p.y)}`;
}

function polygonKey(polygon) {
  const rounded = polygon.map(p => `${Math.round(p.x)},${Math.round(p.y)}`);
  const rotations = [];
  for (let i = 0; i < rounded.length; i++) {
    const rotated = [...rounded.slice(i), ...rounded.slice(0, i)];
    rotations.push(rotated.join('|'));
    rotations.push([...rotated].reverse().join('|'));
  }
  return rotations.sort()[0];
}

// Helper function to check if a polygon is a duplicate of another
function isDuplicatePolygon(polygons, candidate) {
  const key = polygonKey(candidate);
  return polygons.some(poly => polygonKey(poly) === key);
}

// Helper function to calculate the area of a polygon
export function calculatePolygonArea(polygon) {
  let area = 0;
  const n = polygon.length;
  for (let i = 0; i < n; i++) {
    const { x: x1, y: y1 } = polygon[i];
    const { x: x2, y: y2 } = polygon[(i + 1) % n];
    area += (x1 * y2 - x2 * y1);
  }
  return Math.abs(area) / 2;
}

// Helper function to calculate the centroid of a polygon
export function calculateCentroid(polygon) {
  let x = 0, y = 0;
  const n = polygon.length;
  for (const pt of polygon) {
    x += pt.x;
    y += pt.y;
  }
  return { x: x / n, y: y / n };
}

// Wall intersection
// Segédfüggvények
/**
 * Egy fal start vagy end pontját hozzáigazítja egy másik fal testének vonalához, ha közel van.
 */
// export function snapWallEndpointsToOtherWalls(walls) {
//   console.log('[snapWallEndpointsToOtherWalls] running on', walls.length, 'walls');

//   const TOLERANCE = 10; // pixel
//   const updated = walls.map(w => ({ ...w }));

//   for (const wall of updated) {
//     for (const other of updated) {
//       if (wall === other) continue;

//       const pointsToCheck = ['start', 'end'];

//       for (const key of pointsToCheck) {
//         const point = wall[key];
//         const projected = projectPointNearSegment(other.start, other.end, point);

//         if (!projected) continue;

//         const dist = Math.hypot(point.x - projected.x, point.y - projected.y);

//         console.log(`[DEBUG] Wall ${wall.id} ${key} -> projected on wall ${other.id}`, {
//           original: point,
//           projected,
//           distance: dist
//         });
//         if (dist <= TOLERANCE) {
//           console.log(`[Illesztés] A fal (${wall.id}) ${key} pontja illeszkedik a fal (${other.id}) oldalához`);
//           wall[key] = { ...projected };
        
//           // Újra kell számolni a normált, miután a pontot átállítottuk!
//           const updatedStart = wall.start;
//           const updatedEnd = wall.end;
//           const dx = updatedEnd.x - updatedStart.x;
//           const dy = updatedEnd.y - updatedStart.y;
//           const len = Math.hypot(dx, dy);
//           const normal = { x: dy / len, y: -dx / len };
//           const half = (wall.thickness || WALL_THICKNESS) / 2;
        
//           if (key === 'start') {
//             wall.outerStart = movePoint(wall.start, normal, half);
//             wall.innerStart = movePoint(wall.start, normal, -half);
//           } else {
//             wall.outerEnd = movePoint(wall.end, normal, half);
//             wall.innerEnd = movePoint(wall.end, normal, -half);
//           }

//           console.log("[ILLASZTOTT FAL]", wall.id, wall);
//         }
               
//       }
//     }
//   }
//   return updated;
// }

// function projectPointNearSegment(point, segStart, segEnd) {
//   const segVec = { x: segEnd.x - segStart.x, y: segEnd.y - segStart.y };
//   const len = Math.hypot(segVec.x, segVec.y);
//   const unit = { x: segVec.x / len, y: segVec.y / len };

//   const projLength = (point.x - segStart.x) * unit.x + (point.y - segStart.y) * unit.y;

//   if (projLength < 0) return segStart;
//   if (projLength > len) return segEnd;

//   return {
//     x: segStart.x + unit.x * projLength,
//     y: segStart.y + unit.y * projLength,
//   };
// }

// function projectPointOnLineSegment(point, segStart, segEnd) {
//   const segVec = { x: segEnd.x - segStart.x, y: segEnd.y - segStart.y };
//   const len = Math.hypot(segVec.x, segVec.y);
//   const unit = { x: segVec.x / len, y: segVec.y / len };

//   const projLength = (point.x - segStart.x) * unit.x + (point.y - segStart.y) * unit.y;
//   if (projLength < 0 || projLength > len) return null; // kívül esik

//   return {
//     x: segStart.x + unit.x * projLength,
//     y: segStart.y + unit.y * projLength,
//   };
// }