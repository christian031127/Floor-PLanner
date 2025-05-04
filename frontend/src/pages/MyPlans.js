// src/pages/MyPlans.js
import React, { useEffect, useState } from "react";
import { getPlan, getPlans, deletePlan, updatePlan } from "../api/api";
import { FaFolderOpen, FaEdit, FaTrash } from "react-icons/fa";
import "../styles/MyPlans.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const MyPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const navigate = useNavigate();

  const handleOpenPlan = async (id) => {
    try {
      const res = await getPlan(id);

      const planData = {
        ...res,
        id: res.id || res._id
      };

      navigate("/plan", { state: { planData } });
    } catch (err) {
      console.error("Terv betöltése sikertelen:", err);
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getPlans();
        setPlans(data);
      } catch (err) {
        console.error("Hiba a tervek betoltese soran:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleRename = async (id, newName) => {
    try {
      await updatePlan(id, { name: newName });
      setPlans((prev) => prev.map(p => p.id === id ? { ...p, name: newName } : p));
      setEditingId(null);
      toast.success("Plan renamed successfully!");
    } catch (err) {
      console.error("Hiba atnevezes kozben:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePlan(id);
      setPlans((prev) => prev.filter(p => p.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Hiba torles kozben:", err);
    }
  };

  const planToDelete = plans.find(p => p.id === deleteConfirmId);

  if (loading) return <p>Loading plans...</p>;

  return (
    <div className="my-plans-wrapper">
      <div className="my-plans-page">
        <h2>My Plans</h2>
        {plans.length === 0 ? (
          <p>You don't have any saved plans yet.</p>
        ) : (
          <div className="plans-list">
            {plans.map((plan) => (
              <div className="plan-card" key={plan.id}>
                <div className="plan-name-section">
                  {editingId === plan.id ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRename(plan.id, editedName);
                        }
                      }}
                      onBlur={() => setEditingId(null)}
                      autoFocus
                    />
                  ) : (
                    <h3>{plan.name}</h3>
                  )}
                </div>
                <div className="plan-actions">
                  <button className="blue" onClick={() => handleOpenPlan(plan.id)}><FaFolderOpen /></button>
                  <button className="gray" onClick={() => {
                    setEditingId(plan.id);
                    setEditedName(plan.name);
                  }}><FaEdit /></button>
                  <button className="red" onClick={() => setDeleteConfirmId(plan.id)}><FaTrash /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteConfirmId && planToDelete && (
          <div className="modal-overlay show">
            <div className="modal slide-in">
              <p>Are you sure you want to delete "{planToDelete.name}"?</p>
              <div className="modal-buttons">
                <button onClick={() => handleDelete(deleteConfirmId)}>Yes</button>
                <button onClick={() => setDeleteConfirmId(null)}>No</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPlans;
