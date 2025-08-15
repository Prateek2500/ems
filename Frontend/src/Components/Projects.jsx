import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Projects = () => {
    const [projects, setProjects] = useState([])

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/auth/projects`)
            .then(result => {
                if (result.data.Status) {
                    setProjects(result.data.Result)
                } else {
                    alert(result.data.Error)
                }
            }).catch(err => console.log(err))
    }, [])

    return (
        <div className='px-6 py-4'>
            <div className='flex justify-between items-center mb-6'>
                <h3 className='text-2xl font-semibold text-gray-800'>Project List</h3>
                <Link to="/dashboard/add_projects" className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow'>
                    Add Project
                </Link>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className='min-w-full table-auto border-collapse text-sm text-gray-700'>
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className='px-4 py-3 text-left font-medium'>Name</th>
                            <th className='px-4 py-3 text-left font-medium'>Description</th>
                            <th className='px-4 py-3 text-left font-medium'>Start Date</th>
                            <th className='px-4 py-3 text-left font-medium'>End Date</th>
                            <th className='px-4 py-3 text-left font-medium'>Status</th>
                            <th className='px-4 py-3 text-left font-medium'>Department</th>
                            <th className='px-4 py-3 text-left font-medium'>Manager</th>
                            <th className='px-4 py-3 text-left font-medium'>Client</th>
                            <th className='px-4 py-3 text-left font-medium'>Budget</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            projects.map(project => (
                                <tr key={project.project_id} className="border-b hover:bg-gray-50">
                                    <td className='px-4 py-2'>{project.name}</td>
                                    <td className='px-4 py-2'>{project.description}</td>
                                    <td className='px-4 py-2'>{project.start_date}</td>
                                    <td className='px-4 py-2'>{project.end_date || '—'}</td>
                                    <td className='px-4 py-2'>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold
                                            ${project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                    project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                                                        project.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'}
                                        `}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className='px-4 py-2'>{project.dept_name || '—'}</td>
                                    <td className='px-4 py-2'>{project.manager_name || '—'}</td>
                                    <td className='px-4 py-2'>{project.client_name || '—'}</td>
                                    <td className='px-4 py-2'>₹{project.budget?.toLocaleString() || '—'}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Projects;
