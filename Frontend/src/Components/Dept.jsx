
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Dept = () => {

    const [dept, setDept] = useState([])

    useEffect(()=> {
        axios.get(`${import.meta.env.VITE_API_URL}/auth/dept`)
        .then(result => {
            if(result.data.Status) {
                setDept(result.data.Result);
            } else {
                alert(result.data.Error)
            }
        }).catch(err => console.log(err))
    }, [])
  return (
    <div className='px-5 mt-3'>
        <div className='d-flex justify-content-center'>
            <h3>Department List</h3>
        </div>
        <Link to="/dashboard/add_dept" className='btn btn-success'>Add Department</Link>
        <div className='mt-3'>
            <table className='table'>
                <thead>
                    <tr>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        dept.map(d => (
                            <tr>
                                <td>{d.name}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>

    </div>
  )
}

export default Dept;
