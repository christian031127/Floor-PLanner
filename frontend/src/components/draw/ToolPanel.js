import React, { useState } from 'react';
import { FaMousePointer, FaDrawPolygon, FaTrash, FaArrowLeft, FaSave, FaDoorOpen, FaBed, FaCouch, FaLightbulb, FaFire, FaThLarge, FaFileExport } from 'react-icons/fa';

import '../../styles/ToolPanel.css';
import { createPlan, updatePlan } from '../../api/api';

const ToolPanel = ({
  selectedTool,
  setSelectedTool,
  editMode,
  selectedWall,
  setWallThickness,
  deleteWall,
  exitEditMode,
  setIsInteractingWithUI,
  justSelectedRef,
  walls,
  doors,
  windows,
  beds,
  sofas,
  grills,
  lamps,

  planName,
  setPlanName,
  resetPlan,
  planId,
  setPlanId,

}) => {

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSavePlan = async () => {
    if (!planName.trim()) {
      alert("Please enter a plan name!");
      return;
    }

    console.log("Saving plan with:");
    console.log("walls:", walls);
    console.log("doors:", doors);
    console.log("windows:", windows);
    console.log("objects:", [...beds, ...sofas, ...grills, ...lamps]);

    try {
      // Walls
      const wallsToSave = walls.map(wall => ({
        id: wall.id,
        start_x: wall.start.x,
        start_y: wall.start.y,
        end_x: wall.end.x,
        end_y: wall.end.y,
        thickness: wall.thickness
      }));

      // Doors and windows
      const doorElements = doors.map(door => {
        const wall = walls.find(w => w.id === door.wallId);
        if (!wall) return null;

        const wallVec = {
          x: wall.end.x - wall.start.x,
          y: wall.end.y - wall.start.y
        };
        const wallLength = Math.hypot(wallVec.x, wallVec.y);

        const doorVec = {
          x: door.position.x - wall.start.x,
          y: door.position.y - wall.start.y
        };

        const dot = (doorVec.x * wallVec.x + doorVec.y * wallVec.y) / wallLength;
        const position_x = dot / wallLength;

        return {
          type: "door",
          wall_id: door.wallId,
          position_x,
          flip: door.flip || false
        };
      }).filter(Boolean);

      const windowElements = windows.map(window => {
        const wall = walls.find(w => w.id === window.wallId);
        if (!wall) return null;

        const wallVec = {
          x: wall.end.x - wall.start.x,
          y: wall.end.y - wall.start.y
        };
        const wallLength = Math.hypot(wallVec.x, wallVec.y);

        const windowVec = {
          x: window.position.x - wall.start.x,
          y: window.position.y - wall.start.y
        };

        const dot = (windowVec.x * wallVec.x + windowVec.y * wallVec.y) / wallLength;
        const position_x = dot / wallLength;

        return {
          type: "window",
          wall_id: window.wallId,
          position_x
        };
      }).filter(Boolean);

      const elements = [...doorElements, ...windowElements];

      // Objects
      const objects = [
        ...beds.map(o => ({
          type: "bed",
          position_x: o.position.x,
          position_y: o.position.y,
          angle: o.angle
        })),
        ...sofas.map(o => ({
          type: "sofa",
          position_x: o.position.x,
          position_y: o.position.y,
          angle: o.angle
        })),
        ...grills.map(o => ({
          type: "grill",
          position_x: o.position.x,
          position_y: o.position.y,
          angle: o.angle
        })),
        ...lamps.map(o => ({
          type: "lamp",
          position_x: o.position.x,
          position_y: o.position.y,
          angle: o.angle
        }))
      ];


      if (planId) {
        await updatePlan(planId, {
          name: planName.trim(),
          walls: wallsToSave,
          elements,
          objects
        });
        alert("Plan updated!");
      } else {
        const result = await createPlan({
          name: planName.trim(),
          walls: wallsToSave,
          elements,
          objects
        });
        setPlanId(result.id);
        alert("Plan saved!");
      }

      setShowSaveModal(false);
    } catch (error) {
      console.error("Error saving plan:", error);
      alert("Error saving plan!");
    }
  };


  return (
    <div
      className="toolbar"
      onMouseEnter={() => setIsInteractingWithUI(true)}
      onMouseLeave={() => setIsInteractingWithUI(false)}
    >
      <h2>Planner</h2>

      {!editMode ? (
        <>
          <button
            className={`toolbar-button ${selectedTool === 'select' ? 'active' : ''}`}
            style={{ justifyContent: 'center' }}
            onClick={() => setSelectedTool('select')}
          >
            <FaMousePointer />
          </button>

          <hr />
          <strong>Base elements</strong>

          <button
            className={`toolbar-button ${selectedTool === 'wall' ? 'active' : ''}`}
            onClick={() => setSelectedTool('wall')}
          >
            Wall <FaDrawPolygon />
          </button>

          <button
            className={`toolbar-button ${selectedTool === 'door' ? 'active' : ''}`}
            onClick={() => setSelectedTool('door')}
          >
            Door <FaDoorOpen />
          </button>

          <button
            className={`toolbar-button ${selectedTool === 'window' ? 'active' : ''}`}
            onClick={() => setSelectedTool('window')}
          >
            Window <FaThLarge />
          </button>

          <hr />
          <strong>Indoor objects</strong>

          <button
            className={`toolbar-button ${selectedTool === 'sofa' ? 'active' : ''}`}
            onClick={() => {
              justSelectedRef.current = true;
              setSelectedTool('sofa');
              setTimeout(() => { justSelectedRef.current = false }, 50);
            }}

          >
            Sofa <FaCouch />
          </button>

          <button
            className={`toolbar-button ${selectedTool === 'bed' ? 'active' : ''}`}
            onClick={() => setSelectedTool('bed')}
          >
            Bed <FaBed />
          </button>

          <hr />
          <strong>Outdoor objects</strong>

          <button
            className={`toolbar-button ${selectedTool === 'lamp' ? 'active' : ''}`}
            onClick={() => setSelectedTool('lamp')}
          >
            Lamp <FaLightbulb />
          </button>

          <button
            className={`toolbar-button ${selectedTool === 'grill' ? 'active' : ''}`}
            onClick={() => setSelectedTool('grill')}
          >
            Grill <FaFire />
          </button>

          <div className="toolbar-bottom-buttons">
            <button
              className="toolbar-button icon-only"
              title="Save plan"
              onClick={() => setShowSaveModal(true)}
            >
              <FaSave />
            </button>
            <button
              className="toolbar-button icon-only"
              title="Reset plan"
              onClick={() => setShowResetModal(true)}
            >
              <FaTrash />
            </button>
            <button
              className="toolbar-button icon-only"
              title="Export plan"
              onClick={() => alert("Export not implemented yet.")}
            >
              <FaFileExport />
            </button>
          </div>

          {showSaveModal && (
            <div className="modal-overlay show">
              <div className="modal slide-in">
                <p>
                  {planId
                    ? "Do you want to save changes to this plan?"
                    : "Enter a name for your new plan:"}
                </p>

                <input
                  type="text"
                  placeholder="Plan name"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  style={{ marginTop: "10px", width: "100%", padding: "6px" }}
                />
                <div className="modal-buttons">
                  <button onClick={handleSavePlan}>Save</button>
                  <button onClick={() => setShowSaveModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {showResetModal && (
            <div className="modal-overlay show">
              <div className="modal slide-in">
                <p>Are you sure you want to reset the current plan?</p>
                <div className="modal-buttons">
                  <button onClick={() => {
                    resetPlan();
                    setShowResetModal(false);
                  }}>Yes</button>

                  <button onClick={() => setShowResetModal(false)}>No</button>
                </div>
              </div>
            </div>
          )}

          {/* <div className="save-plan-section">
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
          </div> */}
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
