import React, { useState, useRef, useEffect } from 'react';
import ToolPanel from '../components/draw/ToolPanel';
import PlanEditor from '../components/draw/PlanEditor';
import '../styles/Plan.css';
import { useLocation } from 'react-router-dom';

const PlanPage = () => {
  const [walls, setWalls] = useState([]);
  const [doors, setDoors] = useState([]);
  const [windows, setWindows] = useState([]);
  const [sofas, setSofas] = useState([]);
  const [beds, setBeds] = useState([]);
  const [grills, setGrills] = useState([]);
  const [lamps, setLamps] = useState([]);

  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedWall, setSelectedWall] = useState(null); // kiválasztott fal
  const [isInteractingWithUI, setIsInteractingWithUI] = useState(false); // UI interakció jelző
  const justSelectedRef = useRef(false);

  const [planName, setPlanName] = useState('');
  const [planId, setPlanId] = useState(null);

  const location = useLocation();
  const loadedPlan = location.state?.planData;

  useEffect(() => {
    if (loadedPlan) {

      setPlanName(loadedPlan.name);
      setPlanId(loadedPlan.id);

      const convertedWalls = loadedPlan.walls?.map(w => ({
        start: { x: w.start_x, y: w.start_y },
        end: { x: w.end_x, y: w.end_y },
        thickness: w.thickness || 25,
        id: w.id,
      })) || [];

      setWalls(convertedWalls);

      setDoors(
        loadedPlan.elements?.filter(e => e.type === 'door').map(e => {
          const wall = convertedWalls.find(w => w.id === e.wall_id);
          if (!wall) return null;

          const dx = wall.end.x - wall.start.x;
          const dy = wall.end.y - wall.start.y;

          return {
            wallId: e.wall_id,
            wall, // teljes falra szükség van a transformhoz
            position: {
              x: wall.start.x + dx * e.position_x,
              y: wall.start.y + dy * e.position_x
            },
            flip: e.flip
          };
        }).filter(Boolean) || []
      );


      setWindows(
        loadedPlan.elements?.filter(e => e.type === 'window').map(e => {
          const wall = convertedWalls.find(w => w.id === e.wall_id);
          if (!wall) return null;

          const dx = wall.end.x - wall.start.x;
          const dy = wall.end.y - wall.start.y;

          return {
            wallId: e.wall_id,
            wall,
            position: {
              x: wall.start.x + dx * e.position_x,
              y: wall.start.y + dy * e.position_x
            }
          };
        }).filter(Boolean) || []
      );


      setBeds(
        loadedPlan.objects?.filter(o => o.type === 'bed').map(o => ({
          position: { x: o.position_x, y: o.position_y },
          angle: o.angle
        })) || []
      );

      setSofas(
        loadedPlan.objects?.filter(o => o.type === 'sofa').map(o => ({
          position: { x: o.position_x, y: o.position_y },
          angle: o.angle
        })) || []
      );

      setGrills(
        loadedPlan.objects?.filter(o => o.type === 'grill').map(o => ({
          position: { x: o.position_x, y: o.position_y },
          angle: o.angle
        })) || []
      );

      setLamps(
        loadedPlan.objects?.filter(o => o.type === 'lamp').map(o => ({
          position: { x: o.position_x, y: o.position_y },
          angle: o.angle
        })) || []
      );
    }
  }, [loadedPlan]);

  // új fal hozzáadása
  const addWall = (wall) => {
    setWalls([...walls, wall]);
  };

  // fal vastagságának módosítása
  const handleThicknessChange = (newThickness) => {
    if (!selectedWall) return;
    const updatedWalls = walls.map(wall =>
      wall === selectedWall ? { ...wall, thickness: newThickness } : wall
    );
    setWalls(updatedWalls);
    setSelectedWall({ ...selectedWall, thickness: newThickness });
  };

  // fal törlése
  const handleWallDelete = () => {
    if (!selectedWall) return;
    const updatedWalls = walls.filter(wall => wall !== selectedWall);
    setWalls(updatedWalls);
    setSelectedWall(null);
  };

  return (
    <div className="plan-container">
      {/* Bal oldali vezérlőpanel */}
      <ToolPanel
        walls={walls}
        doors={doors}
        windows={windows}
        sofas={sofas}
        beds={beds}
        grills={grills}
        lamps={lamps}

        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        editMode={!!selectedWall}
        selectedWall={selectedWall}
        setWallThickness={handleThicknessChange}
        deleteWall={handleWallDelete}
        exitEditMode={() => setSelectedWall(null)}
        setIsInteractingWithUI={setIsInteractingWithUI}
        justSelectedRef={justSelectedRef}

        planName={planName}
        setPlanName={setPlanName}
        planId={planId}
        setPlanId={setPlanId}
        resetPlan={() => {
          setWalls([]);
          setDoors([]);
          setWindows([]);
          setBeds([]);
          setSofas([]);
          setGrills([]);
          setLamps([]);
          setPlanName('');
          setPlanId(null);
        }}
      />

      {/* Alaprajz szerkesztő */}
      <div className="canvas-container">
        <PlanEditor
          walls={walls}
          setWalls={setWalls}
          doors={doors}
          setDoors={setDoors}
          windows={windows}
          setWindows={setWindows}
          sofas={sofas}
          setSofas={setSofas}
          beds={beds}
          setBeds={setBeds}
          grills={grills}
          setGrills={setGrills}
          lamps={lamps}
          setLamps={setLamps}

          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
          addWall={addWall}
          selectedWall={selectedWall}
          setSelectedWall={setSelectedWall}
          isInteractingWithUI={isInteractingWithUI}
          justSelectedRef={justSelectedRef}

          planName={planName}
        />
      </div>
    </div>
  );
};

export default PlanPage;
