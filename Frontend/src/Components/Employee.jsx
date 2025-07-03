import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Employee = () => {
  const [employee, setEmployee] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/auth/employee`)
      .then((result) => {
        if (result.data.Status) {
          setEmployee(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, []);

const handleDelete = (id) => {
  axios
    .delete(`${import.meta.env.VITE_API_URL}/auth/delete_employee/${id}`)
    .then((result) => {
      if (result.data.Status) {
        // Remove the deleted employee from the state without reloading the page
        setEmployee((prev) => prev.filter((emp) => emp.id !== id));
        alert("Employee deleted successfully.");
      } else {
        alert(result.data.Error || "Deletion failed.");
      }
    })
    .catch((error) => {
      if (error.response) {
        // Server responded with an error
        const details = error.response.data?.Details;
        const errMsg = error.response.data?.Error || error.response.data?.message || "Server error during deletion.";
        alert(details ? `${errMsg}: ${details}` : errMsg);
        console.error("Delete error details:", error.response.data);
      } else if (error.request) {
        // No response received from server
        alert("Network error: No response from server.");
        console.error("No response:", error.request);
      } else {
        // Error setting up the request
        alert("Request error: " + error.message);
        console.error("Request setup error:", error.message);
      }
    });
};

  return (
    <div className="px-5 mt-3">
      <div className="d-flex justify-content-center">
        <h3>Employee List</h3>
      </div>
      <Link to="/dashboard/add_employee" className="btn btn-success mb-3">
        Add Employee
      </Link>
      <div className="mt-3">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Image</th>
              <th>Email</th>
              <th>Address</th>
              <th>Salary</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {employee.map((e) => (
              <tr key={e.id}>
                <td>{e.name}</td>
                <td>
                  <img
                    src={`${import.meta.env.VITE_API_URL}/Images/${e.image}`}
                    className="employee_image"
                    alt={e.name}
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                </td>
                <td>{e.email}</td>
                <td>{e.address}</td>
                <td>{e.salary}</td>
                <td>
                  {/* View Button */}
                  <Link
                    to={`/employee_dashboard/employee_detail/${e.id}`}
                    className="btn btn-success btn-sm me-2"
                  >
                    View
                  </Link>
                  {/* Edit Button */}
                  <Link
                    to={`/employee_dashboard/edit_employee/${e.id}`}
                    className="btn btn-info btn-sm me-2"
                  >
                    Edit
                  </Link>
                  {/* Delete Button */}
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleDelete(e.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {employee.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Employee;
