import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Start = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/verify`)
      .then(result => {
        if (result.data.Status) {
          navigate('/');
        }
      }).catch(err => console.log(err));
  }, [navigate]);

  const handleScroll = () => setShowLogin(true);
  const handleClick = () => setShowLogin(true);

  return (
    <div 
      className="min-h-screen flex flex-col transition-all duration-700 ease-in-out"
      onWheel={handleScroll}
    >
      {/* Welcome Section */}
      <section className="flex-1 bg-gradient-to-br from-blue-500 to-teal-400 text-white flex flex-col justify-center items-center text-center px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          Welcome to Employee Management System
        </h1>
        <button
          onClick={handleClick}
          className="text-3xl animate-bounce hover:scale-125 transition-transform duration-300"
          aria-label="Show Login"
        >
          ▼
        </button>
      </section>

      {/* Login Section */}
      <section className={`overflow-hidden transition-all duration-700 ${showLogin ? "max-h-96 py-10" : "max-h-0"} bg-gray-100`}>
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Login As</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/employee_login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-300"
            >
              Employee
            </button>
            <button
              onClick={() => navigate('/hr_login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-300"
            >
              Human Resource
            </button>
            <button
              onClick={() => navigate('/adminlogin')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-300"
            >
              Admin
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Start;
