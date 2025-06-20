import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";

const router = express.Router();

// Image Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/Images");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Admin Login
router.post("/adminlogin", (req, res) => {
  const sql = "SELECT * FROM admin WHERE email = ?";
  con.query(sql, [req.body.email], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });
    if (result.length > 0) {
      bcrypt.compare(req.body.password, result[0].password, (err, response) => {
        if (err) return res.json({ loginStatus: false, Error: "Password comparison error" });
        if (response) {
          const token = jwt.sign(
            {
              role: "admin",
              email: result[0].email,
              id: result[0].id,
              name: result[0].name,
            },
            "jwt_secret_key",
            { expiresIn: "1d" }
          );
          res.cookie("token", token);
          return res.json({
            loginStatus: true,
            id: result[0].id,
            name: result[0].name,
          });
        }
        return res.json({ loginStatus: false, Error: "Wrong password" });
      });
    } else {
      return res.json({ loginStatus: false, Error: "Email not found" });
    }
  });
});

// Department Routes
router.get("/dept", (req, res) => {
  const sql = "SELECT * FROM dept";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

router.post("/add_dept", (req, res) => {
  const sql = "INSERT INTO dept (`name`) VALUES (?)";
  con.query(sql, [req.body.dept], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true });
  });
});

// Employee Management Routes
router.post("/add_employee", upload.single("image"), (req, res) => {
  const sql = `INSERT INTO employee 
    (name, email, password, address, salary, image, dept_id, age, gender,
     account_no, bank_name, branch, university, yop, father_name, mother_name, designation, experience,
     emergency_contact, alternate_contact, aadhar_number, pan_number, degree, edu_branch, gradepoint) 
    VALUES (?)`;

  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) return res.json({ Status: false, Error: "Hashing error" });
    const imageName = req.file ? req.file.filename : null;
    const values = [
      req.body.name,
      req.body.email,
      hash,
      req.body.address,
      req.body.salary,
      imageName,
      req.body.dept_id,
      req.body.age,
      req.body.gender,
      req.body.account_no,
      req.body.bank_name,
      req.body.branch,
      req.body.university,
      req.body.yop,
      req.body.father_name,
      req.body.mother_name,
      req.body.designation,
      req.body.experience,
      req.body.emergency_contact,
      req.body.alternate_contact,
      req.body.aadhar_number,
      req.body.pan_number,
      req.body.degree,
      req.body.edu_branch,
      req.body.gradepoint,
    ];
    con.query(sql, [values], (err, result) => {
      if (err) return res.json({ Status: false, Error: "Query error: " + err });
      return res.json({ Status: true });
    });
  });
});

router.put("/edit_employee/:id", upload.single("image"), (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE employee 
    SET name = ?, email = ?, salary = ?, address = ?, dept_id = ?,
        age = ?, gender = ?, account_no = ?, bank_name = ?, branch = ?,
        university = ?, yop = ?, father_name = ?, mother_name = ?,
        emergency_contact = ?, aadhar_number = ?, pan_number = ?,
        degree = ?, edu_branch = ?, gradepoint = ?
    WHERE id = ?`;

  const values = [
    req.body.name,
    req.body.email,
    req.body.salary,
    req.body.address,
    req.body.dept_id,
    req.body.age,
    req.body.gender,
    req.body.account_no,
    req.body.bank_name,
    req.body.branch,
    req.body.university,
    req.body.yop,
    req.body.father_name,
    req.body.mother_name,
    req.body.emergency_contact,
    req.body.aadhar_number,
    req.body.pan_number,
    req.body.degree,
    req.body.edu_branch,
    req.body.gradepoint,
    id,
  ];

  con.query(sql, values, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error: " + err });
    return res.json({ Status: true, Result: result });
  });
});

// Get all employees with department name
router.get("/employee", (req, res) => {
  const sql = `
    SELECT e.*, d.name AS dept_name 
    FROM employee e 
    LEFT JOIN dept d ON e.dept_id = d.id
  `;
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

// Get employee by ID
router.get("/employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT e.*, d.name AS dept_name 
    FROM employee e 
    LEFT JOIN dept d ON e.dept_id = d.id 
    WHERE e.id = ?
  `;
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    if (result.length > 0) {
      return res.json({
        Status: true,
        Result: {
          ...result[0],
          dept_id: result[0].dept_id?.toString(),
        },
      });
    }
    return res.json({ Status: false, Error: "Employee not found" });
  });
});

// Get employees by department
router.get("/employee/dept/:dept_id", (req, res) => {
  const dept_id = req.params.dept_id;
  const sql = `
    SELECT e.*, d.name AS dept_name 
    FROM employee e 
    LEFT JOIN dept d ON e.dept_id = d.id 
    WHERE e.dept_id = ?
  `;
  con.query(sql, [dept_id], (err, result) => {
    if (err)
      return res.json({
        Status: false,
        Error: "Database query error",
        Details: err.message,
      });
    return res.json({
      Status: true,
      Result: result.map((emp) => ({
        ...emp,
        dept_id: emp.dept_id?.toString(),
      })),
    });
  });
});

// Dashboard Statistics
router.get("/admin_count", (req, res) => {
  const sql = "SELECT COUNT(id) AS admin FROM admin";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error: " + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/employee_count", (req, res) => {
  const sql = "SELECT COUNT(id) AS employee FROM employee";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error: " + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/salary_count", (req, res) => {
  const sql = "SELECT SUM(salary) AS salaryOFEmp FROM employee";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error: " + err });
    return res.json({ Status: true, Result: result });
  });
});

// Get all admin records
router.get("/admin_records", (req, res) => {
  const sql = "SELECT * FROM admin";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error: " + err });
    return res.json({ Status: true, Result: result });
  });
});

// Get attendance for all employees in a department
router.get('/attendance/dept/:dept_id', (req, res) => {
  const dept_id = req.params.dept_id;
  const sql = `
    SELECT a.employee_id, a.attendance_date, a.status, e.name AS employee_name
    FROM attendance a
    JOIN employee e ON a.employee_id = e.id
    WHERE e.dept_id = ?
    ORDER BY a.attendance_date DESC
  `;
  con.query(sql, [dept_id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error: " + err });
    return res.json({ Status: true, Result: result });
  });
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

export { router as adminRouter };
