import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

const Leave = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [type, setType] = useState("casual");
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch leave history on mount and after applying
  const fetchLeaves = async () => {
  setLoading(true);
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/employee/leave/history`,
      { withCredentials: true }
    );
    
    // Handle both cases:
    if (res.data.Status) {
      setLeaves(res.data.Result || []); // Ensure array even if undefined
    } else {
      setLeaves([]);
    }
  } catch (err) {
    setLeaves([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !purpose) {
      setMessage("Please fill in all fields.");
      return;
    }
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/employee/apply_leave`,
        {
          start_date: startDate.toISOString().slice(0, 10),
          end_date: endDate.toISOString().slice(0, 10),
          leave_type: type,
          purpose,
        },
        { withCredentials: true }
      );
      if (res.data.Status) {
        setMessage("Leave application submitted successfully!");
        setStartDate(null);
        setEndDate(null);
        setType("casual");
        setPurpose("");
        fetchLeaves(); // Refresh leave history
      } else {
        setMessage(res.data.Error || "Failed to apply for leave.");
      }
    } catch (err) {
      setMessage("Failed to apply for leave.");
    }
  };

  // Calculate duration in days (inclusive)
  const getDuration = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Capitalize first letter
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
  <div className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
    <h3 className="text-2xl font-semibold text-center mb-6">Apply for Leave</h3>
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Start Date */}
      <div>
        <label className="block font-medium mb-1">Start Date</label>
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          dateFormat="yyyy-MM-dd"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholderText="Select start date"
          minDate={new Date()}
          required
        />
      </div>

      {/* End Date */}
      <div>
        <label className="block font-medium mb-1">End Date</label>
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          dateFormat="yyyy-MM-dd"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholderText="Select end date"
          minDate={startDate || new Date()}
          required
        />
      </div>

      {/* Leave Type */}
      <div>
        <label className="block font-medium mb-1">Type of Leave</label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={type}
          onChange={e => setType(e.target.value)}
          required
        >
          <option value="casual">Casual</option>
          <option value="sick">Sick</option>
          <option value="vacation">Vacation</option>
        </select>
      </div>

      {/* Purpose */}
      <div>
        <label className="block font-medium mb-1">Purpose of Leave</label>
        <textarea
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={purpose}
          onChange={e => setPurpose(e.target.value)}
          rows={3}
          placeholder="Enter purpose"
          required
        />
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-lg font-medium"
        >
          Apply
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="text-center text-blue-600 mt-4">{message}</div>
      )}
    </form>

    {/* Leave History Table */}
    <div className="mt-10">
      <h4 className="text-xl font-semibold text-center mb-4">Leave History</h4>
      {loading ? (
        <div className="text-center text-gray-600">Loading leave history...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
              <tr>
                <th className="px-4 py-2 border-b">Leave ID</th>
                <th className="px-4 py-2 border-b">Type</th>
                <th className="px-4 py-2 border-b">Start Date</th>
                <th className="px-4 py-2 border-b">End Date</th>
                <th className="px-4 py-2 border-b">Duration</th>
                <th className="px-4 py-2 border-b">Purpose</th>
                <th className="px-4 py-2 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-4">
                    No leave applications found.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.leave_id} className="text-sm text-gray-800">
                    <td className="px-4 py-2 border-b">{leave.leave_id}</td>
                    <td className="px-4 py-2 border-b">{capitalize(leave.leave_type)}</td>
                    <td className="px-4 py-2 border-b">{leave.start_date}</td>
                    <td className="px-4 py-2 border-b">{leave.end_date}</td>
                    <td className="px-4 py-2 border-b">{getDuration(leave.start_date, leave.end_date)}</td>
                    <td className="px-4 py-2 border-b">{leave.purpose}</td>
                    <td className="px-4 py-2 border-b">
                      <span
                        className={`font-medium ${
                          leave.status === "approved"
                            ? "text-green-600"
                            : leave.status === "denied"
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {capitalize(leave.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
);

};

export default Leave;
