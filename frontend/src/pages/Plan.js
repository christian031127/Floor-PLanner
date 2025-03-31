import React, { useState } from 'react';
import ToolPanel from '../components/draw/ToolPanel';
import PlanEditor from '../components/draw/PlanEditor';
import '../styles/Plan.css';

const PlanPage = () => {
  const [selectedTool, setSelectedTool] = useState('select');
  const [walls, setWalls] = useState([]); // falak listája
  const [selectedWall, setSelectedWall] = useState(null); // kiválasztott fal
  const [isInteractingWithUI, setIsInteractingWithUI] = useState(false); // UI interakció jelző

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
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        editMode={!!selectedWall}
        selectedWall={selectedWall}
        setWallThickness={handleThicknessChange}
        deleteWall={handleWallDelete}
        exitEditMode={() => setSelectedWall(null)}
        setIsInteractingWithUI={setIsInteractingWithUI}
      />

      {/* Alaprajz szerkesztő */}
      <div className="canvas-container">
        <PlanEditor
          selectedTool={selectedTool}
          addWall={addWall}
          walls={walls}
          setWalls={setWalls}
          selectedWall={selectedWall}
          setSelectedWall={setSelectedWall}
          isInteractingWithUI={isInteractingWithUI}
        />
      </div>
    </div>
  );
};

export default PlanPage;
