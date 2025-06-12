import React, { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import axios from "axios";

import Sidebar from "./Sidebar";

const EmployeeDashboard = () => {
  const [employee, setEmployee] = useState({});

  useEffect(() => {
    const id = localStorage.getItem("employee_id");
    axios.get(`http://localhost:3000/employee/${id}`).then((res) => {
      if (res.data.Status) setEmployee(res.data.Result);
    });
  }, []);

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        <Sidebar role="employee" employee={employee} />
        <div className="col p-0 m-0 main-content-scroll">
          <div className="p-2 d-flex justify-content-center shadow">
            <h4>Employee Self Service</h4>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};


export default EmployeeDashboard;