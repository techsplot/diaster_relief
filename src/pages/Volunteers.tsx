import React, { useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Input, NumericTextBox } from "@progress/kendo-react-inputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { useDisaster } from "../context/DisasterContext";

const Volunteers: React.FC = () => {
  const {
    volunteers,
    setVolunteers,
    selectedDisaster,
    disasters,
    activeDisaster,
    assignVolunteer,
    resources,
    setResources,
  } = useDisaster();

  // Form state
  const [newVolunteerName, setNewVolunteerName] = useState<string>("");
  const [newVolunteerSkill, setNewVolunteerSkill] = useState<string>("");
  const [assignmentLocation, setAssignmentLocation] = useState<string>("");
  const [assignmentDisasterId, setAssignmentDisasterId] = useState<string>(activeDisaster?.id || "");
  const [toast, setToast] = useState<string>("");
  const [openDetailsId, setOpenDetailsId] = useState<number | null>(null);
  const [newVolunteerPhone, setNewVolunteerPhone] = useState<string>("");

  const availableSkills = [
    "Medical",
    "Search & Rescue",
    "Logistics",
    "Communications",
    "Engineering",
    "Transportation",
    "Food Distribution",
    "Emergency Response",
    "First Aid",
    "Coordination",
  ];

  // Create volunteer
  const handleAddVolunteer = () => {
    if (!newVolunteerName.trim() || !newVolunteerSkill) {
      alert("Please enter a valid volunteer name and select a skill.");
      return;
    }
    const newVolunteer = {
      id: volunteers.length > 0 ? Math.max(...volunteers.map((v) => v.id)) + 1 : 1,
      name: newVolunteerName.trim(),
      skill: newVolunteerSkill,
      available: true,
      phone: newVolunteerPhone.trim() || undefined,
    };
    setVolunteers([...volunteers, newVolunteer]);
    setNewVolunteerName("");
    setNewVolunteerSkill("");
    setNewVolunteerPhone("");
  };

  const handleToggleAvailability = (id: number) => {
    setVolunteers(
      volunteers.map((v) => (v.id === id ? { ...v, available: !v.available } : v))
    );
  };

  const handleAssign = (id: number) => {
    const targetDisasterId = assignmentDisasterId || activeDisaster?.id;
    if (!targetDisasterId) {
      alert("Please select a disaster to assign.");
      return;
    }
    if (!assignmentLocation.trim()) {
      alert("Please enter a deployment location.");
      return;
    }
    assignVolunteer(id, {
      disasterId: targetDisasterId,
      location: assignmentLocation.trim(),
    });
    setAssignmentLocation("");
    setToast("Volunteer assigned and notified with location and resources.");
    setTimeout(() => setToast(""), 3000);

    // Optional: Fire SMS via local server if phone is available
    const v = volunteers.find(x => x.id === id);
    if (v?.phone) {
      const d = disasters.find(dd => dd.id === (assignmentDisasterId || activeDisaster?.id));
      const resList = resources.map(r => `${r.name}: ${r.quantity}`).join(", ");
      const msg = `Assignment: ${d ? `${d.name} (${d.type})` : 'Disaster'} @ ${assignmentLocation.trim()}. Resources: ${resList || 'None'}.`;
      const smsUrl = (import.meta as any).env?.VITE_SMS_API_URL || "http://localhost:4000/api/sms";
      fetch(smsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: v.phone, message: msg })
      }).catch(() => {/* no-op */});
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            background: "#28a745",
            color: "white",
            padding: "10px 16px",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
          }}
        >
          {toast}
        </div>
      )}
      <h2>👥 Volunteers for {selectedDisaster || "No Disaster Selected"}</h2>
      <p>Manage, assign, and notify volunteers. Volunteers can also update resources below.</p>

      {/* Add New Volunteer */}
      <div
        style={{
          marginBottom: "20px",
          padding: "20px",
          backgroundColor: "#f8f9fa",
          borderRadius: 8,
          border: "1px solid #dee2e6",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Add New Volunteer</h3>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Name</label>
            <Input
              value={newVolunteerName}
              onChange={(e) => setNewVolunteerName(e.value as string)}
              placeholder="Enter volunteer name"
              style={{ width: 220 }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Skill</label>
            <DropDownList
              data={availableSkills}
              value={newVolunteerSkill}
              onChange={(e) => setNewVolunteerSkill((e as any).value)}
              style={{ width: 200 }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Phone (E.164)</label>
            <Input
              value={newVolunteerPhone}
              onChange={(e) => setNewVolunteerPhone(e.value as string)}
              placeholder="+15551234567"
              style={{ width: 200 }}
            />
          </div>
          <Button onClick={handleAddVolunteer} themeColor="primary">
            Add Volunteer
          </Button>
        </div>
      </div>

      {/* Assignment Controls */}
      <div style={{ marginBottom: 20, padding: 16, border: "1px solid #dee2e6", borderRadius: 8 }}>
        <h3 style={{ marginTop: 0 }}>Assign Volunteers</h3>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Disaster</label>
            <select
              value={assignmentDisasterId}
              onChange={(e) => setAssignmentDisasterId(e.target.value)}
              style={{ padding: 8, minWidth: 240 }}
            >
              <option value="">
                {activeDisaster ? `Use Active: ${activeDisaster.name}` : "Select a disaster"}
              </option>
              {disasters.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.type})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Location</label>
            <Input
              value={assignmentLocation}
              onChange={(e) => setAssignmentLocation(e.value as string)}
              placeholder="e.g., Zone A - Warehouse"
              style={{ width: 260 }}
            />
          </div>
          <div style={{ color: "#6c757d", fontSize: 12 }}>
            Select a volunteer below and click "Assign" to notify them (includes location and resources).
          </div>
        </div>
      </div>

      {/* Volunteers Table */}
      <div style={{ marginBottom: 20 }}>
        <h3>Current Volunteers ({volunteers.length})</h3>
        {volunteers.length === 0 ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            No volunteers available. Add volunteers above.
          </p>
        ) : (
          <div style={{ border: "1px solid #ccc", borderRadius: 4, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#f8f9fa" }}>
                <tr>
                  <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Name</th>
                  <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #dee2e6" }}>Skill</th>
                  <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #dee2e6" }}>Availability</th>
                  <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #dee2e6" }}>Assignment</th>
                  <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #dee2e6" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map((v, index) => (
                  <>
                    <tr key={v.id} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                      <td style={{ padding: 12, borderBottom: "1px solid #dee2e6" }}>
                        <strong>{v.name}</strong>
                        <div style={{ fontSize: 12, color: "#6c757d", marginTop: 4 }}>
                          {v.notifications && v.notifications.length > 0 && (
                            <>Last notice: {v.notifications[v.notifications.length - 1].message}</>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #dee2e6" }}>
                        <span style={{ padding: "4px 8px", backgroundColor: "#e9ecef", borderRadius: 4, fontSize: 14 }}>
                          {v.skill}
                        </span>
                      </td>
                      <td style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #dee2e6" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: 12,
                            fontSize: 14,
                            fontWeight: 700,
                            backgroundColor: v.available ? "#d4edda" : "#f8d7da",
                            color: v.available ? "#155724" : "#721c24",
                          }}
                        >
                          {v.available ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #dee2e6", fontSize: 12 }}>
                        {v.assignedDisasterId ? (
                          <>
                            <div>Assigned</div>
                            <div style={{ color: "#6c757d" }}>{v.assignedLocation || ""}</div>
                          </>
                        ) : (
                          <span style={{ color: "#6c757d" }}>Not assigned</span>
                        )}
                      </td>
                      <td style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #dee2e6" }}>
                        <Button
                          size="small"
                          onClick={() => handleToggleAvailability(v.id)}
                          themeColor={v.available ? "error" : "success"}
                          style={{ padding: "6px 12px", marginRight: 8 }}
                        >
                          {v.available ? "Mark Unavailable" : "Mark Available"}
                        </Button>
                        <Button size="small" onClick={() => handleAssign(v.id)} themeColor="primary" style={{ padding: "6px 12px", marginRight: 8 }}>
                          Assign
                        </Button>
                        <Button size="small" onClick={() => setOpenDetailsId(openDetailsId === v.id ? null : v.id)}>
                          {openDetailsId === v.id ? "Hide" : "View"} Notices
                        </Button>
                      </td>
                    </tr>
                    {openDetailsId === v.id && (
                      <tr>
                        <td colSpan={5} style={{ background: "#fcfcfd", padding: 12, borderBottom: "1px solid #dee2e6" }}>
                          <div style={{ fontWeight: 600, marginBottom: 8 }}>Notifications</div>
                          {!(v.notifications && v.notifications.length) ? (
                            <div style={{ color: "#6c757d" }}>No notifications yet.</div>
                          ) : (
                            <ul style={{ margin: 0, paddingLeft: 16 }}>
                              {v.notifications!.slice().reverse().map((n) => (
                                <li key={n.id} style={{ margin: "4px 0" }}>
                                  <div style={{ fontSize: 12, color: "#6c757d" }}>{new Date(n.createdAt).toLocaleString()}</div>
                                  <div>{n.message}</div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Volunteer-driven resource updates */}
      <div style={{ padding: 16, border: "1px solid #e9ecef", borderRadius: 8, background: "#fdfdfd" }}>
        <h3 style={{ marginTop: 0 }}>Resources for {activeDisaster ? `${activeDisaster.name} (${activeDisaster.type})` : selectedDisaster || "Current Disaster"}</h3>
        {resources.length === 0 ? (
          <p style={{ color: "#6c757d" }}>No resources available to update.</p>
        ) : (
          resources.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderTop: "1px solid #f1f3f5" }}>
              <div style={{ width: 240 }}>{r.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>Quantity:</span>
                <NumericTextBox
                  value={r.quantity}
                  onChange={(e) => {
                    const val = (e as any).value as number | null;
                    if (val === null) return;
                    setResources(resources.map((item) => (item.id === r.id ? { ...item, quantity: val, stock: val } : item)));
                  }}
                  min={0}
                  step={1}
                  style={{ width: 120 }}
                />
              </div>
              <Button
                size="small"
                onClick={() => setResources(resources.map((item) => (item.id === r.id && item.quantity > 0 ? { ...item, quantity: item.quantity - 1, stock: item.quantity - 1 } : item)))}
              >
                Reduce (-1)
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Volunteers;
