import React, { useState } from "react";
import { NumericTextBox, Input } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { useDisaster } from "../context/DisasterContext";

const Resources: React.FC = () => {
  const { selectedDisaster, activeDisaster, disasters, updateDisasterResources } = useDisaster();
  
  // Form state for adding new resources
  const [newResourceName, setNewResourceName] = useState<string>("");
  const [newResourceQuantity, setNewResourceQuantity] = useState<number | null>(1);

  // Get the current disaster's resources
  const currentResources = activeDisaster?.resources || [];

  // Get the disaster name to display
  const getDisasterDisplayName = () => {
    if (activeDisaster) {
      return activeDisaster.name || activeDisaster.type;
    }
    if (selectedDisaster) {
      const disaster = disasters.find(d => d.type === selectedDisaster || d.name === selectedDisaster);
      return disaster ? (disaster.name || disaster.type) : selectedDisaster;
    }
    return "No Disaster Selected";
  };

  // Add new resource
  const handleAddResource = () => {
    if (!activeDisaster) {
      alert("Please select a disaster first.");
      return;
    }

    if (!newResourceName.trim() || !newResourceQuantity || newResourceQuantity <= 0) {
      alert("Please enter a valid resource name and quantity.");
      return;
    }

    const newResource = {
      id: currentResources.length > 0 ? Math.max(...currentResources.map(r => r.id)) + 1 : 1,
      name: newResourceName.trim(),
      quantity: newResourceQuantity,
      stock: newResourceQuantity, // For backward compatibility
      category: "General"
    };

    const updatedResources = [...currentResources, newResource];
    updateDisasterResources(activeDisaster.id, updatedResources);
    setNewResourceName("");
    setNewResourceQuantity(1);
  };

  // Reduce resource quantity by 1
  const handleReduceQuantity = (id: number) => {
    if (!activeDisaster) return;

    const updatedResources = currentResources.map(resource =>
      resource.id === id && resource.quantity > 0
        ? { ...resource, quantity: resource.quantity - 1, stock: (resource.quantity - 1) }
        : resource
    );
    updateDisasterResources(activeDisaster.id, updatedResources);
  };

  // Update resource quantity
  const updateResourceQuantity = (id: number, newQuantity: number) => {
    if (!activeDisaster) return;

    const updatedResources = currentResources.map(resource =>
      resource.id === id
        ? { ...resource, quantity: newQuantity, stock: newQuantity }
        : resource
    );
    updateDisasterResources(activeDisaster.id, updatedResources);
  };

  // Simple helper retained for future inline edit support

  return (
    <div style={{ padding: "20px" }}>
      <h2>📦 Resources for {getDisasterDisplayName()}</h2>
      <p>Track and manage resources for disaster relief operations.</p>

      {/* Add New Resource Form */}
      <div style={{
        marginBottom: "30px",
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #dee2e6"
      }}>
        <h3 style={{ marginBottom: "15px" }}>Add New Resource</h3>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap"
        }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Resource Name:
            </label>
            <Input
              value={newResourceName}
              onChange={(e) => setNewResourceName(e.value as string)}
              placeholder="Enter resource name"
              style={{ width: "200px" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Quantity:
            </label>
            <NumericTextBox
              value={newResourceQuantity}
              onChange={(e) => setNewResourceQuantity((e as any).value)}
              min={1}
              style={{ width: "120px" }}
            />
          </div>
          <div style={{ alignSelf: "flex-end" }}>
            <Button
              onClick={handleAddResource}
              themeColor="primary"
              style={{ padding: "10px 20px" }}
            >
              Add Resource
            </Button>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Current Resources ({currentResources.length})</h3>
        {currentResources.length === 0 ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            {!activeDisaster 
              ? "Please select a disaster to manage resources." 
              : "No resources available. Add some resources using the form above."
            }
          </p>
        ) : (
          <Grid data={currentResources} style={{ maxHeight: "500px" }}>
            <GridColumn field="name" title="Resource Name" width="300px" />
            <GridColumn field="quantity" title="Quantity" width="200px" />
            <GridColumn field="category" title="Category" width="200px" />
          </Grid>
        )}
      </div>

      {/* Quick Adjustments */}
      {currentResources.length > 0 && activeDisaster && (
        <div style={{ marginTop: "20px", padding: "16px", border: "1px solid #e9ecef", borderRadius: "6px", background: "#fdfdfd" }}>
          <h4 style={{ marginTop: 0 }}>Quick Adjustments</h4>
          {currentResources.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderTop: "1px solid #f1f3f5" }}>
              <div style={{ width: 240 }}>{r.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Quantity:</span>
                <NumericTextBox
                  value={r.quantity}
                  onChange={(e) => {
                    const val = (e as any).value as number | null;
                    if (val === null) return;
                    updateResourceQuantity(r.id, val);
                  }}
                  min={0}
                  step={1}
                  style={{ width: 120 }}
                />
              </div>
              <Button
                size="small"
                onClick={() => handleReduceQuantity(r.id)}
                disabled={r.quantity <= 0}
              >
                Reduce (-1)
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;
