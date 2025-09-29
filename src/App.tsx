
// App.tsx
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { DisasterProvider } from "./context/DisasterContext";
import Login from "./pages/Login";
import DisasterSetup from "./pages/DisasterSetup";
import Resources from "./pages/Resources";
import Volunteers from "./pages/Volunteers";
import Analytics from "./pages/Analytics";
import ContextDemo from "./pages/ContextDemo";
import Sidebar from "./components/Sidebar";
// Markdown libs no longer needed in App (used inside AIAssistant page)
import AIAssistantPage from "./pages/AIAssistant";


// Component to handle dynamic page titles
const TitleUpdater = () => {
  const location = useLocation();
  
  useEffect(() => {
    const titles: { [key: string]: string } = {
      '/login': 'Login - Disaster Relief Dashboard',
      '/setup': 'Disaster Setup - Disaster Relief Dashboard',
      '/resources': 'Resources - Disaster Relief Dashboard',
      '/volunteers': 'Volunteers - Disaster Relief Dashboard',
      '/analytics': 'Analytics - Disaster Relief Dashboard',
      '/demo': 'Context Demo - Disaster Relief Dashboard',
      '/ai-assistant': 'AI Assistant - Disaster Relief Dashboard'
    };
    
    document.title = titles[location.pathname] || 'Disaster Relief Dashboard';
  }, [location.pathname]);
  
  return null;
};

function App() {
  // 🔑 Persisted auth state (very simple demo auth)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem("auth.loggedIn") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("auth.loggedIn", isLoggedIn ? "true" : "false");
    } catch {}
  }, [isLoggedIn]);

  return (
    <DisasterProvider>
      <Router>
        <>
          <TitleUpdater />
          <Routes>
            {/* Login always first */}
            <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />

            {/* Disaster setup required after login */}
            <Route
              path="/setup"
              element={
                isLoggedIn ? (
                  <DisasterSetup />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Main pages with Sidebar */}
            <Route
              path="/resources"
              element={
                isLoggedIn ? (
                  <div style={{ display: "flex", height: "100vh" }}>
                    <Sidebar />
                    <main style={{ flex: 1, padding: "1rem" }}>
                      <Resources />
                    </main>
                  </div>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/volunteers"
              element={
                isLoggedIn ? (
                  <div style={{ display: "flex", height: "100vh" }}>
                    <Sidebar />
                    <main style={{ flex: 1, padding: "1rem" }}>
                      <Volunteers />
                    </main>
                  </div>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/analytics"
              element={
                isLoggedIn ? (
                  <div style={{ display: "flex", height: "100vh" }}>
                    <Sidebar />
                    <main style={{ flex: 1, padding: "1rem" }}>
                      <Analytics />
                    </main>
                  </div>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/demo"
              element={
                isLoggedIn ? (
                  <div style={{ display: "flex", height: "100vh" }}>
                    <Sidebar />
                    <main style={{ flex: 1, padding: "1rem" }}>
                      <ContextDemo />
                    </main>
                  </div>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/ai-assistant"
              element={
                isLoggedIn ? (
                  <div style={{ display: "flex", height: "100vh" }}>
                    <Sidebar />
                    <main style={{ flex: 1, padding: "0" }}>
                      <AIAssistantPage />
                    </main>
                  </div>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Default route: if logged in go to resources, else to login */}
            <Route path="*" element={<Navigate to={isLoggedIn ? "/resources" : "/login"} />} />
          </Routes>
        </>
      </Router>
    </DisasterProvider>
  );
}

export default App;
