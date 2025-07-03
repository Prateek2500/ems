import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";

const Sidebar = ({ role, employee }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (role === "admin") {
      // For admin logout
      axios.get(`${import.meta.env.VITE_API_URL}/auth/logout`).then((result) => {
        if (result.data.Status) {
          localStorage.removeItem("valid");
          navigate("/");
        }
      });
    } else if (role == "employee") {
      
      localStorage.removeItem("valid");
      localStorage.removeItem("employee_id");
      navigate("/");
    }
    else if (role == "HR") {
      localStorage.removeItem("valid");
      localStorage.removeItem("hr_id");
      navigate("/");
    }
  };

  let sidebarContent;

  if (role === "admin") {
    sidebarContent = (
      <>
        <Link
          to="/dashboard"
          className="d-flex align-items-center pb-3 mb-md-1 mt-md-3 me-md-auto text-white text-decoration-none"
        >
          <span className="fs-5 fw-bolder d-none d-sm-inline">HRMS</span>
        </Link>
        <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start w-100">
          <li className="w-100">
            <Link to="/dashboard" className="nav-link text-white px-0 align-middle">
              <i className="fs-4 bi-speedometer2 ms-2"></i>
              <span className="ms-2 d-none d-sm-inline">Dashboard</span>
            </Link>
          </li>
          <li className="w-100">
            <Link to="/dashboard/employee" className="nav-link text-white px-0 align-middle">
              <i className="fs-4 bi-people ms-2"></i>
              <span className="ms-2 d-none d-sm-inline">Manage Employees</span>
            </Link>
          </li>
          <li className="w-100">
            <Link to="/dashboard/dept" className="nav-link text-white px-0 align-middle">
              <i className="fs-4 bi-columns ms-2"></i>
              <span className="ms-2 d-none d-sm-inline">Department</span>
            </Link>
          </li>
          
          <li className="w-100">
            <Link to="/dashboard/leave" className="nav-link text-white px-0 align-middle">
              <i className="fs-4 bi-person ms-2"></i>
              <span className="ms-2 d-none d-sm-inline">Leave</span>
            </Link>
          </li>
          <li className="w-100">
            <Link to="/dashboard/projects" className="nav-link text-white px-0 align-middle">
              <i className="fs-4 bi-person ms-2"></i>
              <span className="ms-2 d-none d-sm-inline">Projects</span>
            </Link>
          </li>
        </ul>
      </>
    );
  } else  if (role == "employee"){
    sidebarContent = (
      <>
        <div className="text-center w-100 py-4">
          {employee?.image && (
            <span
              style={{ cursor: "pointer", display: "inline-block" }}
              onClick={() => navigate(`/employee_dashboard/employee_detail/${employee.id}`)}
              title="View Profile"
            >
              <img
                src={`${import.meta.env.VITE_API_URL}/Images/${employee.image}`}
                alt="Profile"
                className="img-fluid rounded-circle mb-3"
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
            </span>
          )}
          <br />
          <small className="text-white">Name: {employee?.name}</small>
          <br />
          <small className="text-white">Employee ID: {employee?.id}</small>
        </div>
        <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start w-100">
          <li className="w-100">
            <span
              className="nav-link text-white px-0 align-middle"
              role="button"
              onClick={() => navigate(`/employee_dashboard/edit_employee/${employee.id}`)}
            >
              <i className="fs-4 bi-speedometer2 ms-2"></i>
              <span className="ms-2 d-none d-sm-inline">Edit Profile</span>
            </span>
          </li>
          <li className="w-100">
            <span
              className="nav-link text-white px-0 align-middle"
              role="button"
              onClick={() => navigate('/employee_dashboard/attendance')}
            >
              <i className="fs-4 bi-person-check ms-2"></i>
              <span className="ms-2 d-none d-sm-inline">Attendance</span>
            </span>
          </li>
        </ul>
      </>
    );
  }

  else  if (role == "HR"){
    sidebarContent = (
      <>
        <div className="text-center w-100 py-4">
          {employee?.image && (
            <span
              style={{ cursor: "pointer", display: "inline-block" }}
              onClick={() => navigate(`/hr_dashboard/hr_detail/${employee.id}`)}
              title="View Profile"
            >
              <img
                src={`${import.meta.env.VITE_API_URL}/Images/${employee.image}`}
                alt="Profile"
                className="img-fluid rounded-circle mb-3"
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
            </span>
          )}
          <br />
          <small className="text-white">Name: {employee?.name}</small>
          <br />
          <small className="text-white">Employee ID: {employee?.id}</small>
        </div>
        <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start w-100">
          <li className="w-100">
            <span
              className="nav-link text-white px-0 align-middle"
              role="button"
              onClick={() => navigate(`/hr_dashboard/setSalary`)}
            >
              <i className="fs-4 bi-speedometer2 ms-2"></i>
              <span className="ms-2 d-none d-sm-inline">Edit Salary</span>
            </span>
          </li>

          <li className="w-100">
            <span
              className="nav-link text-white px-0 align-middle"
              role="button"
              onClick={() => navigate('/hr_dashboard/attendance')}
            >
              <i className="fs-4 bi-person-check ms-2"></i>
              <span className="ms-2 d-none d-sm-inline">Attendance</span>
            </span>
          </li>

        
        </ul>
      </>
    );
  }

  return (
    <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark sidebar-sticky">
      <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
        {sidebarContent}
        <div className="mt-auto w-100">
          <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start w-100">
            <li className="w-100" onClick={handleLogout}>
              <span className="nav-link text-white px-0 align-middle" role="button">
                <i className="fs-4 bi-power ms-2"></i>
                <span className="ms-2 d-none d-sm-inline">Logout</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

};

export default Sidebar;