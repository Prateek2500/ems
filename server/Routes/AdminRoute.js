import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";


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
const upload = multer({ storage });

// Admin Login
router.post("/adminlogin", (req, res) => {
  const sql = "SELECT * FROM admin WHERE email = ?";
  con.query(sql, [req.body.email], (err, result) => {
    
    if (err) {
      console.error("❌ SQL error:", err);
      return res.json({ loginStatus: false, Error: err.message });
    }


    if (result.length > 0) {
      bcrypt.compare(req.body.password, result[0].password, (err, response) => {
        if (err) return res.json({ loginStatus: false, Error: "Password comparison error" });
        if (response) {
          const token = jwt.sign(
            { role: "admin", email: result[0].email, id: result[0].id, name: result[0].name },
            "jwt_secret_key",
            { expiresIn: "1d" }
          );
          res.cookie("token", token);
          return res.json({ loginStatus: true, id: result[0].id, name: result[0].name });
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
  const allowedFields = {
    "name": "string",
    "email": "string",
    "salary": "number",
    "address": "string",
    "dept_id": "number",
    "age": "number",
    "gender": "string",
    "account_no": "string",
    "bank_name": "string",
    "branch": "string",
    "university": "string",
    "yop": "number",
    "father_name": "string",
    "mother_name": "string",
    "emergency_contact": "string",
    "alternate_contact": "string",
    "aadhar_number": "string",
    "pan_number": "string",
    "degree": "string",
    "edu_branch": "string",
    "gradepoint": "number"
  };
  
  const updateFields = {};
  const validationErrors = [];
  
  Object.keys(req.body).forEach(field => {
    if (allowedFields.hasOwnProperty(field)) {
      const value = req.body[field];
      const expectedType = allowedFields[field];
      
      if (expectedType === "number" && isNaN(Number(value))) {
        validationErrors.push(`Invalid number format for ${field}`);
      } else {
        updateFields[field] = expectedType === "number" 
          ? Number(value) 
          : value.toString();
      }
    }
  });
  
  if (validationErrors.length > 0) {
    return res.status(400).json({
      Status: false,
      Error: "Validation failed",
      Details: validationErrors
    });
  }
  
  if (req.file) {
    updateFields.image = req.file.filename;
    con.query("SELECT image FROM employee WHERE id = ?", [id], (err, result) => {
      if (!err && result[0]?.image) {
        fs.unlink(`./public/images/${result[0].image}`, (unlinkErr) => {
          if (unlinkErr) console.error("Image delete error:", unlinkErr);
        });
      }
    });
  }
  
  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ 
      Status: false, 
      Error: "No valid fields to update" 
    });
  }
  
  const setClause = Object.keys(updateFields)
    .map(field => `${field} = ?`)
    .join(', ');
  
  const values = [...Object.values(updateFields), id];
  const sql = `UPDATE employee SET ${setClause} WHERE id = ?`;
  
  con.query(sql, values, (err, result) => {
    if (err) {
      console.error("SQL Error:", err);
      return res.status(500).json({
        Status: false,
        Error: "Database operation failed",
        SQL: sql,
        Values: values
      });
    }
    
    return res.json({ 
      Status: true,
      Message: "Employee updated successfully",
      UpdatedFields: Object.keys(updateFields),
      AffectedRows: result.affectedRows
    });
  });
});

router.delete("/delete_employee/:id", (req, res) => {
  const id = req.params.id;
  
  con.beginTransaction(err => {
    if (err) {
      return res.status(500).json({
        Status: false,
        Error: "Transaction start failed: " + err.message
      });
    }

    con.query("SELECT image FROM employee WHERE id = ?", [id], (fetchErr, fetchResult) => {
      if (fetchErr) {
        return con.rollback(() => {
          res.status(500).json({
            Status: false,
            Error: "Fetch error: " + fetchErr.message
          });
        });
      }

      if (fetchResult.length === 0) {
        return con.rollback(() => {
          res.status(404).json({
            Status: false,
            Error: "Employee not found"
          });
        });
      }

      const imageFile = fetchResult[0].image;
      const childTables = ["leaves", "attendance"];
      const deleteOperations = [];

      childTables.forEach(table => {
        deleteOperations.push(new Promise((resolve, reject) => {
          con.query(`DELETE FROM ${table} WHERE employee_id = ?`, [id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        }));
      });

      Promise.all(deleteOperations)
        .then(() => {
          con.query("DELETE FROM employee WHERE id = ?", [id], (deleteErr, deleteResult) => {
            if (deleteErr) {
              return con.rollback(() => {
                res.status(500).json({
                  Status: false,
                  Error: "Delete failed: " + deleteErr.message
                });
              });
            }

            con.commit(err => {
              if (err) {
                return con.rollback(() => {
                  res.status(500).json({
                    Status: false,
                    Error: "Commit failed: " + err.message
                  });
                });
              }

              if (imageFile) {
                const imagePath = path.join('../public/images', imageFile);
                fs.unlink(imagePath, unlinkErr => {
                  if (unlinkErr) console.error("Image delete error:", unlinkErr);
                });
              }

              res.json({
                Status: true,
                Message: "Employee and all related data deleted successfully"
              });
            });
          });
        })
        .catch(childErr => {
          con.rollback(() => {
            res.status(500).json({
              Status: false,
              Error: "Child table deletion failed: " + childErr.message
            });
          });
        });
    });
  });
});


router.get("/employee", (req, res) => {
  const sql = `SELECT e.*, d.name AS dept_name 
    FROM employee e LEFT JOIN dept d ON e.dept_id = d.id`;
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = `SELECT e.*, d.name AS dept_name 
    FROM employee e LEFT JOIN dept d ON e.dept_id = d.id 
    WHERE e.id = ?`;
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    if (result.length > 0) {
      return res.json({
        Status: true,
        Result: { ...result[0], dept_id: result[0].dept_id?.toString() }
      });
    }
    return res.json({ Status: false, Error: "Employee not found" });
  });
});

router.get("/employee/dept/:dept_id", (req, res) => {
  const dept_id = req.params.dept_id;
  const sql = `SELECT e.*, d.name AS dept_name 
    FROM employee e LEFT JOIN dept d ON e.dept_id = d.id 
    WHERE e.dept_id = ?`;
  con.query(sql, [dept_id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Database query error", Details: err.message });
    return res.json({
      Status: true,
      Result: result.map(emp => ({ ...emp, dept_id: emp.dept_id?.toString() }))
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

router.get("/admin_records", (req, res) => {
  const sql = "SELECT * FROM admin";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error: " + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get('/attendance/dept/:dept_id', (req, res) => {
  const dept_id = req.params.dept_id;
  const sql = `SELECT a.employee_id, a.attendance_date, a.status, e.name AS employee_name
    FROM attendance a JOIN employee e ON a.employee_id = e.id
    WHERE e.dept_id = ? ORDER BY a.attendance_date DESC`;
  con.query(sql, [dept_id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error: " + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get('/leaves/:deptId', (req, res) => {
  const deptId = req.params.deptId;
  const sql = `SELECT l.leave_id, l.employee_id, e.name AS employee_name,
      l.start_date, l.end_date, l.leave_type, l.purpose, l.status
    FROM leaves l JOIN employee e ON l.employee_id = e.id
    WHERE e.dept_id = ? ORDER BY l.start_date DESC`;
  con.query(sql, [deptId], (err, result) => {
    if (err) return res.json({ Status: false, Error: err.message });
    return res.json({ Status: true, Result: result });
  });
});

router.post('/leave_action', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ Status: false, Error: "Not authenticated" });

  jwt.verify(token, "jwt_secret_key", (err, decoded) => {
    if (err) return res.status(403).json({ Status: false, Error: "Invalid token" });
    
    const { leave_id, status } = req.body;
    if (!leave_id || !['approved', 'denied'].includes(status)) {
      return res.status(400).json({ Status: false, Error: "Invalid input" });
    }

    const sql = `UPDATE leaves SET status = ? WHERE leave_id = ?`;
    con.query(sql, [status, leave_id], (err, result) => {
      if (err) return res.status(500).json({ Status: false, Error: "Database error", Details: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ Status: false, Error: "Leave not found" });
      return res.json({ Status: true, Message: "Leave status updated" });
    });
  });
});

// GET all projects with department and manager names
router.get('/projects', (req, res) => {
    const sql = `
        SELECT 
            p.project_id, p.name, p.description, p.start_date, p.end_date, 
            p.status, p.budget, p.client_name,
            d.name AS dept_name,
            e.name AS manager_name
        FROM projects p
        LEFT JOIN dept d ON p.dept_id = d.id
        LEFT JOIN employee e ON p.manager_id = e.id
        ORDER BY p.project_id DESC
    `;
    con.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ Status: false, Error: "Failed to fetch projects" });
        }
        return res.json({ Status: true, Result: result });
    });
});


// Add a new project
router.post('/addprojects', (req, res) => {
    const {
        name,
        description,
        start_date,
        end_date,
        dept_id,
        manager_id,
        budget,
        client_name,
        status
    } = req.body;

    if (!name || !start_date || !dept_id || !manager_id) {
        return res.json({ Status: false, Error: "Required fields missing" });
    }

    const sql = `
        INSERT INTO projects 
        (name, description, start_date, end_date, dept_id, manager_id, budget, client_name, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    con.query(
        sql,
        [name, description, start_date, end_date, dept_id, manager_id, budget || null, client_name || null, status || 'Not Started'],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.json({ Status: false, Error: "Failed to insert project" });
            }
            return res.json({ Status: true, Result: result });
        }
    );
});



// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

export { router as adminRouter };
