import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Helper to get a date in IST as YYYY-MM-DD (en-CA gives 2025-06-16)
const getISTDateString = (d = new Date()) => {
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
};

const EmployeeAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [todayMarkedStatus, setTodayMarkedStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Today's date in IST (YYYY-MM-DD)
  const today = getISTDateString();

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/employee/attendance/history`,
        { withCredentials: true }
      );
      if (res.data.Status && Array.isArray(res.data.Result)) {
        setAttendance(res.data.Result);
      } else {
        setAttendance([]);
        setError("No attendance records found.");
      }
    } catch (err) {
      setError("Error fetching attendance history.");
      setAttendance([]);
      console.error("Error fetching attendance history:", err);
    } finally {
      setLoading(false);
    }
  };

  // Compute today's marked status in IST
  useEffect(() => {
    const todayRecord = attendance.find((record) => {
      if (!record.date) return false;
      // Convert UTC date to IST date string
      const recordDateIST = new Date(record.date + "T00:00:00Z").toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      return recordDateIST === today;
    });
    const status = todayRecord ? todayRecord.status.toLowerCase() : null;
    setTodayMarkedStatus(status);
  }, [attendance, today]);

  const markAttendance = async (statusValue) => {
    setMarking(true);
    setError("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/employee/attendance`,
        { status: statusValue },
        { withCredentials: true }
      );
      if (res.data.Status) {
        await fetchAttendance();
      } else {
        setError(res.data.Error || "Failed to mark attendance.");
      }
    } catch (err) {
      setError("Failed to mark attendance.");
      console.error("Error marking attendance:", err);
    } finally {
      setMarking(false);
    }
  };

  const resetTodayAttendance = async () => {
    setMarking(true);
    setError("");
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/employee/attendance/reset`,
        { withCredentials: true }
      );
      if (res.data.Status) {
        setTodayMarkedStatus(null);
        await fetchAttendance();
      } else {
        setError(res.data.Error || "Failed to reset attendance.");
      }
    } catch (err) {
      setError("Failed to reset attendance.");
      console.error("Error resetting attendance:", err);
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-4">Employee Attendance</h3>

      {/* Show today's date in IST */}
      <div className="text-center mb-3">
        <strong>Today's Date (IST): {today}</strong>
      </div>

      <div className="d-flex justify-content-center gap-3 mb-4">
        <button
          className="btn btn-success"
          onClick={() => markAttendance("present")}
          disabled={!!todayMarkedStatus || marking}
        >
          {marking && !todayMarkedStatus ? "Marking..." : "Mark Present"}
        </button>
        <button
          className="btn btn-danger"
          onClick={() => markAttendance("absent")}
          disabled={!!todayMarkedStatus || marking}
        >
          {marking && !todayMarkedStatus ? "Marking..." : "Mark Absent"}
        </button>
        <button
          className="btn btn-secondary"
          onClick={resetTodayAttendance}
          disabled={marking}
        >
          {marking ? "Resetting..." : "Reset Today"}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      {/* Attendance table is always shown after loading */}
      {!loading && (
        <div className="card shadow">
          <div className="card-header bg-primary text-white">
            <h5>Last 30 Days Attendance</h5>
          </div>
          <div className="card-body">
            {attendance.length === 0 ? (
              <p>No attendance records found.</p>
            ) : (
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Date (IST)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance
                    .filter((record) => record.date)
                    .map((record, index) => (
                      <tr key={index}>
                        <td>
                          {new Date(record.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            timeZone: "Asia/Kolkata"
                          })}
                        </td>
                        <td
                          style={{
                            color:
                              record.status?.toLowerCase() === "present"
                                ? "#28a745"
                                : record.status?.toLowerCase() === "absent"
                                ? "#dc3545"
                                : "#6c757d",
                            fontWeight: "bold"
                          }}
                        >
                          {record.status ? record.status : ""}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Apply for Leave Button */}
      <div className="text-center mt-4">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/employee_dashboard/apply_leave")}
        >
          Apply for Leave
        </button>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
