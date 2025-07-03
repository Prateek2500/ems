import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Helper: Get YYYY-MM-DD string in IST
function getISTDateString(date) {
  return date
    ? date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
    : '';
}

function AttendanceTab() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/dept`, {
          withCredentials: true
        });
        if (response.data.Status) {
          setDepartments(response.data.Result);
        }
      } catch (err) {
        setError('Failed to load departments');
      }
    };
    fetchDepartments();
  }, []);

  // Fetch employees and attendance when department changes
  useEffect(() => {
    const fetchData = async () => {
      if (selectedDept) {
        try {
          setLoading(true);
          setError('');
          setEmployees([]);
          setAttendance([]);

          const [employeesRes, attendanceRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/auth/employee/dept/${selectedDept}`, {
              withCredentials: true
            }),
            axios.get(`${import.meta.env.VITE_API_URL}/auth/attendance/dept/${selectedDept}`, {
              withCredentials: true
            })
          ]);

          if (employeesRes.data.Status) {
            setEmployees(employeesRes.data.Result);
          } else {
            setError('Failed to load employees');
          }

          if (attendanceRes.data.Status) {
            setAttendance(attendanceRes.data.Result);
          } else {
            setError('Failed to load attendance records');
          }

        } catch (err) {
          setError(err.response?.data?.Error || 'Failed to load data');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [selectedDept]);

  // Combine employee data with attendance for selected date (in IST)
  const getAttendanceForDate = () => {
    if (!selectedDate) return [];
    const targetDateIST = getISTDateString(selectedDate);

    return employees.map(employee => {
      const record = attendance.find(a =>
        a.employee_id === employee.id &&
        getISTDateString(new Date(a.attendance_date)) === targetDateIST
      );
      return {
        ...employee,
        status: record ? record.status : 'Not Marked'
      };
    });
  };

  return (
  <div className="max-w-4xl mx-auto p-6">
    <h2 className="text-2xl font-semibold mb-6 text-gray-800">Department Attendance</h2>

    {/* Department Selection */}
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-1">Select Department:</label>
      <select
        value={selectedDept}
        onChange={(e) => {
          setSelectedDept(e.target.value);
          setSelectedDate(null);
        }}
        disabled={loading}
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
      >
        <option value="">Select Department</option>
        {departments.map((dept) => (
          <option key={dept.id} value={dept.id}>
            {dept.name}
          </option>
        ))}
      </select>
    </div>

    {/* Date Picker */}
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-1">Select Date:</label>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="dd-MMM-yyyy"
        isClearable
        placeholderText="Choose date"
        disabled={!selectedDept || loading}
        maxDate={new Date()}
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
      />
    </div>

    {/* Error Message */}
    {error && <div className="text-red-500 mb-4">{error}</div>}

    {/* Attendance Table */}
    {loading ? (
      <div className="text-center text-gray-600">Loading...</div>
    ) : (
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full border border-gray-200 shadow-sm rounded">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Employee</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {!selectedDate ? (
              <tr>
                <td colSpan={2} className="text-center px-4 py-4 text-gray-500">
                  Select a date to view attendance
                </td>
              </tr>
            ) : getAttendanceForDate().length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center px-4 py-4 text-gray-500">
                  No attendance records for this date
                </td>
              </tr>
            ) : (
              getAttendanceForDate().map((employee, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">{employee.name}</td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      employee.status === "Present"
                        ? "text-green-600"
                        : employee.status === "Absent"
                        ? "text-red-500"
                        : "text-gray-600"
                    }`}
                  >
                    {employee.status}
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

}

export default AttendanceTab;
