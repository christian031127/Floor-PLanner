import { React, Fragment } from 'react';
import { Line, Circle } from 'react-konva';

const WALL_THICKNESS = 25;

export function renderWall(wall, key, color = 'gray') {
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) return null;

    const dirX = dx / len;
    const dirY = dy / len;
    const normX = dirY;
    const normY = -dirX;
    const half = WALL_THICKNESS / 2;

    const p1 = { x: wall.start.x + normX * half, y: wall.start.y + normY * half };
    const p2 = { x: wall.end.x + normX * half, y: wall.end.y + normY * half };
    const p3 = { x: wall.end.x - normX * half, y: wall.end.y - normY * half };
    const p4 = { x: wall.start.x - normX * half, y: wall.start.y - normY * half };

    return (
        <Fragment key={`wall-${key}`}>
            <Line
                key={`wall-${key}-line`}
                closed
                points={[p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y]}
                fill={color}
                stroke={color}
                strokeWidth={1}
            />
            {/* <Circle key={`wall-${key}-p1`} x={p1.x} y={p1.y} radius={3} fill="black" />
            <Circle key={`wall-${key}-p2`} x={p2.x} y={p2.y} radius={3} fill="black" />
            <Circle key={`wall-${key}-p3`} x={p3.x} y={p3.y} radius={3} fill="black" />
            <Circle key={`wall-${key}-p4`} x={p4.x} y={p4.y} radius={3} fill="black" /> */}
        </Fragment>
    );
}

export function adjustWallEndpoints(walls) {
    const updated = walls.map(w => ({ ...w }));
    const debug = [];

    for (let i = 0; i < updated.length; i++) {
        for (let j = i + 1; j < updated.length; j++) {
            const a = updated[i];
            const b = updated[j];
            const shared = getSharedPoint(a, b);
            if (shared) {
                const aNorm = getWallNormal(a);
                const bNorm = getWallNormal(b);

                const outerA1 = movePoint(a.start, aNorm, WALL_THICKNESS / 2);
                const outerA2 = movePoint(a.end, aNorm, WALL_THICKNESS / 2);
                const outerB1 = movePoint(b.start, bNorm, WALL_THICKNESS / 2);
                const outerB2 = movePoint(b.end, bNorm, WALL_THICKNESS / 2);

                const outerIntersection = findIntersectionExtended(outerA1, outerA2, outerB1, outerB2);

                const innerA1 = movePoint(a.start, aNorm, -WALL_THICKNESS / 2);
                const innerA2 = movePoint(a.end, aNorm, -WALL_THICKNESS / 2);
                const innerB1 = movePoint(b.start, bNorm, -WALL_THICKNESS / 2);
                const innerB2 = movePoint(b.end, bNorm, -WALL_THICKNESS / 2);

                const innerIntersection = findIntersectionExtended(innerA1, innerA2, innerB1, innerB2);

                if (outerIntersection && innerIntersection) {
                    debug.push(outerIntersection);
                    debug.push(innerIntersection);
                }
            }
        }
    }

    return { adjusted: updated, debug };
}

function movePoint(pt, normal, dist) {
    return {
        x: pt.x + normal.y * dist,
        y: pt.y - normal.x * dist,
    };
}

function getWallNormal(wall) {
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const len = Math.hypot(dx, dy);
    return { x: dy / len, y: -dx / len };
}

function getSharedPoint(a, b) {
    if (pointsEqual(a.start, b.start)) return a.start;
    if (pointsEqual(a.start, b.end)) return a.start;
    if (pointsEqual(a.end, b.start)) return a.end;
    if (pointsEqual(a.end, b.end)) return a.end;
    return null;
}

function pointsEqual(p1, p2, tolerance = 1) {
    return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
}

function findIntersectionExtended(a1, a2, b1, b2) {
    const x1 = a1.x, y1 = a1.y, x2 = a2.x, y2 = a2.y;
    const x3 = b1.x, y3 = b1.y, x4 = b2.x, y4 = b2.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 1e-6) return null;

    const px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
    const py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;
    return { x: px, y: py };
}
