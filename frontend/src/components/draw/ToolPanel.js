import React, { useState } from 'react';
import { FaMousePointer, FaDrawPolygon, FaTrash, FaArrowLeft, FaSave, FaDoorOpen, FaBed, FaCouch, FaLightbulb, FaFire, FaThLarge, FaFileExport } from 'react-icons/fa';

import '../../styles/ToolPanel.css';
import { createPlan, updatePlan } from '../../api/api';

const ToolPanel = ({
  selectedTool,
  setSelectedTool,
  editMode,
  setEditMode,
  selectedWall,
  setWallThickness,
  deleteWall,
  exitEditMode,
  setIsInteractingWithUI,
  justSelectedRef,
  walls,
  doors,
  windows,
  beds, setBeds,
  sofas, setSofas,
  grills, setGrills,
  lamps, setLamps,

  planName,
  setPlanName,
  resetPlan,
  planId,
  setPlanId,

  elements,
  setElements,
  selectedElement,
  setSelectedElement,
  handleElementUpdate,
  handleObjectUpdate

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
        </>
      ) : (
        <>
          {/* Wall Property Sheet */}
          {editMode && selectedTool === "select" && selectedElement?.type === "wall" && (
            <div className="wall-editor" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label>Thickness: {selectedElement.data.thickness}</label>
                <input
                  type="range"
                  min="20"
                  max="30"
                  value={selectedElement.data.thickness}
                  onChange={(e) => setWallThickness(parseInt(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '8px' }}>
                <button
                  className="toolbar-button icon-only"
                  onClick={() => {
                    setSelectedElement(null);
                    exitEditMode();
                  }}

                  title="Back"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FaArrowLeft />
                </button>
                <button
                  className="toolbar-button icon-only delete"
                  onClick={deleteWall}
                  title="Delete"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          )}

          {/* Door/Window Property Sheet */}
          {editMode && selectedTool === "select" && selectedElement?.type === "element" && (
            <div className="element-editor" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Width */}
              <div>
                <label>Width: {selectedElement.data.length || 40}</label>
                <input
                  type="range"
                  min="40"
                  max="80"
                  step="1"
                  value={selectedElement.data.length || 40}
                  onChange={(e) =>
                    handleElementUpdate({
                      ...selectedElement.data,
                      length: parseInt(e.target.value)
                    })
                  }
                />
              </div>

              {/* Color */}
              <div>
                <label>Color:</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  {(selectedElement.data.type === "door"
                    ? ["#F5F5F5", "brown", "#333"]
                    : ["#F5F5F5", "lightblue", "skyblue"]
                  ).map((color) => (
                    <div
                      key={color}
                      style={{
                        width: 24,
                        height: 24,
                        backgroundColor: color,
                        borderRadius: '50%',
                        border: selectedElement.data.fill === color ? "2px solid black" : "1px solid #ccc",
                        cursor: 'pointer'
                      }}
                      onClick={() =>
                        handleElementUpdate({
                          ...selectedElement.data,
                          fill: color
                        })
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '8px' }}>
                <button
                  className="toolbar-button icon-only"
                  onClick={() => {
                    setElements((prev) =>
                      prev.map((el) =>
                        el.id === selectedElement.data.id
                          ? selectedElement.data
                          : el
                      )
                    );
                    setSelectedElement(null);
                    setEditMode(false);
                  }}

                  title="Back"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FaArrowLeft />
                </button>
                <button
                  className="toolbar-button icon-only delete"
                  onClick={() => {
                    const updated = elements.filter((el) => el !== selectedElement.data);
                    setElements(updated);
                    setSelectedElement(null);
                    setEditMode(false);
                  }}
                  title="Delete"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          )}

          {/* Indoor/Outdoor Objects Property Sheet */}
          {editMode && selectedTool === "select" && selectedElement?.type === "object" && (
            <div className="object-editor" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <label style={{ marginBottom: '4px' }}>
                  Size: {selectedElement.data.size || 1.5}
                </label>
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.1"
                  value={selectedElement.data.size || 1.5}
                  onChange={(e) => {
                    const updated = { ...selectedElement.data, size: parseFloat(e.target.value) };
                    handleObjectUpdate(updated);
                  }}
                />
              </div>

              <div>
                <label>Angle: {(((selectedElement.data.angle * 180 / Math.PI) + 360) % 360).toFixed(0)}°</label>
                <input
                  type="range"
                  min="0"
                  max="359"
                  step="1"
                  value={(((selectedElement.data.angle * 180 / Math.PI) + 360) % 360).toFixed(0)}
                  onChange={(e) => {
                    const angleInRadians = parseFloat(e.target.value) * Math.PI / 180;
                    const updated = { ...selectedElement.data, angle: angleInRadians };
                    handleObjectUpdate(updated);
                  }}

                />
              </div>

              <div>
                <label>Color:</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  {["#888", "#8B4513", "#800020"].map((color) => (
                    <div
                      key={color}
                      style={{
                        width: 24,
                        height: 24,
                        backgroundColor: color,
                        borderRadius: '50%',
                        border: selectedElement.data.fill === color ? "2px solid black" : "1px solid #ccc",
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        const updated = { ...selectedElement.data, fill: color };
                        handleObjectUpdate(updated);
                      }}


                    />
                  ))}
                </div>
              </div>


              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '8px' }}>
                <button
                  className="toolbar-button icon-only"
                  onClick={() => {
                    setSelectedElement(null);
                    setEditMode(false);
                  }}
                  title="Back"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FaArrowLeft />
                </button>
                <button
                  className="toolbar-button icon-only delete"
                  onClick={() => {
                    setBeds((prev) => prev.filter((el) => el !== selectedElement.data));
                    setSofas((prev) => prev.filter((el) => el !== selectedElement.data));
                    setGrills((prev) => prev.filter((el) => el !== selectedElement.data));
                    setLamps((prev) => prev.filter((el) => el !== selectedElement.data));
                    setSelectedElement(null);
                    setEditMode(false);
                  }}
                  title="Delete"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          )}
        </>
      )
      }
    </div >
  );
};

export default ToolPanel;


