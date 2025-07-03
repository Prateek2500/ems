import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const editableFields = [
  { label: "Name", value: "name" },
  { label: "Email", value: "email" },
  { label: "Address", value: "address" },
  { label: "Department", value: "dept_id" },
  { label: "Age", value: "age" },
  { label: "Gender", value: "gender" },
  // Add more fields as needed
];

const EditEmployee = () => {
  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    address: "",
    dept_id: "",
    age: "",
    gender: "",
    // Add more fields as needed
  });

  const [originalEmployee, setOriginalEmployee] = useState({});
  const [dept, setDept] = useState([]);
  const [selectedField, setSelectedField] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    // Fetch departments
    axios.get(`${import.meta.env.VITE_API_URL}/auth/dept`)
      .then((result) => {
        if (result.data.Status) {
          setDept(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));

    // Fetch employee data
    axios.get(`${import.meta.env.VITE_API_URL}/auth/get_employee/` + id)
      .then((result) => {
        setEmployee(result.data.Result[0]);
        setOriginalEmployee(result.data.Result[0]);
      })
      .catch((err) => console.log(err));
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedField) {
      alert("Please select a field to edit.");
      return;
    }
    if (employee[selectedField] === originalEmployee[selectedField]) {
      alert("No changes detected.");
      return;
    }
    const changedField = { [selectedField]: employee[selectedField] };

    axios
      .put(`${import.meta.env.VITE_API_URL}/auth/edit_employee/` + id, changedField)
      .then((result) => {
        if (result.data.Status) {
          navigate(`/employee_dashboard/employee_detail/${id}`);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  };

  const handleFieldChange = (e) => {
    setSelectedField(e.target.value);
  };

  const handleInputChange = (e) => {
    setEmployee({ ...employee, [selectedField]: e.target.value });
  };

  return (
  <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow-md">
    <h3 className="text-2xl font-semibold text-center mb-6">Edit Employee</h3>

    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Field Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Field to Edit</label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
          value={selectedField}
          onChange={handleFieldChange}
        >
          <option value="">-- Select Field --</option>
          {editableFields.map((field) => (
            <option key={field.value} value={field.value}>
              {field.label}
            </option>
          ))}
        </select>
      </div>

      {/* Dynamic Input Field */}
      {selectedField && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {editableFields.find((f) => f.value === selectedField)?.label}
          </label>

          {selectedField === "dept_id" ? (
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
              value={employee.dept_id}
              onChange={handleInputChange}
            >
              <option value="">-- Select Department --</option>
              {dept.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          ) : selectedField === "gender" ? (
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
              value={employee.gender}
              onChange={handleInputChange}
            >
              <option value="">-- Select Gender --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <input
              type={selectedField === "age" ? "number" : "text"}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
              value={employee[selectedField] || ""}
              onChange={handleInputChange}
            />
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="text-center">
        <button
          type="submit"
          disabled={!selectedField}
          className={`px-6 py-2 rounded text-white font-semibold transition 
            ${!selectedField ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          Update
        </button>
      </div>
    </form>
  </div>
);

};

export default EditEmployee;
