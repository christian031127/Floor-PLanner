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

  const [editMode, setEditMode] = useState(false); // szerkesztési mód
  const [elements, setElements] = useState([...doors, ...windows]);

  const [selectedElement, setSelectedElement] = useState(null); // kiválasztott elem
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedWall, setSelectedWall] = useState(null); // kiválasztott fal
  const [isInteractingWithUI, setIsInteractingWithUI] = useState(false); // UI interakció jelző
  const justSelectedRef = useRef(false);

  const [planName, setPlanName] = useState('');
  const [planId, setPlanId] = useState(null);

  const location = useLocation();
  const loadedPlan = location.state?.planData;

  // Set edit mode based on selected element
  useEffect(() => {
    if (selectedElement) {
      setEditMode(true);
    } else {
      setEditMode(false);
    }
  }, [selectedElement]);

  // Load plan data if available
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
            id: crypto.randomUUID(),
            type: "door",
            wallId: e.wall_id,
            wall,
            position: {
              x: wall.start.x + dx * e.position_x,
              y: wall.start.y + dy * e.position_x
            },
            flip: e.flip,
            length: 50,
            fill: 'sienna'
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
            id: crypto.randomUUID(),
            type: "window",
            wallId: e.wall_id,
            wall,
            position: {
              x: wall.start.x + dx * e.position_x,
              y: wall.start.y + dy * e.position_x
            },
            length: 60,
            fill: 'skyblue'
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

  useEffect(() => {
    setElements([...doors, ...windows]);
  }, [doors, windows]);

  // új fal hozzáadása
  const addWall = (wall) => {
    setWalls([...walls, wall]);
  };

  //--------------------------------------------------------------Wall Property-----------------------------------------------------------------------------------

  // Change wall thickness
  const handleWallThicknessChange = (newThickness) => {
    if (!selectedElement || selectedElement.type !== "wall") return;

    const updatedWalls = walls.map((wall) =>
      wall === selectedElement.data
        ? { ...wall, thickness: newThickness }
        : wall
    );

    const updatedWall = updatedWalls.find(
      (w) => w.start.x === selectedElement.data.start.x &&
        w.start.y === selectedElement.data.start.y &&
        w.end.x === selectedElement.data.end.x &&
        w.end.y === selectedElement.data.end.y
    );

    setWalls(updatedWalls);

    if (updatedWall) {
      setSelectedElement({ type: "wall", data: updatedWall });
    }
  };

  // Delete wall
  const handleWallDelete = () => {
    if (!selectedElement || selectedElement.type !== "wall") return;
    const wallToDelete = selectedElement.data;
    const updatedWalls = walls.filter(wall => wall !== wallToDelete);
    setWalls(updatedWalls);
    setSelectedElement(null);
  };

  //--------------------------------------------------------------Element Property-----------------------------------------------------------------------------------

  // Update element (door/window) position
  const handleElementUpdate = (updatedElement) => {
    if (!selectedElement || selectedElement.type !== "element") return;

    const updatedList = elements.map((el) =>
      el === selectedElement.data ? updatedElement : el
    );
    setElements(updatedList);

    if (updatedElement.type === 'door') {
      setDoors(prev => prev.map(el => el === selectedElement.data ? updatedElement : el));
    } else if (updatedElement.type === 'window') {
      setWindows(prev => prev.map(el => el === selectedElement.data ? updatedElement : el));
    }

    setSelectedElement({ type: "element", data: updatedElement });
  };

  //---------------------------------------------------------------Object Property-----------------------------------------------------------------------------------

  // Update object (bed/sofa/grill/lamp) position or delete it
  const handleObjectUpdate = (updatedObject) => {
    if (!selectedElement || selectedElement.type !== 'object') return;

    const objectId = selectedElement.data.id;
    if (!objectId) return;

    const updateList = (list, setter) => {
      if (updatedObject === null) {
        // törlés
        setter(list.filter(obj => obj.id !== objectId));
      } else {
        setter(list.map(obj => obj.id === objectId ? { ...obj, ...updatedObject } : obj));
      }
    };

    switch (selectedElement.data.type) {
      case 'bed':
        updateList(beds, setBeds);
        break;
      case 'sofa':
        updateList(sofas, setSofas);
        break;
      case 'grill':
        updateList(grills, setGrills);
        break;
      case 'lamp':
        updateList(lamps, setLamps);
        break;
      default:
        return;
    }

    if (updatedObject !== null) {
      const updatedFullObject = { ...selectedElement.data, ...updatedObject };
      setSelectedElement({ type: 'object', data: updatedFullObject });
    } else {
      setSelectedElement(null);
    }
  };


  return (
    <div className="plan-container">

      {/* Left Panel */}
      <ToolPanel

        walls={walls}
        doors={doors}
        windows={windows}

        elements={elements} setElements={setElements}
        selectedElement={selectedElement} setSelectedElement={setSelectedElement}

        sofas={sofas} setSofas={setSofas}
        beds={beds} setBeds={setBeds} 
        grills={grills} setGrills={setGrills}
        lamps={lamps} setLamps={setLamps}
        
        selectedTool={selectedTool} setSelectedTool={setSelectedTool}

        selectedWall={selectedWall}
        setWallThickness={handleWallThicknessChange}
        deleteWall={handleWallDelete}

        exitEditMode={() => setSelectedWall(null)}

        setIsInteractingWithUI={setIsInteractingWithUI}
        justSelectedRef={justSelectedRef}

        /* Update element or object */
        handleElementUpdate={handleElementUpdate}
        handleObjectUpdate={handleObjectUpdate}

        /* Edit Mode */
        editMode={editMode}
        setEditMode={setEditMode}

        /* Plan Name and ID */
        planName={planName} setPlanName={setPlanName}
        planId={planId} setPlanId={setPlanId}
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

      {/* Right Panel */}
      <div className="canvas-container">
        <PlanEditor

          walls={walls} setWalls={setWalls}
          doors={doors} setDoors={setDoors}
          windows={windows} setWindows={setWindows}

          sofas={sofas} setSofas={setSofas}
          beds={beds} setBeds={setBeds}
          grills={grills} setGrills={setGrills}
          lamps={lamps} setLamps={setLamps}

          selectedTool={selectedTool} setSelectedTool={setSelectedTool}

          addWall={addWall}
          selectedWall={selectedWall} setSelectedWall={setSelectedWall}

          isInteractingWithUI={isInteractingWithUI}
          justSelectedRef={justSelectedRef}

          elements={elements} setElements={setElements}
          selectedElement={selectedElement} setSelectedElement={setSelectedElement}

          editMode={editMode} setEditMode={setEditMode}
          handleObjectUpdate={handleObjectUpdate}
          handleElementUpdate={handleElementUpdate}
          handleSelectElement={setSelectedElement}

          planName={planName}
        />
      </div>
    </div>
  );
};

export default PlanPage;
