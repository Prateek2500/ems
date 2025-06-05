import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EmployeeDetail = () => {
  const [employee, setEmployee] = useState(null);
  const [dept, setDept] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:3000/auth/employee/${id}`)
      .then(result => {
        if (result.data.Status && result.data.Result) {
          setEmployee(result.data.Result);
          // Fetch department name
          axios.get('http://localhost:3000/auth/dept')
            .then(deptResult => {
              if (deptResult.data.Status) {
                const department = deptResult.data.Result.find(
                  d => d.id === result.data.Result.dept_id
                );
                setDept(department?.name || '');
              }
            });
        }
      })
      .catch(err => console.log(err));
  }, [id]);

  const handleLogout = () => {
    axios.get('http://localhost:3000/auth/logout')
      .then(result => {
        if (result.data.Status) {
          localStorage.removeItem("valid");
          navigate('/');
        }
      }).catch(err => console.log(err));
  };

  if (!employee) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container">
      <div className='d-flex justify-content-center flex-column align-items-center mt-3'>
        {employee.image ? (
          <img
            src={`http://localhost:3000/Images/${employee.image}`}
            className='emp_det_image rounded-circle'
            alt="Employee"
            style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "50%" }}
          />
        ) : (
          <div className='emp_det_image placeholder-image' style={{
            width: "120px", height: "120px", borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span>No Image</span>
          </div>
        )}

        <div className='w-75 mt-4'>
          {/* Personal Details Card */}
          <div className='card shadow mb-4'>
            <div className='card-header bg-primary text-white'>
              <h4>Personal Details</h4>
            </div>
            <div className='card-body row'>
              <div className='col-md-6'>
                <p><strong>ID:</strong> {employee.id}</p>
                <p><strong>Name:</strong> {employee.name}</p>
                <p><strong>Email:</strong> {employee.email}</p>
                <p><strong>Age:</strong> {employee.age}</p>
                <p><strong>Gender:</strong> {employee.gender}</p>
              </div>
              <div className='col-md-6'>
                <p><strong>Salary:</strong> ₹{employee.salary}</p>
                <p><strong>Address:</strong> {employee.address}</p>
                <p><strong>Department:</strong> {dept}</p>
              </div>
            </div>
          </div>

          {/* Bank Details Card */}
          <div className='card shadow mb-4'>
            <div className='card-header bg-success text-white'>
              <h4>Bank Details</h4>
            </div>
            <div className='card-body row'>
              <div className='col-md-6'>
                <p><strong>Account Number:</strong> {employee.account_no}</p>
                <p><strong>Bank Name:</strong> {employee.bank_name}</p>
              </div>
              <div className='col-md-6'>
                <p><strong>Branch:</strong> {employee.branch}</p>
              </div>
            </div>
          </div>

          {/* Education Details Card */}
          <div className='card shadow mb-4'>
            <div className='card-header bg-info text-white'>
              <h4>Education Details</h4>
            </div>
            <div className='card-body row'>
              <div className='col-md-6'>
                <p><strong>University:</strong> {employee.university}</p>
                <p><strong>Degree:</strong> {employee.degree || "N/A"}</p>
                <p><strong>Branch:</strong> {employee.edu_branch || "N/A"}</p>
              </div>
              <div className='col-md-6'>
                <p><strong>Grade:</strong> {employee.grade || "N/A"}</p>
                <p><strong>Year of Passing:</strong> {employee.yop}</p>
              </div>
            </div>
          </div>

          {/* Emergency Contacts Card */}
          <div className='card shadow mb-4'>
            <div className='card-header bg-warning text-dark'>
              <h4>Emergency Contacts</h4>
            </div>
            <div className='card-body row'>
              <div className='col-md-6'>
                <p><strong>Father's Name:</strong> {employee.father_name || "N/A"}</p>
                <p><strong>Mother's Name:</strong> {employee.mother_name || "N/A"}</p>
              </div>
              <div className='col-md-6'>
                <p><strong>Emergency Contact:</strong> {employee.emergency_contact}</p>
              </div>
            </div>
          </div>
        </div>

        <div className='mb-4'>
          <button
            className='btn btn-primary me-2'
            onClick={() => navigate(`/employee_dashboard/edit_employee/${id}`)}
          >
            Edit Profile
          </button>
          <button className='btn btn-danger' onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
