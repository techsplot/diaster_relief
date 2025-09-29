import React from "react";
import { Card } from "@progress/kendo-react-layout";
import {
  Chart,
  ChartSeries,
  ChartSeriesItem,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartValueAxis,
  ChartValueAxisItem,
} from "@progress/kendo-react-charts";
import { useDisaster } from "../context/DisasterContext";

const Analytics: React.FC = () => {
  const { resources, volunteers, selectedDisaster } = useDisaster();

  // Calculate statistics from context data
  const totalResources = resources.length;
  const totalVolunteers = volunteers.length;
  const availableVolunteers = volunteers.filter(v => v.available).length;
  const totalResourceQuantity = resources.reduce((sum, resource) => sum + resource.quantity, 0);

  // Prepare resource distribution data
  const resourceDistributionData = resources.map(resource => ({
    name: resource.name,
    quantity: resource.quantity
  }));

  // Prepare volunteer skills distribution data
  const skillsCount = volunteers.reduce((acc, volunteer) => {
    acc[volunteer.skill] = (acc[volunteer.skill] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const volunteerSkillsData = Object.entries(skillsCount).map(([skill, count]) => ({
    skill,
    count
  }));

  return (
    <div style={{ padding: "20px" }}>
  <h2>📊 Analytics Dashboard</h2>
  <p style={{ marginTop: 0, color: '#6c757d' }}>Current disaster: {selectedDisaster || 'None selected'}</p>
      <p>Real-time insights from disaster relief operations data.</p>

      {/* Summary Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginBottom: "40px"
      }}>
        <Card style={{
          padding: "20px",
          textAlign: "center",
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "8px"
        }}>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#007bff", marginBottom: "10px" }}>
            {totalResources}
          </div>
          <h4 style={{ margin: "0", color: "#495057" }}>Total Resources</h4>
          <p style={{ margin: "5px 0 0 0", color: "#6c757d", fontSize: "14px" }}>
            {totalResourceQuantity} total quantity
          </p>
        </Card>

        <Card style={{
          padding: "20px",
          textAlign: "center",
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "8px"
        }}>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#28a745", marginBottom: "10px" }}>
            {totalVolunteers}
          </div>
          <h4 style={{ margin: "0", color: "#495057" }}>Total Volunteers</h4>
          <p style={{ margin: "5px 0 0 0", color: "#6c757d", fontSize: "14px" }}>
            Registered volunteers
          </p>
        </Card>

        <Card style={{
          padding: "20px",
          textAlign: "center",
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "8px"
        }}>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#17a2b8", marginBottom: "10px" }}>
            {availableVolunteers}
          </div>
          <h4 style={{ margin: "0", color: "#495057" }}>Available Volunteers</h4>
          <p style={{ margin: "5px 0 0 0", color: "#6c757d", fontSize: "14px" }}>
            Ready for deployment
          </p>
        </Card>
      </div>

      {/* Charts Section */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "30px",
        marginBottom: "30px"
      }}>
        {/* Resource Distribution Chart */}
        <div>
          <h3 style={{ marginBottom: "20px" }}>📦 Resource Distribution by Quantity</h3>
          {resourceDistributionData.length === 0 ? (
            <div style={{
              padding: "40px",
              textAlign: "center",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              color: "#6c757d"
            }}>
              No resources data available
            </div>
          ) : (
            <Chart style={{ height: "350px" }}>
              <ChartCategoryAxis>
                <ChartCategoryAxisItem
                  categories={resourceDistributionData.map(data => data.name)}
                />
              </ChartCategoryAxis>
              <ChartValueAxis>
                <ChartValueAxisItem title={{ text: "Quantity" }} />
              </ChartValueAxis>
              <ChartSeries>
                <ChartSeriesItem
                  type="column"
                  data={resourceDistributionData.map(data => data.quantity)}
                  name="Resource Quantity"
                  color="#007bff"
                />
              </ChartSeries>
            </Chart>
          )}
        </div>

        {/* Volunteer Skills Distribution Chart */}
        <div>
          <h3 style={{ marginBottom: "20px" }}>👥 Volunteer Skills Distribution</h3>
          {volunteerSkillsData.length === 0 ? (
            <div style={{
              padding: "40px",
              textAlign: "center",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              color: "#6c757d"
            }}>
              No volunteers data available
            </div>
          ) : (
            <Chart style={{ height: "350px" }}>
              <ChartSeries>
                <ChartSeriesItem
                  type="pie"
                  data={volunteerSkillsData}
                  field="count"
                  categoryField="skill"
                  name="Volunteer Skills"
                />
              </ChartSeries>
            </Chart>
          )}
        </div>
      </div>

      {/* Additional Insights */}
      {(resources.length > 0 || volunteers.length > 0) && (
        <div style={{
          padding: "20px",
          backgroundColor: "#e8f4f8",
          borderRadius: "8px",
          border: "1px solid #b8e6ff"
        }}>
          <h4 style={{ color: "#2c5aa0", marginBottom: "15px" }}>📈 Key Insights</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "15px" }}>
            {resources.length > 0 && (
              <div>
                <strong>Resource Status:</strong>
                <p style={{ margin: "5px 0", fontSize: "14px" }}>
                  Average quantity per resource: {(totalResourceQuantity / totalResources).toFixed(1)}
                </p>
              </div>
            )}
            {volunteers.length > 0 && (
              <div>
                <strong>Volunteer Availability:</strong>
                <p style={{ margin: "5px 0", fontSize: "14px" }}>
                  {((availableVolunteers / totalVolunteers) * 100).toFixed(1)}% of volunteers are currently available
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
