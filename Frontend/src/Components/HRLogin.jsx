import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const HRLogin = () => {
  const [values, setValues] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  axios.defaults.withCredentials = true

  const handleSubmit = (event) => {
    event.preventDefault()
    
    axios.post(`${import.meta.env.VITE_API_URL}/hr/HR_login`, values)
      .then(result => {
        if (result.data.loginStatus) {
            
          localStorage.setItem("valid", true)
          
          localStorage.setItem("hr_id", result.data.id)
          navigate('/hr_dashboard/hr_detail/' + result.data.id)
        } else {
          setError(result.data.Error)
        }
      })
      .catch(err => console.log(err))
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-500 to-teal-400">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        {error && (
          <div className="text-sm text-red-600 mb-4 text-center">{error}</div>
        )}
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          HR Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              autoComplete="off"
              placeholder="Enter Email"
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              onChange={(e) => setValues({ ...values, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition duration-300 mb-3"
          >
            Log in
          </button>

          <div className="flex items-center justify-center text-xs text-gray-600">
            <input type="checkbox" id="tick" className="mr-2" />
            <label htmlFor="tick">You agree with the terms & conditions</label>
          </div>
        </form>
      </div>
    </div>
  )
}

export default HRLogin
