import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AddDept = () => {
    const [dept, setDept] = useState()
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        axios.post(`${import.meta.env.VITE_API_URL}/auth/add_dept`, {dept})
        .then(result => {
            if(result.data.Status) {
                navigate('/dashboard/dept')
            } else {
                alert(result.data.Error)
            }
        })
        .catch(err => console.log(err))
    }
  return (
    <div className='d-flex justify-content-center align-items-center h-75'>
        <div className='p-3 rounded w-25 border'>
            <h2>Add Department</h2>
            <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                    <label htmlFor="dept"><strong>Department:</strong></label>
                    <input type="text" name='dept' placeholder='Enter Department'
                     onChange={(e) => setDept(e.target.value)} className='form-control rounded-0'/>
                </div>
                <button className='btn btn-success w-100 rounded-0 mb-2'>Add Department</button>
            </form>
        </div>
    </div>
  )
}

export default AddDept;