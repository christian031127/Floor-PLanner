// Import necessary libraries and components
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ToolPanel from '../components/draw/ToolPanel';
import PlanEditor from '../components/draw/PlanEditor';
// Import styles
import '../styles/Plan.css';

const PlanPage = () => {
  const [walls, setWalls] = useState([]);
  const [doors, setDoors] = useState([]);
  const [windows, setWindows] = useState([]);
  const [sofas, setSofas] = useState([]);
  const [beds, setBeds] = useState([]);
  const [grills, setGrills] = useState([]);
  const [lamps, setLamps] = useState([]);

  const [editMode, setEditMode] = useState(false);
  const [elements, setElements] = useState([...doors, ...windows]);

  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedWall, setSelectedWall] = useState(null);
  const [isInteractingWithUI, setIsInteractingWithUI] = useState(false);
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
            length: e.length || 50,
            fill: e.fill || '#F5F5F5'
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
            length: e.length || 60,
            fill: e.fill || '#F5F5F5'
          };
        }).filter(Boolean) || []
      );

      setBeds(
        loadedPlan.objects?.filter(o => o.type === 'bed').map(o => ({
          id: o.id || crypto.randomUUID(),
          type: 'bed',
          position: { x: o.position_x, y: o.position_y },
          angle: o.angle,
          size: o.size || 1.4,
          fill: o.fill || '#888'
        })) || []
      );

      setSofas(
        loadedPlan.objects?.filter(o => o.type === 'sofa').map(o => ({
          id: o.id || crypto.randomUUID(),
          type: 'sofa',
          position: { x: o.position_x, y: o.position_y },
          angle: o.angle,
          size: o.size || 1.7,
          fill: o.fill || '#888'
        })) || []
      );

      setGrills(
        loadedPlan.objects?.filter(o => o.type === 'grill').map(o => ({
          id: o.id || crypto.randomUUID(),
          type: 'grill',
          position: { x: o.position_x, y: o.position_y },
          angle: o.angle,
          size: o.size || 1.5,
          fill: o.fill || '#888'
        })) || []
      );

      setLamps(
        loadedPlan.objects?.filter(o => o.type === 'lamp').map(o => ({
          id: o.id || crypto.randomUUID(),
          type: 'lamp',
          position: { x: o.position_x, y: o.position_y },
          angle: o.angle,
          size: o.size || 1.2,
          fill: o.fill || '#888'
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

      setElements(prevElements =>
        prevElements.map(el => {
          if (el.wall?.id === updatedWall.id) {
            return {
              ...el,
              wall: {
                ...el.wall,
                thickness: newThickness
              }
            };
          }
          return el;
        })
      );
    }

    //console.log(`Wall ${selectedElement.data.id} thickness updated to ${newThickness}, and linked elements updated.`);
  };


  // Delete wall
  const handleWallDelete = () => {
    if (!selectedElement || selectedElement.type !== "wall") return;

    const wallToDelete = selectedElement.data;

    const updatedWalls = walls.filter(wall => wall !== wallToDelete);
    setWalls(updatedWalls);

    // Delete associated doors and windows
    const remainingDoors = doors.filter(door => door.wall !== wallToDelete);
    const remainingWindows = windows.filter(window => window.wall !== wallToDelete);
    setDoors(remainingDoors);
    setWindows(remainingWindows);

    // Delete associated elements
    setElements(prev =>
      prev.filter(el => el.wall !== wallToDelete)
    );

    setSelectedElement(null);
  };

  //--------------------------------------------------------------Element Property-----------------------------------------------------------------------------------

  const handleElementUpdate = (updatedElement) => {
    if (!selectedElement || selectedElement.type !== "element") return;

    const wall = updatedElement.wall;
    if (wall && updatedElement.position) {
      const wallVec = {
        x: wall.end.x - wall.start.x,
        y: wall.end.y - wall.start.y,
      };
      const wallLength = Math.hypot(wallVec.x, wallVec.y);

      const posVec = {
        x: updatedElement.position.x - wall.start.x,
        y: updatedElement.position.y - wall.start.y,
      };

      const dot = (posVec.x * wallVec.x + posVec.y * wallVec.y) / wallLength;
      updatedElement.position_x = dot / wallLength;
    }

    const updatedList = elements.map((el) =>
      el.id === selectedElement.data.id ? updatedElement : el
    );
    setElements(updatedList);

    if (updatedElement.type === 'door') {
      setDoors(prev => prev.map(el =>
        el.id === updatedElement.id ? updatedElement : el
      ));
    } else if (updatedElement.type === 'window') {
      setWindows(prev => prev.map(el =>
        el.id === updatedElement.id ? updatedElement : el
      ));
    }

    setSelectedElement({ type: "element", data: updatedElement });
  };

  //---------------------------------------------------------------Object Property-----------------------------------------------------------------------------------

  // Update object (bed/sofa/grill/lamp) position or delete it
  // const handleObjectUpdate = (updatedObject) => {
  //   if (!selectedElement || selectedElement.type !== 'object') return;

  //   const objectId = selectedElement.data.id;
  //   if (!objectId) return;

  //   const updateList = (list, setter) => {
  //     if (updatedObject === null) {
  //       // törlés
  //       setter(list.filter(obj => obj.id !== objectId));
  //     } else {
  //       setter(list.map(obj => obj.id === objectId ? { ...obj, ...updatedObject } : obj));
  //     }
  //   };

  //   switch (selectedElement.data.type) {
  //     case 'bed':
  //       updateList(beds, setBeds);
  //       break;
  //     case 'sofa':
  //       updateList(sofas, setSofas);
  //       break;
  //     case 'grill':
  //       updateList(grills, setGrills);
  //       break;
  //     case 'lamp':
  //       updateList(lamps, setLamps);
  //       break;
  //     default:
  //       return;
  //   }

  //   if (updatedObject !== null) {
  //     const updatedFullObject = { ...selectedElement.data, ...updatedObject };
  //     setSelectedElement({ type: 'object', data: updatedFullObject });
  //   } else {
  //     setSelectedElement(null);
  //   }
  // };

  const handleObjectUpdate = (updatedObject) => {
    if (!updatedObject?.type) {
      console.warn("Unknown object type:", updatedObject?.type);
      return;
    }

    const updateList = (list, setList) => {
      setList(list.map((obj) => (obj.id === updatedObject.id ? updatedObject : obj)));
    };

    switch (updatedObject.type) {
      case "sofa":
        updateList(sofas, setSofas);
        break;
      case "bed":
        updateList(beds, setBeds);
        break;
      case "grill":
        updateList(grills, setGrills);
        break;
      case "lamp":
        updateList(lamps, setLamps);
        break;
      default:
        console.warn("Unknown object type:", updatedObject.type);
        break;
    }

    setSelectedElement({ type: "object", data: updatedObject });
  };

  //---------------------------------------------------------------Render-----------------------------------------------------------------------------------

  return (
    <div className="plan-container">

      {/* Left Panel */}
      <ToolPanel

        walls={walls}
        doors={doors} setDoors={setDoors}
        windows={windows} setWindows={setWindows}

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
