import React, { useState, useEffect } from "react";
import axios from "axios";

const ApproveLeave = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch departments on mount
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/auth/dept`, { withCredentials: true })
      .then(res => {
        if (res.data.Status) setDepartments(res.data.Result);
      });
  }, []);

  // Fetch leaves when department changes
  useEffect(() => {
    if (!selectedDept) return;
    setLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL}/auth/leaves/${selectedDept}`, { withCredentials: true })
      .then(res => {
        if (res.data.Status) setLeaves(res.data.Result);
        else setLeaves([]);
      })
      .finally(() => setLoading(false));
  }, [selectedDept]);

  const handleAction = async (leave_id, action) => {
  // Optimistically update the local state
  setLeaves(prevLeaves => 
    prevLeaves.map(leave => 
      leave.leave_id === leave_id ? { ...leave, status: action } : leave
    )
  );

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/leave_action`,
      { leave_id, status: action },
      { withCredentials: true }
    );
    setMessage(res.data.Status ? "Action successful!" : res.data.Error);
    
    // Re-fetch to confirm server state (optional but recommended)
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/auth/leaves/${selectedDept}`, 
      { withCredentials: true }
    );
    if (data.Status) setLeaves(data.Result);
  } catch (err) {
    setMessage("Failed to update leave status.");
    // Revert UI if the server update fails
    setLeaves(prevLeaves => 
      prevLeaves.map(leave => 
        leave.leave_id === leave_id ? { ...leave, status: "pending" } : leave
      )
    );
  }
};

  const getDuration = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  };

 return (
  <div className="max-w-6xl mx-auto mt-10 px-6">
    <h3 className="text-2xl font-semibold text-center mb-6">Approve Leave Requests</h3>

    {/* Department Selector */}
    <div className="mb-6">
      <label className="block font-medium mb-2">Select Department:</label>
      <select
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={selectedDept}
        onChange={e => setSelectedDept(e.target.value)}
      >
        <option value="">-- Select Department --</option>
        {departments.map(dept => (
          <option key={dept.id} value={dept.id}>{dept.name}</option>
        ))}
      </select>
    </div>

    {/* Feedback Message */}
    {message && (
      <div className="text-center mb-4 text-blue-600 bg-blue-100 px-4 py-2 rounded">
        {message}
      </div>
    )}

    {/* Leave Table */}
    {loading ? (
      <div className="text-center text-gray-600">Loading...</div>
    ) : (
      <div className="overflow-x-auto shadow border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="px-4 py-3 text-left">Employee</th>
              <th className="px-4 py-3 text-left">Start Date</th>
              <th className="px-4 py-3 text-left">End Date</th>
              <th className="px-4 py-3 text-left">Duration</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Purpose</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {leaves.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-500">
                  No leave applications found.
                </td>
              </tr>
            ) : (
              leaves.map(leave => (
                <tr key={leave.leave_id}>
                  <td className="px-4 py-3">{leave.employee_name}</td>
                  <td className="px-4 py-3">{leave.start_date}</td>
                  <td className="px-4 py-3">{leave.end_date}</td>
                  <td className="px-4 py-3">
                    {getDuration(leave.start_date, leave.end_date)}
                  </td>
                  <td className="px-4 py-3 capitalize">{leave.leave_type}</td>
                  <td className="px-4 py-3">{leave.purpose}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-medium capitalize ${
                        leave.status === "approved"
                          ? "text-green-600"
                          : leave.status === "denied"
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    {leave.status === "pending" && (
                      <>
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded"
                          onClick={() => handleAction(leave.leave_id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
                          onClick={() => handleAction(leave.leave_id, "denied")}
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

};

export default ApproveLeave;
