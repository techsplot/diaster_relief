import React from "react";
import { Button } from "@progress/kendo-react-buttons";
import { useDisaster } from "../context/DisasterContext";

const ContextDemo: React.FC = () => {
  const {
    // Disaster management
    disasters,
    activeDisaster,
    addDisaster,
    setActiveDisaster,
    
    // Global app state
    selectedDisaster,
    setSelectedDisaster,
    resources,
    setResources,
    volunteers,
    setVolunteers,
  } = useDisaster();

  const handleAddSampleDisaster = () => {
    addDisaster({
      type: "Flood",
      name: "Sample Flood 2024",
      resources: [
        { id: 1, name: "Sandbags", quantity: 100, stock: 100, category: "Flood" },
        { id: 2, name: "Water Pumps", quantity: 5, stock: 5, category: "Flood" },
      ],
      isActive: true,
    });
  };

  const handleAddSampleResource = () => {
    const newResource = {
      id: resources.length + 1,
      name: "Emergency Kit",
      quantity: 50,
      stock: 50,
      category: "General",
    };
    setResources([...resources, newResource]);
  };

  const handleAddSampleVolunteer = () => {
    const newVolunteer = {
      id: volunteers.length + 1,
      name: "John Doe",
      skill: "Medical",
      available: true,
    };
    setVolunteers([...volunteers, newVolunteer]);
  };

  const handleToggleVolunteerAvailability = (id: number) => {
    setVolunteers(volunteers.map(v => 
      v.id === id ? { ...v, available: !v.available } : v
    ));
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🧪 Disaster Context Demo</h1>
      <p>This page demonstrates how to use the DisasterContext API across your application.</p>

      {/* Selected Disaster */}
      <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#f0f8ff", borderRadius: "8px" }}>
        <h3>🎯 Selected Disaster</h3>
        <p><strong>Current:</strong> {selectedDisaster || "None selected"}</p>
        <input
          type="text"
          placeholder="Enter disaster name"
          value={selectedDisaster}
          onChange={(e) => setSelectedDisaster(e.target.value)}
          style={{ padding: "8px", marginRight: "10px", width: "200px" }}
        />
        <Button onClick={() => setSelectedDisaster("Hurricane Maria")}>
          Set Sample Disaster
        </Button>
      </div>

      {/* Disasters Management */}
      <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
        <h3>🌪️ Disasters ({disasters.length})</h3>
        <Button onClick={handleAddSampleDisaster} style={{ marginBottom: "15px" }}>
          Add Sample Disaster
        </Button>
        {disasters.length === 0 ? (
          <p>No disasters created yet.</p>
        ) : (
          <div>
            <p><strong>Active Disaster:</strong> {activeDisaster?.name || "None"}</p>
            <ul>
              {disasters.map(disaster => (
                <li key={disaster.id} style={{ marginBottom: "10px" }}>
                  <strong>{disaster.name}</strong> ({disaster.type}) - {disaster.resources.length} resources
                  {disaster.id !== activeDisaster?.id && (
                    <Button
                      size="small"
                      onClick={() => setActiveDisaster(disaster.id)}
                      style={{ marginLeft: "10px" }}
                    >
                      Set Active
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Resources Management */}
      <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#fff8f0", borderRadius: "8px" }}>
        <h3>📦 Global Resources ({resources.length})</h3>
        <Button onClick={handleAddSampleResource} style={{ marginBottom: "15px" }}>
          Add Sample Resource
        </Button>
        {resources.length === 0 ? (
          <p>No global resources yet.</p>
        ) : (
          <ul>
            {resources.map(resource => (
              <li key={resource.id}>
                <strong>{resource.name}</strong> - Quantity: {resource.quantity}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Volunteers Management */}
      <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#f0fff0", borderRadius: "8px" }}>
        <h3>👥 Volunteers ({volunteers.length})</h3>
        <Button onClick={handleAddSampleVolunteer} style={{ marginBottom: "15px" }}>
          Add Sample Volunteer
        </Button>
        {volunteers.length === 0 ? (
          <p>No volunteers yet.</p>
        ) : (
          <ul>
            {volunteers.map(volunteer => (
              <li key={volunteer.id} style={{ marginBottom: "10px" }}>
                <strong>{volunteer.name}</strong> - {volunteer.skill} 
                <span style={{ 
                  color: volunteer.available ? "green" : "red",
                  marginLeft: "10px"
                }}>
                  ({volunteer.available ? "Available" : "Unavailable"})
                </span>
                <Button
                  size="small"
                  onClick={() => handleToggleVolunteerAvailability(volunteer.id)}
                  style={{ marginLeft: "10px" }}
                >
                  Toggle Availability
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* LocalStorage Status */}
      <div style={{ padding: "20px", backgroundColor: "#fff0f5", borderRadius: "8px" }}>
        <h3>💾 Persistence</h3>
        <p>All changes are automatically saved to localStorage and will persist across browser sessions.</p>
        <Button 
          onClick={() => {
            localStorage.removeItem('disaster-relief-data');
            window.location.reload();
          }}
          themeColor="error"
        >
          Clear All Data & Reload
        </Button>
      </div>
    </div>
  );
};

export default ContextDemo;