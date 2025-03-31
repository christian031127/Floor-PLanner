import React, { useState } from 'react';
import { FaUndo, FaRedo, FaMousePointer, FaDrawPolygon, FaTrash, FaArrowLeft, FaSave } from 'react-icons/fa';
import '../../styles/ToolPanel.css';
import { createPlan } from '../../api/api';

const ToolPanel = ({
  selectedTool,
  setSelectedTool,
  editMode,
  selectedWall,
  setWallThickness,
  deleteWall,
  exitEditMode,
  setIsInteractingWithUI,
  walls
}) => {
  const [planName, setPlanName] = useState('');

  const handleSavePlan = async () => {
    if (!planName.trim()) {
      alert("Please enter a plan name!");
      return;
    }
    try {
      console.log("Saving plan:", planName); // debug
      const result = await createPlan(planName);
      console.log("Save result:", result);   // debug
      alert("Plan saved successfully!");
      setPlanName('');
    } catch (error) {
      console.error("Error saving plan:", error);
    }
  };
  

  return (
    <div
      className="toolbar"
      onMouseEnter={() => setIsInteractingWithUI(true)}
      onMouseLeave={() => setIsInteractingWithUI(false)}
    >
      <h3>Plan editor</h3>

      {!editMode ? (
        <>
          <div className="toolbar-actions">
            <button className="icon-button"><FaUndo /></button>
            <button className="icon-button"><FaRedo /></button>
          </div>

          <button
            className={`toolbar-button ${selectedTool === 'select' ? 'active' : ''}`}
            onClick={() => setSelectedTool('select')}
          >
            <FaMousePointer />
          </button>

          <button
            className={`toolbar-button ${selectedTool === 'wall' ? 'active' : ''}`}
            onClick={() => setSelectedTool('wall')}
          >
            <FaDrawPolygon /> Wall
          </button>

          <div className="save-plan-section">
            <input
              type="text"
              placeholder="Plan name"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
            <button className="toolbar-button save" onClick={handleSavePlan}>
              <FaSave /> Save Plan
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="wall-editor">
            <label>Thickness: {selectedWall?.thickness || 10}</label>
            <input
              type="range"
              min="5"
              max="30"
              value={selectedWall?.thickness || 10}
              onChange={(e) => setWallThickness(parseInt(e.target.value))}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />

            <button className="toolbar-button delete" onClick={deleteWall}>
              <FaTrash /> Delete
            </button>
            <button className="toolbar-button" onClick={exitEditMode}>
              <FaArrowLeft /> Back
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ToolPanel;
