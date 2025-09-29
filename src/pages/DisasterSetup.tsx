import React, { useState, useEffect } from "react";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { NumericTextBox } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import { useNavigate } from "react-router-dom";
import { useDisaster, disasterTypes, defaultResourcesByType } from "../context/DisasterContext";

const DisasterSetup: React.FC = () => {
  const navigate = useNavigate();
  const { disasters, addDisaster, setActiveDisaster, selectedDisaster, setSelectedDisaster, resources, setResources } = useDisaster();
  
  const handleBackToDashboard = () => {
    // Prefer navigating back to the previous page; if no history, go to Resources
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/resources");
    }
  };
  
  const [selectedDisasterType, setSelectedDisasterType] = useState<string>(selectedDisaster || "");
  const [disasterName, setDisasterName] = useState<string>("");
  


  // Debug logs
  console.log("DisasterSetup component rendered");
  console.log("Selected disaster type:", selectedDisasterType);
  console.log("Disaster name:", disasterName);
  console.log("Resources:", resources);
  console.log("Existing disasters:", disasters);

  // Disaster type options
  // Use shared types/defaults from context

  // Handle disaster type selection
  const handleDisasterTypeChange = (event: any) => {
    // KendoReact DropDownList passes the selected value in event.value
    const disasterType = event.value;
    console.log("Selected disaster type:", disasterType); // Debug log
    setSelectedDisasterType(disasterType);
    setSelectedDisaster(disasterType);

    // Generate default resources for selected disaster
    if (disasterType && defaultResourcesByType[disasterType]) {
      const defaultResources = defaultResourcesByType[disasterType].map((resourceName, index) => ({
        id: index + 1,
        name: resourceName,
        quantity: 10, // Default quantity
        stock: 10, // Default stock quantity for backward compatibility
        category: disasterType,
      }));
      setResources(defaultResources);
      console.log("Generated resources:", defaultResources); // Debug log
    } else {
      setResources([]);
    }
  };





  // Handle selecting existing disaster from dropdown
  const handleDisasterSelection = (event: any) => {
    const selectedItem = event.value; // Kendo provides the selected data item
    const selectedId = selectedItem?.value;
    if (selectedId && selectedId !== "") {
      setActiveDisaster(selectedId);
      const found = disasters.find(d => d.id === selectedId);
      if (found) {
        setSelectedDisaster(found.type);
        setResources(found.resources || []);
      }
      navigate("/resources");
    }
  };

  // Handle stock quantity changes
  const handleStockChange = (id: number, newStock: number | null) => {
    if (newStock === null) return;
    
    setResources(
      resources.map(resource =>
        resource.id === id ? { ...resource, stock: newStock, quantity: newStock } : resource
      )
    );
  };

  // Handle save and continue
  const handleSaveAndContinue = () => {
    if (!selectedDisasterType) {
      alert("Please select a disaster type first.");
      return;
    }

    if (!disasterName.trim()) {
      alert("Please enter a disaster name.");
      return;
    }

    // Create new disaster using context
    const newDisaster = {
      type: selectedDisasterType,
      name: disasterName.trim(),
      resources: resources,
      isActive: true,
    };

    console.log("Creating new disaster:", newDisaster);
    addDisaster(newDisaster);

    // Navigate to Resources page
    navigate("/resources");
  };

  // Ensure local type mirrors context if context changes externally
  useEffect(() => {
    if (selectedDisaster && selectedDisaster !== selectedDisasterType) {
      setSelectedDisasterType(selectedDisaster);
    }
  }, [selectedDisaster]);

  // Add error handling
  try {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
          padding: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            minWidth: "800px",
            maxWidth: "1000px",
          }}
        >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
          <Button 
            onClick={handleBackToDashboard}
            fillMode="flat"
            style={{ 
              marginRight: "20px",
              padding: "8px 12px",
              fontSize: "18px",
              color: "#2563eb",
              cursor: "pointer"
            }}
            title="Back to Dashboard"
          >
            ← Back
          </Button>
          <h1 style={{ textAlign: "center", flex: 1, margin: 0, color: "#333" }}>
            Disaster Relief Setup
          </h1>
        </div>

        {/* Existing Disasters */}
        {disasters.length > 0 && (
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ marginBottom: "15px", color: "#555" }}>
              Select Existing Disaster
            </h3>
            <DropDownList
              data={[{ text: "Select an existing disaster...", value: "" }, ...disasters.map(d => ({ text: `${d.name} (${d.type})`, value: d.id }))]}
              textField="text"
              dataItemKey="value"
              value={disasters.find(d => d.isActive) ? { text: `${disasters.find(d => d.isActive)?.name} (${disasters.find(d => d.isActive)?.type})`, value: disasters.find(d => d.isActive)?.id } : { text: "Select an existing disaster...", value: "" }}
              onChange={handleDisasterSelection}
              style={{ width: "400px", fontSize: "16px", marginBottom: "10px" }}
            />
            <p style={{ color: "#666", fontSize: "14px", marginTop: "5px" }}>
              Select a disaster to manage or continue creating a new one below
            </p>
            <div style={{ borderBottom: "1px solid #eee", margin: "20px 0" }} />
            <h4 style={{ color: "#666", textAlign: "center", margin: "15px 0" }}>
              OR
            </h4>
          </div>
        )}

        {/* Create New Disaster */}
        <h3 style={{ marginBottom: "15px", color: "#555" }}>
          {disasters.length > 0 ? "Create New Disaster" : "Create Your First Disaster"}
        </h3>

        {/* Disaster Type Selection */}
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ marginBottom: "20px", color: "#555" }}>
            Select Disaster Type
          </h2>
          <DropDownList
            data={disasterTypes}
            value={selectedDisasterType || ""}
            onChange={handleDisasterTypeChange}
            style={{ width: "300px", fontSize: "16px" }}
          />
          {!selectedDisasterType && (
            <p style={{ color: "#666", fontSize: "14px", marginTop: "5px" }}>
              Please select a disaster type from the dropdown above
            </p>
          )}
        </div>

        {/* Disaster Name Input */}
        {selectedDisasterType && (
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ marginBottom: "10px", color: "#555" }}>Disaster Name</h3>
            <input
              type="text"
              placeholder="Enter a name for this disaster (e.g., Hurricane Sandy 2024)"
              value={disasterName}
              onChange={(e) => setDisasterName(e.target.value)}
              style={{
                width: "400px",
                padding: "10px",
                fontSize: "16px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
        )}

        {/* Resources Grid */}
        {selectedDisasterType && resources.length > 0 && (
          <div style={{ marginBottom: "40px" }}>
            <h3 style={{ marginBottom: "20px", color: "#555" }}>
              Default Resources for {selectedDisasterType}
            </h3>
            <p style={{ marginBottom: "20px", color: "#777" }}>
              Adjust the stock quantities as needed for your disaster response plan.
            </p>

            <div style={{ marginBottom: "20px" }}>
              <Grid
                data={resources}
                style={{ height: "300px" }}
              >
                <GridColumn
                  field="name"
                  title="Resource Name"
                  width="300px"
                />
                <GridColumn
                  field="stock"
                  title="Stock Quantity"
                  width="200px"
                />
              </Grid>
            </div>

            {/* Resource Editing Section */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ marginBottom: "15px", color: "#555" }}>Adjust Stock Quantities:</h4>
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px",
                    margin: "5px 0",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <span style={{ fontWeight: "500", minWidth: "200px" }}>
                    {resource.name}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <label>Stock:</label>
                    <NumericTextBox
                      value={resource.stock}
                      onChange={(e) => handleStockChange(resource.id, e.value || 0)}
                      min={0}
                      step={1}
                      style={{ width: "120px" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          {selectedDisasterType && disasterName.trim() ? (
            <Button
              onClick={handleSaveAndContinue}
              themeColor="primary"
              size="large"
              style={{
                padding: "12px 30px",
                fontSize: "16px",
                minWidth: "200px",
              }}
            >
              Create Disaster & Continue
            </Button>
          ) : (
            <p style={{ color: "#888", fontSize: "14px" }}>
              Please select a disaster type and enter a name to continue
            </p>
          )}
        </div>

        {/* Information Panel */}
        {selectedDisasterType && disasterName && (
          <div
            style={{
              marginTop: "30px",
              padding: "20px",
              backgroundColor: "#e8f4f8",
              borderRadius: "6px",
              border: "1px solid #b8e6ff",
            }}
          >
            <h4 style={{ marginBottom: "10px", color: "#2c5aa0" }}>
              📋 Disaster: {disasterName} ({selectedDisasterType})
            </h4>
            <p style={{ margin: "0", color: "#2c5aa0", fontSize: "14px" }}>
              You have configured {resources.length} resource types for this disaster.
              You can modify these resources later in the Resources management page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
  } catch (error) {
    console.error("Error in DisasterSetup component:", error);
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Something went wrong</h2>
        <p>Please refresh the page and try again.</p>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    );
  }
};

export default DisasterSetup;