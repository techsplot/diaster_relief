import React, { useState } from "react";
import { Form, Field, FormElement } from "@progress/kendo-react-form";
import { Input } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (formData: any) => {
    setIsSubmitting(true);
    
    // Simulate login process
    setTimeout(() => {
      console.log("Login attempt:", formData);
      
      // Simple validation (you can replace with actual authentication)
      if (formData.username && formData.password) {
        // Call the onLogin callback to update authentication state
        onLogin();
        // Redirect to the disaster setup page
        navigate("/setup");
      } else {
        alert("Please enter both username and password");
      }
      
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          minWidth: "400px",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "30px", color: "#333" }}>
          Disaster Relief Dashboard
        </h2>
        <h3 style={{ marginBottom: "30px", color: "#666", fontWeight: "normal" }}>
          Login to Continue
        </h3>

        <Form
          onSubmit={handleLogin}
          initialValues={{ username: "", password: "" }}
          render={(formRenderProps) => (
            <FormElement>
              <div style={{ marginBottom: "20px", textAlign: "left" }}>
                <Field
                  name="username"
                  component={Input}
                  label="Username"
                  placeholder="Enter your username"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "30px", textAlign: "left" }}>
                <Field
                  name="password"
                  component={Input}
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  style={{ width: "100%" }}
                />
              </div>

              <Button
                type="submit"
                themeColor="primary"
                size="large"
                style={{ 
                  width: "100%", 
                  padding: "12px",
                  fontSize: "16px"
                }}
                disabled={isSubmitting || !formRenderProps.allowSubmit}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </FormElement>
          )}
        />

        <div style={{ marginTop: "20px", color: "#888", fontSize: "14px" }}>
          <p>Demo credentials: Any username and password will work</p>
        </div>
      </div>
    </div>
  );
};

export default Login;