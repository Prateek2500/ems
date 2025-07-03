import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";

const AddEmployee = () => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1970 + 1 }, (_, index) => 1970 + index);

  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    password: "",
   
    address: "",
    dept_id: "",
    designation: "",      
    experience: "",       
    image: "",
    dob: "",
    age: "",
    gender: "",
    account_no: "",
    bank_name: "",
    branch: "",
    university: "",
    degree: "",
    edu_branch: "",
    gradepoint: "",
    yop: "",
    father_name: "",
    mother_name: "",
    emergency_contact: "",
    alternate_contact: "", // Added for Emergency Contacts
    aadhar_number: "",
    pan_number: ""
  });

  const [dept, setDept] = useState([]);
  const [isAgeValid, setIsAgeValid] = useState(true);
  const navigate = useNavigate();

  // Fetch department list
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/auth/dept`)
      .then(res => {
        if (res.data.Status) setDept(res.data.Result);
      })
      .catch(err => console.log(err));
  }, []);

  const calculateAge = (dob) => {
    const dobDate = new Date(dob);
    if (isNaN(dobDate)) {
      // If dobDate is invalid, return null or handle the error appropriately
      console.error('Invalid Date of Birth');
      return '';
    }
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();

    if(m < 0 || (m == 0 && today.getDate() < dobDate.getDate()))
        age--;
    return age;
  }

  useEffect(() => {
      if(employee.dob){
        const theAge = calculateAge(employee.dob);
        setEmployee((prevState) => ({
          ...prevState,
          age: theAge
        }));
        if (theAge < 18 || theAge > 60) {
        setIsAgeValid(false);
      } else {
        setIsAgeValid(true);
      }
      }
  },[employee.dob]);
  // Handle image upload
  const handleImage = (e) => {
    setEmployee({ ...employee, image: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!employee.dept_id) {
      alert("Please select a department.");
      return;
    }
    if (!employee.aadhar_number) {
      alert("Aadhar number is required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", employee.name);
    formData.append("email", employee.email);
    formData.append("password", employee.password);
    formData.append("address", employee.address);
    formData.append("image", employee.image);
    formData.append("dept_id", Number(employee.dept_id));
    formData.append("designation", employee.designation); // Office Details
    formData.append("experience", employee.experience);   // Office Details
    formData.append("age", employee.age);
    formData.append("gender", employee.gender);
    formData.append("account_no", employee.account_no);
    formData.append("bank_name", employee.bank_name);
    formData.append("branch", employee.branch);
    formData.append("university", employee.university);
    formData.append("degree", employee.degree);
    formData.append("edu_branch", employee.edu_branch);
    formData.append("gradepoint", employee.gradepoint);
    formData.append("yop", employee.yop);
    formData.append("dob", employee.dob);


    // Optional fields: send as "" if blank
    formData.append("father_name", employee.father_name || "");
    formData.append("mother_name", employee.mother_name || "");
    formData.append("pan_number", employee.pan_number || "");

    formData.append("emergency_contact", employee.emergency_contact);
    formData.append("alternate_contact", employee.alternate_contact); // Emergency Contacts
    formData.append("aadhar_number", employee.aadhar_number);

    axios
      .post(`${import.meta.env.VITE_API_URL}/auth/add_employee`, formData)
      .then((result) => {
        if (result.data.Status) {
          navigate("/dashboard/employee");
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  };

return (
  <div className="flex justify-center items-center mt-4" >
    <div className="p-4 rounded w-100" style={{ maxWidth: "1200px" }}>
      <h3 className="text-center mb-4">Add Employee</h3>
      <form className="flex flex-wrap -mx-2 items-start" onSubmit={handleSubmit} encType="multipart/form-data">

        {/* Personal Details */}
        <div className="w-full md:w-1/2 px-2 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-secondary text-white">Personal Details</div>
            <div className="card-body">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-xl" required value={employee.name}
                  onChange={(e) => setEmployee({ ...employee, name: e.target.value })} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-xl" required value={employee.email}
                  onChange={(e) => setEmployee({ ...employee, email: e.target.value })} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-xl" required value={employee.password}
                  onChange={(e) => setEmployee({ ...employee, password: e.target.value })} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-xl" required value={employee.address}
                  onChange={(e) => setEmployee({ ...employee, address: e.target.value })} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white" required value={employee.dept_id}
                  onChange={(e) => setEmployee({ ...employee, dept_id: e.target.value })}>
                  <option value="">Select Department</option>
                  {dept.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                <input type="file" className="w-full px-3 py-2 border border-gray-300 rounded-xl" accept="image/*" onChange={handleImage} />
              </div>
              <div className="flex flex-wrap -mx-2">
                <div className="w-full md:w-1/2 px-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-xl" value={employee.dob}
                    onChange={(e) => setEmployee({ ...employee, dob: e.target.value })} />
                </div>
                <div className="w-full md:w-1/2 px-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-xl" disabled
                    value={employee.age !== undefined && employee.age !== null ? employee.age : ''} />
                  {!isAgeValid && (
                    <div className="text-danger">Age must be between 18 and 60.</div>
                  )}
                </div>
                <div className="w-full md:w-1/2 px-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white" value={employee.gender}
                    onChange={(e) => setEmployee({ ...employee, gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="w-full md:w-1/2 px-2 mb-4  " >
          <div className="card shadow-sm h-auto">
            <div className="card-header bg-secondary text-white">Bank Details</div>
            <div className="card-body">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-xl" pattern="[0-9]{9,18}"
                  value={employee.account_no}
                  onChange={(e) => setEmployee({ ...employee, account_no: e.target.value })} />
              </div>
              <div className="flex flex-wrap -mx-2">
                <div className="w-full md:w-1/2 px-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-xl" value={employee.bank_name}
                    onChange={(e) => setEmployee({ ...employee, bank_name: e.target.value })} />
                </div>
                <div className="w-full md:w-1/2 px-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">Branch</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-xl" value={employee.branch}
                    onChange={(e) => setEmployee({ ...employee, branch: e.target.value })} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Office Details */}
        <div className="w-full md:w-1/2 px-2">
  <div className="bg-white shadow-sm rounded-xl h-fit">
    <div className="bg-secondary text-white px-4 py-2 rounded-t-md font-semibold">
      Office Details
    </div>
    <div className="p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Designation</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-xl"
          value={employee.designation}
          onChange={(e) => setEmployee({ ...employee, designation: e.target.value })}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Experience</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-xl"
          value={employee.experience}
          onChange={(e) => setEmployee({ ...employee, experience: e.target.value })}
        />
      </div>
    </div>
  </div>
</div>


        {/* Education Details */}
        <div className="w-full md:w-1/2 px-2  mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-secondary text-white">Education Details</div>
            <div className="card-body">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">University</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-xl" value={employee.university}
                  onChange={(e) => setEmployee({ ...employee, university: e.target.value })} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Degree</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-xl" value={employee.degree}
                  onChange={(e) => setEmployee({ ...employee, degree: e.target.value })} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Branch</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-xl" value={employee.edu_branch}
                  onChange={(e) => setEmployee({ ...employee, edu_branch: e.target.value })} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Gradepoint</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-xl" value={employee.gradepoint}
                  onChange={(e) => setEmployee({ ...employee, gradepoint: e.target.value })} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Year of Passing</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white" value={employee.yop}
                  onChange={(e) => setEmployee({ ...employee, yop: e.target.value })}>
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Relationship Details */}
        <div className="w-full md:w-1/2 px-2 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-secondary text-white">Relationship Details</div>
            <div className="card-body">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-xl" placeholder="Optional"
                  value={employee.father_name}
                  onChange={(e) => setEmployee({ ...employee, father_name: e.target.value })} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-xl" placeholder="Optional"
                  value={employee.mother_name}
                  onChange={(e) => setEmployee({ ...employee, mother_name: e.target.value })} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-xl" pattern="[0-9]{10}"
                  value={employee.emergency_contact}
                  onChange={(e) => setEmployee({ ...employee, emergency_contact: e.target.value })} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Alternate Contact</label>
                <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-xl" pattern="[0-9]{10}"
                  value={employee.alternate_contact}
                  onChange={(e) => setEmployee({ ...employee, alternate_contact: e.target.value })} />
              </div>
            </div>
          </div>
        </div>

        {/* Government IDs */}
        <div className="w-full md:w-1/2 px-2">
          <div className="card shadow-sm h-fit">
            <div className="card-header bg-secondary text-white">Government IDs</div>
            <div className="card-body">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Aadhar Number</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-xl" pattern="[0-9]{12}" required
                  title="12-digit Aadhar number" placeholder="Enter 12-digit Aadhar number"
                  value={employee.aadhar_number}
                  onChange={(e) => setEmployee({ ...employee, aadhar_number: e.target.value })} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}" title="10-character PAN format (e.g., ABCDE1234F)"
                  placeholder="Optional (e.g., ABCDE1234F)"
                  value={employee.pan_number}
                  onChange={(e) => setEmployee({ ...employee, pan_number: e.target.value })} />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="w-full px-2">
          <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-gray-500 rounded hover:bg-gray-400">
            Add Employee
          </button>
        </div>

      </form>
    </div>
  </div>
);
}


export default AddEmployee;