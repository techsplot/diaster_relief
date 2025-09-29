import React from "react";
import { Button } from "@progress/kendo-react-buttons";
import { PanelBar, PanelBarItem } from "@progress/kendo-react-layout";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Exact page names
  const items = [
    { text: "Resources", icon: "grid", route: "/resources" },
    { text: "Volunteers", icon: "user", route: "/volunteers" },
    { text: "Analytics", icon: "chart-bar", route: "/analytics" },
    { text: "Disaster Setup", icon: "gear", route: "/setup" },
    { text: "AI Assistant", icon: "comment", route: "/ai-assistant" },
    { text: "Context Demo", icon: "gear", route: "/demo" }
  ];

  const handleAddDisaster = () => {
    navigate("/setup");
  };

  const handlePanelBarSelect = (event: any) => {
    const route = event.target.props.route;
    if (route) {
      navigate(route);
    }
  };

  return (
    <div style={{ 
      width: "250px", 
      height: "100vh", 
      padding: "1rem",
      flexShrink: 0,
      borderRight: "1px solid #ddd"
    }}>
      <h2 style={{ marginBottom: "1rem" }}>Relief Dashboard</h2>
      <Button
        themeColor="primary"
        size="large"
        onClick={handleAddDisaster}
        style={{ 
          width: "100%",
          marginBottom: "2rem"
        }}
      >
        + Add New Disaster
      </Button>
      
      <PanelBar onSelect={handlePanelBarSelect}>
        {items.map((item) => (
          <PanelBarItem
            key={item.route}
            title={item.text}
            icon={item.icon}
            route={item.route}
            selected={location.pathname === item.route}
          />
        ))}
      </PanelBar>
    </div>
  );
};

export default Sidebar;
