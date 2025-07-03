import axios from "axios";
import React, { useEffect, useState } from "react";

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

const SetSalary = () => {
  const [employee, setEmployee] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [visibleDropdown, setVisibleDropdown] = useState(null);
  const [editingSalaryId, setEditingSalaryId] = useState(null);
  const [salaryInput, setSalaryInput] = useState("");

  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const totalDaysInMonth = getDaysInMonth(year, month);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/auth/employee`)
      .then((res) => {
        if (res.data.Status) setEmployee(res.data.Result);
        else alert(res.data.Error);
      });
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      const data = {};
      for (const e of employee) {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/hr/attendance/present/${e.id}/${month}`
          );
          if (res.data.Status) {
            data[e.id] = res.data.Result.length;
          }
        } catch (err) {
          console.error("Error fetching attendance", e.id, err);
        }
      }
      setAttendance(data);
    };

    if (employee.length > 0) fetchAttendance();
  }, [employee, month]);

  const toggleDropdown = (id) => {
    setVisibleDropdown(visibleDropdown === id ? null : id);
  };

  const toggleEditForm = (id, currentSalary) => {
    if (editingSalaryId === id) {
      setEditingSalaryId(null);
      setSalaryInput("");
    } else {
      setEditingSalaryId(id);
      setSalaryInput(currentSalary); // prefill with current salary
    }
  };

  const handleSalaryUpdate = async (id) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/hr/update_salary/${id}`, {
        salary: salaryInput,
      });

      if (res.data.Status) {
        alert("Salary updated");
        setEditingSalaryId(null);
        setSalaryInput("");
        // Refetch employees
        const result = await axios.get(`${import.meta.env.VITE_API_URL}/auth/employee`);
        if (result.data.Status) setEmployee(result.data.Result);
      } else {
        alert("Error: " + res.data.Error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update salary");
    }
  };

  return (
    <div className="px-8 mt-6">
      <h3 className="text-center text-2xl font-semibold mb-6">Employee Salary Details</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-md">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Designation</th>
              <th className="px-4 py-2 text-left">YoE</th>
              <th className="px-4 py-2 text-left">Attendance</th>
              <th className="px-4 py-2 text-left">Gross Salary</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employee.map((e) => {
              const presentDays = attendance[e.id] || 0;
              const base = Number(e.salary || 0);
              const basic = base * (presentDays / totalDaysInMonth);
              const hra = basic * 0.4;
              const da = basic * 0.1;
              const bonus = basic * 0.1;
              const gross = basic + hra + da + bonus;

              return (
                <React.Fragment key={e.id}>
                  <tr className="border-b">
                    <td className="px-4 py-2">{e.id}</td>
                    <td className="px-4 py-2">{e.name}</td>
                    <td className="px-4 py-2">{e.designation}</td>
                    <td className="px-4 py-2">{e.experience}</td>
                    <td className="px-4 py-2">{presentDays} / {totalDaysInMonth}</td>
                    <td className="px-4 py-2 font-medium">₹ {gross.toFixed(0)}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => toggleDropdown(e.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        {visibleDropdown === e.id ? "Hide" : "View"}
                      </button>
                      <button
                        onClick={() => toggleEditForm(e.id, e.salary)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        {editingSalaryId === e.id ? "Cancel" : "Edit"}
                      </button>
                    </td>
                  </tr>

                  {/* Salary breakdown dropdown */}
                  {visibleDropdown === e.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="px-6 py-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-800">
                          <div><strong>Actual Basic:</strong> ₹ {base}</div>
                          <div><strong>Basic (adjusted):</strong> ₹ {basic.toFixed(1)}</div>
                          <div><strong>HRA (40%):</strong> ₹ {hra.toFixed(1)}</div>
                          <div><strong>DA (10%):</strong> ₹ {da.toFixed(1)}</div>
                          <div><strong>Bonus (10%):</strong> ₹ {bonus.toFixed(1)}</div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Salary Edit Form */}
                  {editingSalaryId === e.id && (
                    <tr className="bg-yellow-50">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                          <label className="text-sm font-medium text-gray-700">
                            New Basic Salary:
                          </label>
                          <input
                            type="number"
                            className="border border-gray-300 rounded px-3 py-1 w-40"
                            value={salaryInput}
                            onChange={(e) => setSalaryInput(e.target.value)}
                            step = "1000"
                          />
                          <button
                            onClick={() => handleSalaryUpdate(e.id)}
                            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                          >
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SetSalary;
