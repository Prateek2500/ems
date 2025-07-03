import React, { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import axios from "axios";

import Sidebar from "./Sidebar";

const HRDashboard = () => {
  const [employee, setEmployee] = useState({});

  useEffect(() => {
    const id = localStorage.getItem("hr_id");
    axios.get(`${import.meta.env.VITE_API_URL}/employee/${id}`).then((res) => {
      if (res.data.Status) setEmployee(res.data.Result);
    });
  }, []);

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        <Sidebar role="HR" employee={employee} />
        <div className="col p-0 m-0 main-content-scroll">
          <div className="p-2 d-flex justify-content-center shadow">
            <h4>HR Self Service</h4>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};


export default HRDashboard;
